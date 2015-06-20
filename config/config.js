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
        server: {
            port: 3000,

            ssl: {
                // path/to/file.crt
                crt: null,
                // path/to/file.key
                key: null
            },

            redis: {
                port: null,
                host: null,
                password: null
            }
        }
    }
);

module.exports = conf;
