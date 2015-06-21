'use strict';

/*global describe, it, beforeEach*/

var BluebirdPromise = require('bluebird');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Rooms = require('./rooms.js');
chai.use(require('sinon-chai'));

describe('Rooms', function () {
    describe('Rooms#constructor', function () {
        it('should throw error if socket listener is missing', function () {
            var instantiateRoomsWithoutSocket = function () {
                return new Rooms();
            };
            expect(instantiateRoomsWithoutSocket).to.throw(Error, 'Unable to get listening socket');
        });

        it('should not throw error on normal initiate with socket listener', function () {
            var rooms;
            var ioMock = {};
            var instantiateRoomsWithSocket = function () {
                rooms = new Rooms({io: ioMock});
            };

            expect(instantiateRoomsWithSocket).not.throw(Error);

        });

        it('should initiate valid attributes', function () {
            var ioMock = {};
            var rooms = new Rooms({io: ioMock});

            expect(rooms.awaiting).to.have.length(0);
            expect(rooms.counter).to.be.equal(0);
            expect(rooms.namespace).to.be.equal('/');
        });
    });

    describe('Rooms#join', function () {
        it('should generate valid room id', function () {
            var ioMock = {};
            var rooms = new Rooms({io: ioMock});
            var socketMockA = {id: 'socketA'};
            var socketMockB = {id: 'socketB'};
            var roomId = rooms._generateRoomId(socketMockA, socketMockB);
            expect(roomId).to.be.equal(socketMockA.id + '_' + socketMockB.id);
        });
    });

    describe('Rooms#join', function () {
        it('should return promise and wait if joined first', function () {
            var ioMock = {};
            var rooms = new Rooms({io: ioMock});
            var socketMock = {};
            var getJoinResult = function () {
                return rooms.join(socketMock);
            };
            expect(getJoinResult()).to.be.an.instanceof(BluebirdPromise);
            expect(rooms.awaiting).to.have.length(1);
        });

        describe('should correctly join room 2 sockets', function() {

            it('should call join method for each socket', function (done) {
                var ioMock = {};
                var rooms = new Rooms({io: ioMock});
                var socketMockA = {id: 'socketA', join: sinon.spy()};
                var socketMockB = {id: 'socketB', join: sinon.spy()};

                [socketMockA, socketMockB].map(function (socketMock) {
                    rooms.join(socketMock);
                });

                setTimeout(function () {
                    expect(socketMockA.join.called).to.be.equal(true);
                    expect(socketMockB.join.called).to.be.equal(true);
                    done();
                }, 0);

            });

            it('should resolve promises with socket and room id', function (done) {
                var ioMock = {};
                var rooms = new Rooms({io: ioMock});
                var socketMockA = {id: 'socketA', join: function (roomId, cb) {cb();}};
                var socketMockB = {id: 'socketB', join: function (roomId, cb) {cb();}};

                var promises = [socketMockA, socketMockB].map(function (socketMock) {
                    return rooms.join(socketMock)
                        .done(function (result) {
                            expect(result.socket).to.be.a('object');
                            expect(result.roomId).to.be.a('string');
                        });

                });

                BluebirdPromise.all(promises)
                    .catch(done)
                    .done(function () { done(); });

            });
        });

    });
});
