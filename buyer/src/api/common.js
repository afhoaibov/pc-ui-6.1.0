/**
 * 公共API
 */

import request, { Method } from '@/utils/request'
import Storage from '@/utils/storage'
import { api } from '~/ui-domain'

/**
 * 获取图片验证码URL
 * @param uuid
 * @param type
 * @returns {string}
 */
export function getValidateCodeUrl(uuid, type) {
  if (!uuid || !type) return ''
  return `${api.base}/base/captchas/${uuid}/${type}?r=${new Date().getTime()}`
}

/**
 * 获取验证方式
 */
export function getValidator() {
  return request({
    url: `${api.base}/base/validator`,
    method: Method.GET
  })
}

/**
 * 获取站点信息
 */
export function getSiteInfo() {
  return request({
    url: `${api.base}/base/site-show`,
    method: Method.GET,
    loading: false
  })
}

/**
 * 记录浏览量【用于统计】
 */
export function recordViews(url) {
  return request({
    url: '/buyer/view',
    method: Method.GET,
    loading: false,
    needToken: !!Storage.getItem('refresh_token'),
    params: {
      url,
      uuid: Storage.getItem('uuid')
    }
  })
}

/**
 * 记录浏览量【用于平台统计】
 */
export function recordPlatformViews() {
  return request({
    url: '/buyer/view/platform-pv',
    method: Method.GET,
    loading: false,
    needToken: !!Storage.getItem('refresh_token'),
    params: {
      uuid: Storage.getItem('uuid')
    }
  })
}

/**
 * 获取语言包
 * @returns {*}
 */
export function getLang(lang) {
  return request({
    url: `${api.base}/base/lang?lang=${lang}&type=buyer`,
    needToken: false,
    loading: false,
    method: Method.GET
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
 * 获取base64图片
 * @param url
 */
export function getBase64(url) {
  return request({
    url: `${api.base}/base/net-image/base64`,
    method: Method.GET,
    params: {
      url
    }
  })
}

/**
 * 获取Stripe密钥
 * @returns {*|Promise<unknown>}
 */
export function getStripeKey() {
  return request({
    url: `${api.base}/base/stripe/secret`,
    method: Method.GET
  })
}
