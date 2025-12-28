<template>
  <div class="__pay_form__">
    <h3 class="tip">支付跳转中...</h3>
  </div>
</template>

<script>
import * as API_Trade from '@/api/trade'
import * as API_Deposit from '@/api/deposit'

export default {
  name: 'cashier-load-pay',
  mounted() {
    const { trade_type, sn, payment_plugin_id } = this.$route.query
    if (trade_type) {
      API_Trade.initiatePay(trade_type, sn, {
        client_type: 'PC',
        pay_mode: 'normal',
        payment_plugin_id
      }).then(response => {
        window.location.href = response.gateway_url
      })
    } else {
      API_Deposit.getRechargeInitiatePay(sn, {
        client_type: 'PC',
        pay_mode: 'normal',
        payment_plugin_id
      }).then(response => {
        window.location.href = response.gateway_url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .tip {
    text-align: center;
    font-size: 20px;
    line-height: 200px;
    font-weight: 600;
  }
</style>
