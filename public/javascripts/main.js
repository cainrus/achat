'use strict';
require(['./require-config'], function(config) {
  require([
    'app',
    'modules/entities/entities.module',
    'modules/textarea/textarea.module',
    'modules/messages/messages.module',
    'link!../vendors/bootstrap/dist/css/bootstrap.min.css'
    ], function(App){
      App.start({});
    });
});
