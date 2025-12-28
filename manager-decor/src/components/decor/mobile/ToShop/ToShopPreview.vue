<template>
  <div class="to-shop">
    <div class="to-shop__wrap">
      <div class="to-shop__inner">
        <i class="to-shop__shop-icon van-icon van-icon-shop-o" style="font-size: 18px;"></i>
        <span class="to-shop__title">{{ shopInfo['shop_name'] }}</span>
        <span class="to-shop__action-text">
          {{ $$FormData.label }}
          <i class="to-shop__arrow van-icon van-icon-arrow"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToShopPreview',
  computed: {
    shopInfo() {
      const { shopInfo } = this.$$FormData
      return shopInfo || {}
    }
  }
}
</script>

<style lang="scss" scoped>
.to-shop {
  &__wrap {
    display: block;
    padding: 24rpx;
    color: #333333;
    font-size: 28rpx;
    line-height: 40rpx;
    background-color: #fff;
  }
  &__inner {
    display: flex;
    align-items: center;
  }
  &__shop-icon {
    margin-right: 8rpx;
  }
  &__title {
    color: #323233;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  &__action-text {
    position: relative;
    flex: 1;
    box-sizing: border-box;
    margin-left: 10rpx;
    padding-right: 34rpx;
    color: #969799;
    text-align: right;
    word-break: keep-all;
  }
  &__arrow {
    position: absolute;
    top: 50%;
    right: 0;
    color: #999999;
    font-size: 24rpx;
    transform: translateY(-50%);
  }
}
</style>
