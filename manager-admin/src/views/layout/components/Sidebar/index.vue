<template>
  <div>
    <div class="logo-container" :class="[isCollapse && 'collapse']">

      <img v-if="isCollapse" src="../../../../assets/favicon.png" alt="" width="30px" height="30px">
      <template v-else>
        <img :src="siteInfo.logo" alt="" height="30px">
        <!-- <span class="logo-title">{{ siteInfo.site_name }}</span> -->
      </template>
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
        'siteInfo'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    }
  }
</script>
