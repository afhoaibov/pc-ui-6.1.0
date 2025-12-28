/**
 * 公共API
 */

import { api } from '~/ui-domain'
import request from '@/utils/request'
import Storage from '@/utils/storage'

/**
 * 获取图片验证码URL
 * @param scene
 * @param uuid
 * @returns {string}
 */
export function getValidateCodeUrl(scene, uuid) {
  return `${api.base}/base/captchas/${uuid}/${scene}?rmd=${new Date().getTime()}`
}

/**
 * 获取登陆验证方式
 */
export function getValidator() {
  return request({
    url: `${api.base}/base/validator`,
    method: 'GET',
    needToken: false
  })
}

/**
 * 刷新token
 */
export function refreshToken() {
  return request({
    url: 'admin/systems/admin-users/token',
    method: 'post',
    needToken: false,
    data: {
      refresh_token: Storage.getItem('admin_refresh_token')
    }
  })
}

/**
 * 获取首页数据
 */
export function getIndexData() {
  return request({
    url: 'admin/index/page',
    method: 'get',
    loading: false
  })
}

/**
 * 获取站点信息
 * @returns {*}
 */
export function getSiteInfo() {
  return request({
    url: `${api.base}/base/site-show`,
    method: 'get',
    needToken: false,
    loading: false
  })
}
/**
 * 获取首页流量走势图表数据
 * @returns
 */
export function getIndexPvChart(params) {
  return request({
    url: 'admin/index/page/pvChart',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取首页交易量图表
 * @param {*} params
 * @returns
 */
export function getIndexTurnoverChart(params) {
  return request({
    url: 'admin/index/page/turnoverChart',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取热卖店铺top10
 * @param {*} params
 * @returns
 */
export function getIndexHotShop(params) {
  return request({
    url: 'admin/index/page/hotShop',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取热卖商品top10
 * @param {*} params
 * @returns
 */
export function getIndexHotGoods(params) {
  return request({
    url: 'admin/index/page/hotGoods',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取语言包
 * @returns {*}
 */
export function getLang(lang) {
  return request({
    url: `${api.base}/base/lang?lang=${lang}&type=admin`,
    needToken: false,
    loading: false,
    method: 'get'
  })
}

/**
 * 获取支持的语言列表
 * @returns {*|Promise<unknown>}
 */
export function getLangCodes() {
  return request({
    url: `${api.base}/base/lang/codes`,
    needToken: false,
    loading: false,
    method: 'get'
  })
}
