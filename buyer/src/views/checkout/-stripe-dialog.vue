<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="showDialog"
    @closed="handleDialogClosed"
    width="710px"
  >
    <form v-loading="loading" id="payment-form" class="payment-form">
      <div id="link-authentication-element">
        <!--Stripe.js injects the Link Authentication Element-->
      </div>
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
      <el-button
        v-if="!loading"
        type="danger"
        :loading="payLoading"
        :disabled="disablePayBtn"
        @click="handleSubmit"
        class="pay-btn"
      >
        立即支付
      </el-button>
      <div v-if="payMessage" id="payment-message">{{ payMessage }}</div>
    </form>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Dialog, Loading } from 'element-ui'

Vue.use(Loading)

export default {
  components: {
    'el-dialog': Dialog
  },
  props: {
    stripeKey: String
  },
  data() {
    return {
      stripe: window.stripe,
      loading: true,
      showDialog: false,
      clientSecret: '',
      elements: null,
      emailAddress: '',
      elementList: [],
      payLoading: false,
      payMessage: '',
      disablePayBtn: true
    }
  },
  mounted() {
    this.checkStripeStatus()
  },
  methods: {
    show(payParams) {
      this.clientSecret = payParams.clientSecret
      this.showDialog = true
      this.$nextTick(() => {
        this.initStripe()
      })
    },
    initStripe() {
      let stripe = this.stripe
      if (!stripe) {
        stripe = window.Stripe(this.stripeKey)
        window.stripe = stripe
        this.stripe = stripe
      }
      const appearance = { theme: 'stripe' }
      const elements = stripe.elements({ appearance, clientSecret: this.clientSecret })
      this.elements = elements
      const linkAuthenticationElement = elements.create('linkAuthentication')
      linkAuthenticationElement.mount('#link-authentication-element')
      linkAuthenticationElement.on('change', (event) => {
        this.emailAddress = event.value.email
      })
      this.elementList.push(linkAuthenticationElement)
      const paymentElementOptions = { layout: 'tabs' }
      const paymentElement = elements.create('payment', paymentElementOptions)
      paymentElement.mount('#payment-element')
      paymentElement.on('ready', () => {
        this.loading = false
      })
      paymentElement.on('change', (e) => {
        this.disablePayBtn = !e.complete
      })
      this.elementList.push(paymentElement)
    },
    async handleSubmit(e) {
      e.preventDefault()
      this.payLoading = true
      try {
        const { error } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
            // Make sure to change this to your payment completion page
            return_url: window.location.href,
            receipt_email: this.emailAddress
          }
        })
        if (error.type === 'card_error' || error.type === 'validation_error') {
          this.payMessage = error.message
        } else {
          this.payMessage = '发生意外错误'
        }
      } finally {
        this.payLoading = false
      }
    },
    handleDialogClosed() {
      this.elementList.forEach(item => {
        if (typeof item.unmount === 'function') item.unmount()
      })
    },
    async checkStripeStatus() {
      const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')
      const isRecharge = new URLSearchParams(window.location.search).get('price')
      if (!clientSecret) return
      const url = isRecharge ? '/member/account-balance' : '/member/my-order'
      const btnTxt = isRecharge ? '查看余额' : '查看订单'
      this.$confirm('请确认是否已完成支付？', () => {
        this.$router.replace(url)
      }, null, [btnTxt, '重新支付'])
    }
  }
}
</script>

<style scoped lang="scss">
.payment-form {
  min-height: 280px;
}
.pay-btn {
  width: 100%;
  margin-top: 20px;
  border-radius: 4px;
  &:not(.is-disabled) {
    background-color: #f42424;
  }
}
</style>
