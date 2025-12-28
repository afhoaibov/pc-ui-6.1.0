<template>
  <div
    class="title-text"
    :style="{backgroundColor: $$FormData.background_color}"
  >
    <div
      class="title-text__content"
      :class="[
        `title-text__${$$FormData.position}`,
        {'title-text__bottom-slicer': $$FormData.show_bottom_slicer},
        `title-text__more-style${$$FormData.more_style}`
      ]"
    >
      <div v-if="$$FormData.show_more" class="title-text__more">
        <span v-if="$$FormData.more_style !== 3" class="title-text__more-text">{{ $$FormData.more_text }}</span>
        <i v-if="$$FormData.more_style !== 1" class="title-text__more-arrow ri-arrow-right-s-line" />
      </div>
      <div class="title-text__body">
        <h1
          class="title-text__title"
          :style="{
            fontSize: $$FormData.title_font_size + 'rpx',
            fontWeight: $$FormData.title_font_weight,
            color: $$FormData.title_color
          }"
        >{{ $$FormData.title || '' }}</h1>
        <p
          v-if="$$FormData.desc"
          class="title-text__desc"
          :style="{
            fontSize: $$FormData.desc_font_size + 'rpx',
            fontWeight: $$FormData.desc_font_weight || '400',
            color: $$FormData.desc_color
          }"
        >
          {{ $$FormData.desc }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleTextPreview',
  computed: {
    more_link() {
      let link = 'javascript:void(0);'
      if (!this.$$FormData.show_more) return link
      return this.$$FormData.more_link.value || link
    }
  }
}
</script>

<style lang="scss" scoped>
.title-text {
  display: block;
  width: 100%;
  padding: 0 32rpx;
  color: #333333;
  background: transparent;
  text-decoration: none;
  box-sizing: border-box;
  .title-text__content {
    position: relative;
    padding: 32rpx 0;
    &.title-text__center {
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      text-align: center;
      .title-text__more {
        margin: 16rpx 0;
        float: none;
      }
    }
    .title-text__body {

    }
    .title-text__title {
      margin: 0;
      overflow: hidden;
      color: #323233;
      font-size: 32rpx;
      line-height: 1.375;
      word-break: break-all;
    }
    .title-text__desc {
      display: inline-block;
      margin: 16rpx 0 0;
      color: #8c8c8c;
      font-size: 24rpx;
      line-height: 1.375;
      word-break: break-all;
    }
    &.title-text__bottom-slicer::after {
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      width: 200%;
      height: 200%;
      -webkit-transform: scale(.5);
      transform: scale(.5);
      -webkit-transform-origin: 0 0;
      transform-origin: 0 0;
      content: "";
      pointer-events: none;
      border-bottom: 2rpx solid #eee;
    }
    &.title-text__more-style1 .title-text__more-text {
      color: #3388ff;
    }
    .title-text__more {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      white-space: nowrap;
      float: right;
      color: #969799;;
      margin-left: 48rpx;
      .title-text__more-text {
        font-size: 24rpx;
      }
    }
  }
}
</style>
