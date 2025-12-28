/**
 * Created by Andste on 2021/04/15.
 * 商品选择器
 * 依赖于element-ui
 */

import Vue from 'vue'
import ShopPicker from './src/main.vue'

ShopPicker.install = function() {
  Vue.component(ShopPicker.name, ShopPicker)
}

export default ShopPicker
