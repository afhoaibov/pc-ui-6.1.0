import * as types from '../mutation-types'
import * as API_Common from '@/api/common'
import * as API_Home from '@/api/home'
import * as API_Message from '@/api/message'
import * as API_Currencies from '@/api/currencies'
import uuid from 'uuid/v1'
import Storage from '@/utils/storage'
import i18n from '@/lang'

if (!Storage.getItem('uuid')) {
  Storage.setItem('uuid', uuid(), { expires: 30 })
}
const current_currency = Storage.getItem('current_currency')
/** state */
export const state = () => ({
  // 导航栏
  navList: [],
  // 分类
  categories: [],
  // 热搜关键词
  hotKeywords: [],
  // 站点信息
  site: Storage.getItem('buyer_site') || '',
  // 未读消息数量
  unreadMessageNum: 0,
  // 客服消息未读数量
  serviceMessageNum: 0,
  // 环境变量
  env: '',
  // referer
  referer: '',
  // 多语言支持列表
  locales: [],
  // 搜索关键字
  searchKeywords: '',
  // 货币列表
  currencies: [],
  // 当前选中货币
  current_currency: current_currency || '',
  // 基准货币，算汇率用
  base_currency: ''
})

/** mutations */
export const mutations = {
  /**
   * 设置分类数据
   * @param state
   * @param data
   */
  [types.SET_CATEGORY_DATA](state, data) {
    state.categories = data
  },
  /**
   * 设置导航栏数据
   * @param state
   * @param data
   */
  [types.SET_NAV_DATA](state, data) {
    state.navList = data
  },
  /**
   * 设置热搜关键词数据
   * @param state
   * @param data
   */
  [types.SET_HOT_KEYWORDS](state, data) {
    state.hotKeywords = data
  },
  /**
   * 未读消息数量
   * @param state
   * @param num
   */
  [types.GET_UNREAD_MESSAGE](state, num) {
    state.unreadMessageNum = num
  },

  /**
   * 客服未读消息数量
   * @param state
   * @param num
   */
  [types.GET_SERVICE_MESSAGE](state, num) {
    state.serviceMessageNum = num
  },
  /**
   * 设置环境变量
   * @param state
   * @param env
   */
  [types.SET_ENV_VARS](state, env) {
    state.env = env
  },
  [types.REFERER](state, env) {
    state.referer = env
  },
  [types.SET_LOCALES](state, codes) {
    state.locales = codes
  },
  [types.SET_SEARCH_KEYWORDS](state, data) {
    state.searchKeywords = data
  },
  /**
   * 设置选中货币
   * @param state
   * @param data
   */
  [types.SET_CURRENT_CURRENCY](state, data) {
    state.current_currency = data
    Storage.setItem('current_currency', data)
  },
  /**
   * 设置基础货币
   * @param state
   * @param data
   */
  [types.SET_BASE_CURRENCY](state, data) {
    state.base_currency = data
  },
  /**
   * 设置货币列表
   * @param state
   * @param data
   */
  [types.SET_CURRENCIES](state, data) {
    state.currencies = data
  },
  /**
   * 设置站点信息
   * @param state
   * @param data
   */
  [types.SET_SITE_INFO](state, data) {
    state.site = data
  }
}

/** actions */
export const actions = {
  /**
   * 获取公共数据
   * @param commit
   * @returns {Promise<void>}
   */
  async getCommonDataAction({ commit }) {
    // 导航栏
    API_Home.getSiteMenu().then(res => {
      commit(types.SET_NAV_DATA, res)
    })
    // 分类数据
    API_Home.getCategory().then(res => {
      commit(types.SET_CATEGORY_DATA, res)
    })
    // 热门关键字
    API_Home.getHotKeywords().then(res => {
      commit(types.SET_HOT_KEYWORDS, res)
    })
  },
  /**
   * 获取未读消息数
   * @param commit
   * @returns {Promise<void>}
   */
  async getUnreadMessageNumAction({ commit }) {
    const res = await API_Message.getNoReadMessageNum()
    commit(types.GET_UNREAD_MESSAGE, res.total)
  },

  /**
   * 获取客服消息未读数量
   * @param {*} commit
   */
  async getServiceMessageNum({ commit }) {
    const res = await API_Message.getServiceMessageNum()
    commit(types.GET_SERVICE_MESSAGE, res)
  },
  /**
   * 设置国际化语言支持列表
   * @param commit
   * @param codes
   * @returns {Promise<void>}
   */
  setLocalesAction({ commit }, codes) {
    commit('SET_LOCALES', codes)
  },

  /** 设置首页搜索关键字 */
  setSearchKeywords({ commit }, data) {
    commit(types.SET_SEARCH_KEYWORDS, data)
  },
  /**
   * 获取货币相关
   */
  async getCurrency({ commit, state }) {
    const params = {
      is_enabled: 1,
    }
    const values = await Promise.all([API_Currencies.getCurrencies(params), API_Currencies.getDefaultCurrency()])
    commit(types.SET_CURRENCIES, values[0])
    commit(types.SET_BASE_CURRENCY, values[1])
    if (!state.current_currency) {
      commit(types.SET_CURRENT_CURRENCY, values[1])
    }
  },
  /**
   * 设置当前货币
   * @param commit
   * @param data
   */
  setCurrentCurrency({ commit }, data) {
    commit(types.SET_CURRENT_CURRENCY, data)
  },
  /**
   * 获取站点信息
   * @param commit
   * @returns {Promise<void>}
   */
  async getSiteInfo({ commit }) {
    const site = await API_Common.getSiteInfo()
    commit('SET_SITE_INFO', site)
    if (site.buyer_icon) {
      const link = document.querySelector('link[rel="shortcut icon"]')
      if (link) {
        link.href = site.buyer_icon
      }
    }
    if (site.title) {
      document.title = site.title
    }
  }
}

export const getters = {
  /**
   * 分类列表
   * @param state
   * @returns {*}
   */
  categories: state => state.categories,
  /**
   * 导航栏
   * @param state
   * @returns {*}
   */
  navList: state => state.navList,
  /**
   * 热搜关键词
   * @param state
   * @returns {*}
   */
  hotKeywords: state => state.hotKeywords,
  /**
   * 获取站点信息
   * @param state
   * @returns {getters.site|(function(*))|string}
   */
  site: state => state.site,
  /**
   * 获取未读消息数量
   * @param state
   * @returns {getters.unreadMessageNum|(function(*))|*|number}
   */
  unreadMessageNum: state => state.unreadMessageNum,

  /**
   * 获取未读消息数量
   * @param state
   * @returns {getters.serviceMessageNum|(function(*))|*|number}
   */
  serviceMessageNum: state => state.serviceMessageNum,
  /**
   * 获取环境变量
   * @param state
   * @returns {*}
   */
  env: state => state.env,
  /**
   * 多语言支持列表
   * @param state
   * @returns {[]}
   */
  locales: state => state.locales,
  /**
   * 当前语言
   * @param state
   * @returns {*}
   */
  locale: state => state.locales.find(item => item.code === i18n.locale),
  /**
   * 获取搜索关键字
   * @param {*} state
   * @returns
   */
  getSearchKeywords: state => state.searchKeywords,
  /**
   * 货币列表
   * @param state
   * @returns {[]}
   */
  currencies: state => state.currencies,
  /**
   * 当前所选货币
   * @param state
   * @returns {*}
   */
  current_currency: state => state.current_currency,
  /**
   * 基准货币
   * @param state
   * @returns {string}
   */
  base_currency: state => state.base_currency
}
