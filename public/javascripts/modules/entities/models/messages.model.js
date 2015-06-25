'use strict';

define(['lib/backbone.socket.model', 'underscore'], function(SocketModel, _) {
  var MessagesModel = SocketModel.extend({
    maxLength: 128,
    url: 'api/messages',
    initialize: function(options) {

      this.on('sync', _.bind(function () { delete this.isDirty; }, this));
      this.on('change:text', _.bind(function(){ this.isDirty = true; }, this));
      this.socket.on('api:clients:join', function(){
          console.log('api:clients:join');
      });
    },
    defaults: {
      text: ""
    },
    validate: function(attrs, options) {

      var textLength = (attrs.text || '').length;

      if (textLength === 0) {
        return "message is empty";
      } else if (textLength > this.maxLength) {
        return "message is too long";
      }
    }



  });

  return MessagesModel;
});
