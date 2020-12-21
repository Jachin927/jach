module.exports = {
  serve: {
    port: 7777, // 默认端口
    folder: 'app', // 默认索引文件夹
    index: 'index.html', // 默认索引文件
    ghost: false, // 是否启用所有设备同步输入
  },
  build: {
    hash: true, // 是否使用 hash 缓存
    compress: { // 对应文件是否压缩
      html: false,
      css: false,
      js: false
    }
  }
}