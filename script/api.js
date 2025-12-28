/**
 * Created by Andste on 2018/7/2.
 * base    : 基础业务API
 * buyer   : 买家API
 * seller  : 商家中心API
 * admin   ：后台管理API
 */

module.exports = {
  // 开发环境
  dev: {
    base  : 'http://127.0.0.1:7001',
    buyer : 'http://127.0.0.1:7002',
    seller: 'http://127.0.0.1:7003',
    admin : 'http://127.0.0.1:7004'
  },
  // 测试环境
  test: {
    base  : window.__ENV__.API_BASE || '${PROTOCOL}://${BASE_API_DOMAIN}:${BASE_API_PORT}',
    buyer : window.__ENV__.API_BUYER || '${PROTOCOL}://${BUYER_API_DOMAIN}:${BUYER_API_PORT}',
    seller: window.__ENV__.API_SELLER || '${PROTOCOL}://${SELLER_API_DOMAIN}:${SELLER_API_PORT}',
    admin : window.__ENV__.API_ADMIN || '${PROTOCOL}://${ADMIN_API_DOMAIN}:${ADMIN_API_PORT}'
  },
  // 生产环境
  pro: {
    base  : window.__ENV__.API_BASE || '${PROTOCOL}://${BASE_API_DOMAIN}:${BASE_API_PORT}',
    buyer : window.__ENV__.API_BUYER || '${PROTOCOL}://${BUYER_API_DOMAIN}:${BUYER_API_PORT}',
    seller: window.__ENV__.API_SELLER || '${PROTOCOL}://${SELLER_API_DOMAIN}:${SELLER_API_PORT}',
    admin : window.__ENV__.API_ADMIN || '${PROTOCOL}://${ADMIN_API_DOMAIN}:${ADMIN_API_PORT}'
  }

}
