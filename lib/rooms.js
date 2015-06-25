'use strict';

var bluebird = require('bluebird');
var util = require('util');
var EventEmitter = require('events').EventEmitter;


function Rooms(options) {

    EventEmitter.call(this);

    options = options || {};
    this.io = options.io;
    if (!this.io) {
        throw new Error('Unable to get socket server');
    }
    this.namespace = options.namespace || '/';
    this.io.sockets.on('connection', function (socket) {
        socket.on('disconnect', this.leave.bind(this));
        this.join(socket);
    }.bind(this));
}
util.inherits(Rooms, EventEmitter);

Rooms.prototype.getSocketById = function (socketId) {
    return this.io.sockets.connected[socketId];
};

/*
Rooms.prototype.getAllRooms = function () {
    return this.io.nsps[this.namespace].adapter.rooms;
};
*/

Rooms.prototype.leave = function (socket) {
    var rooms = this.io.nsps[this.namespace].adapter.rooms;
    var roomIdLength = 20;
    var orphanedSockets = [];
    for (var roomId in rooms) {
        if (rooms.hasOwnProperty(roomId)) {
            var room = rooms[roomId];
            var socketIdList = Object.keys(room);
            var isSharedRoom = roomId.length > roomIdLength;
            var isSocketBelongedToRoom = roomId.match(socket.id);
            if (isSharedRoom && isSocketBelongedToRoom) {
                this.emit('leave', this.getRoomEmitter(roomId), socket);
                // Shared room must consists a least 2 sockets.
                if (socketIdList.length === 1) {
                    orphanedSockets.push(this.getSocketById(socketIdList[0]));
                }
            }
        }
    }

    if (orphanedSockets.length) {
        orphanedSockets.forEach(function (socket) {
            this.join(socket);
        }, this);
    }

};

/**
 * Join socket into room.
 *
 * @param {Socket} joiningSocket
 * @returns {bluebird} Promise
 */
Rooms.prototype.join = function (joiningSocket) {

    var awaitingSocket = this.getAwaitingSocket(joiningSocket.id);

    if (!awaitingSocket) {
        return this._awaitJoin(joiningSocket);

    } else {
        // Generate room id.
        var roomId = this._generateRoomId(awaitingSocket, joiningSocket);

        var joiningPromise = this._joinOne(joiningSocket, roomId);
        var waitingPromise = this._joinOne(awaitingSocket, roomId);

        bluebird.join(
            waitingPromise,
            joiningPromise,
            function () {
                this.emit('filled', this.getRoomEmitter(roomId), [joiningSocket, awaitingSocket]);
            }.bind(this));

        return joiningPromise;
    }
};

Rooms.prototype.getRoomEmitter = function (roomId) {
    return this.io.sockets.in(roomId);
};

/**
 *
 * @param exceptId
 * @returns {Socket|false}
 */
Rooms.prototype.getAwaitingSocket = function (exceptId) {
    // TODO: check for ban/disconnect.
    var socketId;
    var isFreeSocket;

    for (socketId in this.io.sockets.connected) {
        if (this.io.sockets.connected.hasOwnProperty(socketId)) {
            // TODO: multiple ignore.
            if (exceptId === socketId) {
                continue;
            }
            // Socket listening only own private room.
            var socket = this.io.sockets.connected[socketId];
            isFreeSocket = socket.rooms.length <= 1;
            if (isFreeSocket) {
                return socket;
            }
        }
    }
    return false;
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
    socket.resolver = bluebird.defer();
    return socket.resolver.promise;
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
    return new bluebird(function (resolve, reject) {
        socket.join(roomId, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = Rooms;
