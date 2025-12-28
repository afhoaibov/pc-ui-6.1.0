<template>
  <div class="goods-slider">
    <a
      v-if="has_head"
      class="goods-slider__head"
      :href="$$GetLinkValue($$FormData.headLink)"
      target="_blank"
      :style="{
        backgroundImage: `url(${$$FormData.headLink.image.src})`
      }"
    ></a>
    <div v-if="show_swiper" class="goods-slider__slide" :style="{width: has_head ? '1010px' : '1210px'}">
      <div v-if="$$FormData.goodsList.length" v-swiper="swiperOptions">
        <div class="swiper-wrapper">
          <div v-for="(goods, index) in $$FormData.goodsList" :key="index" class="swiper-slide">
            <a
              :href="`${$$GetBuyerPCDomain}/goods/${goods['goods_id']}`"
              class="goods-item"
              :class="index % 2 === 0 ? 'even' : 'odd'"
              target="_blank"
            >
              <div class="goods-name">{{ goods['goods_name'] }}</div>
              <div class="goods-image">
                <img :src="goods['goods_image']" :alt="goods['goods_name']" />
              </div>
            </a>
          </div>
        </div>
        <div class="swiper-scrollbar" slot="scrollbar"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsSliderPreview',
  data() {
    return {
      show_swiper: true
    }
  },
  computed: {
    has_head() {
      return !!this.$$FormData.headLink
    },
    swiperOptions() {
      return {
        speed: 4000,
        observer: true,
        observeParents: true,
        autoplay: {
          delay: 1,
          stopOnLastSlide: false,
          disableOnInteraction: false,
        },
        freeMode: true,
        loop: true,
        resistanceRatio: 0,
        slidesPerView: this.has_head ? 5 : 6,
        centeredSlides: true,
        simulateTouch: false,
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
          dragSize: '99px',
        },
      }
    }
  },
  watch: {
    swiperOptions: {
      deep: true,
      handler: 'updateSwiper'
    },
    '$$FormData.goodsList': {
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
.goods-slider {
  display: flex;
  width: 1210px;
  height: 260px;
  overflow: hidden;
  &:hover {
    .swiper-scrollbar {
      opacity: 1;
    }
  }

  &__head {
    width: 190px;
    height: 260px;
    background-size: cover;
    background-color: #eeeeee;
    background-position: center center;
  }
  &__slide {
    width: 1210px - 200px;
    margin-left: 10px;
    background-color: #ffffff;
    ::v-deep {
      .swiper-container {
        width: 100%;
        height: 100%;
      }
      .swiper-wrapper {
        transition-timing-function: linear !important;
      }
      .swiper-slide {
        display: flex;
        justify-content: center;
      }
      .goods-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 150px;
        overflow: hidden;
        margin-bottom: 10px;
        &.odd {
          flex-direction: column-reverse;
          .goods-name {
            margin-top: 20px;
            margin-bottom: 0;
          }
        }
        &:hover .goods-image {
          opacity: 0.8;
        }
      }
      .goods-image {
        width: 150px;
        height: 150px;
        transition: opacity ease .3s;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .goods-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #333333;
        transition: color ease .2s;
        text-align: center;
        font-size: 14px;
        margin-bottom: 20px;
      }
      .swiper-scrollbar {
        position: absolute;
        left: 15px;
        bottom: 10px;
        width: calc(100% - 30px);
        height: 3px;
        border-radius: 3px;
        background-color: #f3f3f3;
        opacity: 0;
        transition: opacity ease .3s;
        transition-duration: 0.3s !important;
      }
      .swiper-scrollbar-drag {
        height: 9px;
        top: -4.5px;
        border-radius: 4px;
        background-color: #d8d8d8;
        cursor: pointer;
      }
    }
  }
}
</style>
