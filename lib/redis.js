'use strict';

var redis = require('redis');
var config = require('../config/config.js');

module.exports = {
    createClient: function () {
        var client = redis.createClient(config.get('redisPort'), config.get('redisHost'), {no_ready_check: true});
        var password = config.get('redisHost');
        if (password) {
            client.auth(password);
        }
        return client;
    }
};
