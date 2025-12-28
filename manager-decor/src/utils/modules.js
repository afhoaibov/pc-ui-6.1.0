import lodash from 'lodash'
import { clientType, decorType } from '@/utils/decor-types'

export function getModules() {
  let modulesObj = {}
  let requireModules
  if (clientType === 'pc') {
    requireModules = require['context']('@/components/decor/pc', true, /[A-Za-z]\w+\.(vue|js)$/)
  } else {
    requireModules = require['context']('@/components/decor/mobile', true, /[A-Za-z]\w+\.(vue|js)$/)
  }
  const requireModulesKeys = requireModules.keys()

  // 遍历所有引入的文件中的index.js
  // 将index.js中的配置装入modulesObj中
  // 就相当于查找到了所有的装修模块
  requireModulesKeys.forEach(fileName => {
    if (fileName.indexOf('index.js') === -1) return
    const moduleConfig = requireModules(fileName).default
    const name = lodash.kebabCase(moduleConfig.name)
    // 过滤一下装修类型
    const { decor_type } = moduleConfig
    if (decor_type !== undefined && (!decor_type.split(',').includes(decorType))) return
    modulesObj[name] = moduleConfig
  })

  // 遍历modulesObj，也就是遍历所有模块
  // 再根据模块名称name，过滤所有文件名
  // 如果有模块名+Setting.vue的文件，将has_setting设为true，表示有Setting组件
  Object.keys(modulesObj).forEach(key => {
    let setting_name = lodash.camelCase(`${key}-setting`)
    setting_name = lodash.upperFirst(setting_name) + '.vue'
    const index = requireModulesKeys.findIndex(fileName => fileName.indexOf(setting_name) !== -1)
    if (index !== -1) {
      modulesObj[key]['has_setting'] = true
    }
  })
  
  // 遍历modulesObj，把模块放入Modules数组中
  // 顺便按照index.js中的sort字段排个序
  const Modules = []
  Object.keys(modulesObj).forEach(key => {
    Modules.push(modulesObj[key])
    Modules.sort((a, b) => a.sort - b.sort)
  })
  
  return Modules
}
