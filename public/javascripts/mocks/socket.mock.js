'use strict';
define({
    connect: function SocketMock() {
        this.emit = sinon.stub();
        this.once = sinon.stub();
        this.on = sinon.stub();

        //this.on.withArgs('api:messages:create').callsArgWithAsync(1, {error: 'server error'});

        this.once.withArgs(sinon.match(/api\:messages\:[^:]+\:create/)).callsArgWithAsync(1, {error: 'server error'});
        //this.once.withArgs('api:messages:create').callsArgWithAsync(1, {error: 'server error'});

    }
});
