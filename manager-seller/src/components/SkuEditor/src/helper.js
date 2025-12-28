import { v4 as uuidv4 } from 'uuid'
import { RegExp } from '~/ui-utils'
import request from '@/utils/request'
import * as API_Specs from '@/api/specs'
import store from '@/store'

// 默认参数
export const defaultParams = [
  {
    key: 'sn',
    name: '货号',
    value: '',
    type: 'String',
    required: true,
    batch: true,
    batchForm: {
      prefix: '',
      show_prefix: true,
      step: 1,
      pad_zero: 4,
      initial_value_label: '初始数值'
    }
  },
  {
    key: 'weight',
    name: '重量(kg)',
    value: 0,
    type: 'Number',
    reg: RegExp.weight,
    batch: true
  },
  {
    key: 'cost',
    name: '成本价',
    value: 0,
    type: 'Number',
    required: false,
    reg: RegExp.money,
    batch: true
  },
  {
    key: 'price',
    name: '价格',
    value: 0,
    type: 'Number',
    required: true,
    reg: RegExp.money,
    batch: true
  },
  {
    key: 'quantity',
    name: '库存',
    value: 0,
    type: 'Number',
    required: true,
    batch: true
  }
]

/**
 * 生成uuid
 * @type {(function(*, *, *): *)|{}}
 */
export const makeUUID = () => '__' + uuidv4()

/**
 * 合并参数
 * @param extendedParams
 */
export const mergeParams = (extendedParams) => {
  let startSort = 10
  const defParams = cloneJson(defaultParams)
  
  defParams.forEach(dp => {
    dp.sort = startSort++
  })
  extendedParams.forEach(ep => {
    ep.sort = ep.sort || startSort++
  })
  let params = [...defParams]
  extendedParams.forEach(param => {
    const index = params.findIndex(p => p.key === param.key)
    if (index === -1) {
      params.push(param)
    } else {
      params.splice(index, 1, param)
    }
  })
  return params
    .filter(item => item.hidden !== true)
    .map(item => {
      item.max = 99999999
      item.maxlength = 20
      if (item.batch) {
        item.show_batch = false
        item.batchForm = Object.assign({
          prefix: '',
          show_prefix: false,
          initial_value: 0,
          initial_value_type: 'Number',
          initial_value_max: 99999999,
          initial_value_maxlength: 20,
          initial_value_label: '批量设置',
          step: false,
          step_max: 99999999,
          pad_zero: false,
          pad_zero_max: 10,
          max: 99999999,
          maxlength: 20
        }, item.batchForm)
      }
      return item
    })
    .sort((x, y) => x.sort - y.sort)
}

/**
 * 获取商品信息
 * @param goods_id
 * @returns {*|Promise<unknown>}
 */
export const getGoodsInfo = (goods_id) => {
  return request({
    url: `/seller/goods/${goods_id}`,
    method: 'get'
  })
}

/**
 * 保存商品SKU信息
 * @param params
 * @returns {*|Promise<unknown>}
 */
export const saveGoodsSkus = (params) => {
  const skuLst = params.skus.map(item => {
    Object.keys(item).forEach(key => {
      if (key.indexOf('__') === 0) delete item[key]
    })
    if (Array.isArray(item.spec_list)) {
      item.spec_list = item.spec_list.map(sv => {
        Object.keys(sv).forEach(key => {
          if (key.indexOf('__') === 0) delete sv[key]
        })
        delete sv.id
        delete sv.seller_id
        return sv
      })
    }
    return item
  })
  const options = {
    url: `/seller/goods/${params.goodsId}/skus`,
    method: 'put',
    needToken: true,
    headers: { 'Content-Type': 'application/json' },
    data: skuLst
  }
  
  return request(options)
}

/**
 * 获取商品SKU信息
 * @param goods_id
 * @returns {*|Promise<unknown>}
 */
export const getGoodsSkus = async(goods_id) => {
  try {
    let skuList = await request({
      url: `/seller/goods/${goods_id}/skus`,
      method: 'get',
      loading: false
    })
    if (!Array.isArray(skuList)) return Promise.resolve([])
    skuList = skuList.map(sku => {
      if (Array.isArray(sku.spec_list)) {
        sku.spec_list = sku.spec_list.map(item => {
          item.__sp_key = item.spec_group_sn
          item.__sv_key = item.spec_value_sn
          return item
        })
      }
      return sku
    })
    return Promise.resolve(skuList)
  } catch (e) {
    return Promise.resolve([])
  }
}

