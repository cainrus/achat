/*global describe, it, beforeEach, define, chai */


'use strict';
define(['lib/backbone.socket.collection', 'lib/backbone.socket.model'], function (Collection, Model) {

    var expect = chai.expect;

    describe('SocketCollection', function () {

        var MessageModel = Model.extend({
            url: 'api/messages'
        });
        var MessagesCollection = Collection.extend({
            url: 'api/messages',
            model: MessageModel
        });

        var messages;
        beforeEach(function() {
            messages = new MessagesCollection();
        });

        describe('#create', function () {

            it('should correctly listen and emit', function () {
                var data = {text: 'blabla'};
                var model = messages.create(data);

                expect(model.socket.once).to.have.been.calledWith('api:messages:' + model.cid + ':create');
                expect(model.socket.emit).to.have.been.calledWith('api:messages:' + model.cid + ':create', data);
            });

            it('should fallback on server error', function (done) {
                var data = {text: 'blabla'};
                var errorCallbackSpy = sinon.spy();

                messages.create(data, {
                    error: errorCallbackSpy
                });

                setTimeout(function () {
                    var response = errorCallbackSpy.getCall(0).args[1];
                    expect(response).to.have.property('error');
                    done();
                }, 10);
            });
        });

        describe('#read', function () {
            it('should correctly listen and emit', function () {
                messages.fetch();
                expect(messages.socket.emit).to.have.been.calledWith('api:messages:' + messages.cid + ':read');
                expect(messages.socket.once).to.have.been.calledWith('api:messages:' + messages.cid + ':read');
            });
        });

    });
});
