'use strict';

define([
  'marionette',
    'underscore',
  'text!../templates/message.tpl',
  'link!../style/message.css'
], function(
  Marionette,
  _,
  template
) {
  return Marionette.ItemView.extend({
    template: template,
      serializeData: function() {
          return _.extend({isDirty: this.model.isDirty}, this.model.toJSON());
      }

    // collectionEvents: {
    //   "change": "render"
    // },
    //
    // render: function(){
    //   debugger;
    // }


  });
});
