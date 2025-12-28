/**
 * 一些常用的基础方法
 * unixToDate    将unix时间戳转换为指定格式
 * dateToUnix    将时间转unix时间戳
 * deepClone     对一个对象进行深拷贝
 * formatPrice   货币格式化
 * secrecyMobile 手机号隐私保护
 * randomString  随机生成指定长度的字符串
 */
const { parseText, parseTemplate } = require('./helpers')

/**
 * 将unix时间戳转换为指定格式
 * @param unix   时间戳【秒】
 * @param format 转换格式
 * @returns {*|string}
 */
let unixToDate = function unixToDate(unix, format) {
  RegExp = window.RegExp
  if (!unix) return unix
  let _format = format || 'yyyy-MM-dd hh:mm:ss'
  let d = new Date(unix * 1000)
  let o = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds()
  }
  if (/(y+)/.test(_format)) _format = _format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) if (new RegExp('(' + k + ')').test(_format)) _format = _format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return _format
}

/**
 * 将时间转unix时间戳
 * @param date
 * @returns {number} 【秒】
 */
let dateToUnix = function dateToUnix(date) {
  let newStr = date.replace(/:/g, '-')
  newStr = newStr.replace(/ /g, '-')
  let arr = newStr.split('-')
  let datum = new Date(Date.UTC(
    arr[0],
    arr[1] - 1,
    arr[2],
    arr[3] - 8 || -8,
    arr[4] || 0,
    arr[5] || 0
  ))
  return parseInt(datum.getTime() / 1000)
}

/**
 * 对一个对象进行深拷贝
 * @param object
 * @returns {*}
 */
let deepClone = function deepClone(object) {
  let str
  let newobj = object.constructor === Array ? [] : {}
  if (typeof object !== 'object') {
    return object
  } else if (window.JSON) {
    str = JSON.stringify(object)
    newobj = JSON.parse(str)
  } else {
    for (let i in object) {
      if (object.hasOwnProperty(i)) {
        newobj[i] = typeof object[i] === 'object' ? deepClone(object[i]) : object[i]
      }
    }
  }
  return newobj
}

/**
 * 货币格式化
 * @param price
 * @returns {string}
 */
let formatPrice = function formatPrice(price) {
  if (!isNaN(price) && Number.isFinite(price)) {
    return String(Number(price).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else {
    return price
  }
}

/**
 * 手机号隐私保护
 * 隐藏中间四位数字
 * @param mobile
 * @returns {*}
 */
let secrecyMobile = function secrecyMobile(mobile) {
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
 * 随机生成指定长度的字符串
 * @param length
 * @returns {string}
 */
let randomString = function randomString(length) {
  if (!length) length = 32
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let maxPos = chars.length
  let _string = ''
  for (let i = 0; i < length; i++) {
    _string += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return _string
}

/**
 * 计算传秒数的倒计时【天、时、分、秒】
 * @param seconds
 * @returns {{day : *, hours : *, minutes : *, seconds : *}}
 */
let countTimeDown = function countTimeDown(seconds) {
  let leftTime = function(time) {
    if (time < 10) time = '0' + time
    return time + ''
  }
  return {
    day: leftTime(parseInt(seconds / 60 / 60 / 24, 10)),
    hours: leftTime(parseInt(seconds / 60 / 60 % 24, 10)),
    minutes: leftTime(parseInt(seconds / 60 % 60, 10)),
    seconds: leftTime(parseInt(seconds % 60, 10))
  }
}

/**
 * 计算当前时间到第二天0点的倒计时[秒]
 * @returns {number}
 */
let theNextDayTime = function theNextDayTime() {
  let nowDate = new Date()
  let time = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1, 0, 0, 0).getTime() - nowDate.getTime()
  return parseInt(time / 1000)
}

/**
 * 一个变量指向Function,防止有些前端编译工具报错
 */
let eval2 = fn => {
  var Fun = Function
  return new Fun('return ' + fn)()
}

/**
 * I18n文本模板格式化
 * @param data
 * @param key
 * @param i18n
 */
let i18nTemplateFormatter = function(data, key, i18n) {
  const result = i18n.t(key)
  if (!result || result === key) return result
  let parseRes = result
  if (result.indexOf('${') !== -1) {
    parseRes = parseTemplate(result, data)
  }
  if (result.indexOf('{{') !== -1) {
    parseRes = parseText(parseRes)
    parseRes = parseRes.tokens.map(item => {
      if (typeof item === 'object' && item['@binding']) {
        let d = data
        let keys = item['@binding'].split('.')
        while (keys.length !== 0) {
          const key = keys.splice(0, 1)
          if (key[0]) d = d[key[0].trim()]
        }
        return d
      }
      return item
    }).join('')
  }
  return parseRes
}

let prettierBytes = function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  let neg = num < 0
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  let exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1)
  num = Number(num / Math.pow(1024, exponent))
  let unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

/**
 * 获取地址信息中的id集合，一般用于地区选择器回显
 * @param region
 * @param prefix
 * @returns {*[]}
 */
let getRegionIds = function getRegionIds (region, prefix = '') {
  const names = {
    province: `${prefix}province_id`,
    city: `${prefix}city_id`,
    county: `${prefix}county_id`,
    town: `${prefix}town_id`
  }
  const ids = []
  Object.keys(names).forEach(key => {
    const id = region[names[key]]
    if (id) ids.push(id)
  })
  return ids
}

/**
 * 获取地址信息集合
 * @param region
 * @param prefix
 * @returns {*[]}
 */
let getRegionValues = function getRegionValues (region, prefix = '') {
  const names = {
    province: `${prefix}province`,
    city: `${prefix}city`,
    county: `${prefix}county`,
    town: `${prefix}town`
  }
  const values = []
  Object.keys(names).forEach(key => {
    const value = region[names[key]]
    if (value) values.push(value)
  })
  return values
}

module.exports = {
  eval2: eval2,
  unixToDate: unixToDate,
  dateToUnix: dateToUnix,
  deepClone: deepClone,
  formatPrice: formatPrice,
  secrecyMobile: secrecyMobile,
  randomString: randomString,
  countTimeDown: countTimeDown,
  theNextDayTime: theNextDayTime,
  i18nTemplateFormatter: i18nTemplateFormatter,
  prettierBytes: prettierBytes,
  getRegionIds: getRegionIds,
  getRegionValues: getRegionValues
}
