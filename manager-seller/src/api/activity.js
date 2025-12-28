/**
 * 活动相关API
 */

import request from '@/utils/request'

/** ========================== start 满减促销活动API start ================================= */
/**
 * 获取满减活动列表
 * @param params
 * @returns {Promise<any>}
 */
export function getFullCutActivityList(params) {
  return request({
    url: 'seller/promotion/full-minus',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 删除满减活动
* @param id
* @returns {Promise<any>}
* @constructor
*/
export function deleteFullCutActivity(id) {
  return request({
    url: `seller/promotion/full-minus/${id}`,
    method: 'delete'
  })
}

/**

* 关闭满减活动
* @param id
* @returns {Promise<any>}
*/
export function closeFullCutActivity(id) {
  return request({
    url: `seller/promotion/full-minus/invalid/${id}`,
    method: 'post'
  })
}

/**
* 新增满减活动
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function addFullCutActivity(params) {
  return request({
    url: 'seller/promotion/full-minus',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**

* 修改满减活动内容
* @param id
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function saveFullCutActivity(id, params) {
  return request({
    url: `seller/promotion/full-minus/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**

* 获取满减单个活动详情
* @param id
* @returns {Promise<any>}
*/
export function getFullCutActivityDetails(id) {
  return request({
    url: `seller/promotion/full-minus/${id}`,
    method: 'get',
    loading: false
  })
}
/** ========================== end 满减促销活动API end ================================= */

/** ========================== start 满赠促销活动API start ================================= */
/**
* 获取满赠活动列表
* @param params
* @returns {Promise<any>}
*/
export function getFullGiveActivityList(params) {
  return request({
    url: 'seller/promotion/full-give',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 删除满赠活动
* @param id
* @returns {Promise<any>}
* @constructor
*/
export function deleteFullGiveActivity(id) {
  return request({
    url: `seller/promotion/full-give/${id}`,
    method: 'delete'
  })
}

/**
* 关闭满赠活动
* @param id
* @returns {Promise<any>}
*/
export function closeFullGiveActivity(id) {
  return request({
    url: `seller/promotion/full-give/invalid/${id}`,
    method: 'post'
  })
}

/**
* 新增满赠活动
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function addFullGiveActivity(params) {
  return request({
    url: 'seller/promotion/full-give',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
* 修改满赠活动内容
* @param id
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function saveFullGiveActivity(id, params) {
  return request({
    url: `seller/promotion/full-give/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
* 获取满赠单个活动详情
* @param id
* @returns {Promise<any>}
*/
export function getFullGiveActivityDetails(id) {
  return request({
    url: `seller/promotion/full-give/${id}`,
    method: 'get',
    loading: false
  })
}
/** ========================== end 满赠促销活动API end ================================= */

/** ========================== start 单品立减促销活动API start ================================= */
/**
* 获取单品立减活动列表
* @param params
* @returns {Promise<any>}
*/
export function getSingleCutActivityList(params) {
  return request({
    url: 'seller/promotion/minus',
    method: 'get',
    loading: false,
    params
  })
}

/**

* 删除单品立减活动
* @param id
* @returns {Promise<any>}
*/
export function deleteSingleCutActivity(id) {
  return request({
    url: `seller/promotion/minus/${id}`,
    method: 'delete'
  })
}

/**

* 关闭单品立减活动
* @param id
* @returns {Promise<any>}
*/
export function closeSingleCutActivity(id) {
  return request({
    url: `seller/promotion/minus/invalid/${id}`,
    method: 'post'
  })
}

/**
* 新增单品立减活动
* @param params
* @returns {Promise<any>}
*/
export function addSingleCutActivity(params) {
  return request({
    url: 'seller/promotion/minus',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**

* 修改单品立减活动
* @param id
* @param params
* @returns {Promise<any>}
*/
export function saveSingleCutActivity(id, params) {
  return request({
    url: `seller/promotion/minus/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**

* 获取一个单品立减活动洗详情
* @param ids
* @returns {Promise<any>}
*/
export function getSingleCutActivityDetails(id) {
  return request({
    url: `seller/promotion/minus/${id}`,
    method: 'get'
  })
}
/** ========================== end 单品立减促销活动API end ================================= */

/** ========================== start 第二件半价促销活动API start ================================= */
/**

* 获取第二件半价活动列表
* @param params
* @returns {Promise<any>}
*/
export function getSecondHalfActivityList(params) {
  return request({
    url: 'seller/promotion/half-prices',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 删除第二件半价活动
* @param id
* @returns {Promise<any>}
*/
export function deleteSeconedHalfActivity(id) {
  return request({
    url: `seller/promotion/half-prices/${id}`,
    method: 'delete'
  })
}

/**
* 关闭第二件半价活动
* @param id
* @returns {Promise<any>}
*/
export function closeSeconedHalfActivity(id) {
  return request({
    url: `seller/promotion/half-prices/invalid/${id}`,
    method: 'post'
  })
}

/**
* 新增第二件半价活动
* @param params
* @returns {Promise<any>}
*/
export function addSeconedHalfActivity(params) {
  return request({
    url: 'seller/promotion/half-prices',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
* 修改第二件半价活动
* @param id
* @param params
* @returns {Promise<any>}
*/
export function saveSeconedHalfActivity(id, params) {
  return request({
    url: `seller/promotion/half-prices/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
* 获取一个第二件半价活动详情
* @param id
* @returns {Promise<any>}
*/
export function getSeconedHalfActivityDetails(id, params) {
  return request({
    url: `seller/promotion/half-prices/${id}`,
    method: 'get',
    data: params
  })
}
/** ========================== end 第二件半价促销活动API end ================================= */

/** ========================== start 拼团促销活动API start ================================= */
/**
* 获取拼团活动列表
* @param params
*/
export function getAssembleActivityList(params) {
  return request({
    url: 'seller/promotion/pintuan',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 获取单个活动详情
* @param id
* @param params
*/
export function getAssembleActivity(id) {
  return request({
    url: `seller/promotion/pintuan/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 增加拼团活动
 * @param params
 */
export function addAssembleActivity(params) {
  return request({
    url: 'seller/promotion/pintuan',
    method: 'post',
    data: params
  })
}

/**
* 编辑拼团活动
* @param params
*/
export function editAssembleActivity(id, params) {
  return request({
    url: `seller/promotion/pintuan/${id}`,
    method: 'put',
    data: params
  })
}

/**
* 删除某个活动
* @param id
*/
export function delAssembleActivity(id) {
  return request({
    url: `seller/promotion/pintuan/${id}`,
    method: 'delete'
  })
}

/**
* 获取参与拼团活动的商品sku信息集合
* @param id
*/
export function getAssembleGoods(id) {
  return request({
    url: `seller/promotion/pintuan/goods/${id}`,
    method: 'get'
  })
}

/**

* 保存某个拼团活动商品信息
* @param id
* @param params
*/
export function saveAssembleGoods(id, params) {
  return request({
    url: `seller/promotion/pintuan/goods/${id}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
* 开启或关闭拼团活动
* @param id
*/
export function openCloseAssembleActivity(id, type) {
  return request({
    url: `seller/promotion/pintuan/${id}/${type}/open-close`,
    method: 'put'
  })
}
/** ========================== end 拼团促销活动API end ================================= */

/** ========================== start 限时抢购促销活动API start ================================= */
/**
* 获取限时活动列表
* @param params
* @returns {Promise<any>}
*/
export function getLimitTimeActivityList(params) {
  return request({
    url: 'seller/promotion/seckill',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 获取限时活动商品列表
* @param params
* @returns {Promise<any>}
*/
export function getLimitTimeGoodsList(params) {
  return request({
    url: `seller/promotion/seckill-goods`,
    method: 'get',
    loading: false,
    params
  })
}

/**
* 获取限时活动详情
* @param id
* @returns {Promise<any>}
*/
export function getLimitTimeActivityDetails(id) {
  return request({
    url: `seller/promotion/seckill/${id}`,
    method: 'get'
  })
}

/**
* 限时活动报名
* @param ids
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function signUpLimitTimeActivity(id, params) {
  return request({
    url: `seller/promotion/seckill-goods/${id}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}
/** ========================== end 限时抢购促销活动API end ================================= */
