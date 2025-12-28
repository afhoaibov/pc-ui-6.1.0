<template>
  <div id="checkout" class="checkout-container">
    <div v-if="inventoryList && inventoryList.length === 0" class="listing-empty">
	    <img src="../../assets/images/icon-listing-empty.png" alt="购物清单为空！">
	    <h2 v-if="way === 'BUY_NOW'" >
		    商品状态变更，请重新购买
	    </h2>
	    <h2 v-else>
		    您的购物清单为空，请
		    <router-link to="/cart" class="back-cart-btn">返回购物车</router-link>
		    选择要结算的商品！
	    </h2>
    </div>
    <template v-else>
      <div class="checkout-header">
        <div class="w">
          <div class="logo">
            <en-logo/>
          </div>
          <en-cart-step :step="2"/>
        </div>
      </div>
      <div v-if="params" class="ckt-control">
        <checkout-skeleton v-if="!Object.keys(orderTotal).length"/>
        <template v-else>
          <div class="ckt-title">填写并核对订单信息</div>
          <div class="ckt-content">
            <template v-if="!isVirtualOrder && inventoryList.length">


              <!--收货人信息 start-->
              <checkout-address
                v-if="!addressType"
                :address-id="params.address_id"
                @change="handleAddressChanged"
              />
              <!--收货人信息 end-->


            </template>

            <!--支付方式 start-->
            <checkout-payment
              :isVirtualOrder="isVirtualOrder"
              :isSupplierOrder="isSupplierOrder"
              :order-total="orderTotal"
              :payment-type="params.payment_type"
              :address-type="addressType"
              :inventory-list="inventoryList"
              @change="(type) => { params.payment_type = type }"
            />
            <!--支付方式 end-->

            <!--配送清单 start-->
            <checkout-inventory
              :isVirtualOrder="isVirtualOrder"
              :inventory-list="inventoryList"
              :coupons-list="couponsList"
              :remark="params.remark"
              :selectedAddress="selectedAddress"
              @coupon-change="couponUseChange"
              @change="GET_Inventories"
            />
            <!--配送清单 end-->



            <template v-if="!isVirtualOrder">
              <!--送货时间 start-->
              <checkout-time
                :receive-time="params.receive_time"
                @change="(time) => { params.receive_time = time }"
              />
              <!--送货时间 end-->
            </template>
            <template>
              <!--发票信息 start-->
              <checkout-receipt :inventory-list="inventoryList" :receipt="params.receipt" :order-way="addressType" @change="(receipt) => { params.receipt = receipt }"/>
              <!--发票信息 end-->
            </template>

          </div>
          <div class="ckt-total">
            <checkout-total
              :order-total="orderTotal"/>
            <div v-if="selectedAddress" class="summary-ckt-total">
              <div class="address-info-ckt">
                <span>收货人信息：</span>
                <span>{{ formatterAddress(selectedAddress) }}</span>
                <span>&nbsp;收货人：&nbsp;<em>{{ selectedAddress.name }}</em>&nbsp;<em>{{ selectedAddress.mobile | formatMobile}}</em></span>
              </div>
            </div>
            <div class="bill-btn-ckt">
              <a href="javascript:" class="bill_btn" @click="handleCreateTrade">提交订单</a>
            </div>
          </div>
        </template>

      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import * as CheckoutComponents from './components'
import * as API_Trade from '@/api/trade'
import { Input } from 'element-ui'
import { mapGetters } from 'vuex'

