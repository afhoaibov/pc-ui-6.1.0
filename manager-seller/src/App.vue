<template>
  <div id="app">
    <router-view v-if="isRouterAlive"></router-view>
  </div>
</template>

<script>
import { receiveDecorToken } from '@/utils/decor-utils'
import Storage from '@/utils/storage'

export default {
  name: 'APP',
  computed: {
    isRouterAlive() {
      return this.$store.state.tagsView.isRouterAlive
    },
    user() {
      return this.$store.state.user.user
    }
  },
  async mounted() {
    if (this.MixinI18n) {
      this.$store.dispatch('getBaseCurrency')
    }
    const accessToken = Storage.getItem('seller_access_token')
    if (this.user && accessToken) {
      this.$store.dispatch('getShopInfoAction')
    }
    if (location.href.indexOf('/chat') > -1) {
      document.title = '在线客服'
    }
    receiveDecorToken()
  }
}
</script>
