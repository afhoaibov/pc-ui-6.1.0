/**
 * 分销相关API
 */

import request from '@/utils/request'

/**
 * 账单列表
 * @param params
 */
export function getBillList(params) {
  return request({
    url: 'admin/distribution/bill/member',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取某个账单详情
 * @param id
 */
export function getDisBillDetails(id) {
  return request({
    url: `admin/distribution/bill/member/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 分销订单列表
 * @param params
 */
export function getDisOrderList(params) {
  return request({
    url: 'admin/distribution/order',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 分销退款单查询
 * @param params
 */
export function getDisRefundOrderList(params) {
  return request({
    url: 'admin/distribution/order/sellback',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取某个分销商下级业绩
 * @param params
 */
export function getDisBillDown(params) {
  return request({
    url: 'admin/distribution/bill/member/down',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 提现申请/提现记录列表
 * @param params
 */
export function getWithdrawApplyList(params) {
  return request({
    url: 'admin/distribution/withdraw/page',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 批量审核提现申请
 * @param params
 */
export function batchAuditWithdrawApply(params) {
  return request({
    url: `admin/distribution/withdraw/batch-audit`,
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 批量转账
 * @param params
 */
export function batchTransferWithdrawApply(params) {
  return request({
    url: 'admin/distribution/withdraw/batch-transfer',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 单条转账
 * @param params
 */
export function singleTransferWithdrawApply(id, params) {
  return request({
    url: `admin/distribution/withdraw/single-transfer/${id}`,
    method: 'post',
    loading: false,
    params
  })
}

/**
 * 批量关闭
 * @param params
 */
export function batchCloseWithdrawApply(params) {
  return request({
    url: 'admin/distribution/withdraw/batch-close',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 导出提现申请
 * @param params
 */
export function exportWithdrawApplyList(params) {
  return request({
    url: 'admin/distribution/withdraw/export',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取分销商列表
 * @param params
 */
export function getDistributionList(params) {
  return request({
    url: 'admin/distribution/page',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取分销商详情数据
 * @param params
 */
export function getDistributionDetail(id) {
  return request({
    url: `admin/distribution/${id}/detail`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取分销商动态列表
 * @param params
 */
export function getDistributionMessageList(params) {
  return request({
    url: 'admin/distribution/event/page',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取分销商订单列表
 * @param params
 */
export function getDistributionOrderList(params) {
  return request({
    url: 'admin/distribution/order/page',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取指定分销商订单列表
 * @param distribution_member_id 分销商会员ID
 */
export function getDistributionOrderPage(params) {
  return request({
    url: `admin/distribution/order/page/${params.distribution_member_id}`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取分销商订单统计数据
 * @param params
 */
export function getDistributionOrderStatistics(params) {
  return request({
    url: 'admin/distribution/order/statistics',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取佣金列表
 * @param params
 */
export function getDistributionCommissionList(params) {
  return request({
    url: 'admin/distribution/commission/page',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取分佣列表查询金额统计
 * @param params
 */
export function getBrokerageTotal(params) {
  return request({
    url: 'admin/distribution/commission/statistics',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取订单分佣详情数据
 * @param order_sn 订单编号
 * @param sku_id 商品skuID
 */
export function getOrderCommissionDetail(order_sn, sku_id) {
  return request({
    url: `admin/distribution/commission/${order_sn}/${sku_id}`,
    method: 'get',
    loading: false
  })
}
