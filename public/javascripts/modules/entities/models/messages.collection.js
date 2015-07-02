'use strict';

define(['lib/backbone.socket.collection', 'underscore'], function (SocketCollection, _) {

    var MessagesCollection = SocketCollection.extend({
        url: 'api/messages',
        parse: function (res) {
            return res.data;
        },
        initialize: function () {
            // me emit api:messages:create {cid: cid, text: text}
            // me receive api:messages:update {id: id, text: text, timestamp: timestamp}
            // others receive api:
            this.on('api:messages:create', function (res) {
                _.each(res.data.messages, function (message) {
                    var model = this.create(message, {
                        skipRequest: true
                    });
                    model.trigger('sync');
                }, this);

            }, this);

            this.on('api:messages:update', function (res) {
                _.each(res.data.messages, function (message) {
                    var model = this.getById(message.id);
                    var emptyModelAttrs = _.object(_.keys(model.attributes));
                    var defaultModelAttrs = _.extend(emptyModelAttrs, model.defaults);
                    var modelAttrs = _.extend(defaultModelAttrs, message);
                    model.save(modelAttrs, {
                        skipRequest: true
                    });
                    model.trigger('sync');
                }, this);
            }, this);

            this.on('api:messages:delete', function (res) {
                var idList = _.map(res.data.messages, function (model) {
                    return model.id;
                }, this);
                this.remove(idList);
            }, this);

            this.on('api:messages:patch', function (res) {
                _.each(res.data.messages, function (message) {
                    var model = this.getById(message.id);
                    model.save(message, {
                        skipRequest: true
                    });
                    model.trigger('sync');
                });
            }, this);

            SocketCollection.prototype.initialize.apply(this, arguments);
        }
    });

    return MessagesCollection;
});
