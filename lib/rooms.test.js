'use strict';

/*global describe, it, beforeEach*/

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
            expect(instantiateRoomsWithoutSocket).to.throw(Error);
        });

        it('should initiate without errors with socket listener', function () {
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
});
