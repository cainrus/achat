'use strict';

var redis = require('redis');
var config = require('../config/config.js').get('redis');

module.exports = {
  createClient: function(){
    var client = redis.createClient(config.port, config.host, {no_ready_check: true});
    client.auth(config.password);
    return client;
  }
};
