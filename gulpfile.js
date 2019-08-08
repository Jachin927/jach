"use strict";

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const plugins = require('gulp-load-plugins')();
const del = require('del');

const {serve, build} = require('./config'); // config

// start local server
gulp.task('serve', () => {
  browserSync.init({
    notify: false,
    port: serve.port,
    server:{
      baseDir: '.tmp',
      index: serve.index
    }
  });
});

// Api 
gulp.task('html', () => {
  return gulp.src(`${serve.folder}/*.html`)
    .pipe(plugins.fileInclude({
      prefix: '@@', // @@include
      basepath: `./${serve.folder}`, // file path
    }))
    .pipe(gulp.dest('.tmp'));
});
gulp.task('base', () => {
  return gulp.src(`${serve.folder}/**/*.{css,js}`, {base:serve.folder})
    .pipe(gulp.dest('.tmp'));
});
gulp.task('sass', () => {  
  return gulp.src(`${serve.folder}/**/*.scss`, {base:serve.folder})
    .pipe(plugins.sass({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('.tmp'));
});
gulp.task('less', () => {  
  return gulp.src(`${serve.folder}/**/*.less`, {base:serve.folder})
    .pipe(plugins.less({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('.tmp'));
});
gulp.task('other', () =>{
  return gulp.src([`${serve.folder}/**/*.*`, `!${serve.folder}/**/*.{html,less,sass,css,js}`])
  .pipe(gulp.dest('.tmp'));
})
gulp.task('clean', () => {
  return del('.tmp');
});

//build Api
gulp.task('b_Html', () => {
  return gulp.src(`.tmp/*.html`)
    .pipe(plugins.if(build.compress.html === true, plugins.htmlmin({
      removeComments: true, // 清除HTML注释
      collapseWhitespace: true, // 压缩HTML
      collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
      minifyJS: true, // 压缩页面JS
      minifyCSS: true // 压缩页面CSS
    })))
    .pipe(gulp.dest('dist'));
})
gulp.task('b_Css', () => {
  return gulp.src([`.tmp/**/*.css`, '!.tmp/css/vendor/*'], {base: '.tmp'})
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.if(build.compress.css === true, plugins.minifyCss()))
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest('dist/css'))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest('dist/rev/css')));
})
gulp.task('b_Js', () => {
  return  gulp.src([`.tmp/**/*.js`, '!.tmp/js/vendor/*'], {base: '.tmp'})
    .pipe(plugins.if(build.compress.js === true, plugins.babel({
      presets: ['es2015']
    })))
    .pipe(plugins.if(build.compress.js === true, plugins.uglify()))
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest('dist/rev/js')));
})
gulp.task('b_baseJs', () => {
  return gulp.src(`.tmp/**/vendor/*.js`, {base: '.tmp'})
    .pipe(gulp.dest('dist'));
})
gulp.task('b_Other', () => {
  return gulp.src(['.tmp/**/*', '!.tmp/**/*.{html,less,sass,css,js}'])
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest('dist/rev/other')));
})
gulp.task('rev', (done) => {
  if (build.hash) {
    return gulp.src(['dist/rev/**/*.json', 'dist/**/*.{html,css,js}'])
    .pipe(plugins.revCollector({
        replaceReved: true, // 可重复替换
    }))
    .pipe(gulp.dest('dist'));
  } else {
    done();
  }
})
gulp.task('d_Dist', () => {
  return del('dist');
})
gulp.task('d_rev', () => {
  return del('dist/rev');
})

// dev watch
gulp.task('watch', () => {
  gulp.watch(`${serve.folder}/**/*.html`, gulp.parallel('html'));
  gulp.watch(`${serve.folder}/**/*.{css,js}`, gulp.parallel('base'));
  gulp.watch(`${serve.folder}/**/*.scss`, gulp.parallel('sass'));
  gulp.watch(`${serve.folder}/**/*.less`, gulp.parallel('less'));
  gulp.watch([`${serve.folder}/**/*.*`, `!${serve.folder}/**/*.{html,less,sass,css,js}`], gulp.parallel('other'));

  gulp.watch(`.tmp/**/*`).on('added', reload);
  gulp.watch(`.tmp/**/*`).on('change', reload);
  gulp.watch(`.tmp/**/*`).on('deleted', reload);

})

// dev init
gulp.task('initial', gulp.series('clean', 'other', 'html', 'less', 'sass', 'base', 'watch'));

// dev command parallel
gulp.task('dev',gulp.parallel('initial', 'serve'));

// building
gulp.task('building', gulp.series('d_Dist', 'b_Other', 'b_Html', 'b_Css', 'b_Js', 'b_baseJs', 'rev', 'd_rev'))

// build command
gulp.task('build', gulp.series('clean', 'other', 'html', 'less', 'sass', 'base', 'building'))
