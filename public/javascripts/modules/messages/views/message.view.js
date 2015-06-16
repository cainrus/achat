'use strict';

define([
  'marionette',
  'text!../templates/message.tpl',
  'link!../style/message.css'
], function(
  Marionette,
  template
) {
  return Marionette.ItemView.extend({
    template: template,


    // collectionEvents: {
    //   "change": "render"
    // },
    //
    // render: function(){
    //   debugger;
    // }


  });
});
