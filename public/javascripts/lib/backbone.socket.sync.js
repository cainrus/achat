'use strict';

define(['backbone', 'jquery', 'underscore'], function (Backbone, $, _, Model, Collection) {

    var urlError = function () {
        throw new Error('A "url" property or function must be specified.');
    };

    var methodError = function (argument) {
        throw new Error('A "method" argument(`' + argument + '`) must be one of: `' + ['*'].concat(methods).join(', ') + '`.');
    };

    var socketMethodListenError = function () {
        throw new Error('Unimplemented method error.');
    };

    var methods = ['create', 'read', 'update', 'delete', 'patch'];
    var subscribedModels = [];
    /**
     * Additional sync method with websocket/socket.io based solution.
     * Model and collections can sync events with
     */
    var sync = function (method, model, options) {

        var isCollection = model instanceof Backbone.Collection;
        var isModel = model instanceof Backbone.Model;

        if (['*'].concat(methods).indexOf(method) === -1) {
            methodError(method);
        }

        var opts = _.extend({}, options);

        if (opts.skipRequest) {
            options.success(options.attributes);
            return;
        }

        var collection = model; // alias
        var defer = $.Deferred();
        var promise = defer.promise();
        var namespace;
        var socket = opts.socket || model.socket; // Determine which websocket to use - set in options, on model.

        opts.url = (opts.url) ? _.result(opts, 'url') : (model.url) ? _.result(model, 'url') : void 0;
        // If no url property has been specified, throw an error, as per the standard Backbone sync
        if (!opts.url) {
            urlError();
        }
        namespace = model.namespace(opts.url);


        // Subscribe on server events.
        if (method === '*') {
            if (subscribedModels.indexOf(model) === -1) {
                subscribedModels.push(model);
                _.map(['create', 'update', 'delete', 'patch'], function (method) {
                    socket.on(namespace + method, function (res) {
                        model.trigger(namespace + method, res);

                    });
                });
            }
            return;
        }

        // Determine what data we're sending, and ensure id is present if we're performing a PATCH call
        if (!opts.data && model) {
            opts.data = opts.attrs || model.toJSON(options) || {};
        }
        if (opts.patch === true && model && (opts.data.id === null || opts.data.id === void 0)) {
            opts.data.id = model.id;
        }

        // We will call success only once, after response or instantly on `create`
        var successCallback = _.once(function (res) {
            if (_.isFunction(options.success)) {
                options.success(res);
            }
            defer.resolve(res);
        });

        // Add a listener for our namespaced method, and resolve or reject our deferred based on the response

        // collection artificial id or normal model id.
        var id = model.id || model.get('id');
        var eventName = namespace + id + ':' + method;

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

    };

    return sync;

});
