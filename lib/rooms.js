'use strict';

var bluebird = require('bluebird');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('achat:rooms');


function Rooms(options) {

    EventEmitter.call(this);

    options = options || {};
    this.io = options.io;
    if (!this.io) {
        throw new Error('Unable to get socket server');
    }
    this.namespace = options.namespace || '/';
    this.io.sockets.on('connection', function (socket) {
        debug(socket.id + ': connecting');
        socket.on('disconnect', function () {
            debug(socket.id + ': disconnecting');
            this.leave(socket);
        }.bind(this));

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

Rooms.prototype._getRooms = function() {
    return this.io.nsps[this.namespace].adapter.rooms;
};

Rooms.prototype._getRoom = function(roomId) {
    return this._getRooms()[roomId];
};

Rooms.prototype.has = function(roomId, socket) {
    var presentingInRoomIds = Object.keys(this._getRoom(roomId));
    return presentingInRoomIds.indexOf(socket.id) !== -1;
};

Rooms.prototype._getRoomSockets = function(roomId) {
    var room = this.getRoom(roomId);
    var sockets = [];
    for (var socketId in room) {
        if (room.hasOwnProperty(socketId)) {
            sockets.push(this.getSocketById(socketId));
        }
    }
    return sockets;
};

Rooms.prototype.leave = function (socket) {
    debug(socket.id + ': left');
    var rooms = this._getRooms();
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
                    var orphanedSocket = this.getSocketById(socketIdList[0]);
                    orphanedSocket.leave(roomId);
                    debug(orphanedSocket.id + ': orphaned');
                    orphanedSockets.push(orphanedSocket);

                }
            }
        }
    }

    if (orphanedSockets.length) {
        orphanedSockets.forEach(function (socket) {
            debug(socket.id + ': searching new room');

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
        debug(joiningSocket.id + ': awaiting');
        return this._awaitJoin(joiningSocket);

    } else {
        debug(joiningSocket.id + ': joining with ' + awaitingSocket.id);
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
    /* TODO: must be generated on some unique id.
     there can be situation, when socketA, socketB can create room socketA_socketB,
     then room wil be filled with SocketC, socketD.
     after that socketA and socketB leave socketA_socketB room. And then they can try to create same room socketA_socketB
     which is created already and filled with socketC, socketD */
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
