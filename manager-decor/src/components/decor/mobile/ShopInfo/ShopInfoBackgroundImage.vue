<template>
  <div class="shop-info-background-image">
    <div class="shop-info-background-image__title">背景图片</div>
    <div class="shop-info-background-image__tips">
      建议尺寸：750x370 像素，尺寸不匹配时，图片将被压缩或拉伸以铺满画面
    </div>
    <div class="shop-info-background-image__image">
      <image-selector v-model="$$FormData.background_image" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopInfoBackgroundImage'
}
</script>

<style lang="scss" scoped>
.shop-info-background-image {
  padding: 12px 16px;
  &__title {
    color: #323233;
    font-size: 14px;
    line-height: 18px;
    white-space: nowrap;
  }
  &__tips {
    margin-top: 10px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }
  &__image {
    margin-top: 10px;
  }
}
</style>
