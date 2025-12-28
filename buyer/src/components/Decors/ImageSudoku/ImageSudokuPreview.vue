<template>
  <div class="image-sudoku">
    <div
      v-for="(column, index) in $$FormData.columnList"
      :key="index"
      class="image-sudoku__column"
      :class="[`column-${column.type}`]"
    >
      <div
        v-for="(block, b_index) in column.blockList"
        :key="'b_' + b_index"
        class="image-sudoku__block"
      >
        <a
          v-if="column.type === 2"
          :href="$$GetLinkValue(block.head.link)"
          class="image-sudoku__title"
          target="_blank"
        >
          <span class="image-sudoku__title-text">{{ block.head.title }}</span>
          <span class="image-sudoku__title-sub">{{ block.head.sub_title }}</span>
        </a>
        <div class="image-sudoku__images">
          <a
            v-for="(link, l_index) in block.images"
            :key="'l_' + l_index"
            :href="$$GetLinkValue(link)"
            class="image-sudoku__block-lk"
            target="_blank"
          >
            <div v-if="link.image" class="image-sudoku__block-image">
              <img :src="link.image.src" :alt="block.title" />
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSudokuPreview'
}
</script>

<style lang="scss" scoped>
.image-sudoku {
  display: flex;
  width: 1210px;
  height: 370px;
  margin: 0 auto;
  &__column {
    width: 295px;
    height: 100%;
    & + .image-sudoku__column {
      margin-left: 10px;
    }
    &.column-2 {
      .image-sudoku__images {
        height: 100px;
        padding-left: 30px;
      }
      .image-sudoku__block {
        height: 180px;
        & + .image-sudoku__block {
          margin-top: 10px;
        }
      }
      .image-sudoku__block-image {
        width: 100px;
        height: 100px;
      }
    }
  }

  &__title {
    display: block;
    height: 30px;
    margin-left: 30px;
    margin-right: 10px;
    padding-top: 17px;
    padding-bottom: 13px;
    line-height: 30px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &-text {
      font-size: 22px;
      font-weight: 700;
      color: #333;
    }
    &-sub {
      font-size: 14px;
      color: #999;
      margin-left: 5px;
    }
  }

  &__images {
    display: flex;
    width: 100%;
    height: 100%;
    font-size: 0;
    line-height: 0;
    box-sizing: border-box;
  }

  &__block {
    width: 100%;
    height: 100%;
    background-color: #fff;
    &-lk {
      display: inline-block;
      width: 100%;
      height: 100%;
    }
    &-image {
      width: 100%;
      height: 100%;
      transition: opacity ease .3s;
      &:hover {
        opacity: 0.8;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
