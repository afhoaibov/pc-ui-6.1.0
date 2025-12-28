/**
 * 支付方式相关API
 */

import request from '@/utils/request'

/**
 * 获取三方平台列表
 * @param params
 */
export function getThirdPlatformList(params) {
  return request({
    url: 'admin/systems/third-platform',
    method: 'get',
    params
  })
}

/**
 * 修改支付方式
 * @param payment_plugin_id 支付方式code
 * @param payment_method 支付方式详细配置
 */
export function editPayment(payment_plugin_id, payment_method) {
  return request({
    url: `admin/payment/payment-methods/${payment_plugin_id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: { ...payment_method }
  })
}

/**
 * 获取支付方式详情
 * @param payment_plugin_id
 */
export function getPaymentDetail(payment_plugin_id) {
  return request({
    url: `admin/payment/payment-methods/${payment_plugin_id}`,
    method: 'get'
  })
}

/**
 * 获取三方平台子应用配置列表
 * @param params
 */
export function getAppList(params) {
  return request({
    url: 'admin/systems/third-platform/app/' + params.plugin_id,
    method: 'get'
  })
}

/**
 * 修改三方平台子应用配置
 * @param params
 */
export function editThirdAppPlatform(id, data) {
  return request({
    url: `admin/systems/third-platform/app/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 切换子应用状态
 * @param data
 */
export function changeThirdAppStatus(id, params) {
  return request({
    url: `admin/systems/third-platform/app/disable/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    params
  })
}

/**
 * 切换三方应用状态
 * @param data
 */
export function changeThirdStatus(id, params) {
  return request({
    url: `admin/systems/third-platform/disable/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    params
  })
}

/**
 * 修改三方平台参数
 * @param params
 */
export function editThirdPlatform(id, data) {
  return request({
    url: `admin/systems/third-platform/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取收款方式详情
 * @param {*} id
 * @returns
 */
export function getThirdPlatform(id) {
  return request({
    url: `/admin/systems/third-platform/${id}`,
    method: 'get'
  })
}
