/**
 * 首页商家商城基本信息API
 */

import request from '@/utils/request'
import { api } from '~/ui-domain'

/**
 * 获取首页统计信息
 * @returns {Promise<any>}
 */
export function getDashboardData() {
  return request({
    url: 'seller/statistics/dashboard/shop',
    method: 'get',
    loading: false
  })
}

/**
 * 获取店铺基础信息
 * @returns
 */
export function getDashboardShopScore() {
  return request({
    url: 'seller/statistics/dashboard/shopScore',
    method: 'get',
    loading: false
  })
}
/**
 * 获取商城公告
 * @param params
 * @returns {Promise<any>}
 */
export function getNotice(type, params) {
  return request({
    url: `${api.base}/base/pages/article-categories/${type}/articles`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取首页平台联系方式
 * @param params
 * @returns {Promise<any>}
 */
export function getConcate(params) {
  return request({
    url: `${api.base}/base/pages/${params.position}/articles`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取交易图表数据
 * @param {*} params
 * @returns
 */
export function getTurnoverChart(params) {
  return request({
    url: 'seller/statistics/dashboard/turnoverChart',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取商品销售排行
 * @param {*} params
 * @returns
 */
export function getHotGoodsCount(params) {
  return request({
    url: 'seller/statistics/dashboard/hotGoodsCount',
    method: 'get',
    loading: false,
    params
  })
}
/**
 * 获取交易排行
 * @param {*} params
 * @returns
 */
export function getHotGoodsAmount(params) {
  return request({
    url: 'seller/statistics/dashboard/hotGoodsAmount',
    method: 'get',
    loading: false,
    params
  })
}

