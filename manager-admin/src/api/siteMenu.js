/**
 * 导航栏相关API
 */

import request from '@/utils/request'

/**
 * 获取导航菜单列表
 * @param params
 */
export function getSiteMenuList(params) {
  return request({
    url: '/admin/shops/navigations',
    method: 'get',
    loading: false,
    params: { shop_id: 0, ...params }
  })
}

/**
 * 添加导航菜单
 * @param client_type
 * @param params
 */
export function addSiteMenu(client_type = 'PC', params) {
  return request({
    url: '/admin/shops/navigations',
    method: 'post',
    data: { shop_id: 0, ...params }
  })
}

/**
 * 获取导航菜单详情
 * @param id
 */
export function getSiteMenuDetail(id) {
  return request({
    url: `/admin/shops/navigations/${id}`,
    method: 'get'
  })
}

/**
 * 修改导航菜单
 * @param id
 * @param params
 */
export function editSiteMenu(id, params) {
  return request({
    url: `/admin/shops/navigations/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 删除导航菜单
 * @param id
 */
export function deleteSiteMenu(id) {
  return request({
    url: `/admin/shops/navigations/${id}`,
    method: 'delete'
  })
}
