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
    needToken: false,
    method: 'GET'
  })
}

/**
 * 刷新token
 */
export function refreshToken() {
  return request({
    url: 'seller/check/token',
    method: 'post',
    needToken: false,
    data: {
      refresh_token: Storage.getItem('seller_refresh_token')
    }
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
 * 获取语言包
 * @returns {*}
 */
export function getLang(lang) {
  return request({
    url: `${api.base}/base/lang?lang=${lang}&type=seller`,
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

/**
 * 获取默认货币
 * @returns {*|Promise<unknown>}
 */
export function getDefaultCurrency() {
  return request({
    url: `/seller/i18n/currencies/default`,
    method: 'get',
    needToken: false
  })
}
