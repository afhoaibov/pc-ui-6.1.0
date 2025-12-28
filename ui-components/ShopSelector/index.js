/**
 * 店铺选择组件
 */
import Vue from 'vue'
import EnShopSelector from './src/main'

EnShopSelector.install = function() {
  Vue.component(EnShopSelector.name, EnShopSelector)
}

export default EnShopSelector
