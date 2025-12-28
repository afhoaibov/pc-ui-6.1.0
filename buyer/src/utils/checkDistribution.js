import * as API_distribution from '@/api/distribution'
import { queryURLparamsReg } from './index'
import Storage from './storage'

/** 分销关系检查绑定 */
export async function bindRelation() {
  const su = Storage.getItem('buyer_su')
  if (!su) return
  const isReseller = await API_distribution.checkDistribution() // 检查是否为经销商

  if (!isReseller) {
    const BindingOrNot = await API_distribution.checkRelation() // 检查是否已绑定分销关系

    if (!BindingOrNot) {
      // 当前非分销商 未绑定关系 本地有su分销关系缓存时
      const suData = await API_distribution.accessShortLink({ su }) // 解析获取分享者memberId
      const message = queryURLparamsReg(suData.message)
      const memberIsRegister = await API_distribution.checkMemberRegister(message.member_id) // 判断分享者是否为分销商
      // 分销关系绑定
      let user = Storage.getItem('user')
      user = user ? JSON.parse(user) : {}
      if (message.member_id && user.member_id !== message.member_id && memberIsRegister) {
        // 当前分享者非当前登录用户 并且 分享者为分销商 可执行绑定
        API_distribution.bindDistributionUser(message.member_id).then(status => {
          Storage.removeItem('buyer_su')
        })
      }
    }
  }
}
