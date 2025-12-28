<template>
  <div id="app">
    <en-shortcut/>
    <en-header/>
    <div id="wrapper">
      <router-view></router-view>
    </div>
    <en-footer/>
  </div>
</template>
<script>
export default {
  name: 'default'
}
</script>
<style type="text/scss" lang="scss">
#wrapper {
  min-height: calc(100vh - 31px - 219px)
}
</style>
