/**
 * 字段管理相关
 */
import request from '@/utils/request'

/**
 * 获取所有货币记录列表
 * @param {*} params
 * @returns
 */
export function getCurrenciesList(params) {
  return request({
    url: '/admin/i18n/currencies/list',
    method: 'get',
    params
  })
}

/**
 * 编辑货币记录配置
 * @returns
 */
export function editCurrencies(id, data) {
  return request({
    url: `/admin/i18n/currencies/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 更新货币数据
 * @returns
 */
export function updateCurrencies(id, data) {
  return request({
    url: `/admin/i18n/currencies/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 新增货币记录
 * @param {*} data
 * @returns
 */
export function addCurrencies(data) {
  return request({
    url: `/admin/i18n/currencies`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 更新货币开启状态
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function updateEnableStatus(id) {
  return request({
    url: `/admin/i18n/currencies/enable/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * 删除货币数据
 * @param {*} params
 * @returns
 */
export function deleteCurrency(id) {
  return request({
    url: `/admin/i18n/currencies/${id}`,
    method: 'delete'
  })
}

/**
 * 获取默认货币
 * @returns {*|Promise<unknown>}
 */
export function getDefaultCurrency() {
  return request({
    url: `/admin/i18n/currencies/default`,
    method: 'get',
    needToken: false
  })
}

/**
 * 刷新汇率
 * @param {*} params
 * @returns
 */
export function updateRate() {
  return request({
    url: `/admin/i18n/currencies/update-rate`,
    method: 'put',

  })
}

/**
 * 获取汇率
 * @param currency_code 货币代码
 * @returns
 */
export function getRate(currency_code) {
  return request({
    url: `/admin/i18n/currencies/rate`,
    method: 'get',
    params: { currency_code }
  })
}

/**
 * 自动更新汇率开关
 * @param currency_code 货币代码
 * @returns
 */
export function updateAutoRate(id, data) {
  return request({
    url: `/admin/i18n/currencies/auto-rate/${id}`,
    method: 'put',
    data
  })
}

