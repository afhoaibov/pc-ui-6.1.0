<template>
  <div id="app">
    <router-view v-if="isRouterAlive"></router-view>
  </div>
</template>

<script>
import { receiveDecorToken } from '@/utils/decor-utils'

export default {
  name: 'App',
  computed: {
    isRouterAlive() {
      return this.$store.state.tagsView.isRouterAlive
    }
  },
  async mounted() {
    if (this.MixinI18n) {
      this.$store.dispatch('getBaseCurrency')
    }
    if (this.$route.path.indexOf('/chat') > -1) {
      document.title = '在线客服'
    }
    receiveDecorToken()
  }
}
</script>
<style type="text/css">
body .el-table th.gutter {
  display: table-cell !important;
}
</style>
