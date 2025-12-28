import Vue from 'vue'
import Vuex from 'vuex'
import * as app from './modules/app'
import * as cart from './modules/cart'
import * as user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    cart,
    user
  },
  getters: {
    user: state => state.user.user
  }
})

export default store
