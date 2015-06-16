'use strict';

define([
  'marionette',
  './message.view',
  'text!../templates/messages.tpl'
], function(
  Marionette,
  MessageView,
  template
) {
  return Marionette.CollectionView.extend({
    childView: MessageView,
    template: template,
    initialize: function(options) {
      this.collection = options.collection;

    },
    collectionEvents: {
      "change": "render"
    },



  });
});
