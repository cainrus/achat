'use strict';

var Promise = require('bluebird');

var Rooms = function(options){
    this.io = options.io;
    this.counter = 0;
    this.namespace = '/';
    this.awaiting = [];

};
Rooms.prototype.getAllRooms = function() {
    return this.io.nsps[this.namespace].adapter.rooms;
};

//Rooms.prototype.

Rooms.prototype.join = function(joiningSocket) {
    var awaiting, roomId;
    if (!this.awaiting.length) {
        return this._awaitJoin(joiningSocket)
    } else {
        // Get next awaiting socket with promise.
        awaiting = this.awaiting.shift();
        // Generate room id.
        roomId = awaiting.socket.id + '_' + joiningSocket.id;

        return Promise.all([
            this._joinOne(awaiting.socket, roomId).done(function(socket, roomId){
                // Proxy resolver for promise from `_awaitJoin`
                awaiting.resolver.resolve(socket, roomId);
            }),
            this._joinOne(joiningSocket, roomId)
        ]);
    }
};


/**
 * Make await socket for meeting.
 *
 * @param {Socket} socket
 * @returns {Promise}
 * @private
 */
Rooms.prototype._awaitJoin = function(socket) {
    var resolver = Promise.defer();
    this.awaiting.push({socket: socket, resolver: resolver});
    return resolver.promise;
};

/**
 * Join multiple sockets into one room.
 *
 * @param {Socket[]} sockets
 * @private
 */
Rooms.prototype._joinMultiple = function(sockets, roomId) {
    this._joinOne(sockets[0], roomId);
    this._joinOne(sockets[0], roomId);
    return Promise.all([

    ]);
};

/**
 * Join one socket into one room.
 * @param {object} socket
 * @param {string} roomId
 * @returns {bluebird}
 * @private
 */
Rooms.prototype._joinOne = function(socket, roomId) {
    return new Promise(function(resolve) {
        socket.join(roomId, function(err) {
            if (err) {
                throw err;
            }
            resolve(socket, roomId);
        });
    });
};








module.exports = Rooms;