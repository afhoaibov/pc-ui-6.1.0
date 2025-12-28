<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
    </div>
    <div class="form-item__right-col">
      <el-input v-model="$$FormData[config.__key]" v-bind="config.props"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Input'
}
</script>

<style lang="scss" scoped>

</style>
