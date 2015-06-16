'use strict';

var redis = require('./redis.js');
var b = require('bluebird');
var socket = require('socket.io');
var Rooms = require('./rooms.js');

//var store = redis.createClient();


var Users = function(){

};



var listen = function(server) {

    var io = socket.listen(server);
    var rooms = new Rooms({io: io});

    setInterval(function(){
        console.log(io.nsps['/'].adapter.rooms);

    }, 5000);

    io.sockets.on('connection', function (client) {

        rooms.join(client)
            .done(function(socket, room_id) {
                console.log('socket:', socket);
                console.log('room_id:', room_id);
                //client.to(roomId).emit('successfully joined room');
            });

        client.on('api:message:create', function(){
            console.log(arguments);
        });
    });
/*
  io.sockets.on('connection', function (client) {

    client.on('api:message:create', function(){
      console.log(arguments);
    });

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
    */
};



module.exports = {
  listen: listen
};
