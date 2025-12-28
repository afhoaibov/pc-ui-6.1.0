/**
 * 字段管理相关
 */
import request from '@/utils/request'

/**
 * 获取界面字典列表
 * @param {*} params
 * @returns
 */
export function getInterfaceDictionary(params) {
  return request({
    url: 'admin/i18n/ui-dict',
    method: 'get',
    params
  })
}

/**
 * 编辑机器翻译平台配置
 * @returns
 */
export function editDictionaryGateway(type, data) {
  return request({
    url: `/admin/i18n/machine-translation-platform/${type}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 开启一个机器翻译平台
 * @returns
 */
export function openDictionaryGatewayById(type) {
  return request({
    url: `/admin/i18n/machine-translation-platform/${type}/open`,
    method: 'put'
  })
}

/**
 * 获取机器翻译平台
 * @returns
 */
export function getMachineDictionary() {
  return request({
    url: 'admin/i18n/machine-translation-platform',
    method: 'get'
  })
}

/**
 * 获取开启的语言编码
 * @returns
 */
export function getOpenLangCode() {
  return request({
    url: 'admin/i18n/lang-code/open',
    method: 'get'
  })
}

/**
 * 新增界面字典数据
 * @param {*} data
 * @returns
 */
export function addInterfaceDictionary(data) {
  return request({
    url: `admin/i18n/ui-dict`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 更新界面字典数据
 * @param {*} key_id
 * @param {*} params
 * @returns
 */
export function updateInterfaceDictionary(key_id, data) {
  return request({
    url: `admin/i18n/ui-dict/key/${key_id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 删除某条界面翻译数据
 * @param {*} params
 * @returns
 */
export function deleteInterfaceDictionary(params) {
  return request({
    url: `admin/i18n/ui-dict/key`,
    method: 'delete',
    params
  })
}

/**
 * 获取国家编码列表
 * @param {*} params
 * @returns
 */
export function getCountryCodeList(params) {
  return request({
    url: 'admin/i18n/lang-code',
    method: 'get',
    params
  })
}

/**
 * 切换字典语言开启状态
 * @param {*} id
 * @param {*} data
 * @returns
 */
export function updateCodeStatus(id, data) {
  return request({
    url: `admin/i18n/lang-code/${id}/operate`,
    method: 'put',
    data
  })
}

/**
 * 获取数据字典列表
 * @param {*} params
 * @returns
 */
export function getDataDictionaryList(params) {
  return request({
    url: 'admin/i18n/data-dict',
    method: 'get',
    params
  })
}

/**
 * 新增数据字典
 * @param {*} data
 * @returns
 */
export function addDataDictionary(data) {
  return request({
    url: `admin/i18n/data-dict`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 删除数据字典项
 * @param {*} group_sn
 * @returns
 */
export function deleteDataDictionary(group_sn) {
  return request({
    url: `admin/i18n/data-dict/group-sn/${group_sn}`,
    method: 'delete'
  })
}

/**
 * 更新数据字典
 * @param {*} group_sn
 * @param {*} data
 * @returns
 */
export function updateDataDictionary(group_sn, data) {
  return request({
    url: `admin/i18n/data-dict/group-sn/${group_sn}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取可创建翻译任务列表
 * @returns
 */
export function getTranslationTaskList() {
  return request({
    url: 'admin/i18n/task/list',
    method: 'get'
  })
}

/**
 * 创建翻译任务
 * @param {*} id
 * @returns
 */
export function createTranslationTask(id) {
  return request({
    url: `admin/i18n/task/${id}/create`,
    method: 'post'
  })
}

/**
 * 重新翻译某个商品
 * @param {*} params
 * @returns
 */
export function retranslateGoods(params) {
  return request({
    url: `admin/i18n/goods/translate`,
    method: 'post',
    params
  })
}
/**
 * 获取翻译失败列表
 * @returns
 */
export function getFailedTaskList() {
  return request({
    url: 'admin/i18n/task/re-translate/list',
    method: 'get'
  })
}

/**
 * 重新创建任务
 * @param {*} id
 * @returns
 */
export function createFailedTask(id) {
  return request({
    url: `admin/i18n/task/re-translate/${id}/create`,
    method: 'post'
  })
}
