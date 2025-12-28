<template>
  <div id="header">
    <div class="top-header w">
      <en-logo/>
      <en-search/>
      <en-settleup/>
    </div>
    <en-nav/>
  </div>
</template>

<script>
  export default {
    name: 'EnHeader'
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @use "../assets/styles/color" as theme;
  #header {
    border-bottom: 1px solid theme.$color-main;
    .top-header {
      display: flex;
      justify-content: space-between;
      height: 67px;
      padding-top: 30px;
      ::v-deep #logo {
        width: 240px;
        height: 60px;
      }
    }
  }
</style>
