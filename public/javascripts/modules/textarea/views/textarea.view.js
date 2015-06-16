'use strict';

define([
  'marionette', 'underscore',
  'text!../templates/textarea.tpl',
  'link!../styl/main.css'
], function(
  Marionette, _,
  template
) {


  return Marionette.ItemView.extend({

    template: template,

    initialize: function(options) {
      this.model = options.model;
      this.channel = options.channel;
      // custom template variables.
      this.templateHelpers = {
        maxLength: this.model.maxLength
      };
    },

    ui: {
      textarea: 'textarea',
      submit: '.btn'
    },

    events: {
      "input @ui.textarea": function(e) {
        this.channel.trigger('textarea:input', e);
      },
      "click @ui.submit": function(e) {
        this.channel.trigger('textarea:submit', e);
      }
    },

    modelEvents: {
      "change": "update"
    },

    update: function(model){
      this.ui.textarea.val(model.get('text'));
    }

  });
});
