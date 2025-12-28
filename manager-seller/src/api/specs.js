/**
 * 规格相关API
 */

import request from '@/utils/request'

/**
 * 获取规格列表
 * @param params
 * @returns {*|Promise<unknown>}
 */
export function getSpecList(params) {
  return request({
    url: `/seller/goods/spec`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取所有规格
 * @returns {*|Promise<unknown>}
 */
export function getAllSpecs() {
  return request({
    url: '/seller/goods/spec/all',
    method: 'get',
    loading: false
  })
}

/**
 * 添加规格
 * @param data
 * @returns {*|Promise<unknown>}
 */
export function addSpec(data) {
  return request({
    url: `/seller/goods/spec`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 修改规格
 * @param id
 * @param data
 * @returns {*|Promise<unknown>}
 */
export function updateSpec(id, data) {
  return request({
    url: `/seller/goods/spec/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取规格详情
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function getSpecDetail(id) {
  return request({
    url: `/seller/goods/spec/${id}`,
    method: 'get'
  })
}

/**
 * 删除规格
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function deleteSpec(id) {
  return request({
    url: `/seller/goods/spec/${id}`,
    method: 'delete'
  })
}

