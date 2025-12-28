export default class AreaUtil {
  constructor(props) {
    this.rawAreaMap = new Map()
    this.keyNames = props || null
  }

  /**
   * 根据传入的key名称设置key
   * @param areas
   * @returns {*}
   */
  setKeyNames(areas) {
    if (!this.keyNames || typeof this.keyNames !== 'object') return areas
    const id = this.keyNames.id || 'id'
    const name = this.keyNames.name || 'name'
    const children = this.keyNames.children || 'children'
    areas = areas.map(item => {
      item.id = item[id]
      item.name = item[name]
      if (item[children]) {
        item.children = item[children]
        if (Array.isArray(item.children)) {
          item.children = this.setKeyNames(item.children)
        }
      }
      return item
    })
    return  areas
  }

  /**
   * 反方向重置设置的key名称
   * @param areas
   * @returns {*}
   */
  resetKeyNames(areas) {
    if (!this.keyNames || typeof this.keyNames !== 'object') return areas
    const id = this.keyNames.id || 'id'
    const name = this.keyNames.name || 'name'
    const children = this.keyNames.children || 'children'
    areas = areas.map(item => {
      item[id] = item.id
      item[name] = item.name
      if (item.children) {
        item[children] = item.children
        if (Array.isArray(item[children])) {
          item[children] = this.resetKeyNames(item[children])
        }
      }
      if (id !== 'id') delete item.id
      if (name !== 'name') delete item.name
      if (children !== 'children') delete item.children
      return item
    })
    return areas
  }

  /**
   * 是否有子集
   * @param item
   * @returns {boolean}
   */
  hasChildren(item) {
    return Array.isArray(item.children) && item.children.length !== 0
  }

  /**
   * 递归获取子集长度
   * 包含选中长度
   * @param children
   * @returns {{length: number, checked: number}}
   */
  getChildrenLengthDeep(children) {
    if (!Array.isArray(children)) return { length: 0, checked: 0 }
    let length = 0
    let checked = 0
    const getChildrenLength = (children) => {
      children.forEach(item => {
        if (item.__disabled) return
        if (Array.isArray(item.children) && item.children.length !== 0) {
          getChildrenLength(item.children)
        } else {
          length++
          if (item.checked === true) checked++
        }
      })
    }
    getChildrenLength(children)
    return { length, checked, allChecked: length === checked }
  }

  /**
   * 递归设置子集选中状态
   * @param children
   * @param checked
   */
  setChildrenCheckboxDeep(children, checked) {
    children.forEach(item => {
      if (item.__disabled === true) return
      item.checked = checked
      if (Array.isArray(item.children)) {
        this.setChildrenCheckboxDeep(item.children, checked)
      }
    })
  }

  /**
   * 获取选中的项
   * @param children
   * @returns {{checked: (*|void), checkedTree: *}}
   */
  getDeepCheckedItems(children) {
    const areas = this.cloneDeep(children)

    /**
     * 递归遍历
     * 获取选中的路径
     * @param array
     * @returns {*}
     */
    const getCheckedItem = (array) => {
      return array.map(item => {
        if (this.hasChildren(item)) {
          // 检查【地区项的所有子集数量】与【原始数据所有子集数量】是否一致
          // 如果不一致，说明此地区项中有被排除掉的子项，checked要设置为false
          const area = this.rawAreaMap.get(item.id)
          if (this.getChildrenLengthDeep(area.children).length !== this.getChildrenLengthDeep(item.children).length) {
            item.checked = false
          }
          item.children = getCheckedItem(item.children)
          const deepLen = this.getChildrenLengthDeep(item.children)
          if (deepLen.checked === 0) return undefined
        } else if (item.checked !== true) {
          return undefined
        }
        return item
      }).filter(item => !!item)
    }
    // 选中的集合树
    let checkedTree = getCheckedItem(areas)

    // 选中的集合，展开的一维数组
    let checked = []
    const getChecked = (array) => {
      array.forEach(item => {
        if (item.checked) {
          checked.push(item)
        } else if (this.hasChildren(item)) {
          getChecked(item.children)
        }
      })
    }
    getChecked(checkedTree)

    checkedTree = this.removeInsideKeysDeep(checkedTree)
    checked = this.removeInsideKeysDeep(checked)

    return { checked, checkedTree }
  }

  /**
   * 递归移除内部的key
   * @param items
   * @returns {*|void}
   */
  removeInsideKeysDeep(items) {
    items = JSON.parse(JSON.stringify(items))
    const removeKey = (item) => {
      Object.keys(item).forEach(key => {
        if (key.indexOf('__') !== -1) delete item[key]
      })
      if (this.hasChildren(item)) {
        item.children = this.removeInsideKeysDeep(item.children)
      }
      return item
    }
    return items.map(removeKey)
  }

  /**
   * 简单深克隆
   * @param data
   * @returns {any}
   */
  cloneDeep(data) {
    if (!Array.isArray(data) || typeof data !== 'object') return data
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * 递归遍历整棵地区树，创建id-->item的映射Map
   * @param areas
   */
  setRawAreaMap(areas) {
    const setMap = (children) => {
      children.forEach(item => {
        this.rawAreaMap.set(item.id, item)
        if (this.hasChildren(item)) setMap(item.children)
      })
    }
    setMap(areas)
  }
}
