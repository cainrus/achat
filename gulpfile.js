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

var config2 = require('./configs/require.config');
config2.baseDir = '/public/javascripts';
config2.dir = '/public';
// config2.name = 'main';

console.log(JSON.stringify(config2, null, '\t'));

gulp.task('scripts', function () {
    return gulp.src('public/javascripts/main.js')
      .pipe(requirejsOptimize(
        config2
       ))
       .pipe(concat('main.build.js'))
       .pipe(gulp.dest('./public/javascripts'));
});
