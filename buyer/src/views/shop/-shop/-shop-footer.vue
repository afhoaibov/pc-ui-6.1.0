<template>
  <div class="shop-footer">
    <div class="shop-intro" id="shop-intro">
      <div class="w">
        <div class="intro-title">店铺简介</div>
        <div class="intro-body" v-html="shop.shop_desc || '暂无简介'"></div>
      </div>
    </div>
    <div class="shop-info" id="shop-info">
      <div class="info-title">关于本店</div>
      <div class="info-information">
        <div class="item">
          <h3>联系方式</h3>
          <div class="information-same">
            <p>所在地址：{{ formatAddress() }}</p>
            <p>详细地址：{{ shop.shop_add }}</p>
            <p>联系电话：
              <span v-if="shop.link_phone">{{ shop.link_phone | secrecyMobile }}</span>
              <span v-else>无</span>
            </p>
          </div>
        </div>
        <div class="item">
          <h3>店铺评价</h3>
          <div class="information-same">
            <div>描述相符：
              <shop-star :star="shop.shop_description_credit" />
            </div>
            <div>服务态度：
              <shop-star :star="shop.shop_service_credit" />
            </div>
            <div>发货速度：
              <shop-star :star="shop.shop_delivery_credit" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShopStar from './-shop-star'

export default {
  name: 'shop-footer',
  props: ['shop'],
  components: { ShopStar },
  methods: {
    /** 格式化店铺地址 */
    formatAddress() {
      const { shop_province, shop_city, shop_county, shop_town } = this.shop
      return `${shop_province}-${shop_city}${shop_county ? '-' + shop_county : ''}${shop_town ? '-' + shop_town : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-footer {
  .shop-intro {
    .w {
      width: 950px;
      border-bottom: 1px dashed #ccc;
      padding-bottom: 20px;
    }

    .intro-title,
    .intro-body {
      text-align: center;
    }

    .intro-title {
      font-size: 20px;
      color: #666;
      padding: 5px 0;
    }

    .intro-body {
      margin-top: 20px;
      all: initial;
      img {
        object-fit: cover;
      }
      ::v-deep em {
        font-style: italic;
      }
      ::v-deep li {
        list-style: inherit;
      }
    }
  }

  .shop-info {
    width: 750px;
    margin: 0 auto;
    padding: 20px 0;

    .info-title {
      width: 100%;
      font-size: 20px;
      color: #666;
      text-align: center;
      padding: 5px 0 20px;
    }

    .info-information {
      display: flex;
      justify-content: space-between;

      h3 {
        font: 14px/1.5 "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
        font-size: 14px;
        padding: 9px 0;
      }

      .information-same {
        border-top: 1px dotted #000;
        clear: both;
        line-height: 22px;
        overflow: hidden;
        padding: 10px 0 0;
      }
    }
  }
}
</style>
