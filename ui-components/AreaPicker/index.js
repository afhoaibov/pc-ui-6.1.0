/**
 * Created by Andste on 2021/04/23.
 * 地区选择组件
 */

import Vue from 'vue'
import AreaPicker from './src/main'

AreaPicker.install = function() {
  Vue.component(AreaPicker.name, AreaPicker)
}

export default AreaPicker
