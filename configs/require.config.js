/*window.require breaks due to context of methods. see http://tobyho.com/2013/03/13/window-prop-vs-global-var/ */
/*jshint -W079*/
var require = (typeof require === 'function' || typeof require === 'object') ? require : {};
(function() {
    'use strict';

    // Check env is old ie browser
    var oldIE = typeof window !== 'undefined' &&  window.attachEvent && !window.addEventListener;

    var config = {
        baseUrl: 'javascripts',
        dir: "../public",
        out: './main.build.js',
        findNestedDependencies: true,
        preserveLicenseComments: true,
        modules: [
            {
                name: "main"
                // include: ["views/app"],
                // exclude: ["jquery"]
            }
        ],
        paths: {
            "jquery": oldIE ?
              [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery",
                "../vendors/jquery/dist/jquery-legacy"
              ] : [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery",
                "../vendors/jquery/dist/jquery-modern"
              ],

            // "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery",
            "marionette": "../vendors/marionette/lib/backbone.marionette",
            "underscore": "../vendors/underscore/underscore",
            "backbone": "../vendors/backbone/backbone",
            "socket": "../vendors/socket.io-client/socket.io"
        },
        shim: {
          underscore:{
            exports: "_"
          },
          backbone:{
              deps: ['underscore', 'jquery'],
              exports:'Backbone'
          },
          marionette: {
           deps: ['backbone'],
           exports: 'Marionette'
          }
        }
    };


    // code coverage should not cover UMD wraps
    /* istanbul ignore next */

    // UMD-like wrap that sets config if possible, exports it or primes it / merges it
    if (typeof define === 'function' && define.amd) {
        // require already loaded, configure above
        require.config(config);
    } else if (typeof module !== 'undefined' && module.exports) {
        // under nodejs, return the object
        module.exports = config;
    } else {
        // if require pre-config exists, this will merge with existing config, overwrites keys
        for (var k in config) {
            // shallow/naive for multiple configs.
            config.hasOwnProperty(k) && (require[k] = config[k]);
        }
    }
}());


/*({
  // appDir: "../public/javascrits",
  baseUrl: "/javascripts",
  dir: "../public",
  out: './main.build.js',
  // optimizeCss: "none",
  // optimize: "uglify",
  findNestedDependencies: true,
  preserveLicenseComments: true,
  paths: {
      // use: 'libs/use-0.2.0.min',
      // jquery: 'empty:',
      // underscore: 'libs/underscore-1.3.1.min',
      // backbone: 'libs/backbone-0.9.2.min'
  },
  modules: [
      {
          name: "main"
          // include: ["views/app"],
          // exclude: ["jquery"]
      }
  ],
})
*/
