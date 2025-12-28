<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view></router-view>
      </keep-alive>
    </transition>
  </section>
</template>

<script>
  export default {
    name: 'AppMain'
  }
</script>

<style lang="scss" scoped>
  .app-main {
    height: calc(100% - 60px);
    position: relative;
    overflow: scroll;
    width: 100%;
    padding: 10px;
    ::v-deep .container {
      height: 100%;
      background-color: #fff;
    }
  }
</style>
