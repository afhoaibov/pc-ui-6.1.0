/**
 * 商品管理API
 */

import request from '@/utils/request'

/**
 * 获取商品列表
 * @param params
 */
export function getGoodsList(params) {
  return request({
    url: 'admin/goods',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 修改商品搜索优先级
 * @param goods_id
 * @param priority
 */
export function modifyPriority(goods_id, priority) {
  return request({
    url: 'admin/goodssearch/priority',
    method: 'put',
    params: { goods_id, priority }
  })
}

/**
 *  获取商品详情
 * @param {*} goods_id
 * @returns
 */
export function getGoodsDetail(goods_id) {
  return request({
    url: `admin/goods/${goods_id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取店铺分组
 * @param {*} goods_id
 * @returns
 */
export function getGoodsCategoryList(seller_id) {
  return request({
    url: `admin/shops/cats/${seller_id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 查询商品参数，获取所选分类关联的参数信息
 * @param ids
 * @param params
 * @returns {Promise<any>}
 */
export function getEditGoodsParams(category_id, goods_id) {
  return request({
    url: `admin/goods/categories/category/${category_id}/${goods_id}/params`,
    method: 'get',
    loading: false
  })
}
/**
 * 运费模板列表
 * @param template_id
 * @param params
 * @returns {Promise<any>}
 */
export function getTplList(template_id) {
  return request({
    url: `admin/shops/ship-templates/${template_id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取待审核商品列表
 * @param params
 */
export function getAuditGoods(params) {
  params.is_auth = 0
  return request({
    url: `admin/goods`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 审核商品
 * @param goods_ids
 * @param params
 * @returns {*}
 */
export function batchAuditGoods(param) {
  return request({
    url: `admin/goods/batch/audit`,
    method: 'POST',
    data: param,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 商品索引生成
 */
export function initSearchIndex() {
  return request({
    url: 'admin/goods/search',
    method: 'get'
  })
}

/**
 * 获取商品设置
 */
export function getGoodsSettings() {
  return request({
    url: 'admin/goods/settings',
    method: 'get'
  })
}

/**
 * 修改商品设置
 * @param params
 */
export function editGoodsSettings(params) {
  return request({
    url: 'admin/goods/settings',
    method: 'post',
    data: params
  })
}

/**
 * 导出商品
 * @param params
 */
export function exportGoods(params) {
  return request({
    url: 'admin/goods/export/sync',
    method: 'get',
    params
  })
}

/**
 * 设置推荐商品
 * @param {*} params
 * @returns
 */
export function changeRecommendStatus(params) {
  return request({
    url: 'admin/goodssearch/priority/recommend',
    method: 'put',
    params
  })
}
/**
 * 批量上架
 * @param {*} goods_ids
 * @returns
 */
export function goodsBatchUp(goods_ids) {
  return request({
    url: `admin/goods/${goods_ids}/up`,
    method: 'put'
  })
}

/**
 * 批量下架
 * @param {*} goods_ids
 * @returns
 */
export function goodsBatchUnder(goods_ids, params) {
  return request({
    url: `admin/goods/${goods_ids}/under`,
    method: 'put',
    params
  })
}

