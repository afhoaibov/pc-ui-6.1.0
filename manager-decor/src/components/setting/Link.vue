<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
    </div>
    <div class="form-item__right-col">
      <link-selector v-model="$$FormData[config.__key]"/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Link'
}
</script>

<style scoped lang="scss">

</style>
