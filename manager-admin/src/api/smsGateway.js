/**
 * 短信网关相关API
 */

import request from '@/utils/request'

/**
 * 获取短信网关列表
 * @param params
 */
export function getSmsGatewayList(params) {
  return request({
    url: 'admin/notice/platforms',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 修改短信网关参数
 * @param id 短信网关ID
 * @param params 短信网关参数
 * @returns {*}
 */
export function editSmsGateway(id, params) {
  return request({
    url: `admin/notice/platforms/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 开启短信网关
 * @param id
 * @returns {*}
 */
export function openSmsGatewayById(id) {
  return request({
    url: `/admin/notice/platforms/${id}/open`,
    method: 'put'
  })
}

/**
 * 查询短信模板列表
 * @param params
 * @returns {*}
 */
export function getSmsTemplateList(params) {
  return request({
    url: `admin/systems/sms-template`,
    method: 'get',
    params
  })
}

/**
 * 查询一个短信模板
 * @param id
 * @returns {*}
 */
export function getSmsTemplateDetail(id) {
  return request({
    url: `/admin/systems/sms-template/${id}`,
    method: 'get'
  })
}

/**
 * 修改短信模板
 * @param id
 * @param content
 * @returns {*}
 */
export function getSmsTemplate(id, content) {
  return request({
    url: `/admin/systems/sms-template/${id}`,
    method: 'put',
    params: { content }
  })
}

/**
 * 短信模板提交审核
 * @param id
 * @param remark
 * @returns {*}
 */
export function getAuditSmsTemplate(id, remark) {
  return request({
    url: `admin/systems/sms-template/${id}/audit`,
    method: 'get',
    params: { remark }
  })
}

/**
 * 修改短信模板开启状态
 * @param id
 * @param enable_status
 * @returns {*}
 */
export function getSmsTemplateStatus(id, enable_status) {
  return request({
    url: `/admin/systems/sms-template/${id}/enable-status`,
    method: 'put',
    params: { enable_status }
  })
}

/**
 * 获取开启的短信网关
 */
export function getOpenSmsPlatforms() {
  return request({
    url: 'admin/notice/platforms/open',
    method: 'get'
  })
}
