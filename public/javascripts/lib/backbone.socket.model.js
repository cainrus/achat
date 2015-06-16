'use strict';

define(['backbone', 'jquery', 'lib/backbone.socket', 'lib/backbone.socket.sync'], function(Backbone, $, socket, sync){

  /**
  * Break url apart to create namespace - every '/' save any pre/post-fixing the url will become a ':' indicating
  * namespace - so a collection that maps to /api/posts will now have its events on the namespace
  * api:posts: (ie. api:posts:create, api:posts:delete, etc.), and a model that maps to /api/posts/21
  * will have events on api:posts:21: (ie. api:posts:21:update, api:posts:21:patch, etc.)
  * @param {string=} url
  */
  var SocketModel = Backbone.Model.extend({
    socket: socket,
    sync: sync,
    namespace: function(url){
        url = url || this.url();
        return url
          .replace(/^\/*/, '')
          .replace(/\/*$/, '')
          .replace('/', ':') + ":";
    },
    constructor: function() {
      Backbone.Model.apply( this, arguments );
      this.socket.on('*', function(name, data) {
        console.log('socket event: ', name, data);
      })
    }
  });

  return SocketModel;
});
