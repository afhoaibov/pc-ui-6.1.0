<template>
  <div class="goods-preview">
    <ul
      class="goods-preview__list"
      :class="[$$FormData.list_style]"
      :style="{
        paddingLeft: $$FormData.page_edge + 'rpx',
        paddingRight: $$FormData.page_edge + 'rpx',
        marginLeft: -($$FormData.goods_space / 2) + 'rpx',
        marginRight: -($$FormData.goods_space / 2) + 'rpx'
      }"
    >
      <li
        v-for="item in ($$FormData.goodsList.length ? $$FormData.goodsList : exampleGoods)"
        :key="item.goods_id"
        class="item-goods"
      >
        <div
          class="a-item-goods"
          :style="{margin: $$FormData.goods_space / 2 + 'rpx'}"
          :class="[$$FormData.goods_chamfer, $$FormData.goods_style]"
        >
          <div class="image-goods">
            <div class="image-goods-inner" :style="{paddingTop: imagePaddingTopByRatio}">
              <div
                class="img-goods"
                :class="[$$FormData.image_fill]"
                :style="{backgroundImage: `url(${item.goods_image})`}"
              ></div>
            </div>
          </div>
          <div class="info-goods" :class="[`align-${$$FormData.text_align}`]">
            <div class="title-goods">
              <h3
                v-if="$$FormData.show_goods_name"
                class="name-goods"
                :style="{fontWeight: $$FormData.text_font_weight}"
              >{{ item.goods_name }}</h3>
            </div>
            <div class="price-goods">
              <div v-if="$$FormData.show_goods_price" class="price" :style="{fontWeight: $$FormData.text_font_weight}">
                <span class="money-price">{{ item.goods_price | unitPrice }}</span>
              </div>
              <div v-if="$$FormData.show_goods_buy_btn" class="buy-btn" :class="['style-' + $$FormData.goods_buy_btn_style]">
                <i v-if="$$FormData.goods_buy_btn_style === 1" class="van-icon van-icon-cart-circle-o"></i>
                <i v-if="$$FormData.goods_buy_btn_style === 2" class="van-icon van-icon-add-o"></i>
                <i v-if="$$FormData.goods_buy_btn_style === 5" class="van-icon van-icon-add"></i>
                <i v-if="$$FormData.goods_buy_btn_style === 6" class="van-icon van-icon-shopping-cart-o"></i>
                <button v-else-if="$$FormData.goods_buy_btn_text" class="buy-text">
                  {{ $$FormData.goods_buy_btn_text }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="$$FormData.show_goods_badge" class="badge-goods" :class="$$FormData.goods_badge_style">
            <i v-if="$$FormData.goods_badge_style === 'new'" class="van-icon van-icon-new-arrival"></i>
            <i v-else-if="$$FormData.goods_badge_style === 'hot'" class="van-icon van-icon-hot-sale"></i>
            <i v-else-if="$$FormData.goods_badge_style === 'NEW'" class="van-icon van-icon-new"></i>
            <i v-else-if="$$FormData.goods_badge_style === 'HOT'" class="van-icon van-icon-hot"></i>
            <img
              v-else-if="$$FormData.goods_badge_style"
              :src="$$FormData.goods_badge_style"
              :alt="$$FormData.goods_badge_style"
              class="image-badge"
            >
            <div v-else class="image-badge">
              <p>角标</p>
              <p>区域</p>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { uuid } from '@/utils/foundation'
export default {
  name: 'GoodsPreview',
  data() {
    return {
      exampleGoods: [
        {
          goods_id: uuid(),
          goods_name: '这里显示商品名称，最多显示1行。',
          goods_image: require('@/assets/placeholder-image.png'),
          goods_price: 99
        },
        {
          goods_id: uuid(),
          goods_name: '这里显示商品名称，最多显示1行。',
          goods_image: require('@/assets/placeholder-image.png'),
          goods_price: 99
        },
        {
          goods_id: uuid(),
          goods_name: '这里显示商品名称，最多显示1行。',
          goods_image: require('@/assets/placeholder-image.png'),
          goods_price: 99
        }
      ]
    }
  },
  computed: {
    /**
     * 通过图片比例计算paddingTop
     * @returns {string}
     */
    imagePaddingTopByRatio() {
      switch (this.$$FormData.image_ratio) {
        case '3:2': return '66.6667%';
        case '1:1': return '100%';
        case '3:4': return '133.333%';
        case '16:9': return '56.25%';
      }
      return '66.6667%'
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-preview {
  width: 100%;
  overflow: hidden;
  .goods-preview__list {
    &.single {
      .name-goods {
        font-size: 32rpx;
      }
    }
    &.row-two {
      overflow: hidden;
      .item-goods {
        float: left;
        width: 50%;
      }
      .name-goods {
        height: 68rpx;
        max-height: 68rpx;
        font-size: 26rpx;
        line-height: 34rpx;
        -webkit-line-clamp: 2
      }
    }
    &.row-three,
    &.row-scroll {
      overflow: hidden;
      .item-goods {
        float: left;
        width: 33.333%;
      }
      .info-goods {
        padding: 0 16rpx 4rpx;
      }
      .name-goods {
        height: 68rpx;
        max-height: 68rpx;
        font-size: 26rpx;
        line-height: 34rpx;
        -webkit-line-clamp: 2
      }
      .price-goods .price {
        height: 32rpx;
        font-size: 32rpx;
        line-height: 32rpx;
      }
      .buy-btn .van-icon {
        height: 40rpx;
        font-size: 40rpx;
        line-height: 40rpx;
      }
      .badge-goods {
        .van-icon {
          font-size: 56rpx;
        }
        &.new .van-icon {
          top: 2rpx;
          &::after {
            top: 20rpx;
            left: 8rpx;
            width: 40rpx;
            height: 20rpx;
          }
        }
        &.hot .van-icon {
          top: 14rpx;
          left: 0;
          &::after {
            top: 0;
            left: 14rpx;
            width: 28rpx;
            height: 54rpx;
          }
        }
        &.NEW .van-icon {
          top: 0;
          left: 9rpx;
          font-size: 64rpx;
          &::after {
            top: 0;
            left: 14rpx;
            width: 38rpx;
            height: 46rpx;
          }
        }
        &.HOT .van-icon {
          top: 10rpx;
          left: 10rpx;
          &::after {
            top: 18rpx;
            left: 14rpx;
            width: 32rpx;
            height: 28rpx;
          }
        }
      }
    }
    &.column {
      .a-item-goods {
        overflow: hidden;
      }
      .image-goods {
        float: left;
        width: 310rpx;
        height: 310rpx;
        min-height: auto;
        margin-right: 20rpx;
        padding-top: initial;
      }
      .info-goods {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 310rpx;
        margin-left: 310rpx;
        padding: 0 24rpx 0 0;
        overflow: hidden;
        .title-goods {
          margin-top: 0;
        }
      }
      .name-goods {
        max-height: 80rpx;
        font-size: 28rpx;
        line-height: 36rpx;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin-top: 24rpx;
        line-height: 40rpx;
      }
    }
    &.hybrid {
      .item-goods {
        float: left;
        &:nth-child(3n+1) {
          width: 100%;
        }
        &:nth-child(3n),
        &:nth-child(3n+2){
          width: 50%;
        }
      }
    }
    &.row-scroll {
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: -20rpx;
      padding-bottom: 20rpx;
      overflow-x: auto;
      overflow-y: hidden;
      .item-goods {
        flex: 0 0 30%;
        float: none;
        width: 30%;
      }
    }
  }
  .a-item-goods {
    position: relative;
    display: block;
    box-sizing: border-box;
    min-height: 100rpx;
    overflow: hidden;
    color: #333333;
    background-color: #ffffff;
    transition: all ease .2s;
    &.round {
      border-radius: 16rpx;
    }
    &.card-shadow {
      box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.06);
    }
    &.outline-white-bottom {
      border: 2rpx solid rgba(50,50,51,.1);
    }
    &.transparent {
      background-color: transparent;
      .info-goods {
        padding: 0;
      }
    }
  }
  .item-goods {
    overflow: hidden;
  }
  .image-goods {
    position: relative;
    .image-goods-inner {
      position: relative;
      max-height: 1000rpx;
      overflow: hidden;
    }
    .img-goods {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      background-repeat: no-repeat;
      background-position: 50%;
      &.cover {
        background-size: cover;
      }
      &.contain {
        background-size: contain;
      }
    }
  }
  .info-goods {
    position: relative;
    padding: 0 24rpx 8rpx;
    &.align-center {
      .title-goods {
        text-align: center;
      }
      .price-goods {
        flex-direction: column;
        height: auto;
        .price {
          flex-shrink: 0;
          height: 88rpx;
          line-height: 88rpx;
        }
        .buy-btn {
          margin-bottom: 20rpx;
        }
      }
    }
    .name-goods {
      margin-top: 24rpx;
      max-height: 40rpx;
      margin-bottom: 8rpx;
      color: #323233;
      font-size: 30rpx;
      line-height: 40rpx;
      vertical-align: middle;
      word-break: break-all;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    .price-goods {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 88rpx;
      .price {
        height: 40rpx;
        color: #f84343;
        font-size: 40rpx;
        line-height: 40rpx;
        word-break: break-all;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .currency-price {
        align-self: center;
        height: 28rpx;
        margin-right: 4rpx;
        font-size: 28rpx;
      }
    }
    .buy-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      .van-icon {
        color: #f84343;
        font-size: 48rpx;
        line-height: normal;
        box-sizing: border-box;
      }
      &.style-4 .buy-text,
      &.style-8 .buy-text {
        color: #f84343;
        border-radius: 4rpx;
        border: 2rpx solid #f84343;
        background-color: #ffffff;
      }
      &.style-7 .buy-text {
        border-radius: 4rpx;
      }
      &.style-8 .buy-text {
        border-radius: 48rpx;
      }
      .buy-text {
        color: #ffffff;
        background-color: #f84343;
        font-size: 24rpx;
        height: 48rpx;
        line-height: normal;
        outline: none;
        border: none;
        border-radius: 48rpx;
        padding: 0 16rpx;
        box-sizing: border-box;
        transition: all ease .2s;
      }
    }
  }
  .badge-goods {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    &.new .van-icon {
      top: 22rpx;
      &::after {
        top: 20rpx;
        left: 8rpx;
        width: 56rpx;
        height: 34rpx;
      }
    }
    &.hot .van-icon {
      top: 20rpx;
      left: 10rpx;
      &::after {
        top: 0;
        left: 20rpx;
        width: 34rpx;
        height: 70rpx;
      }
    }
    &.NEW .van-icon {
      left: 8rpx;
      &::after {
        top: 0;
        left: 14rpx;
        width: 26rpx;
        height: 50rpx;
      }
    }
    &.HOT .van-icon {
      top: 20rpx;
      left: 20rpx;
      &::after {
        top: 18rpx;
        left: 14rpx;
        width: 48rpx;
        height: 44rpx;
      }
    }
    .van-icon {
      position: relative;
      color: #f84343;
      font-size: 76rpx;
      line-height: normal;
      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        background-color: #ffffff;
      }
    }
    .image-badge {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 72rpx;
      height: 72rpx;
      background-color: #86b6cb;
      color: #f84343;
      font-size: 24rpx;
    }
  }
}
</style>
