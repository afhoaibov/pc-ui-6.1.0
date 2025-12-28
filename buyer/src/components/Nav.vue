<template>
  <div id="nav" class="w">
    <en-category/>
    <ul class="nav-list">
      <li v-for="nav in $store.getters.navList" :key="nav.id">
        <a
          v-if="nav.nav_url.indexOf('http') === 0"
          :href="nav.nav_url"
          :target="nav.target ? '_blank' : '_self'"
        >{{ nav.name }}</a>
        <router-link
          v-else
          :to="nav.nav_url"
          :style="{color: isSelected(nav.nav_url) ? `#f42424` : ''}"
          :target="nav.target ? '_blank' : '_self'"
        >
          {{ nav.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'EnNav',
  data() {
    return {
      routerUrl: ''
    }
  },
  watch: {
    $route: {
      handler(val) {
        this.routerUrl = decodeURI(val.fullPath)
      },
      immediate: true
    }
  },
  computed: {
    isSelected() {
      return (url) => {
        return this.routerUrl === url
      }
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
@use "../assets/styles/color" as theme;
#nav {
  display: flex;
  height: 40px;
  .nav-list {
    overflow: hidden;
    max-width: calc(1210px - 240px);
    li {
      vertical-align: top;
      letter-spacing: normal;
      word-spacing: normal;
      display: inline-block;
      a {
        font-size: 16px;
        line-height: 40px;
        color: #333;
        height: 40px;
        padding: 0 24px;
        display: inline-block;
        zoom: 1;
        font-weight: 500;
        &:hover {
          color: theme.$color-main
        }
      }
    }
  }
}
</style>
