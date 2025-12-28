/**
 * 进度相关API
 */

import request from '@/utils/request'

/**
 * 查看是否有任务正在进行
 * @param task_id
 */
export function hasTask(task_id) {
  return request({
    url: `admin/task/${task_id}`,
    method: 'get',
    message: false,
    loading: false
  })
}

/**
 * 获取进度条
 * @param task_id
 */
export function getProgressById(task_id) {
  return request({
    url: `admin/task/${task_id}/progress`,
    method: 'get',
    loading: false
  })
}

/**
 * 清除任务
 * @param task_id
 */
export function clearTask(task_id) {
  return request({
    url: `admin/task/${task_id}`,
    method: 'delete'
  })
}

/**
 * 获取导入导出任务记录列表
 * @returns
 */
export function geTaskRecord(params) {
  return request({
    url: 'admin/task',
    method: 'get',
    params
  })
}

/**
 * 终止导入任务
 * @param params
 * @returns {Promise<any>}
 */
export function terminationImportsTask(params) {
  return request({
    url: `/admin/import/imports/task/force-stop`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取导入任务状态
 * @param params
 * @returns {Promise<any>}
 */
export function goodsImportsStatus(params) {
  return request({
    url: `/admin/import/imports/status`,
    method: 'get',
    loading: false,
    params
  })
}
