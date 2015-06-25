"use strict";

/**
 * This is entry-point for testing with karma-runner and requirejs
 * based on sinpped from: http://karma-runner.github.io/0.8/plus/RequireJS.html
 */
(function () {
    // Check env is old ie browser
    var isOldIE = typeof window !== 'undefined' && window.attachEvent && !window.addEventListener;

    var testFiles = null;
    var baseUrl = '';
    var requirejsCallback = null;

    // if invoked in karma-runner environment
    if (typeof window !== 'undefined' && window.__karma__ !== undefined) {
        // Karma serves files from '/base'
        baseUrl = '/base/public/javascripts';
        requirejsCallback = window.__karma__.start;

        // looking for tests and mocks.
        testFiles = [];
        for (var file in window.__karma__.files) {
            if (window.__karma__.files.hasOwnProperty(file)) {
                if (/.+\/[^\/]+\.(test|mock)\.js$/.test(file)) {
                    testFiles.push(file);
                }
            }
        }
    }

    afterEach(function (done) {
        // Reset sinon stuff.
        require(['lib/backbone.socket'], function (socketMock) {
            for (var methodName in socketMock) {
                if (socketMock.hasOwnProperty(methodName) && socketMock[methodName].reset) {
                    socketMock[methodName].reset();
                }
            }
            done();
        });
    });

    requirejs.config({
        baseUrl: baseUrl,

        paths: {
            underscore: '../vendors/underscore/underscore',
            backbone: '../vendors/backbone/backbone',
            jquery: isOldIE
                ? '../vendors/jquery-legacy/dist/jquery'
                : '../vendors/jquery-modern/dist/jquery',
            socket: './mocks/socket.mock'
        },

        // ask Require.js to load these files (all our tests)
        deps: testFiles,

        // start test run, once Require.js is done
        callback: requirejsCallback
    });
})();
