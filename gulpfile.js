var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');
var concat = require("gulp-concat");

var config = {
    name: "main",
   //  mainConfigFile: "./config/require.config.js",
 //  configFile: "./config/require.config.js",
  findNestedDependencies: true,

   paths: {
     // jquery: 'empty:',
     jquery: "../vendors/jquery/dist/jquery",
   },
   optimize: "uglify",
   baseDir: '/public/javascripts'

};

gulp.task('scripts', function () {
    return gulp.src('public/javascripts/main.js')
      .pipe(requirejsOptimize({
        	"baseUrl": "public/javascripts",
        	"paths": {
        		"jquery": "empty:",
            "marionette": "empty:",
            "backbone": "empty:",
            "backbone_radio": "empty:",
            "handlebars": "empty:",
            "underscore": "empty:",
            "socket": "empty:"
            "text": "empty:"
        	},
        	"preserveLicenseComments": true
        }))
       .pipe(concat('main.build.js'))
       .pipe(gulp.dest('./public/javascripts'));
});
