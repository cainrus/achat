'use strict';



define(['lib/backbone.socket.model', 'underscore'], function(SocketModel, _) {
  var MessagesModel = SocketModel.extend({
    maxLength: 128,
    urlRoot: 'api/message',
    initialize: function(options) {

      this.on('sync', _.bind(function(){ console.log(1);this.unset('dirty'); }, this));
      this.on('change:text', _.bind(function(){ this.set('dirty', true); }, this));
    },
    defaults: {
      text: '',
      dirty: true
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
