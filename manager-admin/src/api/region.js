/**
 * 地区管理相关API
 */

import request from '@/utils/request'

/**
 * 添加地区
 * @param params
 */
export function addRegion(params) {
  return request({
    url: 'admin/systems/regions',
    method: 'post',
    data: params
  })
}

/**
 * 添加国家
 * @param params
 */
export function addCountriesINT(params) {
  return request({
    url: 'admin/countries',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 添加地区
 * @param params
 */
export function addRegionINT(params) {
  return request({
    url: 'admin/states',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 编辑地区
 * @param id
 * @param params
 */
export function editRegion(id, params) {
  return request({
    url: `admin/systems/regions/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 编辑国家
 * @param id
 * @param params
 */
export function editCountriesINT(id, params) {
  return request({
    url: `admin/countries/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 编辑地区
 * @param id
 * @param params
 */
export function editRegionINT(id, params) {
  return request({
    url: `admin/states/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 删除地区
 * @param id
 */
export function deleteRegion(id) {
  return request({
    url: `admin/systems/regions/${id}`,
    method: 'delete'
  })
}

/**
 * 删除国家
 * @param id
 */
export function deleteCountriesINT(id) {
  return request({
    url: `admin/countries/${id}`,
    method: 'delete'
  })
}

/**
 * 删除地区
 * @param id
 */
export function deleteRegionINT(id) {
  return request({
    url: `admin/states/${id}`,
    method: 'delete'
  })
}
