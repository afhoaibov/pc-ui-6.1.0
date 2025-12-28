/**
 * 货币汇率平台相关API
 */

import request from '@/utils/request'

/**
 * 获取货币汇率平台列表
 */
export function getExchangeRatePlatformList() {
  return request({
    url: '/admin/i18n/exchange-rate-platform',
    method: 'get',
    loading: false
  })
}

/**
 * 修改货币汇率平台参数
 * @param pluginId
 * @param params
 */
export function editExchangeRatePlatform(pluginId, params) {
  return request({
    url: `/admin/i18n/exchange-rate-platform/${pluginId}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 开启货币汇率平台
 * @param pluginId
 */
export function openExchangeRatePlatformById(pluginId) {
  return request({
    url: `/admin/i18n/exchange-rate-platform/${pluginId}/status`,
    method: 'put'
  })
}
