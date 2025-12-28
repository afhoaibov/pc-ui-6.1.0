<template>
  <div class="swiper-pc">
    <div
      v-if="show_swiper"
      class="swiper-pc__swiper"
      :style="{
        height: $$FormData.swiper_height + 'px',
        paddingLeft: $$FormData.page_edge + 'px',
        paddingRight: $$FormData.page_edge + 'px',
        '--dot-color': $$FormData.pagination_color,
        '--dot-color-active': $$FormData.pagination_active_color
      }"
    >
      <div v-if="$$FormData.imageList.length" v-swiper="swiperOptions">
        <div class="swiper-wrapper">
          <div
            v-for="(item, index) in $$FormData.imageList"
            :key="index"
            class="swiper-slide"
          >
            <a
              :href="$$GetLinkValue(item.link)"
              class="swiper-pc__item"
              :style="{height: $$FormData.swiper_height + 'px'}"
              target="_blank"
            >
              <div
                class="swiper-pc__image"
                :style="{
                  backgroundImage: `url(${item.image.src})`,
                  backgroundSize: $$FormData.image_fill
                }"
              />
            </a>
          </div>
        </div>
        <div class="swiper-pagination" slot="pagination"></div>
      </div>
      <div v-else class="swiper-pc__empty">
        请添加图片...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSwiperPreview',
  data() {
    return {
      show_swiper: true
    }
  },
  computed: {
    swiperOptions() {
      const formData = this.$$FormData
      return {
        loop: true,
        pagination: formData.show_pagination ? { el: '.swiper-pagination' } : false,
        autoplay: formData.autoplay ? {
          disableOnInteraction: false,
        } : false,
        direction: formData.direction,
        effect: formData.effect
      }
    }
  },
  watch: {
    swiperOptions: {
      deep: true,
      handler: 'updateSwiper'
    },
    '$$FormData.imageList': {
      deep: true,
      handler: 'updateSwiper'
    }
  },
  methods: {
    updateSwiper() {
      this.show_swiper = false
      this.$nextTick(() => {
        this.show_swiper = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.swiper-pc {
  &__swiper {
    overflow: hidden;
  }
  &__swiper,
  &__item,
  &__image,
  .swiper-container {
    width: 100%;
    height: 100%;
    &.swiper-container-vertical ::v-deep .swiper-pagination-bullet-active {
      width: 8px;
      height: 15px;
    }
    ::v-deep {
      .swiper-pagination-bullet {
        transition: all ease .5s;
        border-radius: 4px;
        background-color: var(--dot-color) !important;
      }
      .swiper-pagination-bullet-active {
        width: 15px;
        background-color: var(--dot-color-active) !important;
      }
    }
  }
  &__image {
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }
  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #7D7D80;
    font-size: 20px;
  }
}
</style>
