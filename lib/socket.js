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


var id = 0;
var createMessage = function (options) {
    options.id = id++;
    return options;
};

var listen = function (server) {
    var io = sockets();
    io.serveClient(false);
    io.attach(server);

    var rooms = new Rooms({io: io});

    rooms.on('leave', function (roomEmitter, socket) {
        var message = createMessage({
            type: 'system',
            text: (socket.name ? socket.name : ('#' + socket.id)) + ' has been disconnected'
        });

        roomEmitter.emit('api:messages:create', {
            success: 1, data: {
                messages: [message]
            }
        });
    });

    rooms.on('filled', function (roomEmitter, sockets) {

        var text = 'New conversation for ' + sockets.map(function (socket) {
                return socket.name ? socket.name : ('#' + socket.id);
            }).join(', ');

        var message = createMessage({
            type: 'system',
            text: text
        });

        roomEmitter.emit('api:messages:create', {
            success: 1, data: {
                messages: [message]
            }
        });
    });

    //setInterval(function(){
    //    console.log(io.nsps['/'].adapter.rooms);
    //}, 5000);
    io.sockets.on('disconnect', function () {
        console.log('global disconnect');
    });
    io.sockets.on('connection', function (client) {

        client.on('disconnect', function () {
            console.log('disconnect');
        });

        //rooms.join(client)
        //    .done(function(result) {
        //        console.log('socket:', result.socket);
        //        console.log('room_id:', result.room_id);
        //        // client.to(roomId).emit('successfully joined room');
        //    });

        client.on('api:message:create', function () {
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
