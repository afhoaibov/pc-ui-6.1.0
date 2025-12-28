/**
 * 会员管理API
 */

import request from '@/utils/request'
import md5 from 'js-md5'

/**
 * 获取会员列表
 * @param params
 */
export function getMemberList(params) {
  return request({
    url: 'admin/members',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 添加会员
 * @param params
 */
export function addMember(params) {
  params = JSON.parse(JSON.stringify(params))
  if (params.password) {
    params.password = md5(params.password)
  }
  return request({
    url: 'admin/members',
    method: 'post',
    data: params
  })
}

/**
 * 获取会员详情
 * @param id
 */
export function getMemberDetail(id) {
  return request({
    url: `admin/members/${id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 修改会员
 * @param id
 * @param params
 */
export function editMember(id, params) {
  if (params.password) {
    params.password = md5(params.password)
  }
  return request({
    url: `admin/members/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 删除会员
 * @param id
 */
export function deleteMember(id) {
  return request({
    url: `admin/members/${id}`,
    method: 'delete'
  })
}

/**
 * 获取会员回收站列表
 * @param params
 */
export function getRecycleMemberList(params) {
  return request({
    url: 'admin/members',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 恢复会员
 * @param id
 */
export function recycleMember(id) {
  return request({
    url: `admin/members/${id}`,
    method: 'post'
  })
}

/**
 * 获取会员收货地址列表
 * @param member_id
 * @param params
 */
export function getMemberAddress(member_id, params) {
  return request({
    url: `admin/members/addresses/${member_id}`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取会员咨询列表
 * @param params
 */
export function getMemberAsks(params) {
  return request({
    url: 'admin/members/asks',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除会员咨询
 * @param ask_id
 */
export function deleteMemberAsk(ask_id) {
  return request({
    url: `admin/members/asks/${ask_id}`,
    method: 'delete'
  })
}

/**
 * 获取会员咨询详情
 * @param ask_id
 */
export function getMemberAsksDetail(ask_id) {
  return request({
    url: `admin/members/asks/${ask_id}`,
    method: 'get'
  })
}

/**
 * 获取会员咨询回复列表
 * @param params
 */
export function getMemberAsksReply(params) {
  return request({
    url: 'admin/members/reply',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除会员咨询回复
 * @param id
 */
export function deleteMemberAskReply(id) {
  return request({
    url: `admin/members/reply/${id}`,
    method: 'delete'
  })
}

/**
 * 修改会员消费积分
 * @param member_id
 * @param point
 */
export function editMemberConsumPoint(member_id, point) {
  return request({
    url: `admin/members/point/${member_id}`,
    method: 'put',
    data: { point }
  })
}

/**
 * 获取会员积分列表
 * @param params
 */
export function getMemberPointList(params) {
  return request({
    url: `admin/members/point/${params.member_id}`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 审核咨询
 * @param params
 * @returns {*}
 */
export function batchAuditAsk(param) {
  return request({
    url: `admin/members/asks/batch/audit`,
    method: 'POST',
    data: param,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 审核咨询回复
 * @param params
 * @returns {*}
 */
export function batchAuditReply(param) {
  return request({
    url: `admin/members/reply/batch/audit`,
    method: 'POST',
    data: param,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 获取会员评论列表
 * @param params
 */
export function getMemberComments(params) {
  return request({
    url: 'admin/members/comments',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除会员评论
 * @param comment_id
 */
export function deleteMemberComments(comment_id) {
  return request({
    url: `admin/members/comments/${comment_id}`,
    method: 'delete'
  })
}

/**
 * 审核评论
 * @param comment_id
 */
export function examineMemberComments(comment_id, params) {
  return request({
    url: `admin/members/comments/${params}?audit_status=${comment_id}`,
    method: 'post'
  })
}

/**
 * 审核商品评论
 * @param params
 * @returns {*}
 */
export function batchAuditComment(param) {
  return request({
    url: `admin/members/comments/batch/audit`,
    method: 'POST',
    data: param,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 获取会员评论详情
 * @param comment_id
 */
export function getMemberCommentDetail(comment_id) {
  return request({
    url: `admin/members/comments/${comment_id}`,
    method: 'get'
  })
}

/**
 * 获取会员预存款明细
 * @param params
 */
export function getMemberDepositLog(params) {
  return request({
    url: 'admin/members/deposit/log',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取会员充值记录
 * @param params
 */
export function getMemberDepositRecharge(params) {
  return request({
    url: 'admin/members/deposit/recharge',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取充值和消费总金额
 * @param params
 */
export function getMemberDepositTotal(params) {
  return request({
    url: 'admin/members/deposit/price/total',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取会员充值记录
 * @param id
 */
export function editMembersStatus(id) {
  return request({
    url: `admin/members/${id}/status`,
    method: 'post'
  })
}

/**
 * 获取会员锁定状态
 * @param id
 */
export function getMembersLockStatus(id) {
  return request({
    url: `admin/members/${id}/lock/status`,
    method: 'get'
  })
}

/**
 * 解除会员锁定状态
 * @param id
 */
export function editMembersUnLockStatus(id) {
  return request({
    url: `admin/members/${id}/unlock`,
    method: 'post'
  })
}

/**
 * 或群会员总数
 * @param {*}
 * @returns
 */
export function getMembersTotal(d) {
  return request({
    url: `admin/members/total-count`,
    method: 'get'
  })
}

/**
 * 获取会员预存款余额
 * @param {*} member_id
 * @returns
 */
export function getMembersWallet(member_id) {
  return request({
    url: `admin/members/deposit/${member_id}/wallet`,
    method: 'get'
  })
}
/**
 * 用户预存款充值
 * @param {*} params
 * @returns
 */
export function memberTopUp(params) {
  return request({
    url: `admin/members/deposit/${params.member_id}/increase`,
    method: 'put',
    params
  })
}
/**
 * 删除等级
 * @param {*} id
 * @returns
 */
export function deleteMembersLevel(id, params) {
  return request({
    url: `admin/members/level/${id}`,
    method: 'delete',
    params
  })
}
/**
 * 获取等级详情
 * @param {*} id
 * @returns
 */
export function getMembersLevelDetail(id) {
  return request({
    url: `admin/members/level/${id}`,
    method: 'get'
  })
}
/**
 * 修改等级数据
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function updateMembersLevel(id, params) {
  return request({
    url: `admin/members/level/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data: params
  })
}

/**
 * 设置默认等级
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function updateMembersLevelStatus(id, param) {
  return request({
    url: `admin/members/level/default/${id}`,
    method: 'put'
  })
}

/**
 * 修改会员等级
 * @param {*} member_id
 * @param {*} id
 * @returns
 */
export function editMemberLevel(member_id, id) {
  return request({
    url: `/admin/members/edit-level/${member_id}/${id}`,
    method: 'put'
  })
}
/**
 * 获取会员等级列表
 * @returns
 */
export function getMembersLevelList() {
  return request({
    url: 'admin/members/level',
    method: 'get'
  })
}
/**
 * 添加会员等级
 * @returns
 */
export function addMembersLevel(params) {
  return request({
    url: 'admin/members/level',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: params
  })
}