/**
 * 获取规格列表
 * @type {(function(*): (*|Promise<*>))|*}
 */
export const getSpecList = async() => {
  try {
    const res = await API_Specs.getAllSpecs()
    if (!res || !Array.isArray(res)) {
      return Promise.resolve([])
    }
    const specList = res.map(sp => {
      sp.__sp_key = sp.spec_group_sn
      if (Array.isArray(sp.spec_values)) {
        sp.spec_values = sp.spec_values.map(sv => {
          sv.__sp_key = sp.spec_group_sn
          sv.__sv_key = sv.spec_value_sn
          return sv
        })
      }
      return sp
    })
    return Promise.resolve(specList)
  } catch (e) {
    return Promise.resolve([])
  }
}

/**
 * 保存自定义规格
 * @param spec
 * @param specList
 * @returns {*|Promise<*>}
 */
export const saveSpec = async(spec, specList) => {
  if (specList.some(item => item.spec_group_name === spec.spec_group_name)) {
    return Promise.reject('规格重复！')
  }
  try {
    await API_Specs.addSpec(spec)
  } catch (e) {
    //
  }
}

/**
 * 模拟睡眠
 * @param timer
 * @returns {Promise<unknown>}
 */
export const mockSleep = timer => new Promise(resolve => setTimeout(resolve, timer))

/**
 * 克隆数据
 * @param json
 * @returns {any}
 */
export const cloneJson = (json) => JSON.parse(JSON.stringify(json, (k, v) => {
  if (v instanceof window.RegExp) return v.toString()
  return v
}), (k, v) => {
  try {
    // eslint-disable-next-line no-eval
    if (eval(v) instanceof window.RegExp) return eval(v)
  } catch (e) {
    //
  }
  return v
})

/**
 * 初始化已选规格信息
 * @param skus
 * @returns {{spec_values: *, spec_id: *}[]}
 */
export const initSelectedSpecs = (skus) => {
  let selectedSpecsArr = []
  skus.forEach(sku => {
    if (!Array.isArray(sku.spec_list)) return
    sku.spec_list.forEach(spec => {
      const specVal = {
        __sp_key: spec.__sp_key,
        __sv_key: spec.__sv_key,
        ...spec
      }
      const sp_index = selectedSpecsArr.findIndex(item => item.__sp_key === spec.__sp_key)
      if (sp_index === -1) {
        selectedSpecsArr.push({
          __sp_key: spec.__sp_key,
          id: spec.id,
          spec_group_id: spec.spec_group_id,
          spec_group_sn: spec.spec_group_sn,
          spec_group_name: spec.spec_group_name,
          spec_values: [specVal]
        })
        return
      }
      const sv = selectedSpecsArr[sp_index].spec_values.find(item => item.__sv_key === spec.__sv_key)
      if (!sv) {
        selectedSpecsArr[sp_index].spec_values.push(specVal)
      } else {
        // 需要合并参数
        mergeAndKeepVal(sv, specVal)
      }
    })
  })
  selectedSpecsArr = selectedSpecsArr.map(item => {
    item.__has_image = item.spec_values.some(sv => !!sv.spec_value_image && !selectedSpecsArr.some(v => { return v.__has_image }))
    return item
  })
  return selectedSpecsArr
}

/**
 * 计算SKU表单规则
 * @param skuForm
 * @param params
 * @param excludeSkus
 * @returns {{skuList: *}}
 */
export const computedSkuRules = (skuForm, params, excludeSkus) => {
  let { skuList } = cloneJson(skuForm)
  // SKU表单校验规则
  skuList = skuList.map((sku) => {
    const skuRule = {}
    // 遍历参数列表，生成参数规则
    params.forEach(p => {
      const rule = {}
      rule.required = !!p.required
      rule.trigger = p.trigger || 'blur'
      rule.message = p.message || ''
      // 如果有传入正则的情况，validator使用传入的正则校验
      if (p.reg) {
        rule.validator = (rule, value, callback) => {
          p.reg.test(value) ? callback() : callback(new Error(p.message))
        }
      }
      // 如果有传入自定义校验的情况，使用传入的validator校验
      if (typeof p.validator === 'function') rule.validator = p.validator
      // 考虑隐藏的情况
      if (excludeSkus.includes(sku.__spec_value_keys)) {
        rule.required = false
      }
      skuRule[p.key] = rule
    })
    return skuRule
  })
  return { skuList }
}

