<template>
  <div class="goods-setting-selector">
    <span class="goods-title">添加商品</span>
    <draggable
      v-if="Array.isArray($$FormData.goodsList)"
      v-bind="{sort: true}"
      :list="$$FormData.goodsList"
      prevent-on-filter
      animation="200"
      filter=".ignore-drag"
      class="goods-list"
    >
      <transition-group>
        <div v-for="item in $$FormData.goodsList" :key="item.goods_id" class="item-goods">
          <img :src="item.goods_image" :alt="item.goods_name" class="goods-img" />
          <i class="ri-close-circle-fill del-icon" @click="handleDeleteGoods(item)"></i>
        </div>
        <div class="item-goods add ignore-drag" key="add-goods" @click="handleAddGoods">
          <i class="ri-add-line"></i>
        </div>
      </transition-group>
    </draggable>
    <en-goods-picker
			:lang="currentLang.code"
      :type="$$DecorType"
      :show="goods_picker_show"
      :default-data="defaultGoodsIds"
      @confirm="handleGoodsPickerConfirm"
      @close="goods_picker_show = false"
    />
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import { mapGetters } from 'vuex'

export default {
  name: 'GoodsSettingSelector',
  components: { Draggable },
  data() {
    return {
      goods_picker_show: false
    }
  },
  computed: {
    ...mapGetters(['currentLang']),
    defaultGoodsIds() {
      return this.$$FormData.goodsList.map(item => item.goods_id)
    }
  },
  methods: {
    /**
     * 添加商品
     */
    handleAddGoods() {
      this.goods_picker_show = true
    },
    /**
     * 删除商品
     * @param item
     */
    handleDeleteGoods(item) {
      const index = this.$$FormData.goodsList.findIndex(_item => _item.goods_id === item.goods_id)
      this.$$FormData.goodsList.splice(index, 1)
    },
    /**
     * 商品选择器确定
     * @param items
     */
    handleGoodsPickerConfirm(items) {
      items = JSON.parse(JSON.stringify(items))
      this.$$FormData.goodsList = items
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-setting-selector {
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: #ffffff;
  .goods-title {
    width: 100%;
    height: 30px;
    font-size: 14px;
    color: #969799;
    line-height: 18px;
    white-space: nowrap;
  }
  .goods-list {
    padding: 12px 16px;
    background-color: #f7f8fa;
    box-sizing: border-box;
    &>span {
      display: flex;
      flex-wrap: wrap;
    }
    .item-goods {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      padding: 0;
      margin: 5px 10px 5px 0;
      border: none;
      box-shadow: 0 0 4px 0 rgba(10,42,97,0.2);
      color: #155bd4;
      font-size: 14px;
      background-color: #ffffff;
      border-radius: 2px;
      cursor: move;
      &.add {
        cursor: pointer;
      }
      &:hover {
        .del-icon {
          display: block;
        }
        &:not(.add)::after {
          display: block;
        }
      }
      &::after {
        display: none;
        content: "";
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid #155bd4;
        border-radius: 2px;
        z-index: 1;
        pointer-events: none;
      }
      .goods-img {
        display: block;
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
      }
      .del-icon {
        display: none;
        position: absolute;
        z-index: 2;
        top: -10px;
        right: -10px;
        border-radius: 50%;
        color: #bbbbbb;
        font-size: 20px;
        background-color: #ffffff;
        line-height: normal;
        cursor: pointer;
      }
    }
  }
}
</style>
