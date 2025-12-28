<!-- 输入框脱敏显示组件 -->
<template>
  <div>
    <el-input
      v-model="desensitizationValue"
      @blur="onfocus"
      placeholder="请输入内容"
      clearable></el-input>
    <el-input
      v-model="value"
      style="display: none;"></el-input>
  </div>
</template>

<script>
import { formatDesensitization } from '@/utils/index'

export default {
  name: 'DesensitizationInput',
  props: {
    // 原始数据
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      desensitizationValue: '' // 脱敏显示内容
    }
  },
  watch: {
    value: {
      handler(val) {
        this.desensitizationValue = formatDesensitization(val)
      },
      immediate: true
    }
  },
  methods: {
    onfocus() {
      const desensitizationValue = this.desensitizationValue
      const value = formatDesensitization(this.value)
      if (desensitizationValue !== value) {
        this.$emit('change', desensitizationValue)
      }
    }
  }
}
</script>
