import Vue from 'vue'
import { Loading } from 'element-ui'
import axios from 'axios'
import store from '@/store'
import Storage from '@/utils/storage'
import router from '@/router'
import https from 'https'
import checkToken from '@/utils/checkToken'
import { api } from '~/ui-domain'

const qs = require('qs')

// 创建axios实例
const service = axios.create({
  baseURL: api.admin,
  timeout: 60000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
})

// request拦截器
service.interceptors.request.use(config => {
  if (/\/uploaders/.test(config.url)) {
    config.timeout = 0
  }
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
  // Do something before request is sent
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
  config.headers['uuid'] = Storage.getItem('admin_uuid')
  config.headers['clientType'] = 'PC'
  if (process.env.I18N) {
    config.headers['language'] = Storage.getItem('adminLanguage') || 'zh-CN'
  }

  /** 设置令牌 */
  let accessToken = Storage.getItem('admin_access_token')
  if (accessToken) {
    config.headers['Authorization'] = accessToken
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
      if (!Storage.getItem('admin_refresh_token')) return
      store.dispatch('fedLogoutAction')
      window.location.replace(router.resolve('/login').href)
      return
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      target.config.loading.close()
      resolve()
    }, 200)
  })
}

export default function request(options) {
  if (options.needToken === false) return service(options)
  return new Promise((resolve, reject) => {
    checkToken(options).then(() => {
      service(options).then(resolve).catch(reject)
    })
  })
}
