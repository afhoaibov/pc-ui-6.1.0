/**
 * 国家/区号选择器
 */
import Vue from 'vue'
import AreaSelect from './src/main'

AreaSelect.install = function() {
  Vue.component(AreaSelect.name, AreaSelect)
}

export default AreaSelect
