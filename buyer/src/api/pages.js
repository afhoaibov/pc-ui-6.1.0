import request, { Method } from '@/utils/request'

/**
 * 获取微页面详情
 * @param id
 * @returns {*}
 */
export function getPageDetail(id) {
  return request({
    url: `/buyer/pages/${id}`,
    method: Method.GET
  })
}

/**
 * 获取首页数据
 * @returns {*}
 */
export function getIndexPage() {
  return request({
    url: `/buyer/pages/PC/index`,
    method: Method.GET
  })
}

/**
 * 获取店铺首页数据
 * @returns {*}
 */
export function getShopIndexPage(shop_id) {
  return request({
    url: `/buyer/pages/PC/${shop_id}/index`,
    method: Method.GET
  })
}

