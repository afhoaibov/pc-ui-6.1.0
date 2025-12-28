/**
 * 订单相关API
 */

import request, { Method } from '@/utils/request'

/**
 * 获取订单列表
 * @param params
 */
export function getOrderList(params) {
  return request({
    url: '/buyer/trade/orders',
    method: Method.GET,
    needToken: true,
    params
  })
}

/**
 * 获取订单详情
 * @param order_sn 订单编号
 */
export function getOrderDetail(order_sn) {
  return request({
    url: `/buyer/trade/orders/${order_sn}`,
    method: Method.GET,
    needToken: true
  })
}

/**
 * 取消订单
 * @param order_sn 订单编号
 * @param reason   取消原因
 */
export function cancelOrder(order_sn, reason) {
  return request({
    url: `/buyer/trade/orders/${order_sn}/cancel`,
    method: Method.POST,
    needToken: true,
    data: { reason }
  })
}

/**
 * 确认收货
 * @param order_sn 订单编号
 */
export function confirmReceipt(order_sn) {
  return request({
    url: `/buyer/trade/orders/${order_sn}/rog`,
    method: Method.POST,
    needToken: true
  })
}

/**
 * 获取订单状态数量
 */
export function getOrderStatusNum() {
  return request({
    url: '/buyer/trade/orders/status-num',
    method: Method.GET,
    needToken: true
  })
}

/**
 * 根据交易单号查询订单列表
 * @param trade_sn
 */
export function getOrderListByTradeSn(trade_sn) {
  return request({
    url: `/buyer/trade/orders/${trade_sn}/list`,
    method: Method.GET,
    needToken: true
  })
}

/**
 * 获取订单日志
 * @param order_sn
 */
export function getOrderLog(order_sn) {
  return request({
    url: `/buyer/trade/orders/${order_sn}/log`,
    method: Method.GET,
    needToken: true
  })
}
/**
 * 获取虚拟订单核销信息
 * @param order_sn
 */
export function getOrderVirtual(order_sn) {
  return request({
    url: `/buyer/trade/orders/${order_sn}/virtual`,
    method: Method.GET,
    needToken: true
  })
}

/**
 * 根据某个订单号查询发货记录(buyer端)
 * @param order_sn 订单编号
 */
export function expressOrderSn(order_sn) {
  return request({
    url: `buyer/trade/orders/shipping/${order_sn}`,
    method: 'get',
    needToken: true
  })
}
/**
 * 查询快递物流信息
 * @param params
 * @returns {Promise<any>}
 */
export function getLogisticsInfo(params) {
  return request({
    url: 'buyer/express',
    method: 'get',
    loading: false,
    needToken: true,
    params
  })
}
