/**
 * OAuth2 Client 相关API
 */

import request from '@/utils/request'

/**
 * 分页列表
 * @param params
 */
export function getList(params) {
  return request({
    url: '/admin/systems/oauth2-client',
    method: 'get',
    params
  })
}

/**
 * 添加
 * @param data
 */
export function add(data) {
  return request({
    url: '/admin/systems/oauth2-client',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: data
  })
}

/**
 * 查询详情
 * @param id
 */
export function getDetail(id) {
  return request({
    url: `/admin/systems/oauth2-client/${id}`,
    method: 'get'
  })
}

/**
 * 修改
 * @param id
 * @param data
 */
export function edit(id, data) {
  return request({
    url: `/admin/systems/oauth2-client/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: data
  })
}

/**
 * 删除
 * @param id
 */
export function del(id) {
  return request({
    url: `/admin/systems/oauth2-client/${id}`,
    method: 'delete'
  })
}
