import Vue from 'vue'
import { Message, MessageBox } from 'element-ui'

/**
 * 普通alert弹框
 * @param message
 * @param fn
 * @param options
 * @returns {*|void}
 */
const alert = function(message, fn, options, btn = ['确认']) {
  return window.layer.alert(message || '', {
    title: '信息',
    scrollbar: false,
    closeBtn: 0,
    btn,
    ...(options || {})
  }, function(index) {
    let __ = true
    typeof (fn) === 'function' && (__ = fn(index))
    __ !== false && window.layer.close(index)
  })
}
/**
 * 操作确认
 * @param message
 * @param fn
 * @param cancel
 * @returns {*|boolean}
 */
const confirm = function(message, fn, cancel, btn = ['确认', '取消']) {
  return MessageBox.confirm(message || '确认这个操作吗？', '提示', {
    confirmButtonText: btn[0],
    cancelButtonText: btn[1],
    type: 'warning',
    confirmButtonClass: 'confirm-button',
    cancelButtonClass: 'cancel-button'
  }).then(() => {
    typeof (fn) === 'function' && fn()
  }).catch(() => {
    typeof (cancel) === 'function' && cancel()
  })
}

/**
 * 消息提示
 * @type {{success : (function(*=, *=, *=) : *), error : (function(*=, *=, *=) : *)}}
 * @private
 */
const _message = {
  /**
   * 成功提示
   * @param message
   * @param opts
   * @param fn
   * @returns {*}
   */
  success: function(message, opts, fn) {
    fn = typeof fn === 'function' ? fn : opts
    opts = typeof opts === 'object' ? opts : {}
    return window.layer.msg(message || '成功！', {
      icon: 1,
      skin: 'layer-skin-custom-msg',
      offset: '10px',
      time: 0,
      closeBtn: 1,
      ...opts
    }, fn)
  },

  /**
   * 错误提示
   * @param message
   * @param opts
   * @param fn
   * @returns {*}
   */
  error: function(message, opts, fn) {
    fn = typeof fn === 'function' ? fn : opts
    opts = typeof opts === 'object' ? opts : {}
    return window.layer.msg(message || '出错！', {
      icon: 2,
      skin: 'layer-skin-custom-msg',
      offset: '10px',
      time: 0,
      closeBtn: 1,
      ...opts
    }, fn)
  }
}

/**
 * 配置全局layer
 */
window.layer.config({
  skin: 'layer-skin-common',
  btnAlign: 'c'
})

// 注册到Vue原型链上
Vue.prototype.$layer = window.layer
Vue.prototype.$alert = alert
Vue.prototype.$confirm = confirm
// Vue.prototype.$message = _message
Vue.prototype.$message = function(text) {
  Message(text)
}
Vue.prototype.$message.success = function(text) {
  return Message.success({
    showClose: true,
    message: text,
    duration: 5000
  })
}
Vue.prototype.$message.error = function(text) {
  return Message.error({
    showClose: true,
    message: text,
    duration: 5000
  })
}
