'use strict';

var redis = require('./redis.js');
var b = require('bluebird');
var sockets = require('socket.io');
var Rooms = require('./rooms.js');

//var store = redis.createClient();

//
//var Users = function(){
//
//};



var listen = function(server) {
    var io = sockets();
    io.serveClient(false);
    io.attach(server);

    var rooms = new Rooms({io: io});

    rooms.on('leave', function (roomEmitter, socket) {
        console.log('disconnected', socket);
        roomEmitter.emit(socket.id + ' disconnected');
    });

    rooms.on('join', function (roomEmitter, sockets) {
        var ids = sockets.map(function (socket) { return {id: socket.id}; });

        roomEmitter.emit('api:clients:join', {success: 1, data: {
            connected: ids
        }});
    });

    //setInterval(function(){
    //    console.log(io.nsps['/'].adapter.rooms);
    //}, 5000);
    io.sockets.on('disconnect', function(){
       console.log('global disconnect');
    });
    io.sockets.on('connection', function (client) {
        io.sockets.emit('haha');
        client.on('disconnect', function () {
            console.log('disconnect');
        });

        //rooms.join(client)
        //    .done(function(result) {
        //        console.log('socket:', result.socket);
        //        console.log('room_id:', result.room_id);
        //        // client.to(roomId).emit('successfully joined room');
        //    });

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
