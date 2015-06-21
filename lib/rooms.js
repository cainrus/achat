'use strict';

var bluebird = require('bluebird');

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

/*
Rooms.prototype.getAllRooms = function () {
    return this.io.nsps[this.namespace].adapter.rooms;
};
*/

Rooms.prototype.join = function (joiningSocket) {
    var awaiting;
    var roomId;

    if (!this.awaiting.length) {
        return this._awaitJoin(joiningSocket);
    } else {
        // Get next awaiting socket with promise.
        awaiting = this.awaiting.shift();
        // Generate room id.
        roomId = this._generateRoomId(awaiting.socket, joiningSocket);


        var joining = {socket: joiningSocket, resolver: bluebird.defer()};

        bluebird.all([
            this._joinOne(awaiting.socket, roomId).done(function (result) {
                // Proxy resolver for promise from `_awaitJoin`
                awaiting.resolver.resolve(result);
            }),
            this._joinOne(joining.socket, roomId).done(function (result) {
                // Proxy resolver for promise from `_awaitJoin`
                joining.resolver.resolve(result);
            })
        ]);

        return joining.resolver.promise;
    }
};

Rooms.prototype._generateRoomId = function (socketA, socketB) {
    return socketA.id + '_' + socketB.id;
};

/**
 * Make await socket for meeting.
 *
 * @param {Socket} socket
 * @returns {bluebird}
 * @private
 */
Rooms.prototype._awaitJoin = function (socket) {
    var resolver = bluebird.defer();
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
    return bluebird.all([]);
};

/**
 * Join one socket into one room.
 * @param {object} socket
 * @param {string} roomId
 * @returns {bluebird}
 * @private
 */
Rooms.prototype._joinOne = function (socket, roomId) {
    return new bluebird(function (resolve) {
        socket.join(roomId, function (err) {
            if (err) {
                throw err;
            }
            resolve({socket: socket, roomId: roomId});
        });
    });
};

module.exports = Rooms;