/**
 * 规格维度是否发生改变
 * @param skus
 * @param rawSkus
 * @returns {boolean}
 */
export function specIsChanged(skus, rawSkus) {
  let changed = false
  if (!rawSkus.length) return false
  if (skus.length !== rawSkus.length) return true
  
  skus.forEach(sku => {
    const rawSku = rawSkus.find(item => item.sku_id === sku.sku_id)
    if (!rawSku) {
      changed = true
      return
    }
    let raw_sv_keys = ''
    if (Array.isArray(rawSku.spec_list)) {
      raw_sv_keys = rawSku.spec_list.map(sv => sv.__sv_key).sort().join(',')
    }
    const sku_sv_keys = sku.spec_list.map(sv => sv.__sv_key).sort().join(',')
    if (raw_sv_keys === sku_sv_keys) return
    changed = true
  })
  return changed
}

/**
 * 生成表格表单
 * @param skuForm
 * @param params
 */
export const makeSkus = (skuForm, params) => {
  skuForm = cloneJson(skuForm)
  // 处理商品sku数据
  const defaultSkus = skuForm.skuList.map(sku => {
    if (Array.isArray(sku.spec_list)) {
      sku.__spec_value_keys = sku.spec_list.map(sv => sv.__sv_key).sort().join(',')
    }
    return sku
  })
  // 根据已选规格组合sku
  const specs = skuForm.selectedSpecs.map(sp => sp.spec_values).filter(item => item.length)
  let skus = cartesianProduct(specs)
  skus = skus.map((sv, index) => {
    const sku = {}
    // 如果不是数组，说明规格只有一种
    if (!Array.isArray(sv)) {
      sku.__spec_value_keys = sv.__sv_key
      sku.spec_list = [sv]
    } else {
      sku.__spec_value_keys = sv.map(item => item.__sv_key).sort().join(',')
      sku.spec_list = cloneJson(sv)
    }
    // 写入已有sku数据
    const defaultSku = defaultSkus.find(item => item.__spec_value_keys === sku.__spec_value_keys) || {}
    params.forEach(p => {
      sku[p.key] = isEmpty(defaultSku[p.key]) ? p.value : defaultSku[p.key]
    })
    
    sku.sku_id = defaultSku.sku_id || ''
    if (!isEmpty(defaultSku.sku_sort)) {
      sku.sku_sort = defaultSku.sku_sort
    }
    sku.quantity = defaultSku.quantity || 0
    if (defaultSku.sku_image) {
      sku.sku_image = defaultSku.sku_image
    }
    if (!sku.sku_image) {
      sku.sku_image = getSkuSpecImage(sku)
    }
    return sku
  }).map((item, index) => ({ ...item, sku_sort: index }))
  // 笛卡尔乘积算法组合SKU
  function cartesianProduct(arr) {
    if (arr.length < 2) return arr[0] || []
    return [].reduce.call(arr, (col, set) => {
      let res = []
      col.forEach(c => {
        set.forEach(s => {
          let t = [].concat(Array.isArray(c) ? c : [c])
          t.push(s)
          res.push(t)
        })
      })
      return res
    })
  }
  return cloneJson(skus)
}

/**
 * 数组去重
 * @param arr
 * @param uniId
 * @returns {*}
 */
export function uniqueObjArr(arr, uniId) {
  let hash = {}
  return arr.reduce((accum, item) => {
    if (!hash[item[uniId]]) {
      hash[item[uniId]] = true
      accum.push(item)
    }
    return accum
  }, [])
}

/**
 * 格式化规格文字信息
 * @param row
 * @returns {string}
 */
export function formatterSpecText(row) {
  if (!Array.isArray(row.spec_list)) return '/'
  return row.spec_list.map(sv => sv.spec_value_name).join('/')
}

/**
 * sku表单显示图片
 * @param sku
 * @returns {[{url: *}]|undefined|[{url: (string|*)}]}
 */
export function showSkuImage(sku) {
  if (sku.sku_image) return [{ url: sku.sku_image }]
  // const img = getSkuSpecImage(sku)
  // return img ? [{ url: img }] : undefined
}

const specWidths = []
/**
 * 计算是否显示常用规格后的"全部"按钮
 * @param specs
 * @returns {*}
 */
