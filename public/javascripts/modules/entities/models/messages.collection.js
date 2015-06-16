'use strict';

define(['backbone', './messages.model'], function(Backbone, MessagesModel) {
  var MessagesCollection = Backbone.Collection.extend({
    model: MessagesModel
  });

  return MessagesCollection;
});
