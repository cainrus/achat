'use strict';

define(['backbone', 'jquery', 'underscore'], function (Backbone, $, _) {

    var urlError = function () {
        throw new Error('A "url" property or function must be specified.');
    };

    /**
     * Additional sync method with websocket/socket.io based solution.
     */
    var sync = function (method, model, options) {

        var opts = _.extend({}, options),
            defer = $.Deferred(),
            promise = defer.promise(),
            namespace,
            socket;

        opts.url = (opts.url) ? _.result(opts, 'url') : (model.url) ? _.result(model, 'url') : void 0;
        // If no url property has been specified, throw an error, as per the standard Backbone sync
        if (!opts.url) urlError();
        namespace = model.namespace(opts.url);
        // Determine what data we're sending, and ensure id is present if we're performing a PATCH call
        if (!opts.data && model) opts.data = opts.attrs || model.toJSON(options) || {};
        if ((opts.data.id === null || opts.data.id === void 0) && opts.patch === true && model) {
            opts.data.id = model.id;
        }
        // Determine which websocket to use - set in options, on model
        socket = opts.socket || model.socket;

        // We will call success only once, after response or instantly on `create`
        var successCallback = _.once(function (res) {
            if (_.isFunction(options.success)) {
                options.success(res);
            }
            defer.resolve(res);
        });

        // Add a listener for our namespaced method, and resolve or reject our deferred based on the response
        socket.once(namespace + method, function (res) {
            var success = (res && res.success);

            if (success) {
                successCallback(res);
                return;
            }
            if (_.isFunction(options.error)) {
                options.error(res);
            }
            defer.reject(res);
        });

        if (method === 'create') {
            successCallback({success: true, })
        }


        // Emit our namespaced method and the model+opts data
        socket.emit(namespace + method, opts.data);

        // Trigger the request event on the model, as per backbone spec
        model.trigger('request', model, promise, opts);
        // Return the promise for us to use as per usual (hanging .done blocks off, add to a .when, etc.)
        return promise;

    };

    return sync;

});
