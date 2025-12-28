<template>
  <div class="goods-price">
    <div v-if="isNeg" class="neg-symbol">-</div>
    <div class="price-box" :style="{'flex-direction': direction, 'align-items': direction === 'row' ? 'flex-end' : 'flex-start'}">
      <div
        class="price-text"
        :class="{'line-through': lineThrough}"
        :style="{fontSize: size + 'px', color: priceColor}"
      >
        {{ _price | unitPrice }}
      </div>
      <div v-if="showI18nPrice" class="i18n-price" :style="{fontSize: i18nPriceSize,  color: i18nPriceColor}">
        <i class="symbol" :style="{color: i18nPriceColor}">≈</i>{{ MixinI18nPrice(price) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnPrice',
  props: {
    price: {
      type: [String, Number]
    },
    size: {
      type: [String, Number],
      default: 14
    },
    sizeRatio: {
      type: Number,
      default: 0.7
    },
    priceColor: {
      type: String,
      default: ''
    },
    i18nPriceColor: {
      type: String,
      default: '#808185'
    },
    isNeg: {
      type: Boolean,
      default: false
    },
    lineThrough: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: 'column'
    }
  },
  computed: {
    _price() {
      return Math.abs(this.price || 0)
    },
    showI18nPrice() {
      if (!this.MixinI18n) return false
      const { base_currency, current_currency } = this.$store.getters
      return base_currency.currency_code !== current_currency.currency_code
    },
    i18nPriceSize() {
      return Number(this.size) * this.sizeRatio + 'px'
    }
  }
}
</script>

<style scoped lang="scss">
@use "../assets/styles/color" as theme;
.goods-price {
  display: inline-flex;
  align-items: center;
  position: relative;
  color: theme.$color-main;
  .price-box {
    display: flex;
  }
  .price-text {
    line-height: normal;
    &.line-through {
      text-decoration: line-through;
    }
  }
  .i18n-price {
    font-size: 12px;
    color: #808185;
    line-height: normal;
    margin-top: -2px;
    .symbol {
      color: #666666;
      margin-right: 1px;
    }
  }
}
</style>
