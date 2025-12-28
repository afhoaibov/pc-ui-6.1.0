import Storage from '@/utils/storage'
import * as API_Common from '@/api/common'
import * as API_CurrencySetting from '@/api/currencySetting'

const app = {
  state: {
    sidebar: {
      opened: !+Storage.getItem('adminSidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    siteInfo: Storage.getItem('admin_site'),
    locales: [],
    baseCurrency: Storage.getItem('adminBaseCurrency') || ''
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      const opened = !state.sidebar.opened
      Storage.setItem('adminSidebarStatus', opened ? 0 : 1)
      state.sidebar.opened = opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Storage.setItem('adminSidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LOCALES: (state, codes) => {
      state.locales = codes
    },
    SET_BASE_CURRENCY: (state, currency) => {
      state.baseCurrency = currency
      Storage.setItem('adminBaseCurrency', currency)
    },
    SET_SITE_INFO: (state, siteInfo) => {
      state.siteInfo = siteInfo
      Storage.setItem('admin_site', siteInfo)
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    /**
     * 设置国际化语言支持列表
     * @param commit
     * @param codes
     */
    setLocalesAction({ commit }, codes) {
      commit('SET_LOCALES', codes)
    },
    /**
     * 获取默认货币
     * @param commit
     * @param currency
     */
    async getBaseCurrency({ commit }) {
      const currency = await API_CurrencySetting.getDefaultCurrency()
      commit('SET_BASE_CURRENCY', currency)
    },
    /**
     * 获取站点信息
     * @param commit
     * @returns {Promise<void>}
     */
    async getSiteInfo({ commit }) {
      const site = await API_Common.getSiteInfo()
      commit('SET_SITE_INFO', site)
      if (site.admin_icon) {
        const link = document.querySelector('link[rel="shortcut icon"]')
        if (link) {
          link.href = site.admin_icon
        }
      }
      if (site.title) {
        document.title = site.title
      }
    }
  }
}

export default app
