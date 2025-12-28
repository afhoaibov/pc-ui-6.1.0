<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view></router-view>
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-main {
    /* min-height: calc(100vh - 60px); */
    padding: 10px;
    box-sizing: border-box;
    position: relative;

    flex: 1;
    height: 0;
    overflow-y: scroll;
    ::v-deep .container {
      padding: 5px;
      background-color: #fff !important;
    }
  }
</style>
