<template>
  <div class="goods-pc">
    <ul v-if="$$FormData.goodsList.length" class="goods-list">
      <li v-for="item in $$FormData.goodsList" :key="item['goods_id']" class="goods-item">
        <a
          class="goods-item-link"
          :href="`${$$IsDecor ? $$Domain['buyer_pc'] : ''}/goods/${item['goods_id']}`"
          :title="item['goods_name']"
          target="_blank"
        >
          <div class="goods-item-image">
            <img :src="item['goods_image']" class="goods-item-img" :alt="item['goods_name']">
          </div>
          <div class="goods-item-info">
            <p class="goods-item-name">
              <i class="goods-item-name-tag">推荐</i>
              {{ item['goods_name'] }}
            </p>
            <div class="goods-item-price">
              <i>¥</i>
              <span class="goods-item-price-integer">{{ formatPrice(item).integer }}.</span>
              <span class="goods-item-price-decimal">{{ formatPrice(item).decimal }}</span>
            </div>
          </div>
        </a>
      </li>
    </ul>
    <div v-else class="goods-empty">
      请添加商品...
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsPreview',
  methods: {
    /**
     * 价格格式化
     * @param item
     * @returns {{price: string, integer: string, decimal: string}}
     */
    formatPrice(item) {
      let price = item['goods_price']
      let price_str = String(Number(price).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return {
        price: price_str,
        integer: price_str.split('.')[0],
        decimal: price_str.split('.')[1]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$price-color: #e1251b;
.goods-pc {
  overflow: hidden;
  width: 1210px;
  margin: 0 auto;
  .goods-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    padding-top: 100px;
    box-sizing: border-box;
    color: #8c8c8c;
    background-color: #ffffff;
    background-size: 100px 100px;
    background-position: center 20px;
    background-repeat: no-repeat;
    background-image: url('../../../../assets/placeholder-module.png');
  }
  .goods-list {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: -10px;
  }
  .goods-item {
    position: relative;
    width: 234px;
    height: 322px;
    background-color: #ffffff;
    margin-bottom: 10px;
    &:hover {
      .goods-item-image {
        opacity: 0.8;
      }
    }
    &:not(:nth-child(5n + 1)) {
      margin-left: 10px;
    }
    &-link {
      display: inline-block;
      width: 100%;
      height: 100%;
    }
    &-image {
      width: 150px;
      height: 150px;
      margin: 30px auto 40px;
      transition: opacity ease 0.2s;
      .goods-item-img {
        display: block;
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
        margin: 0 auto;
      }
    }
    &-info {
      padding: 0 20px;
      height: 65px;
      line-height: 24px;
    }
    &-name {
      height: 48px;
      font-size: 14px;
      line-height: 24px;
      text-align: left;
      color: #666666;
      -webkit-transition: color .2s ease;
      transition: color .2s ease;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      &-tag {
        font-style: normal;
        background-color: $price-color;
        border-radius: 2px;
        color: #fff;
        padding: 0 5px;
        margin-right: 4px;
        line-height: 16px;
        height: 16px;
        font-size: 12px;
        display: inline-block;
      }
    }
    &-price {
      margin-top: 10px;
      display: inline-block;
      font-size: 16px;
      line-height: 18px;
      height: 18px;
      color: $price-color;
      i {
        vertical-align: middle;
        font-size: 12px;
        font-weight: 700;
        margin-right: 3px;
      }
      .goods-item-price-integer {
        font-size: 20px;
        font-weight: 700;
      }
      .goods-item-price-decimal {
        font-size: 12px;
      }
    }
  }
}
</style>
