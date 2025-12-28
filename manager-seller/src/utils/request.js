import Vue from 'vue'
import axios from 'axios'
import { Loading } from 'element-ui'
import Storage from '@/utils/storage'
import store from '@/store'
import router from '@/router/index'
import https from 'https'
import checkToken from '@/utils/checkToken'
import { api } from '~/ui-domain'

const qs = require('qs')

// 创建axios实例
const service = axios.create({
  baseURL: api.seller, // 基础api
  timeout: 60000, // 请求超时时间
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
  if (config && config.loading !== false) {
    const { loading } = config
    const is_num = typeof (config.loading) === 'number'
    if (is_num) config.loading_num = true
    // 为API请求缓存做准备处理
    // config.loading = () => {
    //   return Loading.service({
    //     lock: true,
    //     background: `rgba(0, 0, 0, ${is_num ? loading : '0.8'})`,
    //     spinner: 'el-icon-loading'
    //   })
    // }
    config.loading = Loading.service({
      lock: true,
      background: `rgba(0, 0, 0, ${is_num ? loading : '0.8'})`,
      spinner: 'el-icon-loading'
    })
  }

  // uuid
  const uuid = Storage.getItem('seller_uuid')
  config.headers['uuid'] = uuid
  config.headers['clientType'] = 'PC'
  if (process.env.I18N) {
    config.headers['language'] = Storage.getItem('sellerLanguage') || 'zh-CN'
  }

  // 获取访问Token
  let accessToken = Storage.getItem('seller_access_token')
  if (accessToken) {
    config.headers['Authorization'] = accessToken
  }

  return config
}, error => {
  Promise.reject(error)
})

// respone拦截器
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
      if (!Storage.getItem('seller_refresh_token')) return
      await store.dispatch('fedLogoutAction')
      window.location.replace(router.resolve('/login').href)
      return
    }
    if (error.config && error.config.message !== false) {
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
  const { loading, loading_num } = target.config
  if (!loading) return true
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      target.config.loading.close()
      resolve()
    }, loading_num ? 0 : 200)
  })
}

export default function request(options) {
  // 如果是请求【刷新token、登录、退出】不需要检查token，直接请求。
  if (options.needToken === false) return service(options)
  return new Promise((resolve, reject) => {
    checkToken(options).then(() => {
      service(options).then(resolve).catch(reject)
    })
  })
}
