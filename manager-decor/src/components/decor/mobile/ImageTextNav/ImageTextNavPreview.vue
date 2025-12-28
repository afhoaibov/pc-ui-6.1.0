<template>
  <div
    class="image-text-nav"
    :style="{
      paddingLeft: $$FormData.page_edge + 'rpx',
      paddingRight: $$FormData.page_edge + 'rpx',
      backgroundColor: $$FormData.background_color,
    }"
  >
    <div
      v-if="$$FormData.navList.length"
      class="image-text-nav__nav"
      :class="[$$FormData.nav_type]"
      :style="{
        overflowX: $$FormData.nav_style === 'fixed' ? 'hidden' : 'auto',
      }"
    >
      <div
        v-for="item in $$FormData.navList"
        :key="item.__key"
        class="image-text-nav__item"
        :style="{
          width: itemSize + 'rpx',
          color: $$FormData.text_color
        }"
      >
        <div
          v-if="$$FormData.nav_type === 'image-text'"
          class="image-text-nav__image"
          :style="{
            width: itemSize * $$FormData.image_scale + 'rpx',
            height: itemSize * $$FormData.image_scale + 'rpx',
            backgroundImage: `url(${item.image.src || default_image})`,
            borderRadius: $$FormData.image_radius + 'rpx',
          }"
        />
        <h3 v-if="item.title" class="image-text-nav__title">{{ item.title }}</h3>
      </div>
    </div>
    <div v-else class="image-text-nav__empty">
      请添加导航
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageTextNavPreview',
  data() {
    return {
      default_image: require('@/assets/placeholder-image-text-nav-image.png')
    }
  },
  computed: {
    itemSize() {
      const { navList, nav_style, page_edge, nav_show_num } = this.$$FormData
      if (nav_style === 'fixed') return `${(750 - page_edge * 2) / navList.length}`
      return `${(750 - page_edge * 2) / nav_show_num}`
    }
  }
}
</script>

<style lang="scss" scoped>
.image-text-nav {
  overflow: hidden;
  font-size: 0;
  &__nav {
    margin-bottom: -20rpx;
    padding-bottom: 20rpx;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  &__item {
    display: inline-block;
    overflow: hidden;
  }
  &__image {
    display: block;
    width: 100%;
    margin: 0 auto;
    border: 0;
    background-position: 50%;
    background-size: cover;
  }
  &__title {
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: normal;
    text-align: center;
  }
  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100rpx;
    color: #7D7D80;
    font-size: 36rpx;
    background-color: #909399;
  }
}
</style>
