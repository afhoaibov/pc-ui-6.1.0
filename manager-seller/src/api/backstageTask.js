import request from '@/utils/request'

/**
 * 获取导入导出任务记录列表
 * @returns
 */
export function geTaskRecord(params) {
  return request({
    url: 'seller/task',
    method: 'get',
    params
  })
}
