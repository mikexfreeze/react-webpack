var path = require('path')

module.exports = {
  prod: {
    env: require('./prod.env'),
  },
  dev: {
    env: require('./dev.env'),
    port: 8080,//开发模式项目默认启动端口
    // autoOpenBrowser: true,
    // assetsSubDirectory: 'static',
    // assetsPublicPath: '/',
    // proxyTable: {},
    // cssSourceMap: false
  },
  dist: path.resolve(__dirname, '../dist')
}
