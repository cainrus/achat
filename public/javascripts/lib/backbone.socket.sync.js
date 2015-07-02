'use strict';

define(['backbone', 'jquery', 'underscore'], function (Backbone, $, _, Model, Collection) {

    var methods = ['create', 'read', 'update', 'delete', 'patch'];

    /**
     * Additional sync method with websocket/socket.io based solution.
     * Model and collections can sync events with
     */
    var sync = function (method, model, options) {

        if (['subscribe', 'unsubscribe'].concat(methods).indexOf(method) === -1) {
            throw new Error('A "method" argument(`' + method + '`) must be one of: `' + ['*'].concat(methods).join(', ') + '`.');
        }

        var opts = _.extend({}, options);

        if (opts.skipRequest) {
            opts.success(opts.attributes);
            return;
        }

        opts.timeout = opts.timeout || 3000;
        opts.url = (opts.url) ? _.result(opts, 'url') : (model.url) ? _.result(model, 'url') : void 0;
        if (!opts.url) {
            throw new Error('A "url" property or function must be specified.');
        }
        namespace = model.namespace(opts.url);

        var defer = $.Deferred();
        var promise = defer.promise();
        var namespace;
        var socket = opts.socket || model.socket; // Determine which websocket to use - set in options, on model.

        // Listen server commands.
        if (method === 'subscribe') {
            return subscribeOnewayEvents(socket, model, namespace);
        } else if (method === 'unsubscribe') {
            return unsubscribeOnewayEvents(socket, model);
        } else {

            opts.data = opts.data || opts.attrs || model && model.toJSON(options) || {};
            if (opts.patch === true && model && (opts.data.id === null || opts.data.id === void 0)) {
                opts.data.id = model.id;
            }

            // Add a listener for our namespaced method, and resolve or reject our deferred based on the response

            // collection artificial id or normal model id.
            var eventName = namespace;
            if (!model.get('id')) {
                eventName += namespace + model.id;
            }
            eventName += method;

            // We will call success only once, after response or instantly on `create`
            var successCallback = _.once(function (res) {
                if (_.isFunction(options.success)) {
                    options.success(res);
                }
                defer.resolve(res);
            });

            socket.once(eventName, function (res) {
                var success = res && res.success;

                if (success) {
                    successCallback(res);
                } else {
                    if (_.isFunction(options.error)) {
                        options.error(_.extend({error: 'server error'}, res));
                    }
                    defer.reject(res);
                }
            });

            if (method === 'create') {
                successCallback({success: true});
            }

            // Emit our namespaced method and the model+opts data
            socket.emit(eventName, opts.data);

            // Trigger the request event on the model, as per backbone spec
            model.trigger('request', model, promise, opts);
            // Return the promise for us to use as per usual (hanging .done blocks off, add to a .when, etc.)
            return promise;
        }
    };

    var subscribedModels = [];
    var subscribedCallbacks = [];

    function subscribeOnewayEvents(socket, model, namespace) {
        if (subscribedModels.indexOf(model) === -1) {
            subscribedModels.push(model);
            var callbacks = {};
            _.map(methods, function (method) {
                var fullNamespace = namespace + method;
                callbacks[fullNamespace] = function (res) {
                    model.trigger(fullNamespace, res);
                };
                socket.on(fullNamespace, callbacks[fullNamespace]);
            });
        }
    }

    function unsubscribeOnewayEvents(socket, model) {
        var index = subscribedModels.indexOf(model);
        if (index !== -1) {
            subscribedModels.splice(index, 1);
            var callbacks = subscribedCallbacks.splice(index, 1);
            _.mapObject(callbacks, function (fullNamespace, callback) {
                socket.removeEventListener(fullNamespace, callback);
            });
        }
    }

    return sync;

});
