import request from '@/utils/request'
import { decorType, clientType } from '@/utils/decor-types'
import { api } from '~/ui-domain'

/**
 * 添加页面
 * @param data
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function addPage(data) {
  // 客户端类型
  data.client_type = clientType.toUpperCase()
  return request({
    url: `${decorType}/pages`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 更新页面数据
 * @param id
 * @param data
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function updatePage(id, data) {
  // 客户端类型
  data.client_type = clientType.toUpperCase()
  return request({
    url: `${decorType}/pages/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取页面详情
 * @param id
 * @param loading
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getPageDetail(id, loading = true) {
  return request({
    url: `${api.buyer}/buyer/pages/${id}`,
    method: 'get',
    loading
  })
}
