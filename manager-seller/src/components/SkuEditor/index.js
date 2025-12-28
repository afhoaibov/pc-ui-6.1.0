/**
 * 商品SKU编辑器
 */

import Vue from 'vue'
import SkuEditor from './src/main'

SkuEditor.install = () => {
  Vue.component(SkuEditor.name, SkuEditor)
}

export default SkuEditor
