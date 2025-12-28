<template>
  <div class="shop-info" :class="[`style-${$$FormData.shop_style}`]">
    <div class="shop-info__cover" :style="{backgroundImage: `url(${backgroundImage})`}">
      <div class="shop-info__cover-mask"></div>
    </div>
    <div class="shop-info__inner">
      <div class="shop-info__content">
        <div class="shop-info__logo" :style="{backgroundImage: `url(${shopInfo['shop_logo']})`}"/>
        <div class="shop-info__right-content">
          <h3 class="shop-info__shop-name">{{ shopInfo['shop_name'] }}</h3>
          <p v-if="$$FormData.shop_style === 1" class="shop-info__reduce-content">
            <span v-if="shopInfo['self_operated'] === 1" class="shop-info__reduce-content-tag">自营</span>
            <span class="shop-info__reduce-content-text">666人已收藏，666件商品</span>
            <i class="ri-arrow-right-s-line"></i>
          </p>
          <p v-else class="shop-info__sum-content">
            <a href="javascript:void(0)">
              <span class="shop-info__sum-content-total">666人已收藏</span>
            </a>
            <a href="javascript:void(0)">
              <span class="shop-info__sum-content-total">666件商品</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
export default {
  name: 'ShopInfoPreview',
  computed: {
    shopInfo() {
      const { shopInfo } = this.$$FormData
      return shopInfo || ''
    },
    backgroundImage() {
      const { background_image } = this.$$FormData
      if (background_image) return background_image.src
      return ''
    }
  },
  async mounted() {
    /**
     * 更新店铺信息
     * 此处更新店铺信息，是为了回显时有最新的店铺信息可以展示
     * 在前端渲染这个店铺模块的时候，也会再去拿一次最新的店铺信息展示
     */
    if (!this.shopInfo) return
    this.$$FormData.shopInfo = await API_Shop.getShopDetail(this.shopInfo['shop_id'])
  }
}
</script>

<style lang="scss" scoped>
.shop-info {
  position: relative;
  font-size: 24rpx;
  background-color: #fff;
  &__cover {
    position: relative;
    height: 370rpx;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    &-mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0,0,0,.3);
    }
  }
  &__inner {
    position: absolute;
    top: 220rpx;
    width: 100%;
  }
  &__content {
    position: relative;
    padding-left: 15px;
    overflow: hidden;
  }
  &__logo {
    float: left;
    width: 116rpx;
    height: 116rpx;
    overflow: hidden;
    vertical-align: bottom;
    background-color: #fff;
    border: 2rpx solid #fff;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
  }
  &__right-content {
    margin-left: 140rpx;
    h3 {
      max-width: 440rpx;
      margin-top: 20rpx;
      color: #fff;
      font-weight: 700;
      font-size: 36rpx;
      line-height: 44rpx;
      text-shadow: 0 2rpx 30rpx rgba(0,0,0,.5);
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
  &__reduce-content {
    position: relative;
    margin: 16rpx 30rpx 0 0;
    padding-right: 20rpx;
    color: #ffffff;
    cursor: pointer;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    .ri-arrow-right-s-line {
      position: absolute;
      top: 0;
      right: 0;
      color: #ffffff;
      font-size: 28rpx;
    }
    &-tag {
      display: inline-block;
      height: 28rpx;
      padding: 0 6rpx;
      font-size: 24rpx;
      line-height: 28rpx;
      vertical-align: middle;
      background-color: #f44;
      border-radius: 2rpx;
    }
    &-text {
      margin-left: 6rpx;
      font-size: 24rpx;
      vertical-align: middle;
    }
  }
  &__sum-content {
    margin-top: 30rpx;
    line-height: 24rpx;
    &>a {
      color: #999999;
      &:first-child span::after {
        position: absolute;
        top: 0;
        right: 0;
        width: 4rpx;
        height: 24rpx;
        color: #e5e5e5;
        font-size: 20rpx;
        content: "|";
      }
    }
    &-total {
      position: relative;
      display: inline-block;
      padding: 0 20rpx;
      vertical-align: middle;
      &::after {
        padding-left: 0;
        border-left: none;
      }
    }
  }
  &.style-2,
  &.style-3,
  &.style-4 {
    .shop-info__cover-mask {
      background-color: initial;
      background-image: linear-gradient(0deg,#000,transparent);
    }
  }
  &.style-2 {
    height: 476rpx;
    .shop-info__inner {
      top: 300rpx;
    }
    .shop-info__logo {
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
    }
  }
  &.style-3 {}
  &.style-4 {
    height: 516rpx;
    .shop-info__cover {
      height: 300rpx;
    }
    .shop-info__content {
      padding-left: 0;
      text-align: center;
    }
    .shop-info__logo {
      display: inline-block;
      float: none;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
    }
    .shop-info__right-content {
      margin-left: 0;
    }
    .shop-info__shop-name {
      display: inline-block;
      max-width: 100%;
      margin-top: 40rpx;
      color: #333;
      text-shadow: none;
    }
    .shop-info__sum-content {
      margin-top: 20rpx;
    }
  }
  &.style-5 {
    height: 500rpx;
    .shop-info__cover {
      height: 100%;
    }
    .shop-info__inner {
      top: 100rpx;
    }
    .shop-info__content {
      padding-left: 0;
      text-align: center;
    }
    .shop-info__logo {
      display: inline-block;
      float: none;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
    }
    .shop-info__right-content {
      margin-left: 0;
    }
    .shop-info__shop-name {
      display: inline-block;
      max-width: 100%;
      margin-top: 40rpx;
      padding-bottom: 20rpx;
      color: #fff;
      text-shadow: none;
      border-bottom: 2px solid hsla(0,0%,100%,.5);
    }
    .shop-info__sum-content {
      margin-top: 10rpx;
      a {
        color: #ffffff;
      }
    }
  }
}
</style>
