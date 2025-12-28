import Storage from '@/utils/storage'
import { decorType } from '@/utils/decor-types'
import jwt_decode from 'jwt-decode'
import Mixins from './mixins'

/**
 * 等待Admin或者Seller端发来Token相关数据
 * @returns {Promise<unknown>}
 */
export function waitTokenData() {
  return new Promise(resolve => {
    const refreshToken = Storage.getItem(`${decorType}_refresh_token`)
    if (refreshToken) return resolve()
    // 接收Admin或者Seller端发送过来的数据
    window.addEventListener('message', (event) => {
      // if (![domain.admin, domain.seller].includes(event.origin)) return
      if (typeof event.data.type !== 'string' || event.data.type !== 'SYNC_DECOR') return
      Object.keys(event.data).forEach(key => {
        if (key === 'type') return
        const value = event.data[key]
        const options = {}
        if (key.indexOf('_token') !== -1) {
          try {
            options.expires = new Date(jwt_decode(value).exp * 1000)
          } catch (e) {
            //
          }
        }
        Storage.setItem(key, value, options)
      })
      window.opener.postMessage('decorReceived', '*')
      resolve()
    }, false)
  })
}

/**
 * 更新Admin或者Seller端Token
 * @param data
 */
export function sendAndSaveToken(data) {
  const targetOrigin = decorType === 'seller'
    ? Mixins.computed.$$Domain().seller
    : Mixins.computed.$$Domain().admin
  const accessExpires = new Date(jwt_decode(data.accessToken).exp * 1000)
  Storage.setItem(`${decorType}_access_token`, data.accessToken, { expires: accessExpires })
  const refreshExpires = new Date(jwt_decode(data.refreshToken).exp * 1000)
  Storage.setItem(`${decorType}_refresh_token`, data.refreshToken, { expires: refreshExpires })
  data.type = 'SYNC_DECOR_TOKEN'
  window.opener.postMessage(data, targetOrigin)
}
