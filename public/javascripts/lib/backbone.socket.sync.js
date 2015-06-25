'use strict';

define(['backbone', 'jquery', 'underscore'], function (Backbone, $, _, Model, Collection) {

    var urlError = function () {
        throw new Error('A "url" property or function must be specified.');
    };

    var methodError = function (argument) {
        throw new Error('A "method" argument(`' + argument + '`) must be one of: `' + ['*'].concat(methods).join(', ') + '`.');
    };

    var socketMethodListenError = function() {
        throw new Error('Unimplemented method error.');
    };

    var methods = ['create', 'read', 'update', 'delete', 'patch'];

    /**
     * Additional sync method with websocket/socket.io based solution.
     */
    var sync = function (method, model, options) {
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
            _.each(methods, function (method) {
                socket.on(namespace + method, function (res) {

                    var attributes = res;

                    switch (method) {
                        case 'create':
                            collection.create(attributes, {skipRequest: true, attributes: attributes});
                            break;
                        case 'update':
                            model.clear({silent: true});
                            /* fall through */
                        case 'patch':
                            model.save(attributes, {skipRequest: true, attributes: attributes});
                            break;
                        case 'delete':
                            model.collection.remove(model, {skipRequest: true});
                            break;
                        default:
                            socketMethodListenError();
                    }
                });
            });
            return true;
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

        var id = model.get('id') || model.cid;
        var eventName = namespace + id + ':' + method;
        socket.once(eventName, function (res) {
            var success = !(res && res.error);

            if (success) {
                successCallback(res);
            } else {
                if (_.isFunction(options.error)) {
                    options.error('error' in res && res || {error: 'server error'});
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
