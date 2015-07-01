'use strict';

define([
    'app',
    './models/messages.model',
    './models/messages.collection',
    './entities.controller'

], function (App,
             MessagesModel,
             MessagesCollection,
             EntitiesController) {

    // Configure.
    var EntitiesModule = App.module('Entities', function (module) {
        this.startWithParent = false;
        module.MessagesModel = MessagesModel;
        module.MessagesCollection = MessagesCollection;
        module.Controller = EntitiesController.extend({
            MessagesModel: MessagesModel,
            MessagesCollection: MessagesCollection
        });
    });

    // Initialize.
    EntitiesModule.on('before:start', function (options) {
        EntitiesModule.controller = new EntitiesModule.Controller({
            channel: options.channel
        });
    });

    App.on('before:start', function (options) {
        EntitiesModule.start(options);
    });

    return EntitiesModule;
});
