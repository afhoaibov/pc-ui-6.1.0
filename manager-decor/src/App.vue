<template>
  <div id="app">
    <home />
  </div>
</template>

<script>

import Home from '@/views/home'
export default {
  name: 'App',
  components: { Home }
}
</script>

<style lang="scss">
@use "styles/normalize.css" as *;
@use "styles/icon-fonts.css" as *;
@use "styles/van-icon.css" as *;
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
