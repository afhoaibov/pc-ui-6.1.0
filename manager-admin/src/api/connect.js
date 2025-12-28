/**
 * Created by Andste on 2018/6/28.
 * 信任登录相关API
 */

import request from '@/utils/request'

/**
 * 获取信任登录参数
 */
export function getConnect() {
  return request({
    url: 'admin/systems/third-platform?type=CONNECT',
    method: 'get'
  })
}

