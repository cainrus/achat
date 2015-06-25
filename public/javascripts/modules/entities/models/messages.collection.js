'use strict';

define(['lib/backbone.socket.collection', './messages.model.js'], function (SocketCollection, MessagesModel) {
    var MessagesCollection = SocketCollection.extend({
        model: MessagesModel,
        url: 'api/messages',
    });

    return MessagesCollection;
});
