<template>
  <div id="cashier">
    <en-header-other title="收银台"/>
    <div class="cashier-box" v-if="!price">
      <div class="cashier-change" v-if="isExistence">
        <div v-if="!order.enterprise_id">
          <h2 class="time-tip" v-if="order.pay_type_text === 'ONLINE' && order.need_pay_price !== 0 && (order.pay_status !== 'PAID_OFF' && order.pay_status !== 'PAY_YES')">
            订单提交成功，请您在<span>{{leftTime}}</span>内完成支付，否则订单会被自动取消。
          </h2>
          <h2 class="time-tip" v-else-if="order.pay_type_text !== 'COD' || order.pay_status === 'PAID_OFF' || order.pay_status === 'PAY_YES'">订单金额为 <span><en-price :price="0" size="20"/><!-- {{MixinUnitOfCurrency}}0.00 --></span>，您无需支付。</h2>
        </div>
        <div v-else>
          <h2 class="time-tip" v-if="order.pay_type_text === 'ONLINE' && order.need_pay_price !== 0 && (order.pay_status !== 'PAID_OFF' && order.pay_status !== 'PAY_YES')">
            企业采购申请提交成功，采购申请将在<span>{{leftTime}}</span>内完成审核，否则企业采购申请会被自动撤销。
          </h2>
        </div>
        <h2 v-if="this.trade_sn">
          交易号：<b>{{ trade_sn }}</b>
          <router-link class="see-order-btn" to="/member/my-order">查看订单</router-link>
        </h2>
        <h2 v-else>订单编号：<b>{{ order_sn }}</b>
          <router-link class="see-order-btn" :to="'/member/my-order/detail?order_sn=' + order_sn">查看订单</router-link>
        </h2>
        <div class="price-tips-box">
          <h2 sf-text-rule="payment_type">
            {{ !order ? '' : order.pay_type_text === 'ONLINE' ? '在线支付：' : '货到付款：' }}
            <span v-if="order">
              <en-price :price="order.need_pay_price" size="20"/>
            </span>
            <span v-else>加载中...</span>
            <span class="pay-tip" v-if="!order.enterprise_id">订单状态刷新可能会延迟，如果您已付款成功，请勿重复支付！</span>
          </h2>
          <div v-if="is_IM" style="width: 100px;" >
            <a href='javascript:;' @click="MixinOpenIm({shop_id: '0'})" class="service-btn" >
              <i class="iconfont ea-icon-service"></i>
              联系客服
            </a>
          </div>
        </div>
        <div class="cashier-order-detail" v-if="order.order_type !== 'VIRTUAL'">
          <div class="cashier-order-inside">
            <h3><i></i>送货至：
              <template v-if="order">
                <span>{{ order.ship_province }}</span>
                <span>{{ order.ship_city }}</span>
                <span>{{ order.ship_county || '' }}</span>
                <span>{{ order.ship_town || '' }}</span>
                <span>{{ order.ship_addr }}</span>
                <span>{{ order.ship_mobile | formatMobile }}</span>
              </template>
              <span v-else>加载中...</span>
            </h3>
          </div>
        </div>
        <div class="cashier-tools" v-if="!order.enterprise_id && order.pay_type_text === 'ONLINE' && order.need_pay_price !== 0 && (order.pay_status !== 'PAID_OFF' && order.pay_status !== 'PAY_YES')">
          <div class="pre-deposit">
            <div class="payment">
              <div class="pm-logo">
                <img class="pay-img" src="@/assets/images/blance-pay.png" @click="">
              </div>
              <div class="pm-notice">
                <i></i>
                温馨提醒：如遇退款情况，金额将退还至预存款余额上。
              </div>
            </div>
            <div class="pm-wrap">
              <div>
                <el-checkbox v-model="isCheckPreDeposit" v-bind="{'checked': isCheckPreDeposit ? true : false }" @change="handlePreDeposit" :disabled="order.deposite.balance === 0">使用预存款支付</el-checkbox>
                （可用余额：<span><en-price :price="order.deposite.balance || 0"/></span>，目前还需在线支付<span><en-price :price="order.need_pay_price || 0"/></span>。）余额不足？
                <router-link to="/member/account-balance?type=recharge">马上充值</router-link>
              </div>
              <div class="step-tit" v-if="isCheckPreDeposit">
                <h3>支付密码</h3>
                <input class="pm-password" v-model="password" type="password" placeholder="请输入您的支付密码" autocompete="off">
                <div class="step-tip">
                  <i class="el-icon-warning"></i>
                  支付密码与用户登录密码不同，可在用户中心进行安全设置
                  <router-link to="/member/account-safe" v-if="!order.deposite.is_pwd">您还未设置支付密码</router-link>
                  <router-link to="/member/account-safe" v-else>忘记密码?</router-link>
                </div>
              </div>
            </div>
          </div>
          <div class="cashier-tools-inside">
            <div class="cashier-tools-title">
              <h3>支付平台</h3>
            </div>
            <ul class="cashier-pay-list">
              <li v-for="payment in paymentList" :key="payment.plugin_id" :class="['payment-item', payment.selected && 'selected']">
                <img v-if="payment.plugin_id === 'alipayDirectPlugin'" :src="payment.image" @click="alipayInitiatePay('alipayDirectPlugin')">
                <img v-else-if="payment.plugin_id === 'stripePlugin'" :src="payment.image" @click="selectStripePay('stripePlugin')">
                <img v-else :src="payment.image" @click="initiatePay(payment, 'qr')">
              </li>
            </ul>
          </div>
        </div>
        <div v-show="showPayBox && !order.enterprise_id" class="cashier-pay-box">
          <div class="pay-item">
            <div class="pay-left">
              <p v-if="payment_plugin_id !== 'wechatPayPlugin'">使用电脑支付</p>
              <div v-if="payment_plugin_id === 'wechatPayPlugin'" class="pc-pay-img">
                <img src="../../assets/images/background-wechat.jpg">
              </div>
              <div v-else class="pc-pay-img"></div>
              <a class="pay-btn" href="javascript:;" @click="initiatePay(false, 'normal')">立即支付</a>
              <i v-if="payment_plugin_id === 'alipayDirectPlugin'" class="icon-or"></i>
            </div>
            <div v-if="payment_plugin_id === 'alipayDirectPlugin' || payment_plugin_id === 'wechatPayPlugin'" class="pay-right">
              <p v-if="payment_plugin_id === 'alipayDirectPlugin'">使用支付宝钱包扫一扫即可付款</p>
              <p v-if="payment_plugin_id === 'wechatPayPlugin'">使用微信钱包扫一扫即可付款</p>
              <div class="pay-qrcode" id="pay-qrcode">
                <qrcode-vue :value="gateway_url" level="H" :size="200"  style="text-align: center;"></qrcode-vue>
                <!-- <iframe id="iframe-qrcode" width="200px" height="200px" scrolling="no"></iframe> -->
              </div>
            </div>
          </div>
        </div>
        <div class="same-pay-way bank-pay paybtn">
          <template v-if="!order.enterprise_id">
            <router-link to="/member/my-order" v-if="order.pay_type_text === 'COD' || order.pay_status === 'PAID_OFF' || order.pay_status === 'PAY_YES' || order.need_pay_price === 0 ">查看订单</router-link>
            <a @click="stripeInitiatePay" href="javascript:;" v-else-if="payment_plugin_id === 'stripePlugin'">立即支付</a>
            <a @click="handlePay" href="javascript:;" v-else-if="!showPayBox && order.pay_type_text === 'ONLINE' && order.need_pay_price !== 0 && (order.pay_status !== 'PAID_OFF' && order.pay_status !== 'PAY_YES' && payment_plugin_id !== 'alipayDirectPlugin')">立即支付</a>
            <a @click="alipayInitiatePay('alipayDirectPlugin', 'normal')" href="javascript:;" v-else-if="!showPayBox && order.pay_type_text === 'ONLINE' && order.need_pay_price !== 0 && (order.pay_status !== 'PAID_OFF' && order.pay_status !== 'PAY_YES' && payment_plugin_id === 'alipayDirectPlugin')">立即支付</a>
          </template>

        </div>
      </div>
      <div class="existence" v-else>订单编号不存在</div>
    </div>
    <div class="cashier-box" v-if="price">
      <div class="cashier-box">
        <div class="cashier-change">
          <h2>充值金额:
            <span v-if="recharge">
              <en-price :price="recharge.recharge_money" size="20"/>
            </span>
            <span v-else>加载中...</span>
            <span class="pay-tip">充值状态刷新可能会延迟，如果您已付款成功，请勿重复支付！</span>
          </h2>
          <div class="cashier-tools" v-if="!order.enterprise_id">
            <div class="cashier-tools-inside">
              <div class="cashier-tools-title">
                <h3>支付平台</h3>
              </div>
              <ul class="cashier-pay-list">
                <li v-for="payment in paymentList" :key="payment.plugin_id" :class="['payment-item', payment.selected && 'selected']">
                  <img v-if="payment.plugin_id === 'alipayDirectPlugin'" :src="payment.image" @click="alipayInitiatePay('alipayDirectPlugin')">
                  <img v-else-if="payment.plugin_id === 'stripePlugin'" :src="payment.image" @click="selectStripePay('stripePlugin')">
                  <img v-else :src="payment.image" @click="initiatePay(payment, 'qr')">
                </li>
              </ul>
            </div>
          </div>
          <div v-show="showPayBox" class="cashier-pay-box">
            <div class="pay-item">
              <div class="pay-left">
                <p v-if="payment_plugin_id !== 'wechatPayPlugin'">使用电脑支付</p>
                <div v-if="payment_plugin_id === 'wechatPayPlugin'" class="pc-pay-img">
                  <img src="../../assets/images/background-wechat.jpg">
                </div>
                <div v-else class="pc-pay-img"></div>
                <a class="pay-btn" href="javascript:;" @click="initiatePay(false, 'normal')">立即支付</a>
                <i v-if="payment_plugin_id === 'alipayDirectPlugin'" class="icon-or"></i>
              </div>
              <div v-if="payment_plugin_id === 'alipayDirectPlugin' || payment_plugin_id === 'wechatPayPlugin'" class="pay-right">
                <p v-if="payment_plugin_id === 'alipayDirectPlugin'">使用支付宝钱包扫一扫即可付款</p>
                <p v-if="payment_plugin_id === 'wechatPayPlugin'">使用微信钱包扫一扫即可付款</p>
                <div class="pay-qrcode" id="pay-qrcode">
                  <qrcode-vue :value="gateway_url" level="H" :size="200" style="text-align: center"></qrcode-vue>
                  <!-- <iframe id="iframe-qrcode" width="200px" height="200px" scrolling="no"></iframe> -->
                </div>
              </div>
            </div>
          </div>
          <div class="same-pay-way bank-pay paybtn">
            <a @click="stripeInitiatePay" href="javascript:;" v-if="!showPayBox && payment_plugin_id === 'stripePlugin'">立即支付</a>
            <a @click="$message.error('请先选择支付方式！')" href="javascript:;" v-else-if="!showPayBox && payment_plugin_id !== 'alipayDirectPlugin'">立即支付</a>
            <a @click="alipayInitiatePay('alipayDirectPlugin', 'normal')" href="javascript:;" v-if="!showPayBox && payment_plugin_id === 'alipayDirectPlugin'">立即支付</a>
          </div>
        </div>
      </div>
    </div>
    <StripeDialog ref="stripeDialog" :stripe-key="stripeKey"/>
  </div>
