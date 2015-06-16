var cc = require('config-chain'),
    opts = require('optimist').argv,
    env = opts.env || process.env.ANONYMCHAT_ENV || 'dev';

// https://www.npmjs.com/package/config-chain

var conf = cc(
    // command line opts.
    opts,

    // search config in parent dir (useful for local development).
    cc.find('achat.config.json'),

    // defaults.
    {
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
