/**
 * 看板相关API
 */

import request, { Method } from '@/utils/request'

/**
 * 获取预算剩余,发生和预警数据
 * @param is_company
 */
export function getTotalData(is_company, params) {
  return request({
    url: `/budget-look/${is_company}`,
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 获取预算发生(可搜索)
 * @param params
 */
export function getBudgetHappen(params) {
  return request({
    url: `/budget-look/actual`,
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 获取部门数据
 * @param params
 */
export function getDeptSearch(params) {
  return request({
    url: `/budget-look`,
    method: Method.GET,
    needToken: true,
    params
  })
}
