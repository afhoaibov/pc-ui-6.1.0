<template>
  <el-steps :active="step - 1" align-center :space="120" class="steps-container">
    <el-step title="入驻协议"></el-step>
    <el-step title="基本信息"></el-step>
    <el-step title="认证信息"></el-step>
    <el-step title="财务资质信息"></el-step>
    <el-step title="店铺信息"></el-step>
  </el-steps>
</template>

<script>
import Vue from 'vue'
import { Steps, Step } from 'element-ui'

Vue.use(Steps).use(Step)
export default {
  name: 'apply-steps',
  props: ['step']
}
</script>

<style lang="scss" scoped>
.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding-top: 20px;
  border-bottom: 1px dashed #D7D7D7;
  ::v-deep .el-step {
    min-height: 140px;
  }
  ::v-deep .el-step__title {
    font-size: 14px
  }
}
</style>
