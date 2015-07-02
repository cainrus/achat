'use strict';

define(['marionette', 'underscore'], function (Marionette, _) {

    var TextareaController = Marionette.Object.extend({

        initialize: function (options) {
            _.bindAll(this, 'recreateView', 'handleInput', 'submitMessage');
            this.channel = options.channel;
            this.region = options.region;

            this.channel.on('message:save', this.recreateView);
            this.channel.on('textarea:input', this.handleInput);
            this.channel.on('textarea:submit', this.submitMessage);

        },

        recreateView: function () {
            if (this.view) {
                this.view.destroy();
            }
            this.model = this.channel.request('messages:create');
            this.view = new this.View({
                model: this.model,
                channel: this.channel
            });
            this.show();
        },

        handleInput: function (e) {
            var meta = e.ctrlKey || e.metaKey;
            if (meta && e.which === 13/* enter */) {
                this.submitMessage(e);
            } else {
                this.bindData(e);
            }
        },

        bindData: function (e) {
            var text = this.view.ui.textarea.val();
            if (text.length > this.model.maxLength) {
                text = text.substr(0, this.model.maxLength);
                this.view.ui.textarea.val(text);
            } else {
                this.model.set('text', text);
            }
        },

        submitMessage: function (e) {

            var isEnter = e.which === 13;

            if (isEnter && !(e.ctrlKey || e.metaKey)) {
                // Skip enter without cmd/meta, because it's newline.
                return;
            }

            var isEmpty = !!this.model.get('text');
            var inDB = !!this.model.get('id');
            var isChanged = !!this.model.get('dirty');


            if (isEmpty && !isChanged && !inDB) {
                e.prevendDefault();
            } else {
                this.channel.trigger('message:save', this.model);
            }


        },

        show: function () {
            this.region.show(this.view);
        }


    });

    return TextareaController;
});
