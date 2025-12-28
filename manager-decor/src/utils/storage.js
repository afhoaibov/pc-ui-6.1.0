/**
 * Created by Andste on 2021/12/25.
 */

import Cookies from 'js-cookie'

const psl = require('psl')

const cookieKeys = []

/**
 * 判断是否需要储存为Cookie
 * @param key
 * @returns {boolean}
 */
function isCookieKey(key) {
  return cookieKeys.indexOf(key) !== -1
}

/**
 * SetItem
 * @param key
 * @param value
 * @param options
 */
function setItem(key, value, options = {}) {
  if (options.expires === undefined) {
    options.expires = 365 * 10
  }
  return isCookieKey(key)
    ? setCookieItem(key, value, options)
    : setLocalItem(key, value, options)
}

/**
 * GetItem
 * @param key
 * @returns {*|string}
 */
function getItem(key) {
  return isCookieKey(key)
    ? getCookieItem(key)
    : getLocalItem(key)
}

/**
 * RemoveItem
 * @param key
 * @param options
 */
function removeItem(key, options) {
  return isCookieKey(key)
    ? removeCookieItem(key, options)
    : removeLocalItem(key)
}

// ========== LocalStorage ========== //

/**
 * 设置LocalStorageItem
 * @param key
 * @param value
 * @param options
 */
function setLocalItem(key, value, options = {}) {
  let { expires } = options
  if (typeof expires === 'number') {
    expires = new Date().getTime() + expires * 86400 * 1000
  } else if (typeof expires === 'object') {
    expires = expires.getTime()
  }
  value = JSON.stringify({
    expires,
    data: value
  })
  sessionStorage.setItem(key, value)
}

/**
 * 获取LocalStorageItem
 * @param key
 * @returns {string}
 */
function getLocalItem(key) {
  let object = sessionStorage.getItem(key)
  if (!object) return ''
  object = JSON.parse(object)
  const { expires } = object
  if (typeof expires === 'number' && expires <= Date.now()) {
    sessionStorage.removeItem(key)
    return ''
  }
  return object.data
}

/**
 * 移除LocalStorageItem
 * @param key
 */
function removeLocalItem(key) {
  sessionStorage.removeItem(key)
}

// ========== Cookie ========== //

/**
 * 设置CookieItem
 * @param key
 * @param value
 * @param options
 */
function setCookieItem(key, value, options = {}) {
  const p_psl = psl.parse(document.domain)
  let domain = p_psl.domain
  if (/\d+\.\d+\.\d+\.\d+/.test(p_psl.input)) domain = p_psl.input
  options = { domain, ...options }
  Cookies.set(key, value, options)
}

/**
 * 获取CookieItem
 * @param key
 * @returns {*}
 */
function getCookieItem(key) {
  return Cookies.get(key)
}

/**
 * 移除CookieItem
 * @param key
 * @param options
 */
function removeCookieItem(key, options = {}) {
  const p_psl = psl.parse(document.domain)
  let domain = p_psl.domain
  if (/\d+\.\d+\.\d+\.\d+/.test(p_psl.input)) domain = p_psl.input
  options = { domain, ...options }
  Cookies.remove(key, options)
}

export default {
  setItem,
  getItem,
  removeItem
}