Vue.use(Input)
export default {
  name: 'checkout-index',
  components: CheckoutComponents,
  head() {
    return {
      title: `订单填写-${this.site.title}`
    }
  },
  data() {
    return {
      // 结算参数
      params: '',
      // 订单总金额
      orderTotal: {},
      // 购物清单
      inventoryList: '',
      // 优惠劵列表
      couponsList: '',
      // 已选地址
      selectedAddress: '',
      // 跳转过来的是立即购买还是购物车结算
      way: this.$route.query.way || 'CART',
      // 是否为虚拟订单
      isVirtualOrder: false,
      // 订单是否包含供应商货品
      isSupplierOrder: false,
      // 地址类型
      addressType: 0,
      // 申请信息
      applyInfo: {}
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    }),
    /** 格式化地址信息 */
    formatterAddress() {
      return (address) => {
        return `${address.province} ${address.city} ${address.county || ''} ${address.town || ''} ${address.addr}`
      }
    }
  },
  async mounted() {
    // 获取结算参数
    API_Trade.getCheckoutParams().then(response => {
      if (response.address_id) {
        API_Trade.setAddressId(response.address_id).then(this.GET_Inventories)
      } else {
        this.GET_Inventories()
      }
      this.params = response
    })
  },
  watch: {
    addressType: {
      async handler(val) {
        if (this.params.receipt && this.params.receipt.receipt_type === 'VATOSPECIAL') {
          API_Trade.cancelReceipt().then(() => {
            this.params.receipt = {}
          })
        }
      },
    }
  },
  methods: {
    /** 使用优惠券 */
    couponUseChange(couponIndex, use) {
      this.GET_Inventories()
    },
    /** 收货地址发生改变 */
    handleAddressChanged(address, refresh) {
      this.selectedAddress = address
      if (address) {
        this.params.address_id = address.addr_id
      }
      if (refresh) {
        this.GET_Inventories()
      }
    },
    /** 订单创建失败处理 */
    createTradeError(error) {
      const { data = {} } = error.response || {}
      if (data.data) {
        let { data: list } = data
        list = typeof list === 'string' ? JSON.parse(data) : list
        if (!list || !list[0]) {
          return this.$message.error(data.message)
        }
        this.showCantShipList(data.message, list)
      } else {
        this.$message.error(data.message)
      }
    },
    showCantShipList(message, list) {
      if (!list || !list.length) return
      let content = ''
      list.forEach(item => {
        content += `
            <div style="display:flex;align-items:center;margin:10px 0;">
              <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;margin:0 10px;">
              <h5 style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp: 3;overflow: hidden;color: red;">${item.name}</h5>
            </div>`
      })
      this.$layer.open({
        type: 1,
        title: message || '提示',
        area: ['420px', '240px'],
        scrollbar: false,
        content
      })
    },
    /** 创建订单 */
    createTrade() {
      const applyInfo = this.applyInfo
      let params = {
        client: 'PC',
        way: this.way,
        order_way: this.addressType // 0- 个人下单 1-企业采购
      }

      /** 先调用创建订单接口，再跳转到收银台 */
      API_Trade.createTrade(params).then(response => {
        this.$store.dispatch('cart/getCartDataAction')
        this.$router.push({ path: '/checkout/cashier?trade_sn=' + response.trade_sn })
      }).catch(error => {
        this.createTradeError(error)
      })
    },

    /** 提交订单 */
    handleCreateTrade() {
      if (!this.selectedAddress && !this.isVirtualOrder) {
        this.$message.error('请选择或添加收货地址！')
        return
      }
      if (this.addressType === 1) {
        if (this.params.payment_type === 'COD') {
          this.$message.error('请选择支付类型：企业采购只能选择在线支付')
          return false
        }
        // 企业订单校验申请表单
        this.$refs.checkoutApply.$refs['applyForm'].validate((valid) => {
          if (valid) {
            this.createTrade()
          } else {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        })
      } else {
        this.createTrade()
      }
    },
    /** 获取购物清单 */
    GET_Inventories() {
      API_Trade.getCarts('checked', this.way).then(response => {
        this.inventoryList = response.cart_list
        this.isVirtualOrder = response.cart_list.some(sku => {
          return sku.sku_list.some(goods => goods.goods_type === 'VIRTUAL') || sku.group_list.some(group => group.sku_list.some(goods => goods.goods_type === 'VIRTUAL'))
        })
        this.isSupplierOrder = response.cart_list.some(sku => {
          return sku.sku_list.some(goods => goods.supplier_goods) || sku.group_list.some(group => group.sku_list.some(goods => goods.supplier_goods))
        })
        this.couponsList = response.cart_member_coupon_list
        this.orderTotal = response.total_price
        const hasCantShip = this.inventoryList.find(item => item.cant_ship_list && item.cant_ship_list[0])
        if (hasCantShip) {
          const list = []
          this.inventoryList.forEach(cart => {
            const { cant_ship_list = [] } = cart
            cant_ship_list.forEach(item => {
              list.push({ name: item.name, image: item.goods_image })
            })
          })
          this.showCantShipList('商品不在配送区域', list)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "./checkout" as *;
.checkout-container {
  overflow: hidden;
}
</style>
