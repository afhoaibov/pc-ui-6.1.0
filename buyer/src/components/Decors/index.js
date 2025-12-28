import mixin from './mixin'
const requireComponents = require['context']('./', true, /[A-Za-z]\w+\.(vue)$/)

const components = {}

requireComponents.keys().forEach(async fileName => {
  let componentConfig = requireComponents(fileName).default
  componentConfig.mixins = [mixin]
  const name = componentConfig.name.replace('Preview', '')
  components[name] = componentConfig
})

export default components
