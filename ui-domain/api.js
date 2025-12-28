/**
 * Created by Andste on 2018/7/2.
 * base    : 基础业务API
 * buyer   : 买家API
 * seller  : 商家中心API
 * admin   ：后台管理API
 * im      ：客服系统API
 */

module.exports = {
  // 开发环境
  dev: {
    base  : 'http://localhost:8080',
    buyer : 'http://localhost:8080',
    seller: 'http://localhost:8080',
    admin : 'http://localhost:8080'
    
  },
  // 测试环境
  test: {
    base  : window.__ENV__.API_BASE   || 'https://base-bbc-api.shoptnt.cn',
    buyer : window.__ENV__.API_BUYER  || 'https://shop-bbc-api.shoptnt.cn',
    seller: window.__ENV__.API_SELLER || 'https://seller-bbc-api.shoptnt.cn',
    admin : window.__ENV__.API_ADMIN  || 'https://manager-bbc-api.shoptnt.cn'
  },
  // 生产环境
  pro: {
    base  : window.__ENV__.API_BASE || 'https://base-bbc-api.shoptnt.cn',
    buyer : window.__ENV__.API_BUYER || 'https://shop-bbc-api.shoptnt.cn',
    seller: window.__ENV__.API_SELLER || 'https://seller-bbc-api.shoptnt.cn',
    admin : window.__ENV__.API_ADMIN || 'https://manager-bbc-api.shoptnt.cn'
  }
}
