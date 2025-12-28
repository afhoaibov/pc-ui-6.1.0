/**
 * Created by Andste on 2018/5/7.
 */
import Storage from './storage'
import * as API_Common from '@/api/common'
import { MessageBox } from 'element-ui'
import { decorType } from '@/utils/decor-types'
import { sendAndSaveToken } from '@/utils/wait-token'

/**
 * 检查token：
 * 1. user/accessToken/refreshToken都存在。
 *    表示所有条件满足，放行所有API
 * 2. 不存在accessToken，但是user/refreshToken存在。
 *    表示accessToken过期，需要重新获取accessToken。
 *    如果重新获取accessToken返回token失效错误，说明已被登出。
 * @returns {Promise<any>}
 */
export default function checkToken() {
  // user
  const user = Storage.getItem(`${decorType}_user`)
  // 访问Token
  const accessToken = Storage.getItem(`${decorType}_access_token`)
  // 刷新Token
  const refreshToken = Storage.getItem(`${decorType}_refresh_token`)
  // 返回异步方法
  return new Promise(resolve => {
    /**
     * 如果accessToken、user、refreshToken都存在。
     * 说明必要条件都存在，可以直接通过，并且不需要后续操作。
     */
    if (accessToken && user && refreshToken) {
      return resolve()
    }
    /**
     * 如果refreshToken或者user没有
     * 说明登录已失效、或者cookie有问题，需要重新登录。
     */
    if (!refreshToken || !user) {
      return closeWindow()
    }
    /**
     * 不存在accessToken，但是user/refreshToken存在。
     * 说明用户已登录，只是accessToken过期，需要重新获取accessToken。
     * 如果没有needToken，说明不需要等待获取到新的accessToken后再请求。
     * 否则，需要等待
     */
    if (!accessToken && user && refreshToken) {
      /**
       * 如果没有刷新token锁，需要刷新token。
       * 如果有刷新token锁，则进入循环检测。
       */
      if (!window.__refreshTokenLock__) {
        // console.log(options.url + ' | 检测到accessToken失效，这个请求需要等待刷新token。')
        // 开始请求新的Token，并加锁。
        window.__refreshTokenLock__ = true
        API_Common.refreshToken().then(response => {
          sendAndSaveToken({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          })
          window.__refreshTokenLock__ = null
          // console.log(options.url + ' | 已拿到新的token。')
          resolve()
        }).catch(() => {
          window.__refreshTokenLock__ = undefined
          return closeWindow()
        })
      } else {
        // console.log('进入循环检测...')
        // 循环检测刷新token锁，当刷新锁变为null时，说明新的token已经取回。
        const checkLock = () => {
          setTimeout(() => {
            const __RTK__ = window.__refreshTokenLock__
            // console.log(options.url + ' | 是否已拿到新的token：', __RTK__ === null)
            if (__RTK__ === undefined) {
              // console.log('登录已失效了，不用再等待了...')
              return closeWindow()
            }
            __RTK__ === null
              ? resolve()
              : checkLock()
          }, 500)
        }
        checkLock()
      }
      return
    }
    resolve()
  })
}

function closeWindow() {
  MessageBox.alert('您的登录状态已失效，请返回重新登录！', '权限错误', {
    type: 'error',
    callback: window.close
  })
}
