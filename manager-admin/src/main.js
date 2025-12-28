import Vue from 'vue'

import 'babel-polyfill'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import UIComponents from 'ui-components'
import EnComponents from '@/components'
import Viewer from 'v-viewer'

import '@/styles/index.scss' // global css
import App from './App'
import router from './router'
import store from './store'

import i18n, { loadLanguageAsync } from './lang' // Internationalization
import './icons' // icon
import './permission' // permission control
import axios from 'axios'
import directives from 'ui-utils/directives'
// register global utility filters.
import * as filters from './filters' // global filter
// register global utility mixins.
import mixin from './utils/mixin'
import VueClipboard from 'vue-clipboard2'
import JSONBig from 'json-bigint'

Vue.use(Element, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(directives)
Vue.use(VueClipboard)
Vue.use(UIComponents)
Vue.use(EnComponents)
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999
  }
})

Vue.prototype.$http = axios

Vue.prototype.$message.success = function(text) {
  Vue.prototype.$message({
    showClose: true,
    message: text,
    type: 'success',
    duration: 5000
  })
}
Vue.prototype.$message.error = function(text) {
  Vue.prototype.$message({
    showClose: true,
    message: text,
    type: 'error',
    duration: 5000
  })
}

// 注册全局EventCenter
import EventCenter from 'ui-websocket/eventCenter'
import Storage from './utils/storage'
import SocketWorker from './utils/socketWorker'
const eventCenter = new EventCenter()
Vue.prototype.$eventCenter = eventCenter

// 启动worker
const accessToken = Storage.getItem('admin_access_token')
const uuid = Storage.getItem('admin_uuid')
if (accessToken) {
  SocketWorker.startWorker(accessToken, uuid)
}

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.mixin(mixin)

Vue.config.productionTip = false

async function initApp() {
  await Promise.all([
    store.dispatch('getSiteInfo'),
    loadLanguageAsync()
  ])
  new Vue({
    el: '#app',
    router,
    store,
    i18n,
    template: '<App/>',
    components: { App }
  })
}
initApp()
