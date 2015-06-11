'use strict';

var redis = require('./redis.js');

var store = redis.createClient();
var pub = redis.createClient();
var sub = redis.createClient();

var listen = function(server) {
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (client) {
    sub.subscribe("chatting");

    sub.on("message", function (channel, message) {
        console.log("message received on server from publish ");
        client.send(message);
    });
    client.on("message", function (msg) {
        console.log(msg);
        if(msg.type == "chat"){
            pub.publish("chatting",msg.message);
        }
        else if(msg.type == "setUsername"){
            pub.publish("chatting","A new user in connected:" + msg.user);
            store.sadd("onlineUsers",msg.user);
        }
    });
    client.on('disconnect', function () {
        sub.quit();
        pub.publish("chatting","User is disconnected :" + client.id);
    });
  });
};


module.exports = {
  listen: listen
}
