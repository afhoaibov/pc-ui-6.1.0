import Vue from 'vue'
import axios from 'axios'
window.axios = axios

import 'nprogress/nprogress.css'
import 'swiper/css/swiper.min.css'
import 'viewerjs/dist/viewer.css'
import './assets/styles/normalize.css'
import './assets/styles/base.scss'

import './assets/styles/iconfont/iconfont.css'
import * as EnComponents from './components'
import VueLazyLoad from 'vue-lazyload'
import VueMeta from 'vue-meta'

import App from './App'
import i18n, { loadLanguageAsync } from './lang'
import router from './router'
import './router/router-hook'
import store from './store'
import './utils/vue-layer'
import './utils/vue-element'
import directives from 'ui-utils/directives'

import * as filters from './utils/filters'
import * as drag from './utils/drag'

import mixin from './utils/mixin'

Vue.use(directives)
Vue.use(drag)
Vue.use(VueLazyLoad)
Vue.use(VueMeta)
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Object.keys(EnComponents).forEach(key => {
  Vue.component(EnComponents[key].name, EnComponents[key])
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
