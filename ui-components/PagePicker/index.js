/**
 * Created by Andste on 2021/04/21.
 * 页面选择组件
 */

import Vue from 'vue'
import PagePicker from './src/main'

PagePicker.install = function() {
  Vue.component(PagePicker.name, PagePicker)
}

export default PagePicker
