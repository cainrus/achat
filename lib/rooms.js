'use strict';

var b = require('bluebird');

var Rooms = function (options) {
    options = options || {};
    this.io = options.io;
    if (!this.io) {
        throw new Error('Unable to get listening socket');
    }
    this.counter = 0;
    this.namespace = '/';
    this.awaiting = [];

};
Rooms.prototype.getAllRooms = function () {
    return this.io.nsps[this.namespace].adapter.rooms;
};

Rooms.prototype.join = function (joiningSocket) {
    var awaiting;
    var roomId;

    if (!this.awaiting.length) {
        return this._awaitJoin(joiningSocket);
    } else {
        // Get next awaiting socket with promise.
        awaiting = this.awaiting.shift();
        // Generate room id.
        roomId = awaiting.socket.id + '_' + joiningSocket.id;

        return b.all([
            this._joinOne(awaiting.socket, roomId).done(function (socket, roomId) {
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
 * @returns {b}
 * @private
 */
Rooms.prototype._awaitJoin = function (socket) {
    var resolver = b.defer();
    this.awaiting.push({socket: socket, resolver: resolver});
    return resolver.promise;
};

/**
 * Join multiple sockets into one room.
 *
 * @param {Socket[]} sockets
 * @private
 */
Rooms.prototype._joinMultiple = function (sockets, roomId) {
    this._joinOne(sockets[0], roomId);
    this._joinOne(sockets[0], roomId);
    return b.all([]);
};

/**
 * Join one socket into one room.
 * @param {object} socket
 * @param {string} roomId
 * @returns {bluebird}
 * @private
 */
Rooms.prototype._joinOne = function (socket, roomId) {
    return new b(function (resolve) {
        socket.join(roomId, function (err) {
            if (err) {
                throw err;
            }
            resolve(socket, roomId);
        });
    });
};

module.exports = Rooms;
