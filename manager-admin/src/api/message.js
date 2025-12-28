/**
 * 消息设置相关API
 * 消息模板
 * 站内消息
 */

import request from '@/utils/request'

/**
 * 获取消息模板列表
 * @param params
 */
export function getMessageTemplate(params) {
  return request({
    url: 'admin/systems/message-templates',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 编辑消息模板
 * @param id
 * @param params
 */
export function editMessageTemplate(id, params) {
  return request({
    url: `admin/systems/message-templates/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 获取站内消息列表
 * @param params
 */
export function getMessageList(params) {
  return request({
    url: 'admin/systems/messages',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 发布新的站内消息
 * @param params
 */
export function releaseMessage(params) {
  return request({
    url: 'admin/systems/messages',
    method: 'post',
    data: params
  })
}

/**
 * 获取微信订阅通知列表
 * @param params
 */
export function getWechatSubScribeNoticeList(params) {
  return request({
    url: 'admin/systems/wechat-subscribe-notice',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 修改微信订阅通知配置信息
 * @param noticeType
 * @param params
 */
export function modifyWechatConfigItem(noticeType, params) {
  return request({
    url: `admin/systems/wechat-subscribe-notice/${noticeType}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 启用或关闭微信订阅通知
 * @param noticeType
 * @param open
 */
export function openAndCloseWechatNotice(noticeType, open) {
  return request({
    url: `admin/systems/wechat-subscribe-notice/${noticeType}/${open}`,
    method: 'put'
  })
}

/**
 * 获取微信订阅通知消息模板列表
 * @param noticeType
 * @param params
 */
export function getWechatNoticeTemplateList(noticeType, params) {
  return request({
    url: `admin/systems/wechat-subscribe-notice/tmp/${noticeType}`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 启用或关闭微信订阅通知
 * @param template_id
 * @param open
 */
export function openAndCloseWechatNoticeTemplate(template_id, open) {
  return request({
    url: `admin/systems/wechat-subscribe-notice/tmp/${template_id}/${open}`,
    method: 'put'
  })
}

/**
 * 编辑微信订阅通知消息模板
 * @param id
 * @param data
 */
export function updateWechatNoticeTemplate(id, data) {
  return request({
    url: `/admin/systems/wechat-subscribe-notice/tmp/edit/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取微信订阅通知消息模板详情
 * @param id
 */
export function getWechatNoticeTemplate(id) {
  return request({
    url: `/admin/systems/wechat-subscribe-notice/tmp/get/${id}`,
    method: 'get'
  })
}

/**   站内信相关api start */

/**
 * 获取站内信列表
 * @param {*} params
 * @returns
 */
export function getNoticeTemplates(params) {
  return request({
    url: `admin/notice/templates`,
    method: 'get',
    params
  })
}

/**
 * 切换站内信开启状态
 * @param {*} params
 * @returns
 */
export function changeNoticeStatus(params) {
  return request({
    url: `admin/notice/templates/${params.id}/status`,
    method: 'put',
    params
  })
}

/**
 * 修改站内信模板
 * @param {*} data
 * @returns
 */
export function updateNoticeTemplates(data) {
  return request({
    url: `admin/notice/templates/${data.id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 新增站内信模板
 * @param {*} data
 * @returns
 */
export function addNoticeTemplates(data) {
  return request({
    url: `admin/notice/templates`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**  站内信 end */

/** 邮件相关api  start */

/**
 * 获取邮件模板列表
 * @param {*} params
 * @returns
 */
export function getMailTemplates(params) {
  return request({
    url: `admin/notice/mail/templates`,
    method: 'get',
    params
  })
}

/**
 * 新增邮件模板
 * @param {*} data
 * @returns
 */
export function addMailTemplates(data) {
  return request({
    url: 'admin/notice/mail/templates',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 切换邮件开启状态
 * @param {*} params
 * @returns
 */
export function changeMailTemplatesStatus(params) {
  return request({
    url: `admin/notice/mail/templates/${params.id}/status`,
    method: 'put',
    params
  })
}

/**
 * 修改邮件模板
 * @param {*} data
 * @returns
 */
export function updateMailTemplates(data) {
  return request({
    url: `admin/notice/mail/templates/${data.id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/** 邮件相关api  end */

/** 短信api相关 */

/** 获取短信签名列表 */
export function getSmsSignList(params) {
  return request({
    url: 'admin/notice/sms/sign/core',
    method: 'get',
    params
  })
}
/**
 * 新增短信签名
 * @param {*} pluginId
 * @param {*} data
 * @returns
 */
export function addSmsSign(pluginId, data) {
  return request({
    url: `admin/notice/sms/sign/${pluginId}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 编辑短信签名
 * @param {*} pluginId
 * @param {*} data
 * @returns
 */
export function editSmsSign(pluginId, data) {
  return request({
    url: `admin/notice/sms/sign/${pluginId}/${data.sign_id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 删除短信签名
 * @param {*} sign_id
 * @returns
 */
export function deleteSmsSign(pluginId, sign_id) {
  return request({
    url: `admin/notice/sms/sign/${pluginId}/${sign_id}`,
    method: 'delete'
  })
}

/**
 * 同步签名状态
 * @param {*} pluginId
 * @returns
 */
export function syncSignStatus(pluginId) {
  return request({
    url: `admin/notice/sms/sign/${pluginId}/sync`,
    method: 'put'
  })
}

/**
 * 获取审核通过的短信签名
 * @returns
 */
export function getPassSmsSignList() {
  return request({
    url: 'admin/notice/sms/sign/core/pass',
    method: 'get'
  })
}

/**
 * 获取某条签名数据详情
 * @param {*} sign_id
 * @returns
 */
export function getSmsSignInfo(pluginId, sign_id) {
  return request({
    url: `admin/notice/sms/sign/${pluginId}/${sign_id}`,
    method: 'get'
  })
}

/**
 * 获取业务模板编码选项
 * @returns
 */
export function getTemplateServiceCode() {
  return request({
    url: 'admin/notice/sms/template/core/service-code',
    method: 'get'
  })
}

/**
 * 获取短信模板列表
 * @param {*} params
 * @returns
 */
export function getSmsTemplateList(params) {
  return request({
    url: 'admin/notice/sms/template/core',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 新增短信模板
 * @param {*} pluginId
 * @param {*} data
 * @returns
 */
export function addSmsTemplate(pluginId, data) {
  return request({
    url: `admin/notice/sms/template/${pluginId}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 新增模板审核
 * @param {*} pluginId
 * @param {*} data
 * @returns
 */
export function addSmsTemplateAudit(pluginId, data, template_id) {
  return request({
    url: `admin/notice/sms/template/${pluginId}/${template_id}/audit`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 获取模板审核列表
 * @param {*} template_id
 * @returns
 */
export function getSmsTemplateRecord(template_id) {
  return request({
    url: `admin/notice/sms/template/smsAliPlugin/${template_id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 更新短信模板签名
 * @param {*} params
 * @returns
 */
export function updateSmsTemplateSign(params) {
  return request({
    url: `admin/notice/sms/template/core/${params.id}/sign`,
    method: 'put',
    params
  })
}

/**
 * 编辑短信模板
 * @param {*} pluginId
 * @param {*} data
 * @returns
 */
export function editSmsTemplate(pluginId, data) {
  return request({
    url: `admin/notice/sms/template/${pluginId}/${data.template_id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 *  同步短信模板
 * @returns
 */
export function syncTemplateStatus(pluginId) {
  return request({
    url: `admin/notice/sms/template/${pluginId}/sync`,
    method: 'put'
  })
}
/**
 * 删除短信模板
 * @param {*} template_id
 * @returns
 */
export function deleteSmsTemplate(pluginId, template_id) {
  return request({
    url: `admin/notice/sms/template/${pluginId}/${template_id}`,
    method: 'delete'
  })
}

/**
 * 切换模板开启状态
 * @param {*} params
 * @returns
 */
export function changeTemplateStatus(params) {
  return request({
    url: `admin/notice/sms/template/core/${params.id}/status`,
    method: 'put',
    params
  })
}

/**
 * 获取模板详情
 * @param {*} template_id
 * @returns
 */
export function getTemplateInfo(template_id) {
  return request({
    url: `/admin/notice/sms/template/core/${template_id}`,
    method: 'get'
  })
}

/**
 * 获取审核通过的模板
 * @returns
 */
export function getPassTemplateList(params) {
  return request({
    url: 'admin/notice/sms/template/core/pass',
    method: 'get',
    params
  })
}

/**
 * 获取短信任务列表
 * @param {*} params
 * @returns
 */
export function getSmsTaskList(params) {
  return request({
    url: 'admin/notice/sms/task',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 新增短信发送任务
 * @param {*} data
 * @returns
 */
export function addSmsTask(data) {
  return request({
    url: 'admin/notice/sms/task',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

/**
 * 撤回发送任务
 * @param {*} id
 * @returns
 */
export function withdrawTask(id) {
  return request({
    url: `admin/notice/sms/task/${id}/recall`,
    method: 'put'
  })
}

/**
 * 获取短信任务详情
 * @param {*} id
 * @returns
 */
export function getSmsTaskInfo(id) {
  return request({
    url: `admin/notice/sms/task/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 获取任务记录
 * @param {*} params
 * @returns
 */
export function getTaskRecord(params) {
  return request({
    url: `admin/notice/sms/record`,
    method: 'get',
    loading: false,
    params
  })
}
