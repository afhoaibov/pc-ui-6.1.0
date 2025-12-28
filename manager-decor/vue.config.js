const path = require('path')
const alias = require('ui-domain/alias')
const assets = require('ui-domain/assets')
const enableAutoTester = require('../.auto-tester-config.js').ENABLE

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: assetsUrl(),
  devServer: {
    port: 3004,
    allowedHosts: 'all',
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('~', resolve(''))
      .set('@', resolve('src'))
    config.module
      .rule('rpx')
      .test(/\.vue$/)
      .use('./src/utils/rpx-to-px-loader')
      .loader('./src/utils/rpx-to-px-loader')
    if (enableAutoTester) {
      config.module
        .rule('auto-tester-loader')
        .test(/src\/main.js/)
        .use('../ui-utils/auto-tester-loader')
        .loader('../ui-utils/auto-tester-loader')
    }
    config.end()
  }
}

function assetsUrl() {
  let url = ''
  if (assets.decor) {
    url = assets.decor
    if (!assets.decor.endsWith('/')) url += '/'
  } else if (alias.decor) {
    if (!alias.decor.startsWith('/')) url += '/'
    url += alias.decor
    if (!alias.decor.endsWith('/')) url += '/'
  }
  url = url.replace(/\/\//g, '/')
  return url || undefined
}
