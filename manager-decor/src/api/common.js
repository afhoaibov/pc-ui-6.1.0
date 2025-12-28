/**
 * 公共API
 */
import request from '@/utils/request'
import Storage from '@/utils/storage'
import { decorType } from '@/utils/decor-types'
import { api } from '~/ui-domain'

/**
 * seller/check/token
 * seller_refresh_token
 * 刷新token
 */
export function refreshToken() {
  return request({
    url: decorType === 'seller' ? 'seller/check/token' : 'admin/systems/admin-users/token',
    method: 'post',
    data: {
      refresh_token: Storage.getItem(`${decorType}_refresh_token`)
    }
  })
}

/**
 * 获取语言数据
 * @param lang
 * @returns {*}
 */
export function getLang(lang) {
  return request({
    url: `${api.base}/base/lang?lang=${lang}&type=decor`,
    method: 'get',
    needToken: false
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
