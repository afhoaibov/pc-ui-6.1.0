import request, { Method } from '@/utils/request'

/**
 * 获取货币列表
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getCurrencies(params) {
  return request({
    url: `/buyer/currencies`,
    method: Method.GET,
    params,
    loading: false
  })
}

/**
 * 获取货币详情
 * @param id
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getCurrency(id) {
  return request({
    url: `/buyer/currencies/${id}`,
    method: Method.GET,
    loading: false
  })
}

/**
 * 获取货币列表分页
 * @param params
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getCurrencyList(params) {
  return request({
    url: `/buyer/currencies/list`,
    method: Method.GET,
    params
  })
}

/**
 * 获取默认货币
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getDefaultCurrency() {
  return request({
    url: `/buyer/currencies/default`,
    method: Method.GET,
    loading: false
  })
}
