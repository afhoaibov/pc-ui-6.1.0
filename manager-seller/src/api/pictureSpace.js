/**
 * 图片空间API
 */

import request from '@/utils/request'

/**
 * 上传图片
 *param params
 * @returns {Promise<any>}
 */
export function uploadPicture(params) {
  return request({
    url: `/seller/shops/resource/batch`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 获取图片分组列表
 * @returns {Promise<any>}
 */
export function getPictureGroup(params) {
  return request({
    url: '/seller/shops/resource-group/tree-list',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 添加分组
 * @returns {Promise<any>}
 */
export function addPictureGroup(params) {
  return request({
    url: '/seller/shops/resource-group',
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    data: params
  })
}

/**
 * 获取图片列表
 * @param params
 * @returns {Promise<any>}
 */
export function getPictureList(params) {
  return request({
    url: '/seller/shops/resource',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除图片
 * @param id
 * @returns {Promise<any>}
 */
export function deletePicture(params) {
  return request({
    url: `/seller/shops/resource/batch`,
    method: 'delete',
    params
  })
}

/**
 * 修改图片名称
 * @param id
 * @param params
 * @returns {Promise<any>}
 */
export function editPicture(id, params) {
  return request({
    url: `/seller/shops/resource/${id}/resource-name`,
    method: 'put',
    params
  })
}

/**
 * 修改图片分组
 * @param id
 * @param params
 * @returns {Promise<any>}
 */
export function editPictureGroup(params) {
  return request({
    url: `/seller/shops/resource/resource-group`,
    method: 'put',
    params
  })
}

/**
 * 修改分组名称
 * @param id
 * @param params
 * @returns {Promise<any>}
 */
export function editGroup(group_id, params) {
  return request({
    url: `/seller/shops/resource-group/${group_id}/group-name`,
    method: 'put',
    params
  })
}

/**
 * 修改分组名称
 * @param id
 * @returns {Promise<any>}
 */
export function deleteGroup(group_id) {
  return request({
    url: `/seller/shops/resource-group/${group_id}`,
    method: 'delete'
  })
}

/**
 * copy 资源
 */
export function copyResource(group_id, params) {
  return request({
    url: `/seller/shops/resource/copy/${group_id}`,
    method: 'post',
    params
  })
}

