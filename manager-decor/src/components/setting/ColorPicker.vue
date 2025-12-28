<template>
  <div class="form-item__container">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
      <span class="form-item__value">
        {{ $$FormData[config.__key] }}
      </span>
    </div>
    <div class="form-item__right-col">
      <el-button type="text" @click="$$FormData[config.__key] = config.default">重置</el-button>
      <el-color-picker
        v-model="$$FormData[config.__key]"
        show-alpha
        :predefine="predefineColors"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  data() {
    return {
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
