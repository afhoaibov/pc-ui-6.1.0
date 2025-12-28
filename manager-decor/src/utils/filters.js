import dayjs from 'dayjs'
import { Foundation } from '~/ui-utils'
import { decorType } from '@/utils/decor-types'
import Storage from '@/utils/storage'

/**
 * 文件单位转换
 * 默认传入KiB
 * @param value
 * @param si
 * @returns {string}
 */
export function bytesUnit(value, si) {
  if (!value) return '0 kB'
  if (value) value *= 1024
  let thresh = si ? 1024 : 1000
  if (Math.abs(value) < thresh) {
    return value + ' B'
  }
  let units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  do {
    value /= thresh
    ++u;
  } while (Math.abs(value) >= thresh && u < units.length - 1)
  return value.toFixed(1) + ' ' + units[u]
}

/**
 * 时间戳转字符串
 * @param time
 * @param format
 * @returns {string}
 */
export function timestampToDate(time, format = 'YYYY-MM-DD') {
  return dayjs.unix(time).format(format)
}

/**
 * 金钱单位置换  2999 --> 2,999.00
 * @param val
 * @param showUnit 是否显示货币单位
 * @param location
 * @returns {*}
 */
export function unitPrice(val, showUnit = true, location) {
  let price = Foundation.formatPrice(val)
  let unit = ''
  if (location === 'before') {
    return price.substr(0, price.length - 3)
  }
  if (location === 'after') {
    return price.substr(-2)
  }
  if (showUnit) {
    unit = '￥'
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('lang')) {
      // 开启国际化货币单位显示
      const currency = Storage.getItem(`${decorType}BaseCurrency`) || {}
      unit = currency.symbol || '$'
    }
  }
  return unit + price
}
