/**
 * Created by Andste on 2018/5/16.
 */

import request from '@/utils/request'

/**
 * 获取微页面列表
 * @param params
 * @returns {*|Promise<unknown>}
 */
export function getMiniPages(params) {
  return request({
    url: `admin/pages`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除微页面
 * @param ids
 * @returns {*|Promise<unknown>}
 */
export function deleteMiniPages(ids) {
  return request({
    url: `admin/pages/${ids}`,
    method: 'delete'
  })
}

/**
 * 复制微页面
 * @param ids
 * @returns {*|Promise<unknown>}
 */
export function copyMiniPages(id) {
  return request({
    url: `admin/pages/${id}/copy`,
    method: 'put'
  })
}

/**
 * 设置微页面为首页
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function setMiniPageIndex(id) {
  return request({
    url: `/admin/pages/${id}/index`,
    method: 'put'
  })
}

/**
 * 更改微页面发布状态
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function changeMiniPagePublishStatus(id) {
  return request({
    url: `admin/pages/${id}/publish`,
    method: 'put'
  })
}

/**
 * 获取楼层数据
 * @param client_type
 * @param page_type
 */
export function getFloor(client_type, page_type) {
  return request({
    url: `admin/pages/${client_type}/${page_type}`,
    method: 'get'
  })
}

/**
 * 修改楼层
 * @param client_type
 * @param page_type
 * @param params
 */
export function editFloor(client_type, page_type, params) {
  return request({
    url: `admin/pages/${client_type}/${page_type}`,
    method: 'put',
    data: params
  })
}

/**
 * 获取焦点图列表
 * @param client_type
 */
export function getFocus(client_type) {
  return request({
    url: 'admin/focus-pictures',
    method: 'get',
    params: { client_type }
  })
}

/**
 * 添加焦点图
 * @param params
 */
export function addFocus(params) {
  return request({
    url: 'admin/focus-pictures',
    method: 'post',
    data: params
  })
}

/**
 * 获取焦点图详情
 * @param id
 */
export function getFocusDetail(id) {
  return request({
    url: `admin/focus-pictures/${id}`,
    method: 'get'
  })
}

/**
 * 修改焦点图
 * @param id
 * @param params
 */
export function editFocus(id, params) {
  return request({
    url: `admin/focus-pictures/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 删除焦点图
 * @param id
 */
export function deleteFocus(id) {
  return request({
    url: `admin/focus-pictures/${id}`,
    method: 'delete'
  })
}
