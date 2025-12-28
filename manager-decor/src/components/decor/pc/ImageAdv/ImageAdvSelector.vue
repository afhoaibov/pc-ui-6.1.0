<template>
  <div class="image-adv-selector">
    <div class="title-selector">
      <div class="title">添加图片</div>
      <p class="tips">{{ tplTip }}</p>
    </div>
    <div class="body-selector">
      <image-link-editor
        v-model="$$FormData.imageList"
        :limit="linkLimit"
        :type="$$FormData.image_tpl === 'hotarea' ? 'hotarea' : 'link'"
        title-placeholder="建议10个字以内，可不填"
        add-text="添加背景图"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageAdvSelector',
  computed: {
    // 最大个数
    linkLimit() {
      if (this.$$FormData.image_tpl === 'nav-slide') return 15
      return 10
    },
    // 提示信息
    tplTip() {
      switch (this.$$FormData.image_tpl) {
        case 'single':
          return '最多添加 10 个广告，鼠标拖拽调整广告顺序，建议宽度750像素'
        case 'swiper':
          return '最多添加 10 个广告，鼠标拖拽调整广告顺序，建议尺寸750x260像素'
        case 'big-slide':
          return '最多添加 10 个广告，鼠标拖拽调整广告顺序，建议宽度670像素'
        case 'small-slide':
          return '最多添加 10 个广告，鼠标拖拽调整广告顺序，建议宽度305像素'
        case 'nav-slide':
          return '最多添加 15 个广告，鼠标拖拽调整广告顺序，建议宽度142像素'
        case 'hotarea':
          return '最多添加 10 个广告，鼠标拖拽调整广告顺序，建议宽度750像素, 高度1000像素以内, 单张图片大小200kb以内'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.image-adv-selector {
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
