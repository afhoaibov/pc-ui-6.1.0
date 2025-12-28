<template>
  <div id="member-breadcrumb" class="w">
    <router-link to="/"><i class="iconfont ea-icon-home"></i>首页</router-link>&ensp;&gt;
    <router-link to="/member">会员中心</router-link>&ensp;&gt;
    <template v-if="fullPath === '/member'">
      <router-link to="/member/my-profile"> {{ $store.getters.user.uname }}</router-link>
    </template>
    <template v-else v-for="(b, i) in breadcrumbs">
      <router-link :to="b.path" :key="b.path"> {{ b.title }}</router-link>
      <template v-if="i !== breadcrumbs.length - 1">&ensp;&gt;</template>
    </template>
  </div>
</template>

<script>
import { getMenus } from './menus'

export default {
  name: 'member-breadcrumb',
  computed: {
    fullPath() {
      return this.$route.fullPath
    },
    breadcrumbs() {
      let _paths = this.$route.path.split('/').slice(2, 6)
      let _bcs = []
      const menus = getMenus()
      menus.forEach(item => {
        item.children.forEach(_item => {
          if (_item.name === _paths[0] || _item.name === _paths[1]) {
            _bcs.push({ title: _item.title, path: '/member/' + _item.path })
            if (_item.children) {
              _item.children.forEach(__item => {
                if (__item.name === _paths[1]) _bcs.push({ title: __item.title, path: '/member/' + _item.path })
              })
            }
          }
        })
      })
      return _bcs
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
#member-breadcrumb {
  position: relative;
  font-size: 12px;
  height: 20px;
  padding: 10px 0;
  color: #777;
  .iconfont {
    margin-right: 5px;
  }
  a {
    color: #666
  }
  a:hover {
    color: theme.$color-main
  }
}
</style>
