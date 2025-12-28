<template>
  <div class="image-adv"
       :class="[
        $$FormData.image_chamfer,
        $$FormData.image_style
      ]">
    <div v-if="!$$FormData.imageList.length"
         class="image-adv__placeholder">
    </div>
    <template v-else-if="['single', 'hotarea'].includes($$FormData.image_tpl)">
      <ul class="image-adv__list"
          :style="{
            paddingLeft: $$FormData.page_edge + 'px',
            paddingRight: $$FormData.page_edge + 'px'
          }">
        <li v-for="(item, index) in $$FormData.imageList"
            :key="index"
            class="image-adv__item"
            :style="{
              marginBottom: `${$$FormData.image_space}px`
            }">
          <h3 v-if="item.title && $$FormData.image_tpl !== 'hotarea'"
              class="image-adv__title">{{ item.title }}</h3>
          <div class="image-adv__image">
            <img :src="item.image.src"
                 class="image-adv__image-img"
                 alt="" />
          </div>
          <template v-if="$$FormData.image_tpl === 'single' && item.link">
            <a :key="item.__key"
               :href="$$GetLinkValue(item.link)"
               class="image-adv__area"
               :style="{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }">
            </a>
          </template>
          <template v-if="$$FormData.image_tpl === 'hotarea' && item.hotAreas">
            <a v-for="area in item.hotAreas"
               :key="area.__key"
               :href="area.link ? area.link.value : 'javascript:void(0)'"
               class="image-adv__area"
               :style="{
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height
              }">
            </a>
          </template>
        </li>
      </ul>
    </template>
    <template v-else-if="['big-slide', 'small-slide', 'nav-slide'].includes($$FormData.image_tpl)">
      <div :class="[`image-adv__${$$FormData.image_tpl}`]"
           :style="{
            paddingLeft: $$FormData.page_edge + 'px',
            paddingRight: $$FormData.page_edge + 'px'
          }">
        <div v-for="(item, index) in $$FormData.imageList"
             :key="index"
             class="image-adv__item"
             :style="{
              marginRight: $$FormData.image_space + 'px',
            }">
          <h3 v-if="item.title"
              class="image-adv__title">{{ item.title }}</h3>
          <div class="image-adv__image">
            <img :src="item.image.src"
                 class="image-adv__image-img"
                 alt="" />
          </div>
          <template v-if="item.link">
            <a :key="item.__key"
               :href="$$GetLinkValue(item.link)"
               class="image-adv__area"
               :style="{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }">
            </a>
          </template>
        </div>
      </div>
    </template>
    <template v-else-if="$$FormData.image_tpl === 'swiper'">
      <div class="image-adv__swiper"
           :style="{
            height: $$FormData.swiper_height + ($$FormData.image_style === 'shadow' ? 20 : 0) + 'px',
            paddingLeft: $$FormData.page_edge + 'px',
            paddingRight: $$FormData.page_edge + 'px',
          }">
        <swiper :options="swiperOptions">
          <swiper-slide v-for="(item, index) in $$FormData.imageList"
                        :key="index">
            <div class="image-adv__item">
              <h3 v-if="item.title"
                  class="image-adv__title">{{ item.title }}</h3>
              <div class="image-adv__image">
                <img :src="item.image.src"
                     class="image-adv__image-img"
                     alt="" />
              </div>
              <template v-if="item.link">
                <a :key="item.__key"
                   :href="$$GetLinkValue(item.link)"
                   class="image-adv__area"
                   :style="{
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%'
                  }">
                </a>
              </template>
            </div>
          </swiper-slide>
          <div class="swiper-pagination"
               slot="pagination"></div>
        </swiper>
      </div>
    </template>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.min.css'
export default {
  name: 'ImageAdvPreview',
  components: { Swiper, SwiperSlide },
  data() {
    return {
      swiperOptions: {
        loop: true,
        autoplay: true,
        pagination: {
          el: '.swiper-pagination'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.image-adv {
  &__placeholder {
    width: 100%;

    &-img {
      width: 100%
    }
  }

  &__list {}

  &__item {
    position: relative;
    overflow: hidden;
  }

  &__image {
    position: relative;

    &-img {
      width: 100%;
      transition: all ease .2s;
    }
  }

  &__area {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }

  &__title {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    height: 36px;
    padding: 0;
    color: #ffffff;
    font-size: 14px;
    line-height: 36px;
    text-align: center;
    background-color: rgba(51, 51, 51, .8);
  }

  &__swiper {
    width: 100%;
    height: 375px;
    overflow: hidden;
    box-sizing: border-box;

    .swiper-container,
    .image-adv__item,
    .image-adv__image,
    .image-adv__image-img {
      width: 100%;
      height: 100%;
    }

    ::v-deep .swiper-pagination {
      bottom: 6px;
      display: flex;
      justify-content: center;

      &-bullet {
        width: 7px;
        height: 7px;
        margin: 0 3px;
        border-radius: 10px;
        transition: all .5s;
        background-color: rgba(0, 0, 0, .5);

        &-active {
          width: 17px;
          background-color: rgba(255, 255, 255, .8);
        }
      }
    }
  }

  &__big-slide,
  &__small-slide,
  &__nav-slide {
    width: auto;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
    padding: 15px 0;

    .image-adv__item {
      display: inline-block;
    }

    .image-adv__image {
      width: 330px;
    }
  }

  &__small-slide .image-adv__image {
    width: 150px;
  }

  &__nav-slide .image-adv__image {
    width: 138px;
  }

  &.shadow {
    overflow: hidden;

    .image-adv__big-slide,
    .image-adv__small-slide,
    .image-adv__nav-slide {
      margin: 0 -15px;

      .image-adv__item:first-child {
        margin-left: 15px;
      }

      .image-adv__item:last-child {
        margin-right: 15px !important;
      }
    }

    .image-adv__swiper {
      padding-bottom: 15px;

      .swiper-container {
        box-shadow: 0 10px 5px -5px #c0c4cc;
      }
    }

    .image-adv__image-img,
    .image-adv__item {
      box-shadow: 0 4px 10px rgba(47, 54, 70, 0.1);
    }
  }

  &.round {
    .image-adv__title {
      border-radius: 0 0 10px 10px;
    }

    .swiper-container {
      border-radius: 10px;
      overflow: hidden;
    }

    .image-adv__image-img {
      border-radius: 10px;
    }
  }
}
</style>
