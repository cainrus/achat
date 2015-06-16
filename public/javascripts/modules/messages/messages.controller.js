'use strict';

define(['marionette'], function(
  Marionette
) {

  var MessagesController = Marionette.Object.extend({
    initialize: function(options) {
      this.channel = options.channel;
      this.collection = this.channel.request('messages:list');

      this.view = new this.View({collection: this.collection});
      this.region = options.region;

      this.channel.on('message:save', this.view.render);
    },

    show: function() {
      this.region.show(this.view);
    }

  });

  return MessagesController;

});
