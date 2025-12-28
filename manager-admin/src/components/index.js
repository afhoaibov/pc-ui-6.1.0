import CategoryPicker from './CategoryPicker'
import GradeEditor from './GradeEditor'
import GradeEditorINT from './GradeEditorINT'
import ShopPicker from './ShopPicker'
import BrandPicker from './BrandPicker'
import DesensitizationInput from './DesensitizationInput'
import Authentication from './Authentication'

const components = {
  CategoryPicker,
  GradeEditor,
  GradeEditorINT,
  ShopPicker,
  BrandPicker,
  DesensitizationInput,
  Authentication
}

components.install = function(Vue) {
  Object.keys(components).forEach(function(key) {
    key !== 'install' && Vue.component(components[key].name, components[key])
  })
}

export default components

export {
  CategoryPicker,
  GradeEditor,
  GradeEditorINT,
  ShopPicker,
  BrandPicker,
  DesensitizationInput,
  Authentication
}
