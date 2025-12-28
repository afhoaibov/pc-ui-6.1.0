<template>
  <div>
    <div class="coupon-view-wrap">
      <el-form :model="couponDetail" ref="couponDetail" label-width="100px">
        <el-form-item label="优惠券名称：">
          <span>{{ couponDetail.title }}</span>
        </el-form-item>
        <el-form-item label="优惠券面额：">
          <span>{{ couponDetail.coupon_price | unitPrice }}</span>
        </el-form-item>
        <el-form-item label="门槛金额：">
          <span>{{ couponDetail.coupon_threshold_price | unitPrice }}</span>
        </el-form-item>
        <el-form-item label="领取方式：">
          <span v-if="couponDetail.type === 'FREE_GET'">免费领取</span>
          <span v-if="couponDetail.type === 'ACTIVITY_GIVE'">活动赠送</span>
        </el-form-item>
        <el-form-item label="生效方式：">
          <span v-if="couponDetail.effective_type === 'AUTO_TAKE_EFFECT'">按有效期生效</span>
          <span v-if="couponDetail.effective_type === 'EFFECTIVE_AFTER_RECEIVING'">领取即生效</span>
        </el-form-item>
        <el-form-item label="生效时间：">
          <span>{{ couponDetail.effective_time_text }}</span>
        </el-form-item>
        <el-form-item label="发放数量：">
          <span>{{ couponDetail.create_num }}</span>
        </el-form-item>
        <el-form-item label="限领数量：">
          <span v-if="couponDetail.limit_num === 0">不限制（用户可重复可领）</span>
          <span v-else>每位用户最多可领取 {{ couponDetail.limit_num }} 张优惠券</span>
        </el-form-item>
        <el-form-item label="已领数量：">
          <span>{{ couponDetail.received_num }}</span>
        </el-form-item>
        <el-form-item label="已用数量：">
          <span>{{ couponDetail.used_num }}</span>
        </el-form-item>
        <el-form-item label="创建时间：">
          <span>{{ couponDetail.create_time | unixToDate }}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import * as API_coupon from '@/api/coupon'

  export default {
    name: 'CouponPreview',
    props: {
      couponId: {
        type: String
      }
    },
    data() {
      return {
        couponDetail: {}
      }
    },
    watch: {
      couponId: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.getCouponDetail()
          }
        }
      }
    },
    methods: {
      getCouponDetail() {
        API_coupon.getCouponDetails(this.couponId).then(response => {
          this.couponDetail = response
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
.coupon-view-wrap {
  padding: 0 20px;
}
</style>
