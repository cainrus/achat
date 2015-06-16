'use strict';

define([
  'app',
  'radio',
  './views/messages.view',
  './messages.controller'
], function(
  App,
  Radio,
  MessagesView,
  MessagesController
  ) {

    // Configure.
    var MessagesModule = App.module('MessagesModule', function(module) {
      this.startWithParent = false;
      module.View = MessagesView;
      module.Controller = MessagesController.extend({
        View: MessagesView
      });
    });

    // Initialize.
    MessagesModule.on('start', function(options) {
      MessagesModule.controller = new MessagesModule.Controller({
        region: App.layout.addRegion("MessagesRegion", "#messages"),
        channel: options.channel
      });
      MessagesModule.controller.show();
    });

    App.on('start', function(options) {
      MessagesModule.start(options);
    });

    return MessagesModule;
});
