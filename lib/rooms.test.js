'use strict';

/*global describe, context, it, beforeEach*/

var BluebirdPromise = require('bluebird');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Rooms = require('./rooms.js');
var sockets = require('socket.io');

chai.use(require('sinon-chai'));
chai.should();

describe('Rooms', function () {
    var io;
    var ioMock;
    var socketMocks = [];

    beforeEach(function () {

        io = sockets();
        io.serveClient(false);
        sinon.spy(io.sockets, 'on');


        // Mocked socket connection.
        ioMock = {
            sockets: {
                in: sinon.spy(),
                on: sinon.spy(),
                connected: {}
            },
            emulateSocketConnection: function (socket) {
                this.sockets.connected[socket.id] = socket;
            }
        };

        // Create mocked client sockets.
        var joinMockedSocked = function (roomId, cb) {
            ioMock.sockets.connected[roomId] = this;
            cb();
        };
        for (var i = 0; i < 2; i++) {
            socketMocks[i] = {
                id: 'socket' + i,
                rooms: ['socket' + i],
                join: sinon.spy(joinMockedSocked)
            };
        }
    });

    describe('Rooms#constructor', function () {
        it('should throw error if socket server is missing', function () {
            var instantiateRoomsWithoutSocket = function () {
                return new Rooms();
            };
            expect(instantiateRoomsWithoutSocket).to.throw(Error, 'Unable to get socket server');
        });

        it('should not throw error on normal initiate with socket listener', function () {
            var rooms;
            var instantiateRoomsWithSocket = function () {
                rooms = new Rooms({io: ioMock});
            };

            expect(instantiateRoomsWithSocket).not.throw(Error);
            expect(ioMock.sockets.on).to.have.been.calledWith('connection');


        });

        it('should initiate valid attributes', function () {
            var rooms = new Rooms({io: io});

            expect(rooms.namespace).to.be.equal('/');
        });
    });

    describe('Rooms#join', function () {

        it('should generate valid room id', function () {
            var rooms = new Rooms({io: ioMock});
            var roomId = rooms._generateRoomId(socketMocks[0], socketMocks[1]);
            expect(roomId).to.be.equal(socketMocks[0].id + '_' + socketMocks[1].id);
        });
    });

    describe('Rooms#join', function () {

        it('should call await for other socket (1/2)', function () {

            var rooms = new Rooms({io: ioMock});

            var awaitSpy = sinon.spy(rooms, '_awaitJoin');
            rooms.join(socketMocks[0]);
            chai.assert(awaitSpy.calledOnce, true);
        });

        describe('should correctly join room 2 sockets', function () {

            it('should call Socket#join method for each socket', function (done) {

                ioMock.emulateSocketConnection(socketMocks[0]);
                ioMock.emulateSocketConnection(socketMocks[1]);

                var rooms = new Rooms({io: ioMock});

                [socketMocks[0], socketMocks[1]].map(function (socketMock) {
                    rooms.join(socketMock);
                });

                setTimeout(function () {
                    expect(socketMocks[0].join.called).to.be.equal(true);
                    expect(socketMocks[1].join.called).to.be.equal(true);
                    done();
                }, 0);

            });

            it('should await and emit in right order', function (done) {

                var rooms = new Rooms({io: ioMock});

                var awaitSpy = sinon.spy(rooms, '_awaitJoin');
                var emitSpy = rooms.emit = sinon.spy();

                // Emulate client socket connection.
                ioMock.emulateSocketConnection(socketMocks[0]);
                rooms.join(socketMocks[0]);
                // Emulate client socket connection.
                ioMock.emulateSocketConnection(socketMocks[1]);
                rooms.join(socketMocks[1]);

                setTimeout(function () {
                    expect(awaitSpy).to.have.been.calledWith(socketMocks[0]);
                    chai.assert(emitSpy.calledOnce, true);
                    done();
                }, 10);

            });

            it('should return promise on socket Rooms#join', function () {
                var rooms = new Rooms({io: ioMock});
                rooms.join(socketMocks[0])
                    .should.be.instanceof(BluebirdPromise);
                rooms.join(socketMocks[1])
                    .should.be.instanceof(BluebirdPromise);
            });

        });

    });
})
;
