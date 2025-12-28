<template>
  <div class="shop-coupon">
    <p class="shop-coupon__title">店铺优惠券</p>
    <p class="shop-coupon__subtitle">
      此模块无须预览，提供占位即可。
    </p>
  </div>
</template>

<script>
export default {
  name: 'ShopCouponPreview'
}
</script>

<style lang="scss" scoped>
.shop-coupon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 140rpx;
  margin: 0 auto;
  background-color: #fff;
  overflow: hidden;
  &__title {
    font-size: 30rpx;
    text-align: center;
  }
  &__subtitle {
    font-size: 24rpx;
    color: #999999;
    margin-top: 20rpx;
    text-align: center;
  }
}
</style>
