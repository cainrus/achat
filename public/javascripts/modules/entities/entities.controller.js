'use strict';

define(['marionette', 'underscore'], function(Marionette, _) {

  var EntitiesController = Marionette.Object.extend({
    initialize: function(options) {
      this.messages = new this.MessagesCollection();

      this.channel = options.channel;

      _.bindAll(this, 'createMessage', 'saveMessage');

      this.channel.reply('messages:create', this.createMessage);
      this.channel.reply('messages:list', this.messages);
      this.channel.on('message:save', this.saveMessage);
    },

    createMessage: function() {
      this.activeModel = new this.MessagesModel();
      this.messages.add([this.activeModel]);
      return this.activeModel;
    },

    saveMessage: function() {
      debugger;
      this.activeModel.save();
    }
  });

  return EntitiesController;
});
