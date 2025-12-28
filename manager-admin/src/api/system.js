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
    url: 'admin/system-logs',
    method: 'get',
    params
  })
}
