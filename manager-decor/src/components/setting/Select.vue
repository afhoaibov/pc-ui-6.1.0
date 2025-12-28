<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
    </div>
    <div class="form-item__right-col">
      <el-select v-model="$$FormData[config.__key]">
        <el-option
          v-for="(option, index) in config.options"
          :key="index"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Select'
}
</script>

<style lang="scss" scoped>

</style>
