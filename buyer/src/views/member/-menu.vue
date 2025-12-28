<template>
  <div id="member-menu">
    <div class="inner-menu">
      <div v-for="menu in menus" :key="menu.name" class="menu-item">
        <h2>{{ menu.title }}</h2>
        <template v-for="item in menu.children">
          <router-link
            v-if="!item.hidden"
            :key="item.name"
            :to="'/member/' + item.path"
            :class="[item.include && item.include.includes(name) && 'router-link-exact-active router-link-active']"
          >
            <em>&gt;</em>{{ item.title }}<em>&lt;</em>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { getMenus } from './menus'
import { mapGetters } from 'vuex'
import { cloneObj } from '@/utils/index'

export default {
  name: 'member-menu',
  data() {
    return {
      menus: []
    }
  },
  computed: {
    name() {
      return this.$route.name.replace('member-', '')
    },
    ...mapGetters({
      user: 'user'
    })
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.menus = cloneObj(getMenus())
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
#member-menu {
  width: 208px;
  .inner-menu {
    width: 100%;
    border: 1px solid #e7e7e7;
  }
  h2 {
    background: #F7F7F7;
    color: #333;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    padding: 10px;
  }
  a {
    display: block;
    line-height: 32px;
    padding-left: 20px;
    color: #777;
    font-weight: 400;
    transition: all .3s ease-out;
    &.router-link-active, &:hover {
      background-color: theme.$color-main;
      color: #fff;
      padding-left: 30px;
    }
  }
  em {
    color: #fff;
  }
}
</style>