export function showSpecListAllBtn(specs) {
  const listBody = document.getElementById('spec-list-body')
  if (!listBody) return false
  const bodyWidth = listBody.clientWidth - 60
  if (!specWidths.length) {
    const svs = listBody.querySelectorAll('.spec-stage')
    svs.forEach(item => {
      specWidths.push(item.clientWidth + 10)
    })
  }
  let svWidths = 0
  for (let i = 0; i < specWidths.length; i++) {
    const svw = specWidths[i]
    svWidths += svw
    if (svWidths >= bodyWidth) {
      return true
    }
  }
  return false
}

/**
 * 获取表格规格值名
 * @param sku
 * @param spec
 * @returns {*}
 */
export function getTableSpecValName(sku, spec) {
  const spec_list = sku.spec_list || []
  const specVal = spec_list.find(item => item.__sp_key === spec.__sp_key) || {}
  return specVal.spec_value_name
}

/**
 * 计算表格合并
 * @param rowIndex
 * @param columnIndex
 * @param tableSpanArray
 * @returns {{colspan: (number), rowspan: *}}
 */
export function computedTableSpan({ rowIndex, columnIndex }, tableSpanArray) {
  if (columnIndex < tableSpanArray.length) {
    const row = tableSpanArray[columnIndex][rowIndex]
    const col = row > 0 ? 1 : 0
    return { rowspan: row, colspan: col }
  }
}

/**
 * 制作表格rowspan
 * @param skuList
 * @param specTHeads
 * @returns {*[]}
 */
export function makeTableSpans(skuList, specTHeads) {
  const twoSpanArr = []
  specTHeads.forEach((_, index) => {
    const spanArr = []
    let pos = 0
    for (let i = 0; i < skuList.length; i++) {
      if (i === 0) {
        spanArr.push(1)
        pos = 0
      } else {
        if (skuList[i].spec_list[index].spec_value_name === skuList[i - 1].spec_list[index].spec_value_name) {
          spanArr[pos] += 1
          spanArr.push(0)
        } else {
          spanArr.push(1)
          pos = i
        }
      }
    }
    twoSpanArr.push(spanArr)
  })
  return twoSpanArr
}

/**
 * 获取sku规格图片
 * @param sku
 * @returns {*|null}
 */
function getSkuSpecImage(sku) {
  const { spec_list } = sku
  if (Array.isArray(spec_list)) {
    for (let i = 0; i < spec_list.length; i++) {
      const { spec_value_image: img } = spec_list[i]
      if (img) return img
    }
  }
  return ''
}

// 是否已选择规格
export function isSelectedSpec(spec, selected) {
  if (!selected || selected.length === 0) return false
  return selected.some(item => item.spec_group_name === spec.spec_group_name)
}

/**
 * 通过规格值查找有关系的sku列表
 * @param sv
 * @param skuList
 * @returns {*}
 */
export function findSkusBySpecVal(sv, skuList) {
  skuList = skuList.filter(sku => {
    return includesAs(sku.__spec_value_keys.split(','), [sv.__sv_key])
  })
  return skuList
}

/**
 * 在规格列表中找对应的规格值
 * @param specList
 * @param sv
 * @returns {*}
 */
export function findSpecVal(specList, sv) {
  const sp_key = sv.__sp_key
  const sp = specList.find(item => item.__sp_key === sp_key)
  if (!sp) return
  const find_sv = sp.spec_values.find(item => item.spec_value_name === sv.spec_value_name)
  if (!find_sv) return
  return find_sv
}

/**
 * 是否相互包含
 * @param target
 * @param elements
 * @returns {*}
 */
function includesAs(target, elements) {
  return target.every(item => elements.includes(item)) || elements.every(item => target.includes(item))
}

/**
 * sku列表去重
 * @param skus
 * @returns {*}
 */
function uniqueSkus(skus) {
  skus.forEach(item => {
    item.__spec_value_keys = item.spec_list.map(sv => sv.__sv_key).sort().join(',')
  })
  skus = uniqueObjArr(skus, '__spec_value_keys')
  return skus
}

/**
 * 值是否一样
 * @param target
 * @param elements
 * @returns {*}
 */
function sameAs(target, elements) {
  if (target.length !== elements.length) return false
  return target.every(item => elements.includes(item))
}

/**
 * 合并相似对象值
 * @param target
 * @param object
 * @param keys
 * @returns {*}
 */
function mergeAndKeepVal(target, object, keys = []) {
  keys = keys.length ? keys : Object.keys(target)
  keys.forEach(key => {
    target[key] = isEmpty(target[key]) ? object[key] : target[key]
  })
}

/**
 * 是否为空值
 * @param val
 * @returns {boolean}
 */
function isEmpty(val) {
  return val === undefined || val === null || val === ''
}
