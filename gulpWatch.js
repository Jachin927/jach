const { src, dest } = require('gulp');
const plugins = require('gulp-load-plugins')();
const fs = require('fs');

const projectPath = process.env.INIT_CWD.replace(/\\/g, "/");

const { serve } = require(`${projectPath}/config`); // config

function unlink(path) { // 删除
  fs.unlink(path.replace(serve.folder, '.tmp'), (err) => { if (err) throw err; })
}

function change(path, type) { // 修改
  src(path, { base: `${projectPath}/${serve.folder}` })
    .pipe(plugins.if(
      type === 'html',
      plugins.fileInclude({
        prefix: '@@', // @@include
        basepath: `${projectPath}/${serve.folder}`, // file path
      })
    ))
    .pipe(plugins.if(
      type === 'html',
      plugins.replace(/\.less|\.scss/g, '.css')
    ))
    .pipe(plugins.if(
      type === 'less' || type === 'scss',
      plugins.autoprefixer('last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
    ))
    .pipe(plugins.if(
      type === 'less',
      plugins.less({ style: 'expanded' })
    ))
    .pipe(plugins.if(
      type === 'scss',
      plugins.sass({ style: 'expanded' })
    ))
    .pipe(dest(`${projectPath}/.tmp`));
}
module.exports = { unlink, change }