</template>

<script>
import * as API_Trade from '@/api/trade'
import * as API_Deposit from '@/api/deposit'
import * as API_Common from '@/api/common'
import Vue from 'vue'
import { Checkbox } from 'element-ui'
import QrcodeVue from 'qrcode.vue'
import StripeDialog from './-stripe-dialog'

Vue.use(Checkbox)
export default {
  name: 'cashier',
  layout: 'full',
  middleware: 'auth-user',
  components: {
    QrcodeVue,
    StripeDialog
  },
  head() {
    return {
      title: `订单支付-${this.site.title}`
    }
  },
  data() {
    return {
      trade_sn: this.$route.query.trade_sn,
      order_sn: this.$route.query.order_sn,
      price: this.$route.query.price,
      // 支付方式列表
      paymentList: [],
      // 订单详情
      order: '',
      // 充值详情
      recharge: '',
      // 显示支付窗口
      showPayBox: false,
      // 支付方式
      payment_plugin_id: '',
      // 显示确认订单完成支付dialog
      showConfirmDialog: false,
      // 订单编号是否存在
      isExistence: true,
      // 是否使用预存款支付
      isCheckPreDeposit: false,
      // 支付密码
      password: '',
      // 订单取消时间
      leftTime: '',
      Time: '',
      // 是否开启了IM
      is_IM: process.env.IM,
      // 微信支付二维码地址
      gateway_url: '',
      // Stripe密钥
      stripeKey: '',
      // 微信支付查询状态定时器
      weixinPayTimer: null
    }
  },
  async mounted() {
    if (!this.price) {
      // 订单支付
      await this.getCashierData()
      this.cancelLeftTime()
    } else {
      // 充值单支付
      await this.getRecharge()
    }
    this.getPaymentList()
  },
  methods: {

    /** 获取充值数据 */
    getRecharge() {
      API_Deposit.getRecharge(this.price).then(res => {
        this.recharge = res
      })
    },
    /** 获取结算数据 */
    getCashierData() {
      let params = {}
      if (this.trade_sn) {
        params.trade_sn = this.trade_sn
      } else {
        params.order_sn = this.order_sn
      }
      API_Trade.getCashierData(params).then(responses => {
        this.order = responses
      }).catch(() => {
        this.order = ''
        this.paymentList = []
        this.isExistence = false
        this.$message.error('订单编号不存在')
      })
    },
    /** 获取支付方式 */
    getPaymentList() {
      API_Trade.getPaymentList().then(res => {
        if (!res) return
        const paymentList = res.map(item => {
          item.selected = false
          return item
        })
        if (paymentList.length === 1) {
          paymentList[0].selected = true
          if (paymentList[0].plugin_id === 'alipayDirectPlugin') {
            this.alipayInitiatePay('alipayDirectPlugin')
          } else if (paymentList[0].plugin_id === 'stripePlugin') {
            this.selectStripePay('stripePlugin')
          } else {
            this.initiatePay(paymentList[0], 'qr')
          }
        }
        this.paymentList = paymentList
        this.loadStripeScript()
      })
    },
    /** 是否支付确认 */
    aliPayCheck() {
      this.$confirm('支付是否完成?', (confirm) => {
        this.$router.push({ path: '/member/my-order' })
      }, null, ['支付成功', '重新支付'])
    },
    /** 查询取消时间 */
    async cancelLeftTime() {
      let params = { trade_type: this.trade_sn ? 'TRADE' : 'ORDER' }
      let res = await API_Trade.cancelLeftTime(this.trade_sn ? this.trade_sn : this.order_sn, params)
      if (res === '0') {
        this.leftTime = '0小时0分钟0秒'
      } else {
        if (res <= 3600) {
          let _this = this
          let interval = setInterval(function() {
            res = res - 1
            const m = Math.floor((res % 3600) / 60)
            const s = Math.floor((res % 3600) % 60)
            if (m === 0 && s === 0) {
              clearInterval(interval)
            }
            _this.leftTime = `0小时${m}分钟${s}秒`
          }, 1000)
        } else {
          let _this = this
          let interval = setInterval(function() {
            res = res - 1
            const h = Math.floor(res / 3600)
            const m = Math.floor((res % 3600) / 60)
            const s = Math.floor((res % 3600) % 60)
            if (h === 0 && m === 0 && s === 0) {
              clearInterval(interval)
            }
            _this.leftTime = `${h}小时${m}分钟${s}秒`
          }, 1000)
        }
      }
    },
    formatSecond(rema) {
      if (rema <= 3600) {
        return `0小时${parseInt(rema / 60)}分钟`
      } else {
        const h = parseInt(rema / 3600)
        const m = parseInt((rema - h * 3600) / 60)
        return `${h}小时${m}分钟`
      }
    },
    /** 检查微信支付状态 **/
    async checkWeixinPayStatus(sn) {
      clearTimeout(this.weixinPayTimer)
      const trade_type = this.trade_sn ? 'TRADE' : 'ORDER'
      try {
        const result = await API_Trade.getWeChatQrStatus(sn)
        if (result === 'SUCCESS') {
          clearTimeout(this.weixinPayTimer)
          if (this.recharge) {
            this.$router.replace('/payment-complete?type=RECHARGE')
          } else {
            this.$router.replace('/payment-complete?type=' + trade_type)
          }
        }
      } finally {
        this.weixinPayTimer = setTimeout(() => {
          this.checkWeixinPayStatus(sn)
        }, 2000)
      }
    },
    /** 是否选择预存款支付 */
    handlePreDeposit() {
      if (this.isCheckPreDeposit) {
        this.showPayBox = false
        this.payment_plugin_id = ''
        this.paymentList.forEach(item => {
          item.selected = false
          return item
        })
      }
    },
    /** 预存款支付 */
    handlePay() {
      const isSelectedPay = this.paymentList.every(item => item.selected)
      if (!this.isCheckPreDeposit && !isSelectedPay) {
        this.$message.error('请先选择支付方式！')
      } else {
        if (!this.password) {
          this.$message.error('请输入支付密码！')
          return false
        }
        const trade_type = this.trade_sn ? 'TRADE' : 'ORDER'
        const sn = this.trade_sn || this.order_sn
        const password = this.password
        const params = {
          sn,
          trade_type,
          password
        }
        API_Deposit.getBalancePay(trade_type, sn, params, this.$store.getters.user.uname).then(response => {
          if (response.need_pay === 0) {
            this.$router.push('/payment-complete?type=' + trade_type)
          } else {
            location.reload()
          }
        })
      }
    },
    /** 支付宝支付 */
    alipayInitiatePay(plugin_id, pay_mode) {
      this.showPayBox = false
      this.isCheckPreDeposit = false
      this.$set(this, 'paymentList', this.paymentList.map(item => {
        item.selected = item.plugin_id === plugin_id
        return item
      }))
      this.payment_plugin_id = plugin_id
      const trade_type = this.trade_sn ? 'trade' : 'order'
      const sn = this.trade_sn || this.order_sn || this.recharge.recharge_sn
      const client_type = 'PC'
      const payment_plugin_id = plugin_id
      if (!pay_mode) return false
      if (!this.recharge) {
        // 如果是普通模式，就跳新窗口支付
        if (pay_mode === 'normal') {
          const route = this.$router.resolve(`./cashier-load-pay?trade_type=${trade_type}&sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          this.aliPayCheck()
          window.open(route.href, '_blank')
          return false
        }
        this.$nextTick(() => {
          API_Trade.initiatePay(trade_type, sn, {
            client_type,
            pay_mode,
            payment_plugin_id
          }).then(response => {
            // 支付宝支付
            this.handleAliPay(response)
          })
        })
      } else {
        if (pay_mode === 'normal') {
          const route = this.$router.resolve(`./cashier-load-pay?sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          window.open(route.href, '_blank')
          return false
        }
        this.$nextTick(() => {
          API_Deposit.getRechargeInitiatePay(sn, {
            client_type,
            pay_mode,
            payment_plugin_id
          }).then(response => {
            // 支付宝支付
            this.handleAliPay(response)
          })
        })
      }
    },
    /** 支付宝支付 */
    handleAliPay(response) {
      let $formItems = ''
      response.form_items && response.form_items.forEach(item => {
        $formItems += `<input name="${item.item_name}" type="hidden" value='${item.item_value}' />`
      })
      let $form = `<form action="${response.gateway_url}" method="post">${$formItems}</form>`
      const qrIframe = document.getElementById('iframe-qrcode').contentWindow.document
      qrIframe.getElementsByTagName('body')[0].innerHTML = $form
      qrIframe.forms[0].submit()
    },

    /** 支付回调处理 */
    handlePayCallBack(payment_plugin_id, response) {
      // 微信支付
      if (payment_plugin_id === 'wechatPayPlugin') {
        this.gateway_url = response.gateway_url
        this.checkWeixinPayStatus(response.bill_sn)
      } else {
        // 支付宝支付
        this.handleAliPay(response)
      }
    },
    /** 发起支付 */
    initiatePay(payment, pay_mode) {
      clearTimeout(this.weixinPayTimer)
      this.showPayBox = true
      this.isCheckPreDeposit = false
      if (payment) {
        this.$set(this, 'paymentList', this.paymentList.map(item => {
          item.selected = item.plugin_id === payment.plugin_id
          return item
        }))
      } else {
        payment = this.paymentList.find(item => item.selected)
      }
      this.payment_plugin_id = payment.plugin_id
      const trade_type = this.trade_sn ? 'trade' : 'order'
      const sn = this.trade_sn || this.order_sn || this.recharge.recharge_sn
      const client_type = 'PC'
      const payment_plugin_id = payment.plugin_id
      const goods_desc = this.order.goods_desc
      if (!this.recharge) {
        // 如果是普通模式，就跳新窗口支付
        if (pay_mode === 'normal') {
          const route = this.$router.resolve(`/checkout/cashier-load-pay?trade_type=${trade_type}&sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          window.open(route.href, '_blank')
          return false
        }
        // 如果是二维码模式，并且支付方式不是支付宝或微信，就跳新窗口支付
        if (pay_mode === 'qr' && (payment_plugin_id !== 'alipayDirectPlugin' && payment_plugin_id !== 'wechatPayPlugin')) {
          const route = this.$router.resolve(`/checkout/cashier-load-pay?trade_type=${trade_type}&sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          window.open(route.href, '_blank')
          return false
        }
        this.$nextTick(() => {
          // 如果是二维码模式，并且支付方式是支付宝或者微信
          API_Trade.initiatePay(trade_type, sn, {
            client_type,
            pay_mode,
            payment_plugin_id,
            goods_desc
          }).then(response => {
            this.handlePayCallBack(payment_plugin_id, response)
          })
        })
      } else {
        if (pay_mode === 'normal') {
          const route = this.$router.resolve(`/checkout/cashier-load-pay?sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          window.open(route.href, '_blank')
          return false
        }
        if (pay_mode === 'qr' && (payment_plugin_id !== 'alipayDirectPlugin' && payment_plugin_id !== 'wechatPayPlugin')) {
          const route = this.$router.resolve(`/checkout/cashier-load-pay?sn=${sn}&payment_plugin_id=${payment_plugin_id}`)
          window.open(route.href, '_blank')
          return false
        }
        // 如果是二维码模式，并且支付方式是支付宝或者微信
        this.$nextTick(() => {
          API_Deposit.getRechargeInitiatePay(sn, {
            client_type,
            pay_mode,
            payment_plugin_id
          }).then(response => {
            this.handlePayCallBack(payment_plugin_id, response)
          })
        })
      }
    },

    /** 选择Stripe支付  */
    selectStripePay(plugin_id) {
      this.payment_plugin_id = plugin_id
      this.$set(this, 'paymentList', this.paymentList.map(item => {
        item.selected = item.plugin_id === plugin_id
        return item
      }))
    },

    /** 初始化Stripe支付参数 */
    async stripeInitiatePay() {
      const pay_mode = 'normal'
      const trade_type = this.trade_sn ? 'trade' : 'order'
      const sn = this.trade_sn || this.order_sn || this.recharge.recharge_sn
      const client_type = 'PC'
      const payment_plugin_id = 'stripePlugin'
      const goods_desc = this.order.goods_desc
      // 如果是余额充值
      if (this.recharge) {
        API_Deposit.getRechargeInitiatePay(sn, {
          client_type,
          pay_mode,
          payment_plugin_id
        }).then(res => {
          this.$refs['stripeDialog'].show(res)
        })
      } else {
        API_Trade.initiatePay(trade_type, sn, {
          client_type,
          pay_mode,
          payment_plugin_id,
          goods_desc
        }).then(res => {
          this.$refs['stripeDialog'].show(res)
        })
      }
    },

    /** 加载Stripe */
    loadStripeScript() {
      const hasStripe = this.paymentList.find(item => item.plugin_id === 'stripePlugin')
      if (!hasStripe) return
      API_Common.getStripeKey().then((stripeKey) => {
        if (document.getElementById('stripeScript')) {
          this.stripeKey = stripeKey
          return
        }
        const stripeScriptEle = document.createElement('script')
        stripeScriptEle.src = 'https://js.stripe.com/v3'
        stripeScriptEle.id = 'stripeScript'
        stripeScriptEle.onload = () => {
          this.stripeKey = stripeKey
        }
        document.body.appendChild(stripeScriptEle)
      })
    }
  },
  beforeDestroy() {
    clearTimeout(this.weixinPayTimer)
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
.cashier-box {
  width: 100%;
  background: #f5f5f5;
  padding: 20px 0;
}
.existence {
  width: 950px;
  margin: 0 auto;
  padding: 30px 50px;
  position: relative;
  box-shadow: 0 2px 5px #ccc;
  background: #fff;
  text-align: center;
  font-size: 20px;
}
.cashier-change {
  width: 950px;
  margin: 0 auto;
  padding: 30px 50px;
  position: relative;
  box-shadow: 0 2px 5px #ccc;
  background: #fff;
  .price-tips-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .service-btn {
      font-size: 12px;
      color: theme.$color-main;
    }
  }
  h2 {
    width: 950px;
    min-height: 30px;
    line-height: 30px;
    font-size: 12px;
    font-weight: 200;
    b {
      font-weight: 200;
      font-size: 14px;
      color: #ff6700;
    }
    span {
      font-size: 20px;
      color: theme.$color-main;
      margin: 0 5px 0 0;
      font-weight: 400;
    }
  }
  .pay-tip {
    font-size: 16px;
    color: theme.$color-main;
    font-weight: 600;
    margin-left: 20px;
  }
  .cashier-order-detail {
    width: 950px;
    border: 1px solid #e1e1e1;
    background: #f4f4f4;
    margin: 20px 0 0 0;
  }
  .cashier-tools {
    width: 950px;
    border: 1px solid #e1e1e1;
    background: #f4f4f4;
    margin: 20px 0 20px 0;
    .pre-deposit {
      background: #fff;
      .payment {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 40px 10px 0;
        .pm-logo {
          width: 55px;
          height: 35px;
          background: theme.$color-main;
          border-radius: 0 20px 20px 0;
          display: flex;
          align-items: center;
          padding-left: 10px;
          box-sizing: border-box;
          .pay-img {
            width: 30px;
            height: 30px;
          }
        }
        .pm-notice {
          color: #4b5b78;
          i {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 4px;
            vertical-align: middle;
            background: url('../../assets/images/pm_notoce_icon.png') no-repeat 0 0;
          }
        }
      }
      .pm-wrap {
        padding: 10px 35px;
        span {
          font-weight: 700;
        }
        ::v-deep .el-checkbox {
          margin-right: 0;
        }
        ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
        ::v-deep .el-checkbox__input.is-focus .el-checkbox__inner {
          background-color: #fff;
          border-color: #DCDFE6;
        }
        ::v-deep .el-checkbox__inner {
          width: 12px;
          height: 12px;
        }
        ::v-deep .el-checkbox__inner::after {
          border-color: #000;
          left: 3px;
          height: 6px;
        }
        ::v-deep .el-checkbox__inner:hover {
          border-color: #DCDFE6;
        }
        ::v-deep .el-checkbox__label {
          color: #666;
          padding-left: 5px;
          font-size: 12px;
        }
        .step-tit {
          padding: 10px 20px;
          color: #000;
          .pm-password {
            color: #777;
            background-color: #FFF;
            vertical-align: top;
            display: inline-block;
            width: 300px;
            min-height: 20px;
            padding: 5px;
            margin: 10px 0;
            border: solid 1px #E6E9EE;
          }
          .step-tip {
            color: #F59C1A;
            a {
              background-color: #F59C1A;
              border-color: #F59C1A;
              color: #FFF;
              padding: 4px 8px;
              border-radius: 5px;
              margin-left: 10px;
            }
          }
        }
      }
    }
    .cashier-tools-inside {
      margin: 3px;
      background: #fff;
    }
    .cashier-tools-title {
      height: 52px;
      line-height: 52px;
      h3 {
        width: 924px;
        height: 52px;
        line-height: 52px;
        font-weight: 200;
        font-size: 12px;
        background: #fcfcfc;
        padding-left: 20px;
      }
    }
    .cashier-pay-list {
      width: 844px;
      overflow: hidden;
      margin: 0 10px;
      padding: 10px 40px;
      .payment-item {
        float: left;
        line-height: 30px;
        margin: 0 8px 10px 0;
        padding: 5px 5px;
        position: relative;
        border: 1px solid #e0e0e0;
        cursor: pointer;
        img {
          width: 150px;
          height: 35px;
        }
        &.selected {
          border: 2px solid #f56a3e;
          padding: 4px;
        }
      }
    }
  }
  .cashier-order-inside {
    margin: 3px;
    background: #fff;
    min-height: 52px;
    overflow: hidden;
    h3 {
      display: flex;
      width: 944px;
      min-height: 52px;
      line-height: 52px;
      font-weight: 200;
      font-size: 12px;
      background: #fcfcfc;
      flex-wrap: wrap;
      i {
        width: 21px;
        height: 21px;
        display: block;
        background: url(../../assets/images/icons-cashier.png) no-repeat -70px 0;
        float: left;
        margin: 15px 10px 0 20px;
      }
      span {
        margin: 0 5px;
      }
    }
  }
  .paybtn {
    a {
      font-family: Microsoft YaHei;
      width: 180px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #fff;
      font-size: 14px;
      background: theme.$color-main;
      display: block;
      margin: 30px auto 0 auto;
    }
  }
}
.cashier-pay-box {
  width: 950px;
  border: 1px solid #e1e1e1;
  background: #f4f4f4;
  margin: 0 0 40px 0;
  padding-top: 3px;
  .pay-item {
    display: flex;
    justify-content: center;
    margin: 0 3px 3px 3px;
    background: #fff;
    overflow: hidden;
    height: 335px;
    .pay-left {
      width: 471px;
      float: left;
      height: 310px;
      position: relative;
      p {
        width: 450px;
        text-align: center;
        height: 30px;
        line-height: 30px;
        margin: 25px 0 0 0;
        font-size: 16px;
      }
      .pc-pay-img {
        height: 92px;
        margin-left: 150px;
        margin-top: 48px;
        width: 165px;
        background: url(../../assets/images/icons-cashier.png) no-repeat 0 -1417px;
      }
      .pay-btn {
        width: 180px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #fff;
        font-size: 14px;
        background: theme.$color-main;
        display: block;
        margin: 30px auto 0 auto;
      }
      .icon-or {
        display: block;
        background: url(../../assets/images/icons-cashier.png) no-repeat -212px -1417px;
        height: 41px;
        left: 464px;
        position: absolute;
        top: 130px;
        width: 31px;
      }
    }
    .pay-right {
      float: left;
      border-left: 1px solid #f4f4f4;
      p {
        width: 472px;
        text-align: center;
        height: 30px;
        line-height: 30px;
        margin: 25px 0 0 0;
        font-size: 16px;
      }
      .pay-qrcode {
        margin: 20px auto;
        height: 200px;
        width: 200px;
        overflow: hidden;
      }
    }
  }
}
.see-order-btn {
  margin-left: 20px;
  color: theme.$color-href;
  &:hover {
    color: theme.$color-main
  }
}
.cashier-change .time-tip {
  font-size: 16px;
  font-weight: 400;
  span {
    color: theme.$color-main;
  }
}
</style>
