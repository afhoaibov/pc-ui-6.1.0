<template>
  <router-view/>
</template>

<script>
export default {
  name: 'checkout-layout',
  layout: 'full',
  middleware: 'auth-user'
}
</script>

<style lang="scss" scoped>

</style>
