import { Foundation } from 'ui-utils'
import store from '@/store'

/**
 * 金钱单位置换  2999 --> 2,999.00
 * @param val
 * @param unit 货币单位，传入undefined表示由内部决定
 * @param roundNumber
 * @returns {*}
 */
export function unitPrice(val, unit, roundNumber) {
  if (!val) val = 0
  if (!roundNumber) {
    val = Foundation.formatPrice(val)
  }
  if (!unit && process.env.I18N) {
    // 开启国际化货币单位显示
    unit = store.getters.base_currency.symbol || '$'
  } else if (!unit && unit !== '') {
    unit = '￥'
  }
  return unit + val
}

/**
 * 按小数点分割金额
 * @param {*} val
 * @param {*} location
 * @returns
 */
export function unitSlicePrice(val, location) {
  let price = Foundation.formatPrice(val)
  if (location === 'before') {
    return price.substr(0, price.length - 3)
  }
  if (location === 'after') {
    return price.substr(-2)
  }
}

/**
 * 处理unix时间戳，转换为可阅读时间格式
 * @param unix
 * @param format
 * @returns {*|string}
 */
export function unixToDate(unix, format) {
  let _format = format || 'yyyy-MM-dd hh:mm:ss'
  const d = new Date(unix * 1000)
  const o = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds()
  }
  if (/(y+)/.test(_format)) _format = _format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o) if (new RegExp('(' + k + ')').test(_format)) _format = _format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return _format
}

/**
 * 根据订单状态码返回订单状态
 * @param status_code
 * @returns {string}
 */
export function unixOrderStatus(status_code) {
  switch (status_code) {
    case 'NEW':
      return '新订单'
    case 'INTODB_ERROR':
      return '入库失败'
    case 'CONFIRM':
      return '已确认'
    case 'PAID_OFF':
      return '已付款'
    case 'SHIPPED':
      return '已发货'
    case 'ROG':
      return '已收货'
    case 'COMPLETE':
      return '已完成'
    case 'CANCELLED':
      return '已取消'
    case 'AFTER_SERVICE':
      return '售后中'
  }
}

/**
 * 13888888888 -> 138****8888
 * @param mobile
 * @returns {*}
 */
export function secrecyMobile(mobile) {
  mobile = String(mobile)
  if (process.env.I18N && mobile.indexOf(',') !== -1) {
    return '+' + mobile.split(',')[0] + mobile.split(',')[1].replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
  }
  if (!/\d{11}/.test(mobile)) {
    return mobile
  }
  return mobile.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

/**
 * 格式化货品的规格
 * @param sku
 * @returns {*}
 */
export function formatterSkuSpec(sku) {
  if (!sku.spec_list || !sku.spec_list.length) return ''
  return sku.spec_list.map(spec => spec.spec_value_name).join(' - ')
}

/**
 * 处理手机号区号显示  86,13269111627 --> +8613269111627
 * @param val
 */
export function formatMobile(val) {
  if (!val) return val
  if (val.indexOf(',') !== -1) {
    const areaValue_n = val.split(',')[0]
    const mobile = val.split(',')[1]
    if (areaValue_n && process.env.I18N) {
      return '+' + areaValue_n + mobile
    }
    return mobile
  } else {
    return val
  }
}
