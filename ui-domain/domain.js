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
    buyer_pc : 'https://shop-bbc.shoptnt.cn',
    buyer_wap: 'https://wap-bbc.shoptnt.cn',
    seller   : 'https://seller-bbc.shoptnt.cn',
    admin    : 'https://manager-bbc.shoptnt.cn',
    decor    : 'https://decor-bbc.shoptnt.cn'
  },
  // 测试环境
  test: {
    buyer_pc : window.__ENV__.DOMAIN_BUYER_PC  || 'https://shop-bbc.shoptnt.cn',
    buyer_wap: window.__ENV__.DOMAIN_BUYER_WAP || 'https://wap-bbc.shoptnt.cn',
    seller   : window.__ENV__.DOMAIN_SELLER    || 'https://seller-bbc.shoptnt.cn',
    admin    : window.__ENV__.DOMAIN_ADMIN     || 'https://manager-bbc.shoptnt.cn',
    decor    : window.__ENV__.DOMAIN_DECOR     || 'https://decor-bbc.shoptnt.cn'
  },
  // 生产环境
  pro: {
    buyer_pc : window.__ENV__.DOMAIN_BUYER_PC  || 'https://shop-bbc.shoptnt.cn',
    buyer_wap: window.__ENV__.DOMAIN_BUYER_WAP || 'https://wap-bbc.shoptnt.cn',
    seller   : window.__ENV__.DOMAIN_SELLER    || 'https://seller-bbc.shoptnt.cn',
    admin    : window.__ENV__.DOMAIN_ADMIN     || 'https://manager-bbc.shoptnt.cn',
    decor    : window.__ENV__.DOMAIN_DECOR     || 'https://decor-bbc.shoptnt.cn'
  }
}
