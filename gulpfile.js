const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const fs = require("fs")
const thePath = require("path")

const plugins = require('gulp-load-plugins')();

const projectPath = process.env.INIT_CWD.replace(/\\/g, "/");

const { serve, build } = require(`${projectPath}/config`); // config

const gulpWatch = require('./gulpWatch'); // gulpWatch

// start local server
function dev(cb) { // 开发模式
  // 启动端口热加载
  browserSync.init({
    notify: false,
    port: serve.port,
    server: {
      baseDir: `${projectPath}/.tmp`,
      index: serve.index
    },
    ghostMode: serve.ghost, // 所有设备同步输入
    logPrefix: 'jach'
  });

  //启动监听

  //html监听
  const htmlWatch = gulp.watch([`${projectPath}/${serve.folder}/**/*.html`, `!${projectPath}/${serve.folder}/template/*.html`]);
  htmlWatch.on('add', (path) => {
    gulpWatch.change(path, 'html');
    reload();
  })
  htmlWatch.on('unlink', (path) => {
    gulpWatch.unlink(path);
    reload();
  })
  htmlWatch.on('change', (path) => {
    gulpWatch.change(path, 'html');
    reload();
  })

  // template监听
  const htmlTemplate = gulp.watch([`${projectPath}/${serve.folder}/template/*.html`]);
  htmlTemplate.on('change', () => {
    serve_html();
    reload();
  });
  htmlTemplate.on('unlink', () => {
    serve_html();
    reload();
  });

  //less, scss监听
  const lessWatch = gulp.watch([`${projectPath}/${serve.folder}/**/*.less`]);
  lessWatch.on('add', (path) => {
    gulpWatch.change(path, 'less');
    reload();
  })
  lessWatch.on('unlink', (path) => {
    gulpWatch.unlink(path);
    reload();
  })
  lessWatch.on('change', (path) => {
    gulpWatch.change(path, 'less');
    reload();
  })

  const scssWatch = gulp.watch([`${projectPath}/${serve.folder}/**/*.scss`]);
  scssWatch.on('add', (path) => {
    gulpWatch.change(path, 'scss');
    reload();
  })
  scssWatch.on('unlink', (path) => {
    gulpWatch.unlink(path);
    reload();
  })
  scssWatch.on('change', (path) => {
    gulpWatch.change(path, 'scss');
    reload();
  })


  // 其他类型监听
  const otherWatch = gulp.watch([`${projectPath}/${serve.folder}/**/*.*`, `!${projectPath}/${serve.folder}/**/*.{html,less,scss}`]);
  otherWatch.on('add', (path) => {
    gulpWatch.change(path, 'other');
    reload();
  })
  otherWatch.on('unlink', (path) => {
    gulpWatch.unlink(path);
    reload();
  })
  otherWatch.on('change', (path) => {
    gulpWatch.change(path, 'html');
    reload();
  })

  cb();
}

