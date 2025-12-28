<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
      <span v-if="config.props && config.props.activeText && config.props.inactiveText" class="form-item__value">
        {{ $$FormData[config.__key] ? config.props.activeText : config.props.inactiveText }}
      </span>
    </div>
    <div class="form-item__right-col">
      <el-switch v-model="$$FormData[config.__key]" v-bind="config.props"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Switch'
}
</script>

<style lang="scss" scoped>

</style>
