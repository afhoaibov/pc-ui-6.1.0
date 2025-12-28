/**
 * 订单相关API
 */

import request from '@/utils/request'

/**
 * 获取订单列表
 * @param params
 * @returns {Promise<any>}
 */
export function getOrderList(params) {
  return request({
    url: 'seller/trade/orders',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 根据订单sn获取订单详情
 * @param sn
 * @returns {Promise<any>}
 */
export function getOrderDetail(sn) {
  return request({
    url: `seller/trade/orders/${sn}`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取供应商订单列表
 * @param params
 * @returns {Promise<any>}
 */
export function getSupplyOrderList(params) {
  return request({
    url: 'seller/trade/orders/supplier',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 根据供应商订单sn获取订单详情
 * @param sn
 * @returns {Promise<any>}
 */
export function getSupplyOrderDetail(sn) {
  return request({
    url: `seller/trade/orders/supplier/${sn}`,
    method: 'get'
  })
}

/**
 * 调整价格
 * @param sn
 * @returns {Promise<any>}
 */
export function updateOrderPrice(sn, params) {
  return request({
    url: `seller/trade/orders/${sn}/price`,
    method: 'put',
    data: params
  })
}

/**
 * 修改收货人信息
 * @param sn
 * @param params
 * @returns {Promise<any>}
 */
export function updateConsigneeInfo(sn, params) {
  return request({
    url: `seller/trade/orders/${sn}/address`,
    method: 'put',
    data: params
  })
}

/**
 * 确认收款
 * @param sn
 * @param params
 * @returns {Promise<any>}
 */
export function confirmGetAmount(sn, params) {
  return request({
    url: `seller/trade/orders/${sn}/pay`,
    method: 'post',
    data: params
  })
}

/**
 * 发货
 * @param ids
 * @param params
 * @returns {Promise<any>}
 */
export function deliveryGoods(sn, params) {
  return request({
    url: `seller/trade/orders/${sn}/delivery`,
    method: 'post',
    data: params
  })
}

/**
 * 查询快递物流信息
 * @param params
 * @returns {Promise<any>}
 */
export function getLogisticsInfo(params) {
  return request({
    url: `seller/express`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 生成菜鸟电子面单
 * @param params
 * @returns {Promise<any>}
 */
export function generateCaiNiaoWaybill(params) {
  return request({
    url: `seller/waybill/cainiao`,
    method: 'post',
    loading: false,
    params
  })
}

/**
 * 取消生成的菜鸟电子面单
 * @param params
 * @returns {Promise<any>}
 */
export function cancelCaiNiaoWaybill(params) {
  return request({
    url: `seller/waybill/cainiao/cancel`,
    method: 'post',
    loading: false,
    data: params
  })
}

/**
 * 获取生成的菜鸟电子面单
 * @param params
 * @returns {Promise<any>}
 */
export function getCaiNiaoWaybill(params) {
  return request({
    url: `seller/waybill/cainiao`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 批量生成菜鸟电子面单
 * @param params
 * @returns {Promise<any>}
 */
export function batchGenerateCaiNiaoWaybill(params) {
  return request({
    url: `seller/waybill/creates/cainiao`,
    method: 'post',
    loading: false,
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 批量预生成菜鸟电子面单
 * @param params
 * @returns {Promise<any>}
 */
export function batchPreviewCaiNiaoWaybill(params) {
  return request({
    url: `seller/waybill/preview/cainiao`,
    method: 'post',
    loading: false,
    data: params
  })
}

/**
 * 获取订单流程图数据
 * @param ids
 * @param params
 * @returns {Promise<any>}
 */
export function getStepList(ids) {
  return request({
    url: `seller/trade/orders/${ids}/flow`,
    method: 'get',
    loading: false
  })
}

/**
 * 导出订单
 * @param params
 */
export function exportOrders(params) {
  return request({
    url: 'seller/trade/orders/export/sync',
    method: 'get',
    params
  })
}

/**
 * 导出供应商订单
 * @param params
 */
export function exportThirdPartOrders(params) {
  return request({
    url: '/seller/trade/orders/supplier/export',
    method: 'get',
    params
  })
}

/**
 * 获取发货单
 * @param params
 * @returns {Promise<any>}
 */
export function getInvoiceList(params) {
  return request({
    url: 'seller/trade/invoice',
    method: 'get',
    params
  })
}

/**
 * 取消订单
 * @param order_sn 订单编号
 * @param reason   取消原因
 */
export function cancelOrder(order_sn, reason) {
  return request({
    url: `seller/trade/orders/${order_sn}/cancel`,
    method: 'post',
    data: { reason }
  })
}

/**
 * 虚拟商品核销
 * @param sn
 * @returns {Promise<any>}
 */
export function virtualGoodsVerification(params) {
  return request({
    url: 'seller/trade/orders/use/virtual',
    method: 'put',
    data: params
  })
}

/**
 * 获取虚拟订单核销信息
 * @param order_sn
 */
export function getOrderVirtual(order_sn) {
  return request({
    url: `seller/trade/orders/${order_sn}/virtual`,
    method: 'get',
    needToken: true
  })
}

/**
 * 查询发货订单的sku列表
 * @param order_sn 订单编号
 */
export function queryOrdersItems(order_sn) {
  return request({
    url: `seller/trade/orders/${order_sn}/items`,
    method: 'get'
  })
}

/**
 * 根据某个订单号查询发货记录(seller端)
 * @param order_sn 订单编号
 */
export function expressOrderSn(order_sn) {
  return request({
    url: `seller/trade/orders/shipping/${order_sn}`,
    method: 'get'
  })
}
