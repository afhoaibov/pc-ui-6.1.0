/**
 * Created by Andste on 2018/8/2.
 */

import request, { Method } from '@/utils/request'

/**
 * 生成短链接
 */
export function generateShortLink() {
  return request({
    url: '/buyer/distribution/su/get-short-url',
    method: Method.POST,
    needToken: true
  })
}

/**
 * 访问短链接
 * @param params
 */
export function accessShortLink(params) {
  return request({
    url: '/buyer/distribution/su/visit',
    method: Method.GET,
    needToken: false,
    loading: false,
    params
  })
}

/**
 * 获取提现记录
 * @param params
 */
export function getWithdrawalsList(params) {
  return request({
    url: '/buyer/distribution/withdraw/page',
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 检查是否为分销商
 */
export function checkDistribution() {
  return request({
    url: '/buyer/distribution/check',
    method: Method.GET,
    needToken: true
  })
}
/**
 * 注册成为分销商
 * @param params
 */
export function distributionRegister(params) {
  return request({
    url: '/buyer/distribution/register',
    method: Method.POST,
    needToken: true,
    params
  })
}
/**
 * 获取分销动态
 * @param params
 */
export function getDistributionMessage(params) {
  return request({
    url: '/buyer/distribution/event/page',
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
* 获取分销商信息
* @param params
*/
export function getDistributionUserInfo() {
  return request({
    url: '/buyer/distribution/get/detail',
    method: Method.GET,
    needToken: true
  })
}

/**
 * 获取下级分销数据
 * @param params
 */
export function getDistributionChildren() {
  return request({
    url: '/buyer/distribution/listTeamPage',
    method: Method.GET,
    needToken: true
  })
}

/**
 * 获取分佣列表查询金额统计
 * @param params
 */
export function getBrokerageTotal(params) {
  return request({
    url: '/buyer/distribution/commission/total-commission',
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 获取佣金列表
 * @param params
 */
export function getBrokerageList(params) {
  return request({
    url: '/buyer/distribution/commission/page',
    method: Method.GET,
    needToken: true,
    params
  })
}
/**
 * 获取订单列表查询金额统计
 * @param params
 */
export function getOrderListTotal(params) {
  return request({
    url: '/buyer/distribution/order/get-commission',
    method: Method.GET,
    needToken: true,
    params
  })
}
/**
 * 获取分销订单列表
 * @param params
 */
export function getDistributionOrderList(params) {
  return request({
    url: '/buyer/distribution/order/page',
    method: Method.GET,
    needToken: true,
    params
  })
}
/**
 * 获取分销商品
 * @param params
 */
export function getDistributionGoods(params) {
  return request({
    url: '/buyer/distribution/goods/list',
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 获取用户支付宝提现账户信息
 */
export function getWithdrawAlipayAccount() {
  return request({
    url: '/buyer/distribution/withdraw/alipay-account',
    method: Method.GET,
    needToken: true
  })
}

/**
* 提现申请提交
* @param params
*/
export function applyWithDraw(params) {
  return request({
    url: '/buyer/distribution/withdraw/apply',
    method: Method.POST,
    needToken: true,
    params
  })
}

/**
 * 分销关系绑定
 * @param params
 */
export function bindDistributionUser(parent_id) {
  return request({
    url: `/buyer/distribution/bind/${parent_id}`,
    method: Method.PUT,
    needToken: true
  })
}

/**
 * 检查当前是否已绑定分销关系
 * @param params
 */
export function checkRelation() {
  return request({
    url: '/buyer/distribution/get/relation',
    method: Method.GET,
    needToken: true
  })
}

/**
 * 检查当前绑定用户是否为分销商
 * @param {*} member_id
 * @returns
 */
export function checkMemberRegister(member_id) {
  return request({
    url: `/buyer/distribution/check/${member_id}`,
    method: Method.GET,
    needToken: true
  })
}
