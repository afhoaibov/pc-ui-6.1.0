<template>
  <div class="goods-corridor">
    <div class="goods-corridor__head">
      <div class="goods-corridor__head-left">
        <span class="goods-corridor__head-title">{{ $$FormData.head_title }}</span>
        <span class="goods-corridor__head-subtitle">{{ $$FormData.head_subtitle }}</span>
      </div>
      <div class="goods-corridor__head-right">
        <router-link :to="$$GetLinkValue($$FormData.more_link)" class="goods-corridor__head-more-text">
          {{ $$FormData.more_text }}
        </router-link>
      </div>
    </div>
    <div v-if="goodsSlices.length" class="goods-corridor__goods">
      <div class="goods-corridor__goods-list" :style="{ '--item-count': item_count }">
        <div
          v-for="slice in currentSlices"
          :key="slice.__key"
          class="goods-corridor__goods-list-slice"
        >
          <a
            v-for="goods in slice.goodsList"
            :key="goods.__key"
            :href="`${$$Domain.buyer_pc}/goods/${goods.goods_id}`"
            target="_blank"
            class="goods-corridor__goods-item"
            :style="{ opacity: goods.__opacity }"
          >
            <div class="goods-corridor__goods-item-image">
              <img :src="goods.goods_image" class="goods-corridor__goods-item-image-img" :alt="goods.goods_name"/>
            </div>
            <div class="goods-corridor__goods-item-name">{{ goods.goods_name }}</div>
            <div class="goods-corridor__goods-item-price">{{ goods.goods_price | unitPrice }}</div>
          </a>
        </div>
      </div>
      <template v-if="goodsSlices.length >= 2">
        <div class="goods-corridor__goods-btn pre" @click="handleBtnPre"></div>
        <div class="goods-corridor__goods-btn next" @click="handleBtnNext"></div>
      </template>
    </div>
    <div v-else class="goods-corridor__goods empty">请选择商品</div>
  </div>
</template>

<script>
import { uuid } from '@/utils/foundation'

export default {
  name: 'GoodsCorridorPreview',
  data() {
    return {
      goodsSlices: [],
      currentSlices: [],
      current_index: 0,
      item_count: 7,
      done: true
    }
  },
  watch: {
    '$$FormData.goodsList': {
      immediate: true,
      handler: 'getGoodsSlices'
    }
  },
  methods: {
    getGoodsSlices(goodsList) {
      if (!goodsList || !goodsList.length === 0) {
        this.goodsSlices = []
        return
      }
      const chunks = []
      for (let i = 0; i < goodsList.length; i += this.item_count) {
        const list = {
          __key: uuid(),
          goodsList: goodsList.slice(i, i + this.item_count).map(item => ({ ...item, __opacity: 0, __key: uuid() }))
        }
        chunks.push(JSON.parse(JSON.stringify(list)))
      }
      if (chunks[0] && chunks[0].goodsList) {
        chunks[0].goodsList = chunks[0].goodsList.map(item => ({ ...item, __opacity: 1 }))
      }
      this.$set(this, 'goodsSlices', chunks)
      this.$set(this, 'currentSlices', [chunks[0]])
    },
    handleBtnPre() {
      if (!this.done) return
      let nextChunk = this.goodsSlices[this.current_index - 1]
      if (!nextChunk) {
        nextChunk = this.goodsSlices[this.goodsSlices.length - 1]
        this.current_index = this.goodsSlices.length - 1
      } else {
        this.current_index -= 1
      }
      nextChunk = JSON.parse(JSON.stringify(nextChunk))
      this.currentSlices.push(nextChunk)
      this.setItemHide(this.currentSlices[0].goodsList, 'pre')
      this.setItemShow(this.currentSlices[1].goodsList, 'pre')
    },
    async handleBtnNext() {
      if (!this.done) return
      let nextChunk = this.goodsSlices[this.current_index + 1]
      if (!nextChunk) {
        nextChunk = this.goodsSlices[0]
        this.current_index = 0
      } else {
        this.current_index += 1
      }
      nextChunk = JSON.parse(JSON.stringify(nextChunk))
      this.currentSlices.push(nextChunk)
      this.setItemHide(this.currentSlices[0].goodsList, 'next')
      this.setItemShow(this.currentSlices[1].goodsList, 'next')
    },
    async setItemShow(items, type) {
      const isNext = type === 'next'
      for (let i = 0; i < this.item_count; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        const index = isNext ? this.item_count - 1 - i : i
        if (items[index]) items[index].__opacity = 1
      }
    },
    async setItemHide(items, type) {
      this.done = false
      const isNext = type === 'next'
      for (let i = 0; i < this.item_count; i++) {
        const index = isNext ? this.item_count - 1 - i : i
        if (items[index]) items[index].__opacity = 0
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      this.currentSlices.splice(0, 1)
      this.done = true
    }
  }
}
</script>

<style scoped lang="scss">
.goods-corridor {
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 24px;
    &-title {
      color: #333333;
      font-size: 20px;
      font-weight: bold;
      line-height: 1.4;
    }
    &-subtitle {
      color: #333333;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.3;
      padding: 4px 0 0 8px;
    }
    &-right {
      position: relative;
      padding: 0 10px 0 8px;
      &::after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        border-right: 1px solid #0078b5;
        border-top: 1px solid #0078b5;
        bottom: 0;
        height: 7px;
        margin: auto 0;
        transform: rotate(45deg);
        width: 7px;
      }
    }
    &-more-text {
      color: #0078b5;
      font-size: 14px;
    }
  }
  &__goods {
    position: relative;
    height: 200px;
    &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #666666;
      font-size: 20px;
      font-weight: bold;
    }
    &-btn {
      position: absolute;
      top: 50%;
      left: 0;
      margin-top: -60px;
      color: #333333;
      width: 40px;
      height: 40px;
      cursor: pointer;
      &::before {
        background-color: #fff;
        border-radius: 100%;
        bottom: 0;
        box-shadow: 0 1.25px 6px rgba(0, 0, 0, .2);
        content: "";
        display: block;
        height: 32px;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        top: 0;
        width: 32px;
      }
      &:hover::before {
        background-color: #f7f7f7;
      }
      &::after {
        position: absolute;
        content: "";
        width: 9px;
        height: 9px;
      }
      &.pre::after {
        border-left: 2px solid #8f8f8f;
        border-top: 2px solid #8f8f8f;
        left: 16px;
        top: 14px;
        transform: rotate(-45deg);
      }
      &.next {
        left: auto;
        right: 0;
      }
      &.next::after {
        border-right: 2px solid #8f8f8f;
        border-top: 2px solid #8f8f8f;
        right: 16px;
        top: 14px;
        transform: rotate(45deg);
      }
    }
  }
  &__goods-list {
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    &-slice {
      position: absolute;
      top: 0;
      left: 20px;
      display: flex;
      width: calc(100% - 40px);
    }
  }
  &__goods-item {
    display: flex;
    flex-direction: column;
    width: calc(100% / var(--item-count));
    flex-shrink: 0;
    transition: opacity .2s ease;
    &-image {
      width: 150px;
      height: 110px;
      &-img {
        width: 100%;
        height: 100%;
      }
    }
    &-name {
      overflow: hidden;
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      margin: 6px 0;
      text-align: left;
      line-height: 20px;
      word-wrap: break-word;
      width: 150px;
      height: 59px;
      color: #333;
      font-size: 13px;
    }
    &-price {
      width: 150px;
      color: #e1251b;
      font-size: 14px;
      font-weight: bold;
      line-height: 20px;
      text-align: right;
    }
  }
}
</style>
