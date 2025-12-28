<template>
  <div class="item-setting">
    <div class="header-setting">
      <div class="header-setting__label">{{ config.label }}</div>
      <div class="header-setting__value">
      </div>
    </div>
    <div class="body-setting">
      <video-selector v-model="$$FormData[config.__key]"/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Video'
}
</script>

<style scoped lang="scss">

</style>
