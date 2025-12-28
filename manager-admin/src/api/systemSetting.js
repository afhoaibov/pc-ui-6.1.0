/**
 * 系统设置
 */

import request from '@/utils/request'
import md5 from 'js-md5'

/**
 * 获取站点设置
 */
export function getSiteSetting() {
  return request({
    url: 'admin/settings/site',
    method: 'get',
    loading: false
  })
}

/**
 * 修改站点设置
 * @param params
 */
export function editSiteSetting(params) {
  return request({
    url: 'admin/settings/site',
    method: 'put',
    data: params
  })
}

/**
 * 获取积分设置
 */
export function getPointSetting() {
  return request({
    url: 'admin/settings/point',
    method: 'get'
  })
}

/**
 * 修改积分设置
 * @param params
 */
export function editPointSetting(params) {
  return request({
    url: 'admin/settings/point',
    method: 'put',
    data: params
  })
}

/**
 * 获取账号安全设置
 */
export function getAccountSetting() {
  return request({
    url: 'admin/settings/account',
    method: 'get'
  })
}

/**
 * 修改账号安全设置
 * @param params
 */
export function editAccountSetting(params) {
  return request({
    url: 'admin/settings/account',
    method: 'put',
    data: params
  })
}

/**
 * 查询二次身份验证设置
 */
export function getAuthenticationsSetting() {
  return request({
    url: 'admin/systems/authentications',
    method: 'get'
  })
}
/**
 * 二次身份验证校验验证码
 */
export function validCode(params) {
  return request({
    url: 'admin/systems/authentications/valid/code',
    method: 'put',
    data: params
  })
}
/**
 * 二次身份验证发送验证码
 */
export function smsCode(mobile) {
  return request({
    url: `admin/systems/authentications/smscode/${mobile}`,
    method: 'put',
  })
}
/**
 * 修改二次身份验证设置密码
 * @param params
 */
export function updatePassword(params) {
  console.log(params)
  if (params.password) {
    params.password = md5(params.password)
  }
  return request({
    url: 'admin/systems/authentications/update-password',
    method: 'put',
    data: params
  })
}
/**
 * 修改二次身份验证设置
 * @param params
 */
export function editAuthenticationsSetting(params) {
  console.log(params)
  if (params.password) {
    params.password = md5(params.password)
  }
  if (params.old_password) {
    params.old_password = md5(params.old_password)
  }
  return request({
    url: 'admin/systems/authentications',
    method: 'put',
    data: params
  })
}

/**
 * 获取新用户优惠券设置
 */
export function getNewComerCouponSetting() {
  return request({
    url: 'admin/settings/new-comer-coupon',
    method: 'get'
  })
}

/**
 * 修改新用户优惠券设置
 */
export function editNewComerCouponSetting(data) {
  return request({
    url: 'admin/settings/new-comer-coupon',
    method: 'put',
    data
  })
}

/**
 * 清空数据
 * @param {*} data
 * @returns
 */
export function cleanAllData(data) {
  return request({
    url: 'admin/system/clean-all',
    method: 'put',
    data,
    loading: false
  })
}
