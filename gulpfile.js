var jshint = require('gulp-jshint'),
    gulp = require('gulp');

var files = ['routes.js'];
gulp.task('lint', function() {
    return gulp.src(files).pipe(jshint()).pipe(jshint.reporter('default'));
});
