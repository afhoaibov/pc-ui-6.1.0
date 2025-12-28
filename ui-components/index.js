/**
 * 导出选择器
 */

import CategoryPicker from './CategoryPicker'
import GoodsPicker from './GoodsPicker'
import ImagePicker from './ImagePicker'
import PriceRange from './PriceRange'
import RegionPicker from './RegionPicker'
import TableLayout from './TableLayout'
import TableSearch from './TableSearch'
import TextPicker from './TextPicker'
import YearMonthPicker from './YearMonthPicker'
import MemberPicker from './MemberPicker'
import PagePicker from './PagePicker'
import AreaSelect from './AreaSelect'
import ResourcePicker from './ResourcePicker'
import Clipboard from './Clipboard'
import AreaPicker from './AreaPicker'
import ShopSelector from './ShopSelector'

let components = {
  AreaSelect,
  CategoryPicker,
  GoodsPicker,
  PriceRange,
  ImagePicker,
  RegionPicker,
  TableLayout,
  TableSearch,
  TextPicker,
  YearMonthPicker,
  MemberPicker,
  PagePicker,
	ResourcePicker,
	Clipboard,
  AreaPicker,
  ShopSelector
}

components.install = function(Vue, opts) {
  Object.keys(components).forEach(function(key) {
    key !== 'install' && Vue.component(components[key].name, components[key])
  })
  Vue.component('EnRichTextEditor', () => import('./RichTextEditor'))
}

export {
  AreaSelect,
  CategoryPicker,
  GoodsPicker,
  PriceRange,
  ImagePicker,
  RegionPicker,
  TableLayout,
  TableSearch,
  TextPicker,
  YearMonthPicker,
  MemberPicker,
  PagePicker,
	Clipboard,
  AreaPicker,
  ShopSelector
}

export default components
