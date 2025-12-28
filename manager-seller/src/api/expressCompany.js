/**
 * 物流公司相关API
 */

import request from '@/utils/request'

/**
 * 获取物流公司列表
 * @param params
 * @returns {Promise<any>}
 */
export function getExpressCompanyList(params) {
  return request({
    url: 'seller/shops/logi-companies',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取店铺一样开启的物流公司列表
 * @param params
 * @returns {Promise<any>}
 */
export function getEnabledExpressCompanyList(params) {
  return request({
    url: 'seller/shops/logi-companies/enabled',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 开启 物流公司
 * @param ids
 * @param params
 * @returns {Promise<any>}
 */
export function openExpressPower(ids, params) {
  return request({
    url: `seller/shops/logi-companies/${ids}`,
    method: 'post',
    data: params
  })
}

/**
 * 关闭 物流公司
 * @param ids
 * @param params
 * @returns {Promise<any>}
 */
export function closeExpressPower(ids, params) {
  return request({
    url: `seller/shops/logi-companies/${ids}`,
    method: 'delete',
    loading: false,
    params
  })
}

/**
 * 设置 菜鸟电子面单token
 * @param param
 * @returns {Promise<any>}
 */
export function setCainiaoWaybillToken(param) {
  return request({
    url: `seller/shops/logi-companies/waybill/cainiao`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    loading: false,
    data: param
  })
}

/**
 * 获取菜鸟电子面单设置
 * @returns {Promise<any>}
 */
export function getCainiaoWaybillToken() {
  return request({
    url: 'seller/shops/logi-companies/waybill/cainiao',
    method: 'get',
    loading: false
  })
}

/**
 * 获取菜鸟电子面单的物流公司列表
 * @param params
 * @returns {Promise<any>}
 */
export function getLogisticsCainiaoTemplateList(params) {
  return request({
    url: '/seller/shops/logi-cainiao-template',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 保存物流公司电子面单模板
 * @param logisticsId
 * @param param
 * @returns {Promise<any>}
 */
export function saveLogisticsCainiaoTemplate(logisticsId, param) {
  return request({
    url: `/seller/shops/logi-cainiao-template/${logisticsId}`,
    method: 'post',
    loading: false,
    data: param
  })
}
