module.exports = function (config) {

    config.set({
        /*
         Chrome
         ChromeCanary
         Firefox
         Opera
         Safari (only Mac)
         PhantomJS
         IE (only Windows)
        */
        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'requirejs', 'chai-sinon'],
        plugins: [
            'karma-mocha',
            'karma-chai-sinon',
            'karma-requirejs',
            'karma-phantomjs-launcher',
            'karma-coverage'
        ],
        files: [
            'karma.setup.js',
            {pattern: 'public/vendors/underscore/underscore.js', included: false},
            {pattern: 'public/vendors/jquery-modern/dist/jquery.js', included: false},
            {pattern: 'public/vendors/jquery-legacy/dist/jquery.js', included: false},
            {pattern: 'public/vendors/backbone/backbone.js', included: false},
            {pattern: 'public/javascripts/mocks/*.js', included: false},
            {pattern: 'public/javascripts/lib/*.js', included: false},
            {pattern: 'public/javascripts/modules/**/*.js', included: false}
        ],

        // coverage reporter generates the coverage
        reporters: ['progress'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            // NB! Paths are relative to these config file.
            'public/javascripts/lib/**/!(*.test).js': ['coverage'],
            'public/javascripts/modules/**/!(*.test).js': ['coverage']
        },
        // Configure the reporter
        coverageReporter: {
            type: 'json',
            dir: process.cwd() + '/coverage/',
            subdir: '.',
            file: 'coverage-client.json',
            instrumenterOptions: {
                istanbul: {
                    noCompact: true
                }
            }
        },

        autoWatch: false,
        singleRun: true,

        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        }
    });
};
