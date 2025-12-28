/**
 * 店铺相关API
 */

import request from '@/utils/request'

/**
 * 获取店铺信息
 * @returns {Promise<any>}
 */
export function getShopData() {
  return request({
    url: 'seller/shops',
    method: 'get'
  })
}

/**
 * 保存店铺设置
 * @param params
 * @returns {Promise<any>}
 */
export function saveShopSettings(params) {
  return request({
    url: 'seller/shops',
    method: 'put',
    data: params
  })
}

/**
 * 修改店铺库存预警数
 * @param params
 * @returns {Promise<any>}
 */
export function saveStockWarningNum(params) {
  return request({
    url: 'seller/shops/warning-counts',
    method: 'put',
    data: params
  })
}

/**
 * 修改店铺logo
 * @param params
 * @returns {Promise<any>}
 */
export function updateShopLogo(params) {
  return request({
    url: 'seller/shops/logos',
    method: 'put',
    data: params
  })
}

/**
 * 获取店铺状态
 */
export function getShopStatus() {
  return request({
    url: 'seller/shops/status',
    method: 'get',
    loading: 0.2
  })
}

/**
 * 设置虚拟商品核销密码
 * @param sn
 * @returns {Promise<any>}
 */
export function setRedeemPassword(params) {
  return request({
    url: 'seller/shops/redeem-password',
    method: 'put',
    data: params
  })
}
/**
 * 保证金缴费
 * @param {*} params
 * @returns
 */
export function updateShopRemainingMargin(params) {
  return request({
    url: `seller/shops/margin-flow`,
    method: 'post',
    params
  })
}

/**
 * 获取分类子集
 * @param parent_id
 */
export function getCategoryChildren(parent_id = 0) {
  return request({
    url: `seller/goods/category/${parent_id}/all-children`,
    method: 'get',
    loading: false
  })
}
/**
 * 获取店铺详情
 * @param {*} shop_id
 * @returns
 */
export function getShopDetail(shop_id) {
  return request({
    url: `seller/shops/detail`,
    method: 'get',
    loading: false
  })
}

/**
 * 更新店铺信息数据
 * @param {*} shop_id
 * @param {*} params
 * @returns
 */
export function editAuthShop(params) {
  return request({
    url: `seller/shops/edit`,
    method: 'put',
    data: params
  })
}
/**
 * 保证金流水查询
 * @param {*} params
 * @returns
 */
export function getShopRemainingMargin(params) {
  return request({
    url: `seller/shops/margin-flow/history`,
    method: 'get',
    params
  })
}
