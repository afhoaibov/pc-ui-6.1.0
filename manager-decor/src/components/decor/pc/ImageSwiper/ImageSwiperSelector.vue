<template>
  <div class="swiper-pc-selector">
    <div class="title-selector">
      <div class="title">添加图片</div>
      <p class="tips">如果要作为顶部轮播，请选择1210x500或同比例的图片。</p>
    </div>
    <div class="body-selector">
      <image-link-editor
        v-model="$$FormData.imageList"
        :limit="100"
        title-placeholder="建议10个字以内，可不填"
        :show-title="false"
        add-text="添加图片"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSwiperSelector'
}
</script>

<style lang="scss" scoped>
.swiper-pc-selector {
  .title-selector {
    padding: 12px 16px;
    box-sizing: border-box;
    background-color: #ffffff;
    .title {
      color: #323233;
      font-size: 14px;
    }
    .tips {
      color: #969799;
      font-size: 12px;
      line-height: 18px;
      margin-top: 10px;
    }
  }
  .body-selector {
    padding: 12px 16px;
    background-color: #f7f8fa;
    overflow: hidden;
  }
}
</style>
