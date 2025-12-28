<template>
  <div class="ckt-item time">
    <div class="top-ckt">
      <span class="title-top">送货时间</span>
      <div class="clearfix"></div>
    </div>
    <div class="content-ckt time">
      <div
        :class="['ckt-checkbox time', receiveTime === 'ANY_TIME' && 'selected']"
        @click="handleSetReceiveTime('ANY_TIME')"
      >
        <span>任意时间</span>
      </div>
      <div
        :class="['ckt-checkbox time', receiveTime === 'WORKDAY' && 'selected']"
        @click="handleSetReceiveTime('WORKDAY')"
      >
        <span>仅工作日</span>
      </div>
      <div
        :class="['ckt-checkbox time', receiveTime === 'WEEKEND' && 'selected']"
        @click="handleSetReceiveTime('WEEKEND')"
      >
        <span>仅休息日</span>
      </div>
    </div>
    <div class="placeholder-20"></div>
  </div>
</template>

<script>
/**
 * 结算页
 * 送货时间组件
 */
import * as API_Trade from '@/api/trade'
export default {
  name: 'checkout-time',
  props: ['receiveTime'],
  methods: {
    handleSetReceiveTime(time) {
      API_Trade.setReceiveTime(time).then(() => {
        this.$message.success('设置成功！')
        this.$emit('change', time)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
