/**
 * o2o相关API
 */

import request from '@/utils/request'
import { api } from '~/ui-domain'

/**
 * 获取店铺信息
 * @returns {Promise<any>}
 */
export function getShopData() {
  return request({
    url: `${api.o2o}/seller/o2o/shops`,
    method: 'get',
    loading: false
  })
}

/**
 * 保存店铺设置
 * @param params
 * @returns {Promise<any>}
 */
export function saveShopSettings(params) {
  return request({
    url: `${api.o2o}/seller/o2o/shops`,
    method: 'put',
    data: params
  })
}

/**
 * 保存店铺运费设置
 * @param params
 * @returns {Promise<any>}
 */
export function saveShopFreightSettings(params) {
  return request({
    url: `${api.o2o}/seller/o2o/shops/freight`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    params
  })
}

/**
 * 上架正常商品 商品相关API-添加商品
 * @param params
 * @returns {Promise<any>}
 */
export function aboveGoods(params) {
  return request({
    url: `${api.o2o}/seller/o2o/goods`,
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 修改正常商品 编辑商品时用到
 * @param id
 * @param params
 * @returns {Promise<any>}
 */
export function editGoods(id, params) {
  return request({
    url: `${api.o2o}/seller/o2o/goods/${id}`,
    method: 'put',
    data: params,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 查询单个商品信息 商品列表 编辑
 * @param ids
 * @returns {Promise<any>}
 */
export function getGoodData(id) {
  return request({
    url: `${api.o2o}/seller/o2o/goods/${id}`,
    method: 'get',
    loading: false
  })
}
