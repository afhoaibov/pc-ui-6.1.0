<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
    </div>
    <div class="form-item__right-col slider">
      <el-slider v-model="$$FormData[config.__key]" input-size="mini" show-input v-bind="config.props"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Slider'
}
</script>

<style lang="scss" scoped>

</style>
