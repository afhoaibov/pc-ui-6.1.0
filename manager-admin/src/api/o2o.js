/**
 * O2O相关API
 */

import { api } from '~/ui-domain'
import request from '@/utils/request'

/** -------------意见反馈相关API------------- */
/**
 * 获取会员意见反馈
 * @param params
 */
export function getMemberFeedback(params) {
  return request({
    url: `${api.o2o}/admin/o2o/members/feedback`,
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 删除会员意见反馈
 * @param ids
 */
export function deleteMemberFeedback(ids) {
  return request({
    url: `${api.o2o}/admin/o2o/members/feedback/${ids}`,
    method: 'delete'
  })
}
