<template>
  <div id="app">
    <en-shortcut/>
    <div id="wrapper">
      <router-view></router-view>
    </div>
    <en-footer/>
  </div>
</template>

<script>
export default {
  name: 'full'
}
</script>

<style lang="scss" scoped>
#wrapper {
  min-height: calc(100vh - 31px - 219px)
}
</style>
