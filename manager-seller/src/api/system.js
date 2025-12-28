/**
 * 系统相关API
 */

import request from '@/utils/request'

/**
 * 获取日志列表
 * @param params
 * @returns {Promise<any>}
 */
export function getSystemLogs(params) {
  return request({
    url: 'seller/system-logs',
    method: 'get',
    params
  })
}

/**
 * 查询篡改记录列表
 * @param params
 * @returns {Promise<any>}
 */
export function getFalsifyRecord(params) {
  return request({
    url: 'admin/systems/falsify-record',
    method: 'get',
    params
  })
}

/**
 * 修复数据
 * @param params
 * @returns {Promise<any>}
 */
export function editFalsifyRecord(record_id) {
  return request({
    url: `admin/systems/falsify-record/${record_id}`,
    method: 'put'
  })
}

/**
 * 手动触发篡改数据扫描
 * @returns {Promise<any>}
 */
export function getFalsifyRecordScan() {
  return request({
    url: `admin/systems/falsify-record/scan`,
    method: 'get'
  })
}
