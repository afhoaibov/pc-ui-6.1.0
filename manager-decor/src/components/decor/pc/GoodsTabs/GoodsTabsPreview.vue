<template>
  <div class="goods-tabs">
    <div class="goods-tabs__title">
      <span class="goods-tabs__title-text">{{ $$FormData.title }}</span>
    </div>
    <div v-if="$$FormData.tabList && $$FormData.tabList.length" class="goods-tabs__body">
      <div class="goods-tabs__body-tabs">
        <div
          v-for="(tab, index) in $$FormData.tabList"
          :key="tab.__key"
          class="goods-tabs__body-tabs-item"
          :class="{ active: currentTabIndex === index}"
          @click="currentTabIndex = index"
        >
          <span>{{ tab.name }}</span>
        </div>
      </div>
      <div class="goods-tabs__body-cont">
        <div v-for="item in currentTab.imageList" :key="item.__key" class="goods-tabs__body-cont-item">
          <router-link :to="$$GetLinkValue(item.link)">
            <img
              v-if="item.image"
              :src="item.image.src"
              :alt="item.image.src"
              class="goods-tabs__body-cont-item-img"
            />
          </router-link>
        </div>
        <div v-for="goods in currentTab.goodsList" :key="goods.__key" class="goods-tabs__body-cont-item">
          <router-link
            :to="`/goods/${goods.goods_id}`"
            target="_blank"
            class="goods-tabs__goods"
          >
            <div class="goods-tabs__goods-image">
              <img
                :src="goods.goods_image"
                :alt="goods.goods_name"
                class="goods-tabs__goods-image-img"
              />
            </div>
            <div class="goods-tabs__goods-info">
              <h4 class="goods-tabs__goods-name">{{ goods.goods_name }}</h4>
              <div class="goods-tabs__goods-price">{{ goods.goods_price | unitPrice }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="goods-tabs__body empty">
      请添加品牌Tab
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsTabsPreview',
  data() {
    return {
      currentTabIndex: 0
    }
  },
  computed: {
    currentTab() {
      return this.$$FormData.tabList[this.currentTabIndex]
    }
  }
}
</script>

<style scoped lang="scss">
@media (min-width: 769px) {
  .goods-tabs {
    --grid-columns: 4;
  }
}
@media (min-width: 769px) {
  .goods-tabs {
    --grid-columns: 6;
  }
}
.goods-tabs {
  &__title {
    display: flex;
    align-items: center;
    padding: 16px 0;
    &-text {
      color: #191919;
      font-size: 20px;
      font-weight: bold;
    }
  }
  &__body {
    &-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: auto;
      &-item {
        cursor: pointer;
        padding: 8px;
        border-bottom: 4px solid transparent;
        &.active {
          border-bottom-color: #3732ff;
        }
      }
    }
    &-cont {
      display: grid;
      gap: 16px;
      margin-top: 16px;
      padding-bottom: 16px;
      grid-template-columns: repeat(var(--grid-columns), 1fr);
      grid-auto-flow: row dense;
      &-item {
        display: flex;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
        flex-direction: column;
        &-img {
          border-radius: 8px;
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
        }
      }
    }
  }
  &__body.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    color: #666666;
    font-size: 20px;
    font-weight: bold;
  }
  &__goods {
    &-image {
      position: relative;
      border: 1px solid #E4E7EB;
      border-radius: 8px;
      &-img {
        display: block;
        width: 80%;
        margin: auto;
        padding: 8px;
      }
    }
    &-info {
      margin-top: 8px;
    }
    &-name {
      color: #293847;
      font-size: 16px;
      font-weight: 400;
      max-height: 24px;
      line-height: 24px;
      display: -webkit-box;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    &-price {
      color: #f84343;
      font-size: 21px;
      font-weight: bold;
      line-height: 1.5;
    }
  }
}
</style>