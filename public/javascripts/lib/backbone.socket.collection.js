'use strict';

define([
    'backbone',
    'jquery',
    'lib/backbone.socket.model',
    'lib/backbone.socket',
    'lib/backbone.socket.sync',
    'lib/puid.generator'
], function (Backbone, $, Model, socket, sync, puidGenerator) {

    /**
     * Break url apart to create namespace - every '/' save any pre/post-fixing the url will become a ':' indicating
     * namespace - so a collection that maps to /api/posts will now have its events on the namespace
     * api:posts: (ie. api:posts:create, api:posts:delete, etc.), and a model that maps to /api/posts/21
     * will have events on api:posts:21: (ie. api:posts:21:update, api:posts:21:patch, etc.)
     * @param {string=} url
     */
    var SocketCollection = Backbone.Collection.extend({
        socket: socket,
        model: Model,
        sync: sync,
        namespace: function (url) {
            url = url || this.url();
            return url
                    .replace(/^\/*/, '')
                    .replace(/\/*$/, '')
                    .replace('/', ':') + ':';
        },
        initialize: function (options) {
            this.id = puidGenerator.generate();
            // Subscribe on server socket events.
            this.sync('*', this);
        }

    });

    return SocketCollection;
});
