/**
 * Created by Andste on 2021/04/05.
 * 素材选择组件
 */

import Vue from 'vue'
import ResourcePicker from './src/main'

ResourcePicker.install = function() {
  Vue.component(ResourcePicker.name, ResourcePicker)
}

export default ResourcePicker
