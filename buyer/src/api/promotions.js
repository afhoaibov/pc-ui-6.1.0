/**
 * Created by Andste on 2018/7/15.
 * 促销相关API
 */

import request, { Method } from '@/utils/request'

/**
 * 获取商品sku参与的正在进行中的促销活动信息
 * @param goods_id
 */
export function getGoodsPromotions(sku_id) {
  return request({
    url: `/buyer/promotions/${sku_id}`,
    method: Method.GET,
    loading: false
  })
}

/**
 * 获取团购分类
 */
export function getGroupBuyCategorys() {
  return request({
    url: '/buyer/promotions/group-buy/cats',
    method: Method.GET
  })
}

/**
 * 获取团购商品
 * @param params
 */
export function getGroupBuyGoods(params) {
  return request({
    url: `/buyer/promotions/group-buy/goods`,
    method: Method.GET,
    params
  })
}

/**
 * 获取团信息
 * @param gb_id
 */
export function getGroupBuyDetail(gb_id) {
  return request({
    url: `/buyer/promotions/group-buy/active`,
    method: Method.GET
  })
}

/**
 * 获取全部优惠券
 * @param goods_id
 */
export function getOwnCoupons(goods_id) {
  return request({
    url: '/buyer/promotions/coupons/goods-use',
    method: Method.GET,
    loading: false,
    params: { goods_id }
  })
}

/**
 * 获取店铺优惠券
 * @param goods_id
 */
export function getShopCoupons(seller_id) {
  return request({
    url: '/buyer/promotions/coupons',
    method: Method.GET,
    loading: false,
    params: { seller_id }
  })
}

/**
 * 获取限时抢购时间线
 */
export function getSeckillTimeLine() {
  return request({
    url: '/buyer/promotions/seckill/time-line',
    method: Method.GET,
    loading: false
  })
}

/**
 * 获取限时抢购商品
 * @param params
 */
export function getSeckillTimeGoods(params) {
  return request({
    url: '/buyer/promotions/seckill/goods-list',
    method: Method.GET,
    loading: false,
    params
  })
}

/**
 * 获取全部优惠券
 * @param params
 */
export function getAllCoupons(params) {
  return request({
    url: '/buyer/promotions/coupons/all',
    method: Method.GET,
    params
  })
}

/**
 * 获取店铺优惠券
 * @param {*} params
 * @returns
 */
export function getShopAllCoupons(params) {
  return request({
    url: '/buyer/promotions/coupons/shop-all',
    method: Method.GET,
    params
  })
}

/**
 * 获取新人优惠券
 * @returns
 */
export function getNewcomerCoupon() {
  return request({
    url: '/buyer/promotions/coupons/newcomer-coupon',
    method: 'get'
  })
}
