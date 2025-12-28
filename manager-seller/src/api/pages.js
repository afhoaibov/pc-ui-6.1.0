import request from '../utils/request'

/**
 * 获取微页面列表
 * @param params
 * @returns {*|Promise<unknown>}
 */
export function getMiniPages(params) {
  return request({
    url: `seller/pages`,
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
    url: `seller/pages/${ids}`,
    method: 'delete'
  })
}

/**
 * 设置页面为首页
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function setMiniPageIndex(id) {
  return request({
    url: `seller/pages/${id}/index`,
    method: 'put'
  })
}

/**
 * 复制页面
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function copyMiniPages(id) {
  return request({
    url: `seller/pages/${id}/copy`,
    method: 'put'
  })
}

/**
 * 更改页面发布状态
 * @param id
 * @returns {*|Promise<unknown>}
 */
export function changeMiniPagePublishStatus(id) {
  return request({
    url: `seller/pages/${id}/publish`,
    method: 'put'
  })
}
