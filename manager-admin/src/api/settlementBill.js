/**
 * settlement结算单管理API
 */

import request from '@/utils/request'

/**
 * 获取结算单列表
 * @param params
 */
export function getSettlementBillList(params) {
  return request({
    url: 'admin/trade/settlement/settlementBill',
    method: 'get',
    loading: false,
    params
  })
}
export function qweqweqwe(params) {
  return request({
    url: 'trade/settlement/settlementBill/exportSettlementBill',
    method: 'get',
    needToken: true,
    params
  })
}
/**
 * 获取结算对象
 * @param params
 */
export function GET_SubjectList(subjectType, platformType) {
  return request({
    url: `admin/trade/settlement/settlementBill/subjectlist/${subjectType}/${platformType}`,
    method: 'get'
  })
}

/**
 * 导出结算单
 * @param params
 */
export function exportSettlementBill(params) {
  return request({
    url: 'admin/trade/settlement/settlementBill/exportSettlementBill',
    method: 'get',
    params
  })
}
/**
 * 下载结算单明细
 * @param id
 */
export function downloadDetail(id) {
  return request({
    url: `admin/trade/settlement/settlementBill/exportDetail/${id}`,
    method: 'put',
    responseType: 'blob'
  })
}

/**
 * 获取结算单状态
 */
export function getSettlementBillStatusList(params) {
  return request({
    url: 'admin/trade/lookup/list',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 撤回结算单
 * @param id
 */
export function rebackBill(id) {
  return request({
    url: `admin/trade/settlement/${id}/reback`,
    method: 'post'
  })
}

/**
 * 获取结算方式列表
 * @param params
 */
export function getSettlementSetting(params) {
  return request({
    url: 'trade/settlementSetting/getSettlementList',
    method: 'get',
    loading: false,
    needToken: true,
    params
  })
}

/**
 * 删除结算方式
 * @param id
 */
export function deleteSettlementSetting(id) {
  return request({
    url: `trade/settlementSetting/delete/${id}`,
    method: 'delete',
    loading: false
  })
}

/**
 * 查询结算方式
 * @param id
 */
export function getSettlementById(id) {
  return request({
    url: `trade/settlementSetting/get/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 修改结算方式
 * @param id
 * @param params
 */
export function editSettlement(id, params) {
  return request({
    url: `trade/settlementSetting/${id}`,
    method: 'put',
    params,
    loading: false
  })
}

/**
 * 添加结算方式
 * @param params
 */
export function addSettlement(params) {
  return request({
    url: 'trade/settlementSetting',
    method: 'post',
    data: params,
    loading: false,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 获取科目代码
 * @param params
 */
export function getAccountingSubject(params) {
  return request({
    url: 'trade/settlementSetting/getAccountingSubject',
    method: 'get',
    loading: false,
    needToken: true,
    params
  })
}

/**
 *导出选中数据
 * @returns {AxiosPromise}
 */
export function getExportLog(params) {
  return request({
    url: 'trade/settlementSetting/page/export',
    method: 'get',
    needToken: true,
    responseType: 'blob',
    params
  })
}

/**
 * 查询应收应付方式
 * @param params
 */
export function getFinanceSettingList(params) {
  return request({
    url: 'trade/financeSetting/getFinanceSettingList',
    method: 'get',
    loading: false,
    needToken: true,
    params
  })
}

/**
 * 查询应收应付方式
 * @param id
 */
export function getSubjectById(id) {
  return request({
    url: `trade/financeSetting/get/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 修改应收应付方式
 * @param id
 * @param params
 */
export function editSubject(id, params) {
  return request({
    url: `trade/financeSetting/${id}`,
    method: 'put',
    params,
    loading: false
  })
}
/**
 * 创建销售发票
 * @param id 结算单id
 */
export function setBillStatus(id, status) {
  return request({
    url: `admin/trade/settlement/settlementBill/setBillStatus/${id}/${status}`,
    method: 'get',
    loading: false
  })
}
/**
 * 创建销售发票
 * @param id 结算单id
 */
export function createSinvoice(id) {
  return request({
    url: `admin/trade/settlement/settlementBill/createSinvoice/${id}`,
    method: 'get',
    loading: false
  })
}

