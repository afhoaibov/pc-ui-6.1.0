<template>
  <div>
    <div class="logo-container" @click="linkIndex" :class="[isCollapse && 'collapse']">
      <!-- <span class="logo-tip">商家中心</span> -->
      <img v-if="shopInfo.shop_logo" :src="shopInfo.shop_logo" alt="" class="logo-img">
      <img v-else :src="defaultLogo" alt="" class="logo-img">
      <span class="logo-title">{{ shopInfo.shop_name }}</span>
    </div>
    <el-scrollbar wrapClass="scrollbar-wrapper">
      <el-menu
        mode="vertical"
        :show-timeout="200"
        :default-active="$route.path"
        :collapse="isCollapse"
      >
        <sidebar-item v-for="route in permission_routers" :key="route.name" :item="route" :base-path="route.path"></sidebar-item>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters([
      'permission_routers',
      'sidebar',
      'siteInfo',
      'shopInfo'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  data() {
    return {
      defaultLogo: require('../../../../assets/icon-no-shop-logo.png')
    }
  },
  methods: {
    linkIndex() {
      this.$router.push({ path: '/dashboard' })
    }
  }
}
</script>

<style lang="scss" type="text/scss" scoped>
  .logo-container{
    cursor: pointer;
  }
</style>

