'use strict';

var cc = require('config-chain');
var opts = require('optimist').argv;
var env = opts.env || process.env.ACHAT_ENV || 'dev';

// https://www.npmjs.com/package/config-chain

var conf = cc(
    // command line opts.
    opts,

    // search config in parent dir (useful for local development).
    cc.find('achat.config.json'),

    // defaults.
    {
        env: env,
        serverPort: 3000,
        serverSsl: true,
        serverSslCrt: null, // path/to/file.crt
        serverSslKey: null, // path/to/file.key
        redisPort: null,
        redisHost: null,
        redisPassword: null
    }
);

module.exports = conf;
