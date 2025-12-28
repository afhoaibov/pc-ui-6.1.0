<template>
  <div class="ckt-item payment">
    <div class="top-ckt">
      <span class="title-top">支付类型</span>
      <span class="other-top"><a href="javascript:;"></a></span>
      <div class="clearfix"></div>
    </div>
    <div class="content-ckt-pay">
      <ul class="ul-ckt-pay min">
        <li
          :class="['ckt-checkbox', 'pay', paymentType === 'ONLINE' && 'selected']"
          @click="handleSetPaymentType('ONLINE')"
          v-if='!isShow'
        >
          <span>在线支付</span>
        </li>
        <li
          :class="['ckt-checkbox', 'pay', paymentType === 'COD' && 'selected']"
          @click="handleSetPaymentType('COD')"
          v-if="!isShow && orderTotal.total_price > 0 && !isVirtualOrder && addressType === 0 && !isSupplierOrder"
        >
          <span>货到付款</span>
        </li>
      </ul>
    </div>
    <div class="collapse-ckt-pay">
      <span class="more-collapse-ckt">更多方式</span>
      <i class="icon-collapse-ckt-pay"></i>
    </div>
    <div class="placeholder-20"></div>
  </div>
</template>

<script>
/**
 * 结算页
 * 支付类型组件
 */
import * as API_Trade from '@/api/trade'
export default {
  name: 'checkout-payment',
  data() {
    return {
      isShow: true
    }
  },
  props: ['inventoryList', 'paymentType', 'orderTotal', 'isVirtualOrder', 'addressType', 'isSupplierOrder'],
  watch: {
    inventoryList: {
      immediate: true,
      handler(newVal) {
        this.isShow = newVal.every(item => {
          return item.supplier_id > 0
        })
      }
    },
    orderTotal: {
      immediate: true,
      handler(newVal) {
        if (newVal.total_price === 0) {
          return this.handleSetPaymentType('ONLINE', false)
        }
      }
    },
    isVirtualOrder: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          return this.handleSetPaymentType('ONLINE', false)
        }
      }
    },
    isSupplierOrder: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          return this.handleSetPaymentType('ONLINE', false)
        }
      }
    }
  },
  methods: {
    handleSetPaymentType(type, showToast = true) {
      if (type === 'COD') {
        if (this.inventoryList.some(item => { return item.supplier_id > 0 })) {
          this.$message.error('供应商品订单不支持货到付款！')
          return false
        }
      }
      API_Trade.setPaymentType(type).then(() => {
        if (this.orderTotal.total_price > 0 && showToast) {
          this.$message.success('设置成功！')
        }
        this.$emit('change', type)
      })
    }
  }
}
</script>
