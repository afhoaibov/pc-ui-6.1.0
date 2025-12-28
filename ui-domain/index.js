let api    = require('./api')
let domain = require('./domain')

// 当前前台模式
let envString = process.env.NODE_ENV

const envApi = {
  development: api.dev,
  production: api.pro,
  test: api.test
}

const envDomain = {
  development: domain.dev,
  production: domain.pro,
  test: domain.test
}

module.exports =  {
  // 开发环境下的API
  api_dev: api.dev,
  // 生产环境下的API
  api_pro: api.pro,
  // 开发环境下的域名
  domain_dev: domain.dev,
  // 生产环境下的域名
  domain_pro: domain.pro,
  // API根据前台环境自动适配
  api: envApi[envString],
  // 域名根据前台环境自动适配
  domain: envDomain[envString]
}
