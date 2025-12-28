import * as types from '../mutation-types'
import * as API_Members from '@/api/members'
import * as API_Passport from '@/api/passport'
import Storage from '@/utils/storage'
import jwt_decode from 'jwt-decode'

export const namespaced = true

const user = Storage.getItem('user')
export const state = {
  user: user ? JSON.parse(user) : ''
}

/** mutations */
export const mutations = {
  /**
   * 保存用户信息
   * @param state
   * @param data
   */
  [types.SET_USER_INFO](state, data) {
    state.user = data
    Storage.setItem('user', JSON.stringify(data))
  },
  /**
   * 移除用户信息
   * @param state
   * @param data
   */
  [types.REMOVE_USER_INFO](state, data) {
    state.user = ''
    Storage.removeItem('user')
    Storage.removeItem('uid')
    // 主要针对第三方登录留下的数据
    Storage.removeItem('uuid_connect')
  },
  /**
   * 设置访问令牌
   * @param state
   * @param token
   */
  [types.SET_ACCESS_TOKEN](state, token) {
    const expires = new Date(jwt_decode(token).exp * 1000)
    Storage.setItem('access_token', token, { expires })
  },
  /**
   * 移除访问令牌
   * @param state
   */
  [types.REMOVE_ACCESS_TOKEN](state) {
    Storage.removeItem('access_token')
  },
  /**
   * 设置刷新令牌
   * @param state
   * @param token
   */
  [types.SET_REFRESH_TOKEN](state, token) {
    const expires = new Date(jwt_decode(token).exp * 1000)
    Storage.setItem('refresh_token', token, { expires })
  },
  /**
   * 移除刷新令牌
   * @param state
   */
  [types.REMOVE_REFRESH_TOKEN](state) {
    Storage.removeItem('refresh_token')
  },
  /**
   * 移除商家中心登录状态
   * @param state
   */
  [types.REMOVE_SELLER_AUTH](state) {
    Storage.removeItem('seller_access_token')
    Storage.removeItem('seller_refresh_token')
    Storage.removeItem('seller_shop')
    Storage.removeItem('seller_uid')
    Storage.removeItem('seller_user')
  }
}

/** actions */
export const actions = {
  /**
   * 获取用户数据
   * @param commit
   * @param params
   */
  getUserDataAction: ({ commit }) => {
    return new Promise((resolve, reject) => {
      API_Members.getUserInfo().then(response => {
        response.birthday *= 1000
        commit(types.SET_USER_INFO, response)
        resolve(response)
      }).catch(error => reject(error))
    })
  },
  /**
   * 登录
   * @param commit
   * @param dispatch
   * @param params
   * @returns {Promise<any>}
   */
  loginAction: ({ commit, dispatch }, params) => {
    return new Promise((resolve, reject) => {
      if (params.login_type === 'quick') {
        const { mobile } = params.form
        API_Passport.loginByMobile(mobile, params.form).then(loginSuccess).catch(reject)
      } else {
        API_Passport.login(params.form).then(loginSuccess).catch(reject)
      }
      function loginSuccess(res) {
        const { access_token, refresh_token, uid } = res
        commit(types.SET_ACCESS_TOKEN, access_token)
        commit(types.SET_REFRESH_TOKEN, refresh_token)
        Storage.setItem('uid', uid)
        API_Members.getUserInfo().then(response => {
          response.birthday *= 1000
          commit(types.SET_USER_INFO, response)
          resolve(response)
        }).catch(reject)
      }
    })
  },
  /**
   * 登出
   * @param commit
   * @param dispatch
   * @param type
   * @returns {Promise<any>}
   */
  logoutAction: ({ commit, dispatch }, type) => {
    return new Promise((resolve, reject) => {
      API_Members.logout().then(() => {
        /**
         * 如果是修改密码
         * 那么判断当前用户id是否与商家中心已登录用户id一致
         * 如果一致，那么连同商家中心登录状态一同移除
         */
        if (type === 'change-pwd') {
          const uid = Storage.getItem('uid')
          const seller_uid = Storage.getItem('seller_uid')
          if (uid === seller_uid) {
            commit(types.REMOVE_SELLER_AUTH)
          }
        }
        commit(types.REMOVE_USER_INFO)
        commit(types.REMOVE_ACCESS_TOKEN)
        commit(types.REMOVE_REFRESH_TOKEN)
        // 移除不要的参数 - 分销
        Storage.removeItem('bill_id')
        Storage.removeItem('member_id')
        resolve()
      }).catch(error => reject(error))
    })
  },
  /**
   * 保存用户信息【修改资料】
   * @param commit
   * @param params
   * @returns {Promise<any>}
   */
  saveUserInfoAction: ({ commit }, params) => {
    return new Promise((resolve, reject) => {
      API_Members.saveUserInfo(params).then(response => {
        response.birthday *= 1000
        commit(types.SET_USER_INFO, response)
        resolve(response)
      }).catch(error => reject(error))
    })
  },
  /**
   * 移除用户信息
   * @param commit
   */
  removeUserAction: ({ commit }) => {
    commit(types.REMOVE_USER_INFO)
  },
  /**
   * 注册【通过手机号】
   * @param commit
   * @param dispatch
   * @param params
   * @returns {Promise<any>}
   */
  registerByMobileAction: ({ commit, dispatch }, params) => {
    return new Promise((resolve) => {
      API_Passport.registerByMobile(params).then(res => {
        const { access_token, refresh_token, uid } = res
        commit(types.SET_ACCESS_TOKEN, access_token)
        commit(types.SET_REFRESH_TOKEN, refresh_token)
        Storage.setItem('uid', uid)
        resolve(res)
      })
    })
  },
  /**
   * 设置accessToken
   * @param commit
   * @param accessToken
   */
  setAccessTokenAction: ({ commit }, accessToken) => {
    commit(types.SET_ACCESS_TOKEN, accessToken)
  },
  /**
   * 移除accessToken
   * @param commit
   */
  removeAccessTokenAction: ({ commit }) => {
    commit(types.REMOVE_ACCESS_TOKEN)
  },
  /**
   * 设置refreshToken
   * @param commit
   * @param refreshToken
   */
  setRefreshTokenAction: ({ commit }, refreshToken) => {
    commit(types.SET_REFRESH_TOKEN, refreshToken)
  },
  /**
   * 移除refreshToken
   * @param commit
   */
  removeRefreshTokenAction: ({ commit }) => {
    commit(types.REMOVE_REFRESH_TOKEN)
  }
}

/** getters */
export const getters = {
  /**
   * 用户数据
   * @param state
   */
  user: state => state.user
}
