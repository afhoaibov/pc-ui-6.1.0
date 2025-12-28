<template>
  <div class="shop-coupons">
    <div v-if="coupons && coupons.length" id="theme1-coupons" class="shop-coupons">
      <div class="shop-coupons-title"></div>
      <ul class="shop-coupons-list">
        <li v-for="(coupon, index) in coupons" :key="index" class="coupon-item" @click="handleReceiveCoupon(coupon)">
          <div class="coupon-price">
            <!-- {{ coupon['coupon_price'] | unitPrice }} -->
            <en-price :price="coupon['coupon_price'] || 0" :sizeRatio="0.7" size="40" priceColor="#fff" i18nPriceColor="#fff" direction="column" />
          </div>
          <div class="coupon-other">
            <p>{{ coupon['title'] }}</p>
            <p>满<!-- {{ coupon['coupon_threshold_price'] | unitPrice }} --><en-price :price="coupon['coupon_threshold_price'] || 0" :sizeRatio="0.8" size="12" priceColor="#fff" i18nPriceColor="#fff" direction="row" />可使用</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as API_Promotions from '@/api/promotions'
import * as API_Members from '@/api/members'

export default {
  name: 'shop-coupons',
  props: ['shop'],
  data() {
    return {
      coupons: ''
    }
  },
  mounted() {
    /** 获取店铺优惠券列表 */
    API_Promotions.getShopCoupons(this.shop.shop_id).then(response => {
      this.coupons = response
    })
  },
  methods: {
    /** 领取优惠券 */
    handleReceiveCoupon(coupon) {
      if (!this.$store.getters.user) {
        this.$message.error('请先登录！')
        return
      }
      API_Members.receiveCoupons(coupon.coupon_id).then(() => {
        this.$message.success('领取成功！')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-coupons {
  width: 950px;
  margin: 20px auto;
}
.shop-coupons-title {
  width: 100%;
  height: 90px;
  background: url('../../../assets/images/background-shop-coupons-title.png') no-repeat center center #fffbfb;
}
.shop-coupons-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  background: #fff;
  text-align: center;
  overflow: hidden;
}
.coupon-item {
  display: flex;
  width: 230px;
  cursor: pointer;
  border: 1px dashed rgb(222, 222, 222);
  margin: 10px;
  .coupon-price {
    width: 100px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    font-size: 40px;
    height: 120px;
    line-height: 45px;
    text-align: center;
    color: #424242;
    cursor: pointer;
  }
  .coupon-other {
    width: 120px;
    margin-right: 4px;
    padding-top: 60px;
    background: url('../../../assets/images/icon-shop-coupons.png') no-repeat left 27px;
  }
}
</style>
