define(['socket'], function (io) {

    'use strict';

    var connectUrl = location.protocol + '//' + location.host;
    var socket = new io.connect(connectUrl, {
        transports: ['websocket'],
        secure: true
    });

    /**
     * Override socket.emit and SocketNamespace reference for socket.io to add a catch all case for the
     * wildcard ('*') character. Now, socket.on('*') will catch any event, with the name of the caught event
     * passed to the handler as the first argument.
     */
    /*
    var emit = socket.emit;
    socket.emit = function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        emit.apply(this, ['*', name].concat(args));
        emit.apply(this, [name].concat(args));
    };
    */

    /**
     * On any event from the server, trigger it on the app event aggregator. The first
     * argument will always be the name of the event.
     */
    /*
    socket.on('api:clients:join', function () {
        console.log(arguments);
        var args = Array.prototype.slice.call(arguments, 0);
        app.channel.trigger(args[0], args.slice(1));
    });
    */

    socket.on('connect', function () {
        console.log("Connected");
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
    });

    /**
     * On any event from the server, trigger it on the app event aggregator. The first
     * argument will always be the name of the event.
     */
    /*
    socket.on('*', function () {
        console.log(arguments);
        var args = Array.prototype.slice.call(arguments, 0);
        app.channel.trigger(args[0], args.slice(1));
    });
    */

    /**
     * On error, trigger the socket:error event on the global event aggregator for
     * interested listeners.
     */
    /*
    socket.on('error', function (err) {
        app.channel.trigger('socket:error', err);
    });
    */

    return socket;
});
