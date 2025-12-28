<template>
  <div id="app">
    <div id="wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'im'
}
</script>

<style lang="scss" scoped>
#wrapper {
  min-height: calc(100vh - 31px - 219px)
}
</style>
