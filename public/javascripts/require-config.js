'use strict';

// Check env is old ie browser
var oldIE = typeof window !== 'undefined' &&  window.attachEvent && !window.addEventListener;
requirejs.config({
    baseUrl: 'javascripts',

    paths: {
        "jquery": oldIE ?
          [
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery",
            "../vendors/jquery-legacy/dist/jquery-legacy"
          ] : [
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery",
            "../vendors/jquery-modern/dist/jquery-modern"
          ],
        "marionette": [
          "https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.1/backbone.marionette.min",
          "../vendors/marionette/lib/backbone.marionette"
          ],
        "underscore": [
          "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
          "../vendors/underscore/underscore"
        ],
        "backbone": [
          "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/backbone-min",
          "../vendors/backbone/backbone"
        ],
        "socket": [
          "https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.5/socket.io.min",
          "../vendors/socket.io-client/socket.io"
        ],
        "handlebars": [
          'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.3/handlebars.min',
          '../vendors/handlebars/handlebars.min'
        ],
        backbone_radio: [
          'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/0.9.0/backbone.radio.min',
          '../vendors/backbone.radio/build/backbone.radio.min'
        ],
        'marionette.radio': [
          'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/0.9.0/backbone.radio.min',
          '../vendors/backbone.radio/build/backbone.radio.min'
        ],

        "radio": "./lib/radio",
        "text": [
          'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text',
          '../vendors/requirejs-text/text'
        ],
        "link": [
            '../vendors/requirejs-link/link'
        ]
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
    },

    map: {
        //We map calls to marionette to use our own "augment" module
        //we also map backbone.wreqr calls to use the Radio module.
        '*': {
            // 'marionette': 'marionette.radio',
            'backbone.wreqr': 'backbone_radio'

        },


        //For our "augment" module, we want the real Marionette
        'marionette.radio' : {
            'marionette': 'marionette'
        }
    }
});
