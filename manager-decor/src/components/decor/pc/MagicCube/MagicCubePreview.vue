<template>
  <div class="magic-cube">
    <div class="magic-cube__list">
      <div
        v-for="(item, b_index) in $$FormData.blockList"
        :key="'block_' + b_index"
        class="magic-cube__item"
        :style="{
          width: (1210 - ($$FormData.blockList.length - 1) * 10) / $$FormData.blockList.length + 'px'
        }"
      >
        <div class="magic-cube__item-header">
          <a :href="$$GetLinkValue(item.title_link)" class="magic-cube__item-header-link" target="_blank">
            <h3 class="magic-cube__item-header-title">{{ item.title }}</h3>
            <i class="magic-cube__item-header-arrow"></i>
          </a>
          <div v-if="item.type === 'special-offer'" class="header-tab">
            <div
              v-for="(tab, t_index) in item.tabList"
              :key="t_index"
              class="header-tab__item"
              :class="{active: tabsIndex[b_index] === t_index}"
              @mouseover="handleTabHover(b_index, t_index)"
            >
              {{ tab.name }}
            </div>
          </div>
        </div>
        <div class="magic-cube__item-body">
          <!-- 商品轮播 -->
          <div v-if="item.type === 'goods' && item.show_type === 'slider'" class="goods-slider">
            <div v-if="show_swiper" v-swiper="swiperOptions" :instance-name="`block_swiper_${b_index}`" class="swiper-no-swiping">
              <div class="swiper-wrapper">
                <div v-for="(goods, s_index) in item.goodsList" :key="'swiper_' + s_index" class="swiper-slide goods-slider__item">
                  <a class="" :href="`${$$GetBuyerPCDomain}/goods/${goods['goods_id']}`" target="_blank">
                    <div class="goods-slider__item-image">
                      <img :src="goods['goods_image']" alt>
                    </div>
                    <div class="goods-slider__item-info">
                      <p class="goods-slider__item-name">{{ goods['goods_name'] }}</p>
                      <p class="goods-slider__item-desc">来这里发现更多新品</p>
                      <p class="goods-slider__item-price">
                        {{ goods['goods_price'] | unitPrice }}
                        <span style="font-size: 16px;">起</span>
                      </p>
                    </div>
                  </a>
                </div>
              </div>
              <div class="swiper-button swiper-button-prev" slot="button-prev"></div>
              <div class="swiper-button swiper-button-next" slot="button-next"></div>
            </div>
          </div>
          <!-- 商品选项卡 -->
          <div v-if="item.type === 'goods' && item.show_type === 'tab'" class="goods-tab">
            <div class="goods-tab__head">
              <div
                v-for="(tab, t_index) in item.tabList"
                :key="'tab-head_' + t_index"
                class="goods-tab__item"
                :class="{active: tabsIndex[b_index] === t_index}"
                @mouseover="handleTabHover(b_index, t_index)"
              >
                <a class="goods-tab__item-lk" href="javascript:void(0);">{{ tab.name }}</a>
              </div>
            </div>
            <div class="goods-tab__body">
              <div
                v-for="(tab, t_index) in item.tabList"
                :key="'tab-body_' + t_index"
                class="goods-tab__goods-list"
                v-show="tabsIndex[b_index] === t_index"
              >
                <div v-for="(goods, g_index) in tab.goodsList" :key="g_index" class="goods-tab__goods">
                  <a
                    class="goods-tab__goods-lk"
                    :href="`${$$GetBuyerPCDomain}/goods/${goods['goods_id']}`"
                    target="_blank"
                  >
                    <div class="goods-tab__goods-image">
                      <img :src="goods['goods_image']" alt/>
                    </div>
                    <div class="goods-tab__goods-info">
                      <span class="goods-tab__goods-name">{{ goods['goods_name'] }}</span>
                      <div class="goods-tab__goods-price">
                        <i class="currency">¥</i>
                        <span class="goods-tab__goods-price">{{ goods['goods_price'] }}</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- 店铺列表 -->
          <div v-if="item.type === 'shop'" class="shop-list">
            <a
              v-for="shop in item.shopList"
              :key="shop['shop_id']"
              :href="`${$$GetBuyerPCDomain}/shop/${shop['shop_id']}`"
              :title="shop['shop_name']"
              target="_blank"
              class="shop-item"
            >
              <div class="shop-item__info">
                <div class="item-title">{{ shop['shop_name'] }}</div>
                <div class="item-tags">
                  <span class="text-tag rec">推荐</span>
                  <span class="text-tag">好物</span>
                </div>
                <div class="item-collect">{{ shop['shop_collect'] }}人关注</div>
              </div>
              <div class="shop-item__cover">
                <img :src="shop['shop_logo']" :alt="shop['shop_name']">
              </div>
            </a>
          </div>
          <div v-if="item.type === 'special-offer'" class="special-offer">
            <div
              v-for="(tab, t_index) in item.tabList"
              :key="t_index"
              class="special-offer__item"
              v-show="tabsIndex[b_index] === t_index"
            >
              <div
                v-for="goods in tab.goodsList"
                :key="goods['goods_id']"
                class="goods-item"
              >
                <a
                  class="goods-item__lk"
                  :href="`${$$GetBuyerPCDomain}/goods/${goods['goods_id']}`"
                  target="_blank"
                >
                  <div class="goods-item__image">
                    <img :src="goods['goods_image']" :alt="goods['goods_name']">
                  </div>
                  <div class="goods-item__message">
                    <span class="goods-item__name">{{ goods['goods_name'] }}</span>
                    <div class="goods-item__price">
                      {{ goods['goods_price'] | unitPrice }}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MagicCubePreview',
  data() {
    return {
      show_swiper: true,
      swiperOptions: {
        loop: true,
        autoplay: {
          disableOnInteraction: false
        },
        slidesPerView: 2,
        spaceBetween: 30,
        centeredSlides: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      },
      tabsIndex: { 0: 0, 1: 0, 2: 0, 3: 0 }
    }
  },
  watch: {
    swiperOptions: {
      deep: true,
      handler: 'updateSwiper'
    },
    '$$FormData.blockList': {
      deep: true,
      handler: 'updateSwiper'
    }
  },
  methods: {
    handleTabHover(b_index, t_index) {
      this.tabsIndex[b_index] = t_index
    },
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
$header-arrow: url('data:image/png;base64,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');
.magic-cube {
  min-height: 340px;
  width: 1210px;
  margin: 0 auto;

  &__list {
    display: flex;
    justify-content: space-between;
  }

  &__item {
    position: relative;
    height: 340px;
    overflow: hidden;
    background-color: #ffffff;
    &::after {
      content: '';
      clear: both;
    }

    &-header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 60px;
      padding: 0 20px;
      font-size: 0;
      line-height: 0;
      box-sizing: border-box;

      &-link {
        display: inline-block;
        position: relative;
        height: 32px;
        margin: 12px 0 0;

        &:hover {
          .magic-cube__item-header-arrow:after {
            opacity: 1;
            visibility: visible;
          }
        }
      }

      &-title {
        float: left;
        font-weight: 700;
        font-size: 24px;
        color: #333333;
        line-height: 32px;
      }

      &-arrow {
        width: 16px;
        height: 16px;
        position: relative;
        float: left;
        top: 8px;
        left: 10px;
        background-size: 32px 32px;
        background-repeat: no-repeat;
        background-position: -16px 0;
        background-image: $header-arrow;

        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          visibility: hidden;
          opacity: 0;
          -webkit-transition: all .2s ease;
          transition: all .2s ease;
          background-position: 0 0;
          background-size: 32px 32px;
          display: block;
          width: 16px;
          height: 16px;
          opacity: 0;
          background-image: $header-arrow;
        }
      }
    }

    &-body {
      position: relative;
    }
  }

  .goods-slider {
    &__item {
      display: block;
      position: relative;
      transition: all .4s ease;
      transform: scale(.8);
      transform-origin: center center;

      &.swiper-slide-active {
        transform: scale(1);

        .goods-slider__item-info {
          opacity: 1;
        }
      }

      &-image {
        display: inline-block;
        width: 130px;
        height: 140px;
        margin-top: 10px;

        img {
          width: 100%;
          height: 130px;
        }
      }

      &-info {
        transition: opacity .4s ease;
        opacity: 0;
        text-align: center;
      }

      &-name {
        position: relative;
        width: 200px;
        left: -35px;
        line-height: 19px;
        font-size: 14px;
        color: #333;
        transition: color .2s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 20px;
        margin-bottom: 4px;
      }

      &-desc {
        position: relative;
        width: 200px;
        height: 16px;
        left: -35px;
        line-height: 16px;
        letter-spacing: 0;
        font-size: 12px;
        color: #999;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &-price {
        margin-top: 20px;
        font-size: 18px;
        color: #e1251b;
        letter-spacing: 0;
      }
    }

    .swiper-button {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 0;
      top: 50%;
      border-radius: 0;
      width: 25px;
      height: 35px;
      line-height: 35px;
      color: #ffffff;
      background-color: rgba(0, 0, 0, .15);
      margin-top: -20px;
      z-index: 2;
      transition: background-color .2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, .4);
      }

      &::after {
        font-size: 1px;
      }

      &.swiper-button-prev {
        border-top-right-radius: 18px;
        border-bottom-right-radius: 18px;

        &::after {
          margin-right: 5px;
        }
      }

      &.swiper-button-next {
        left: auto;
        right: 0;
        border-top-left-radius: 18px;
        border-bottom-left-radius: 18px;

        &::after {
          margin-left: 5px;
        }
      }
    }
  }

  .goods-tab {
    &__head {
      display: flex;
      justify-content: center;
      height: 40px;
    }

    &__item {
      display: inline-block;
      height: 26px;
      line-height: 40px;
      padding-top: 0;
      font-size: 14px;

      &.active {
        .goods-tab__item-lk {
          background-color: #e1251b;
          color: #fff;
        }
      }

      &-lk {
        display: inline-block;
        max-width: 70px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #999;
        font-size: 12px;
        background-color: #f6f6f6;
        height: 20px;
        line-height: 20px;
        margin: 0 4px;
        width: 62px;
        text-align: center;
        border-radius: 12px;
      }
    }

    &__body {

    }

    &__goods {
      margin: 0 15px 10px;

      &:last-child {
        margin-bottom: 0;
      }

      &-lk {
        position: relative;
        display: block;
        height: 70px;
      }

      &-image {
        display: block;
        width: 70px;
        height: 70px;
        transition: all .2s ease;

        img {
          width: 100%;
          height: 100%;
        }
      }

      &-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;
        left: 80px;
        top: 0;
        width: 180px;
        height: 70px;
      }

      &-name {
        display: block;
        max-height: 28px;
        line-height: 14px;
        font-size: 14px;
        font-weight: 500;
        word-break: break-all;
        color: #333;
        overflow: hidden;
        transition: all .2s ease;
      }

      &-price {
        font-size: 16px;
        color: #e1251b;
        letter-spacing: 0;
        font-weight: 500;
        margin-top: 10px;

        .currency {
          font-size: 12px;
          font-weight: 400;
        }
      }
    }
  }

  .shop-list {
    padding: 0 15px;
    box-sizing: border-box;
    .shop-item {
      position: relative;
      display: block;
      box-sizing: border-box;
      width: 260px;
      height: 128px;
      padding: 15px 125px 15px 15px;
      margin-bottom: 10px;
      background-position: 50%;
      background-repeat: no-repeat;
      background-size: cover;
      &:nth-child(1) {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAggAAAEAAQMAAADsiRzQAAAABlBMVEXr9vTx+PdcLmNuAAAB/klEQVR42qXQsU0FQAwFwVf6lXaluIQLHViGgBQkvmYLmGDzhS0LzUKxcMIbVGgWioWjwkaFZqFYOCpsVGgWLgtRYVh4LFwWosKw8Fi4LESFYeGxcFmICsPCY+GyEBWGhcfCZSEqDAuPhctCVBgWHguXhagwLBQLR4WNCs1CsXBU2KjQLBQLR4WNCs1CsXBU2KjQLBQLR4WNCs1CsXBU2KjQLBQLR4WNCs1CsXBU2KjQLFwWosLklz4SHguXhagwLDwWLgtRYVh4LFwWosKw8Fi4LESFYeGxcFmICsPCY+GyEBWGhcfCZSEqDAvFwlFho0KzUCwcFTYqNAvFwlFho0KzUCwcFTYqNAvFwlFho0KzUCwcFTYqNAvFwlFho0KzUCwcFTYqNAuXhfxT+LNh4bFwWYgKw8Jj4bIQFYaFx8JlISoMC4+Fy0JUGBYeC5eFqDAsPBYuC1FhWHgsXBaiwrBQLBwVNio0C8XCUWGjQrNQLBwVNio0C8XCUWGjQrNQLBwVNio0C8XCUWGjQrNQLBwVNio0C8XCUWGjQrNwQfgpKgwLj4XLQlQYFh4Ll4WoMCw8Fi4LUWFYeCxcFqLCsPBYuCxEhWHhsXBZiArDwmPhshAVhoVi4aiwUaFZKBaOChsVmoVi4aiwUaFZKBaOChsVmoVi4QTbaB2tovGGbzkAras/9KUcAAAAAElFTkSuQmCC');
      }
      &:nth-child(2) {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAggAAAEAAQMAAADsiRzQAAAABlBMVEXv7/bz8/hwiQw0AAAB/klEQVR42qXQsU0FQAwFwVf6lXaluASHDk6GgBQkvmYLmGDzhS0Lw0KxcMIbVBgWioWjwkaFYaFYOCpsVGgWLgtR4bHQLFwWosJjoVm4LESFx0KzcFmICo+FZuGyEBUeC83CZSEqPBaahctCVHgsNAuXhagwLBQLR4WNCsNCsXBU2KgwLBQLR4WNCsNCsXBU2KgwLBQLR4WNCsNCsXBU2KgwLBQLR4WNCsNCsXBU2KjQLFwW8ksfCY+FZuGyEBUeC83CZSEqPBaahctCVHgsNAuXhajwWGgWLgtR4bHQLFwWosJjoVm4LESFYaFYOCpsVBgWioWjwkaFYaFYOCpsVBgWioWjwkaFYaFYOCpsVBgWioWjwkaFYaFYOCpsVBgWioWjwkaFZuH+U/i7qPBYaBYuC1HhsdAsXBaiwmOhWbgsRIXHQrNwWYgKj4Vm4bIQFR4LzcJlISo8FpqFy0JUGBaKhaPCRoVhoVg4KmxUGBaKhaPCRoVhoVg4KmxUGBaKhaPCRoVhoVg4KmxUGBaKhaPCRoVhoVg4KmxUaBB+uixEhcdCs3BZiAqPhWbhshAVHgvNwmUhKjwWmoXLQlR4LDQLl4Wo8FhoFi4LUeGx0CxcFqLCsFAsHBU2KgwLxcJRYaPCsFAsHBU2KgwLxcJRYaPCsFAsnGAbbaJVNN7wDZFnrXsGF3soAAAAAElFTkSuQmCC');
      }

      &:hover {
        .item-title {
          color: #c81623;
        }
        .shop-item__cover {
          opacity: 0.8;
        }
      }

      .item-title {
        height: 38px;
        line-height: 16px;
        font-size: 14px;
        color: #333;
        transition: color .2s ease;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .item-tags {
        margin-top: 5px;
        .text-tag {
          font-size: 12px;
          text-align: center;
          border-radius: 2px;
          padding: 0 2px;
          height: 18px;
          line-height: 17px;
          box-sizing: border-box;
          border: 1px solid transparent;
          margin-right: 5px;
          display: inline-block;
          color: #596fab;
          border-color: #596fab;
          &.rec {
            color: #e2231a;
            border-color: #e2231a;
          }
        }
      }

      .item-collect {
        color: #999;
        font-size: 12px;
        position: absolute;
        bottom: 15px;
      }

      &__cover {
        width: 100px;
        height: 100px;
        position: absolute;
        right: 10px;
        top: 15px;
        transition: opacity .2s ease;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        padding: 5px;
        box-sizing: border-box;
        background: white;
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }

  .header-tab {
    display: flex;
    align-items: center;
    &__item {
      position: relative;
      margin: 0 13.5px;
      display: inline-block;
      cursor: pointer;
      font-size: 14px;
      color: #999;
      line-height: 19px;
      padding-bottom: 2px;
      &.active {
        color: #e1251b;
        &::after {
          content: '';
        }
      }
      &::after {
        content: none;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #e1251b;
      }
    }
  }

  .special-offer {
    padding: 0 15px 15px;
    &__item {
      width: 560px;
      height: 270px;
    }
    .goods-item {
      display: inline-block;
      vertical-align: top;
      width: 170px;
      height: 89px;
      margin-left: 19px;
      margin-bottom: 48px;
      &:hover {
        .goods-item__image {
          opacity: 0.8;
        }
        .goods-item__name {
          color: #c81623;
        }
      }
      &:nth-child(2),
      &:nth-child(3) {
        margin-top: 18px;
      }
      &:first-child {
        background-color: rgba(109,126,146,.05);
        float: left;
        width: 170px;
        height: 265px;
        margin-left: 0;
        margin-bottom: 0;
        margin-right: 6px;
        .goods-item__image {
          margin-top: 46px;
          width: 120px;
          display: inline-block;
          left: 50%;
          margin-left: -60px;
          height: 120px;
          text-align: center;
        }
        .goods-item__message {
          margin-left: 0;
          width: 100%;
          text-align: center;
        }
        .goods-item__name {
          margin-top: 9px;
          margin-bottom: 4px;
          height: 19px;
          line-height: 19px;
          width: 150px;
          font-size: 14px;
          display: inline-block;
          text-align: center;
        }
      }
      &__lk {
        position: relative;
        display: inline-block;
        width: 170px;
      }
      &__image {
        position: relative;
        float: left;
        width: 84px;
        height: 84px;
        transition: opacity ease .3s;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &__message {
        float: left;
        width: 75px;
        margin-left: 6px;
        font-size: 0;
      }
      &__name {
        display: inline-block;
        width: 100%;
        color: #333;
        height: 32px;
        font-size: 12px;
        line-height: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
      }
      &__price {
        color: #c81623;
        font-size: 18px;
        margin-top: 10px;
      }
    }
  }
}
</style>
