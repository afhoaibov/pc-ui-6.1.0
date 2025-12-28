import request from '@/utils/request'
import { api } from '~/ui-domain'

/**
 * 获取IM未读消息数量
 * @returns {*|Promise<unknown>}
 */
export function getUnreadNum() {
  return request({
    url: api['admin'] + `/admin/im/unread-num`,
    method: 'post',
    loading: false,
    needToken: true
  })
}
