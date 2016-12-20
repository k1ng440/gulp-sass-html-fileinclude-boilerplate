var argv        = require('yargs').argv;
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var cssbeautify = require('gulp-cssbeautify');
var plumber     = require('gulp-plumber');
var fileinclude = require('gulp-file-include');
var notify      = require("gulp-notify");
var newer       = require('gulp-newer');
var imagemin    = require('gulp-imagemin');
var pngcrush    = require('imagemin-pngcrush');
var concat      = require('gulp-concat');
var copy        = require('gulp-copy');
var cache       = require('gulp-cached');
var cssmin      = require('gulp-cssmin');
var gulpif      = require('gulp-if');

var outputDir   = './builds/';
var jsSources   = ['./components/js/*.js'];
var htmlSources = [outputDir + '*.html'];
var sassSources = ['./components/scss/**/*.scss'];


// Static Server + watching scss/html files
gulp.task('serve', ['html', 'sass', 'images', 'scripts', 'fonts'], function() {

    browserSync.init({
        server: "builds"
    });

    gulp.watch(sassSources, ['sass', 'fonts', 'images']);
    gulp.watch("./components/html/**/*.html", ['html']);

    gulp.watch(outputDir + "/*.html", ['reload']);
    gulp.watch(outputDir + "/assets/js/*.js", ['reload']);
});

gulp.task('html', function() {
    // content
    gulp.src('./components/html/*.html')
    .pipe(cache('html'))
    .pipe(fileinclude())
    .pipe(gulp.dest(outputDir))
    .pipe( notify({ message: "html tasks have been completed!"}) );
});


gulp.task('reload', function() {
    setTimeout(function() {
        browserSync.reload();
    }, 1000);
});

console.log(argv.production);

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("./components/scss/styles.scss")
        .pipe(gulpif(!argv.production, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(!argv.production, sourcemaps.write()))
        .pipe(gulpif(argv.production, cssmin()))
        .pipe(gulpif(!argv.production, cssbeautify({
            indent: '  ',
            openbrace: 'separate-line',
            autosemicolon: true
        })))
        .pipe(gulp.dest(outputDir + "assets/css"))
        .pipe(browserSync.stream());
});

gulp.task('images', function() {
    gulp.src('./components/img/**/*.*')
        .pipe(newer(outputDir + '/assets/img'))
        .pipe(imagemin({
            optimizationLevel: 7,
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use:[pngcrush()]
        }))
        .pipe(gulp.dest(outputDir + 'assets/img'))
        .pipe( notify({ message: "Images tasks have been completed!"}) );
});

gulp.task('scripts', function() {
   return gulp.src('components/js/*.js')
      .pipe(newer(outputDir + '/assets/js/script.js'))
      .pipe(concat('all.js'))
      .pipe(gulp.dest(outputDir + '/assets/js/'));
});

gulp.task('fonts', function() {
   return gulp.src('components/fonts/**/*.*')
      .pipe(newer(outputDir + '/assets/fonts'))
      .pipe(gulp.dest(outputDir + '/assets/fonts/'));
});

gulp.task('default', ['serve']);
