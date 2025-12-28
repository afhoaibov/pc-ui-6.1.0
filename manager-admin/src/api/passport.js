/**
 * 安全相关API
 */

import request from '@/utils/request'
import md5 from 'js-md5'

/**
 * 二次身份验证-获取验证码
 * @param params
 */
export function sendSmsCode(params) {
  return request({
    url: 'admin/passport/sms-code',
    method: 'post',
    params
  })
}

/**
 * 二次身份验证-验证手机验证码
 * @param params
 */
export function checkSmsCode(params) {
  return request({
    url: 'admin/passport/check-sms-code',
    method: 'post',
    params
  })
}

/**
 * 二次身份验证-验证密码
 * @param params
 */
export function checkPassword(params) {
  params = JSON.parse(JSON.stringify(params))
  params.password = md5(params.password)
  return request({
    url: 'admin/passport/check-password',
    method: 'post',
    params
  })
}

