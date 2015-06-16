'use strict';

define([
  'app',
  './textarea.controller',
  './views/textarea.view'

], function(
  App,
  TextareaController,
  TextareaView
  ) {

    // Configure.
    var TextareaModule = App.module('TextareaModule', function(module) {
      this.startWithParent = false;
      module.View = TextareaView;
      module.Controller = TextareaController.extend({
        View: TextareaView
      });
      module.region = App.layout.addRegion("textareaRegion", "#textarea");
    });

    // Initialize.
    TextareaModule.on('start', function(options) {
      TextareaModule.controller = new TextareaModule.Controller({
        region: TextareaModule.region,
        channel: options.channel

      });
      TextareaModule.controller.recreateView();
    });

    App.on('start', function(options) {
      TextareaModule.start(options);
    });

    return TextareaModule;
});
