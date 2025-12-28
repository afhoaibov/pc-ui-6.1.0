import Vue from 'vue'
import { Loading, MessageBox } from 'element-ui'
import axios from 'axios'
import Storage from '@/utils/storage'
import checkToken from '@/utils/checkToken'
import { decorType } from '@/utils/decor-types'
import { api } from '~/ui-domain'
import * as Foundation from '@/utils/foundation'

const qs = require('qs')

// 创建axios实例
const service = axios.create({
  baseURL: api[decorType],
  timeout: 5000,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
})

// request拦截器
service.interceptors.request.use(config => {
  // 如果是put/post请求，用qs.stringify序列化参数
  const is_put_post = config.method === 'put' || config.method === 'post'
  const is_json = config.headers['Content-Type'] === 'application/json'
  const is_form_data = Object.prototype.toString.call(config.data) === '[object FormData]'
  if (is_put_post && is_json) {
    config.data = JSON.stringify(config.data)
  }
  if (is_put_post && !is_json && !is_form_data) {
    config.data = qs.stringify(config.data, { arrayFormat: 'repeat' })
  }
  /** 配置全屏加载 */
  if (config.loading !== false) {
    config.loading = Loading.service({
      lock: true,
      background: 'rgba(0, 0, 0, 0.7)',
      spinner: 'el-icon-loading',
      text: '请稍候...'
    })
  }

  // uuid
  const uuid = Storage.getItem(`${decorType}_uuid`)
  config.headers['uuid'] = uuid
	const lang = Foundation.getURLSearchParma('lang')

  if (lang) {
    // config.headers['language'] = Storage.getItem(`${decorType}Language`) || 'zh-CN'
    config.headers['language'] = lang
  }

  /** 设置令牌 */
  let accessToken = Storage.getItem(`${decorType}_access_token`)
  if (accessToken) {
    config.headers['Authorization'] = accessToken
  }

  // 如果是上传接口，不限制超时时间
  if (config.url === `${api[decorType]}/${decorType}/uploaders`) {
    config.timeout = 0
  }
  return config
}, error => {
  Promise.reject(error)
})

// response拦截器
service.interceptors.response.use(
  async response => {
    await closeLoading(response)
    return response.data
  },
  async error => {
    await closeLoading(error)
    const error_response = error.response || {}
    const error_data = error_response.data || {}
    if (error_response.status === 403) {
      return closeWindow()
    }
    if (error.config.message !== false) {
      let _message = error.code === 'ECONNABORTED' ? '连接超时，请稍候再试！' : '网络错误，请稍后再试！'
      Vue.prototype.$message.error(error_data.message || _message)
    }
    return Promise.reject(error)
  }
)

/**
 * 关闭全局加载
 * 延迟200毫秒关闭，以免晃眼睛
 * @param target
 */
const closeLoading = (target) => {
  if (!target.config.loading) return true
  return new Promise((resolve) => {
    setTimeout(() => {
      target.config.loading.close()
      resolve()
    }, 200)
  })
}

export default function request(options) {
  // 如果是刷新token或者登录，不需要检查token直接请求。
  const whiteList = [
    'systems/admin-users/login',
    'systems/admin-users/token',
    'seller/check/token',
    'validator',
    'site-show'
  ]
  if (options.needToken === false) return service(options)
  if (whiteList.some(item => options.url.indexOf(item) !== -1)) return service(options)
  return new Promise((resolve, reject) => {
    checkToken(options).then(() => {
      service(options).then(resolve).catch(reject)
    })
  })
}

function closeWindow() {
  MessageBox.alert('您的登录状态已失效，请返回重新登录！', '权限错误', {
    type: 'error',
    callback: window.close
  })
}