// dev Api
function serve_clean(cb) { // 清除
  fs.stat(`${projectPath}/.tmp`, (err) => {
    if (err) {
      cb();
    } else {
      return delFolder(`${projectPath}/.tmp`, () => {
        cb();
      });
    }
  });
}
function serve_html() {
  return gulp.src([`${projectPath}/${serve.folder}/**/*.html`, `!${projectPath}/${serve.folder}/template/*.html`])
    .pipe(plugins.fileInclude({
      prefix: '@@', // @@include
      basepath: `${projectPath}/${serve.folder}`, // file path
    }))
    .pipe(plugins.replace(/\.less|\.scss/g, '.css'))
    .pipe(gulp.dest(`${projectPath}/.tmp`));
}
function serve_scss() {
  return gulp.src(`${projectPath}/${serve.folder}/**/*.scss`, { base: `${projectPath}/${serve.folder}` })
    .pipe(plugins.sass({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(`${projectPath}/.tmp`));
}
function serve_less() {
  return gulp.src(`${projectPath}/${serve.folder}/**/*.less`, { base: `${projectPath}/${serve.folder}` })
    .pipe(plugins.sass({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(`${projectPath}/.tmp`));
}
function serve_other() {
  return gulp.src([`${projectPath}/${serve.folder}/**/*.*`, `!${projectPath}/${serve.folder}/**/*.{html,less,scss}`])
    .pipe(gulp.dest(`${projectPath}/.tmp`));
}

// build Api
function build_clean(cb) { // 清除
  fs.stat(`${projectPath}/dist`, (err) => {
    if (err) {
      cb();
    } else {
      return delFolder(`${projectPath}/dist`, () => {
        cb()
      });
    }
  });
}
function build_html() {
  return gulp.src(`${projectPath}/.tmp/*.html`)
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
    .pipe(gulp.dest(`${projectPath}/dist`));
}
function build_css() {
  return gulp.src([`${projectPath}/.tmp/**/*.css`, `!${projectPath}/.tmp/css/vendor/*`], { base: `${projectPath}/.tmp` })
    .pipe(plugins.if(build.compress.css === true, plugins.minifyCss()))
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest(`${projectPath}/dist`))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest(`${projectPath}/dist/rev/css`)));
}
function build_js() {
  return gulp.src([`${projectPath}/.tmp/**/*.js`, `!${projectPath}/.tmp/js/vendor/*`], { base: `${projectPath}/.tmp` })
    .pipe(plugins.if(build.compress.js === true, plugins.babel({
      presets: ['env']
    })))
    .pipe(plugins.if(build.compress.js === true, plugins.uglify()))
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest(`${projectPath}/dist`))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest(`${projectPath}/dist/rev/js`)));
}
function build_vendor() {
  return gulp.src(`${projectPath}/.tmp/**/vendor/*.*`, { base: `${projectPath}/.tmp` })
    .pipe(gulp.dest(`${projectPath}/dist`));
}
function build_other() {
  return gulp.src([`${projectPath}/.tmp/**/*`, `!${projectPath}/.tmp/**/*.{html,css,js}`, `!${projectPath}/.tmp/**/vendor/*.*`])
    .pipe(plugins.if(build.hash === true, plugins.rev()))
    .pipe(gulp.dest(`${projectPath}/dist`))
    .pipe(plugins.if(build.hash === true, plugins.rev.manifest()))
    .pipe(plugins.if(build.hash === true, gulp.dest(`${projectPath}/dist/rev/other`)));
}
function build_rev(cb) {
  if (build.hash) {
    return gulp.src([`${projectPath}/dist/rev/**/*.json`, `${projectPath}/dist/**/*.{html,css,js}`])
      .pipe(plugins.revCollector({
        replaceReved: true, // 可重复替换
      }))
      .pipe(gulp.dest(`${projectPath}/dist`));
  } else {
    cb();
  }
}
function del_rev(cb) {
  fs.stat(`${projectPath}/dist/rev`, (err) => {
    if (err) {
      cb();
    } else {
      delFolder(`${projectPath}/dist/rev`, () => {
        cb()
      });
    }
  });
}

// 清除文件函数
function delFolder(filePath, callback) {
  fs.stat(filePath, function (err, stat) {
    if (err) return console.log(err)
    if (stat.isFile()) {
      fs.unlink(filePath, callback)
    } else {
      fs.readdir(filePath, function (err, data) {
        if (err) return console.log(err)
        let dirs = data.map(dir => thePath.join(filePath, dir))
        let index = 0
        !(function next() {
          if (index === dirs.length) {
            fs.rmdir(filePath, callback)
          } else {
            delFolder(dirs[index++], next)
          }
        })()
      })
    }
  })
}

exports.serve = gulp.series(serve_clean, gulp.parallel(serve_html, serve_scss, serve_less, serve_other), dev);
exports.build = gulp.series(serve_clean, gulp.parallel(serve_html, serve_scss, serve_less, serve_other), build_clean, gulp.parallel(build_html, build_css, build_js, build_vendor, build_other), build_rev, del_rev)
