<template>
  <div class="goods-search">
    <div
      class="goods-search__inner"
      :style="{
        height: $$FormData.frame_height + 20 + 'rpx'
      }"
    >
      <div class="goods-search__view" :style="{backgroundColor: $$FormData.background_color}">
        <div
          class="goods-search__filed"
          :class="[
            `goods-search__filed-${$$FormData.frame_style}`,
            `goods-search__filed-${$$FormData.text_position}`
          ]"
          :style="{
            backgroundColor: $$FormData.frame_color,
            color: $$FormData.text_color
          }"
        >
          <i class="goods-search__icon ri-search-line"></i>
          <label
            class="goods-search__box"
            :style="{
              height: $$FormData.frame_height + 'rpx'
            }"
          >
            <input
              placeholder="搜索商品"
              class="goods-search__input"
              :style="{color: $$FormData.text_color}"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsSearchPreview'
}
</script>

<style lang="scss" scoped>
.goods-search {
  position: relative;
  width: 100%;
  .goods-search__view {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10rpx 30rpx;
    box-sizing: border-box;
    .goods-search__filed {
      display: flex;
      align-items: center;
      flex: 1;
      transition: all ease .2s;
      &.goods-search__filed-square {
        border-radius: 8rpx;
      }
      &.goods-search__filed-round {
        border-radius: 40rpx;
      }
      &.goods-search__filed-center {
        justify-content: center;
        .goods-search__box {
          width: 160rpx;
          flex: none;
        }
      }
      .goods-search__icon {
        font-size: 32rpx;
        margin: 0 -4rpx 0 24rpx;
      }
      .goods-search__box {
        display: flex;
        align-items: center;
        flex: 1;
        padding: 0 20rpx;
        box-sizing: border-box;
      }
      .goods-search__input {
        border: none;
        outline: none;
        width: 100%;
        height: 48rpx;
        font-size: 28rpx;
        background-color: transparent;
        &::-webkit-input-placeholder {
          color: inherit;
          font-size: inherit;
        }
      }
    }
  }
}
</style>
