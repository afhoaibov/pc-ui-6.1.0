import lodash from 'lodash'

export function getAccessories() {
  let accessoryObj = {}
  const requireAccessories = require['context']('@/components/accessory', true, /[A-Za-z]\w+\.(vue|js)$/)
  const requireAccessoriesKeys = requireAccessories.keys()
  
  // 遍历所有引入的文件中的index.js
  // 将index.js中的配置装入accessoryObj中
  // 就相当于查找到了所有的装修模块
  requireAccessoriesKeys.forEach(fileName => {
    if (fileName.indexOf('index.js') === -1) return
    const moduleConfig = requireAccessories(fileName).default
    moduleConfig.__key = lodash.uniqueId('accessory_')
    const name = lodash.kebabCase(moduleConfig.name)
    accessoryObj[name] = moduleConfig
  })
  
  // accessoryObj，也就是遍历所有模块
  // 再根据模块名称name，过滤所有文件名
  // 如果有模块名+Setting.vue的文件，将has_setting设为true，表示有Setting组件
  Object.keys(accessoryObj).forEach(key => {
    let setting_name = lodash.camelCase(`${key}-setting`)
    setting_name = lodash.upperFirst(setting_name) + '.vue'
    const index = requireAccessoriesKeys.findIndex(fileName => fileName.indexOf(setting_name) !== -1)
    if (index !== -1) {
      accessoryObj[key]['has_setting'] = true
    }
  })
  
  // 遍历modulesObj，把模块放入Modules数组中
  // 顺便按照index.js中的sort字段排个序
  const Accessories = []
  Object.keys(accessoryObj).forEach(key => {
    Accessories.push(accessoryObj[key])
    Accessories.sort((a, b) => a.sort - b.sort)
  })
  return Accessories
}
