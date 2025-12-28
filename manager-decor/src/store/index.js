import Vue from 'vue'
import Vuex from 'vuex'
import lodash from 'lodash'
import * as types from './types'
import * as Foundation from '@/utils/foundation'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    previews: [],
    accessories: [],
    activated: '',
		// 当前已选需要保存的语言模版
		currentLang: '',
    hoverKey: ''
  },
  getters: {
    previews: state => state.previews,
    accessories: state => state.accessories,
    activated: state => state.activated,
    currentLang: state => state.currentLang
  },
  mutations: {
    /**
     * 设置预览项
     * @param state
     * @param item
     */
    [types.SET_PREVIEW_ITEM](state, item) {
      const _item = Foundation.cloneDeep(item)
      _item.__key = Foundation.uuid()
      const __index = item['__index']
      if (/^[0-9]\d*$/.test(__index)) {
        delete _item[__index]
        state.previews.splice(__index, 0, _item)
      } else {
        state.previews.push(_item)
      }
    },
    /**
     * 移除预览项
     * @param state
     * @param key
     */
    [types.REMOVE_PREVIEW_ITEM](state, key) {
      const index = state.previews.findIndex(item => item.__key === key)
      state.previews.splice(index, 1)
      const last = lodash.last(state.previews)
      state.activated = last ? last.__key : state.accessories[0].__key
    },
    /**
     * 设置激活项
     * @param state
     * @param key
     */
    [types.SET_PREVIEW_ACTIVATED](state, key) {
      state.activated = key
    },
    /**
     * 设置预览
     * @param state
     * @param previews
     */
    [types.SET_PREVIEWS](state, previews) {
      state.previews = previews
    },
    /**
     * 设置页面参数
     * @param state
     * @param params
     */
    [types.SET_PAGE_PARAMS](state, params) {
      const index = state.accessories.findIndex(item => item.name === 'page-params')
      if (index === -1) return
      state.accessories[index].data = params
    },
		/**
     * 设置选择语言
     * @param state
     * @param params
     */
		[types.SET_CURRENT_LANG](state, params) {
      state.currentLang = params
    },
    /**
     * 设置鼠标悬浮的预览项
     * @param state
     * @param key
     */
    [types.SET_PREVIEW_HOVER_ITEM](state, key) {
      state.hoverKey = key
    }
  },
  actions: {
    /**
     * 设置预览项
     * @param commit
     * @param item
     */
    setPreviewItemAction({ commit }, item) {
      return commit(types.SET_PREVIEW_ITEM, item)
    },
    /**
     * 移除预览项
     * @param commit
     * @param key
     */
    removePreviewItemAction({ commit }, key) {
      commit(types.REMOVE_PREVIEW_ITEM, key)
    },
    /**
     * 设置激活项
     * @param commit
     * @param key
     */
    setPreviewActivatedAction({ commit }, key) {
      commit(types.SET_PREVIEW_ACTIVATED, key)
    },
    /**
     * 设置预览
     * @param commit
     * @param previews
     */
    setPreviewsAction({ commit }, previews) {
      commit(types.SET_PREVIEWS, previews)
    },
    /**
     * 设置页面参数
     * @param commit
     * @param params
     */
    setPageParamsAction({ commit }, params) {
      commit(types.SET_PAGE_PARAMS, params)
    },
		/**
     * 设置模版语言
     * @param commit
     * @param params
     */
		setCurrentLang({ commit }, params) {
      commit(types.SET_CURRENT_LANG, params)
		},
    /**
     * 设置鼠标悬浮的预览项
     * @param commit
     * @param key
     */
    setPreviewItemHoverAction({ commit }, key) {
      commit(types.SET_PREVIEW_HOVER_ITEM, key)
    }
  }
})

export default store
