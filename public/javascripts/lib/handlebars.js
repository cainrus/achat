'use strict';

define(['marionette', 'handlebars'], function(Marionette, Handlebars) {
  //render templates with Handlebars instead of Underscore
  Marionette.Renderer.render = function(template, data) {
      var renderer = Handlebars.compile(template);
      return renderer(data);
  };
});
