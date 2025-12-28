/**
 * Created by Andste on 2018/7/2.
 * buyer_pc : 买家PC端
 * buyer_wap: 买家WAP端
 * seller   : 商家中心
 * admin    : 后台管理
 * decor    : 装修中心
 */

module.exports = {
  // 开发环境
  dev: {
    buyer_pc : 'http://127.0.0.1:3000',
    buyer_wap: 'http://127.0.0.1:3001',
    seller   : 'http://127.0.0.1:3002',
    admin    : 'http://127.0.0.1:3003',
    decor    : 'http://127.0.0.1:3004'
  },
  // 测试环境
  test: {
    buyer_pc : window.__ENV__.DOMAIN_BUYER_PC || '${PROTOCOL}://${BUYER_PC_DOMAIN}:${BUYER_PC_PORT}',
    buyer_wap: window.__ENV__.DOMAIN_BUYER_WAP || '${PROTOCOL}://${BUYER_WAP_DOMAIN}:${BUYER_WAP_PORT}',
    seller   : window.__ENV__.DOMAIN_SELLER || '${PROTOCOL}://${SELLER_DOMAIN}:${SELLER_PORT}',
    admin    : window.__ENV__.DOMAIN_ADMIN || '${PROTOCOL}://${ADMIN_DOMAIN}:${ADMIN_PORT}',
    decor    : window.__ENV__.DOMAIN_DECOR || '${PROTOCOL}://${DECOR_DOMAIN}:${DECOR_PORT}'
  },
  // 生产环境
  pro: {
    buyer_pc : window.__ENV__.DOMAIN_BUYER_PC || '${PROTOCOL}://${BUYER_PC_DOMAIN}:${BUYER_PC_PORT}',
    buyer_wap: window.__ENV__.DOMAIN_BUYER_WAP || '${PROTOCOL}://${BUYER_WAP_DOMAIN}:${BUYER_WAP_PORT}',
    seller   : window.__ENV__.DOMAIN_SELLER || '${PROTOCOL}://${SELLER_DOMAIN}:${SELLER_PORT}',
    admin    : window.__ENV__.DOMAIN_ADMIN || '${PROTOCOL}://${ADMIN_DOMAIN}:${ADMIN_PORT}',
    decor    : window.__ENV__.DOMAIN_DECOR || '${PROTOCOL}://${DECOR_DOMAIN}:${DECOR_PORT}'
  }

}
