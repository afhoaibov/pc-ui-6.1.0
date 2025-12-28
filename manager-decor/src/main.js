import Vue from 'vue'
import '@itbuilder/auto-tester-helper'
import ElementUI from 'element-ui'
import 'remixicon/fonts/remixicon.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'swiper/css/swiper.min.css'
import store from './store'
import router from './router'
import mixins from '@/utils/mixins'
import * as Filters from '@/utils/filters'
import * as Foundation from '@/utils/foundation'
import { getAccessories } from '@/utils/accessories'
import App from './App.vue'
import '@/styles/common.scss'
import UIComponents from 'ui-components'
import settingMixins from '@/components/setting/mixins'
import { clientType } from '@/utils/decor-types'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import i18n, { loadLanguageAsync } from './lang'

Vue.mixin(mixins)
Object.keys(Filters).forEach(key => Vue.filter(key, Filters[key]))
Vue.config.productionTip = false
Vue.use(ElementUI, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(UIComponents)
Vue.use(VueAwesomeSwiper)

// 自动注册全局组件
const requireComponents = require['context']('./components', true, /[A-Za-z]\w+\.(vue)$/)
requireComponents.keys().forEach(async fileName => {
  // 对不相关的客户端类型组件进行拦截
  // 例如当前装修的是pc类型，那么遇到文件路径里有/mobile/的，就不进行注册
  if (fileName.indexOf(clientType === 'pc' ? '/mobile/' : '/pc/') !== -1) return
  let componentConfig = await requireComponents(fileName)
  componentConfig = componentConfig['default']
  // 设置组件需要用到settingMixins
  if (fileName.indexOf('/setting/') !== -1) {
    componentConfig.mixins = [settingMixins]
    componentConfig.name = `Setting${componentConfig.name}`
  }
  Vue.component(componentConfig.name, componentConfig)
})

loadLanguageAsync().then(() => {
  store.state.accessories = Foundation.cloneDeep(getAccessories())
  new Vue({
    render: h => h(App),
    i18n,
    store,
    router
  }).$mount('#app')
})
