/**
 * 优惠券相关API
 */

import request from '@/utils/request'

/**
* 获取优惠券模型列表
* @param params
* @returns {Promise<any>}
*/
export function getCouponsList(params) {
  return request({
    url: 'seller/promotion/coupons',
    method: 'get',
    loading: false,
    params
  })
}

/**
* 获取所有领取方式为活动赠送的优惠券信息集合
*/
export function listActivityCoupons() {
  return request({
    url: `/seller/promotion/coupons/list-activity-coupons`,
    method: 'get',
    loading: false
  })
}

/**
* 删除优惠券
* @param id
* @returns {Promise<any>}
* @constructor
*/
export function deleteCoupons(id) {
  return request({
    url: `seller/promotion/coupons/${id}`,
    method: 'delete',
    loading: false
  })
}

/**
* 保存优惠券 更新操作
* @param ids
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function modifyCoupons(ids, params) {
  return request({
    url: `seller/promotion/coupons/${ids}`,
    method: 'put',
    data: params
  })
}

/**
* 新增优惠券
* @param params
* @returns {Promise<any>}
* @constructor
*/
export function addCoupons(params) {
  return request({
    url: 'seller/promotion/coupons',
    method: 'post',
    data: params
  })
}

/**
* 查询一个优惠券的详情
* @param id
* @returns {Promise<any>}
*/
export function getCouponDetails(id) {
  return request({
    url: `seller/promotion/coupons/${id}`,
    method: 'get',
    loading: false
  })
}

/**
* 作废优惠券
* @param id
* @returns {Promise<any>}
* @constructor
*/
export function cancelCoupons(id) {
  return request({
    url: `seller/promotion/coupons/${id}`,
    method: 'post',
    loading: false
  })
}

/**
* 查询某优惠券领取列表
* @param params
*/
export function queryReceiveCouponsList(params) {
  return request({
    url: 'seller/members/coupon',
    method: 'get',
    params
  })
}

/**
* 作废会员优惠券
* @param mc_id
* @param params
*/
export function nullifyCoupons(mc_id, params) {
  return request({
    url: `/seller/members/coupon/${mc_id}/cancel`,
    method: 'put',
    params
  })
}
