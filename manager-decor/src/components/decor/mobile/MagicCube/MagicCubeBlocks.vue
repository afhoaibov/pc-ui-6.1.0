<template>
  <div class="magic-cube-blocks">
    <div class="header-setting">
      <div class="header-setting__label">魔方布局</div>
    </div>
    <div class="body-setting">
      <div class="body-setting__tip">
        {{ $$FormData.magic_style === 'custom' ? '移动鼠标选定布局区域大小' : '选定布局区域，在下方添加图片，建议添加比例一致的图片' }}
      </div>
      <div class="magic-cube-blocks__list" :style="{height: getCubeHeight(348 / 2) + 'px'}">
        <div
          v-for="block in $$FormData.blockList"
          :key="block.__key"
          class="magic-cube-blocks__block"
          :style="{
            width: blockSize(block).width + 'px',
            height: blockSize(block).height + 'px',
            top: blockSize(block).top + 'px',
            left: blockSize(block).left + 'px',
            backgroundImage: `url(${(block.link && block.link.image) ? block.link.image.src : ''})`
          }"
          :class="{
            'has-content': !!block.link,
            selected: currentBlock.__key === block.__key
          }"
          @click.stop="handleClickBlock(block)"
        >
          <img
            v-if="block.link && block.link.image"
            :src="block.link.image.src"
            alt=""
            class="magic-cube-blocks__block-img"
          />
          <div v-else class="magic-cube-blocks__block-tip">
            {{ blockTip(block) }}
            <p>或同等比例</p>
          </div>
        </div>
      </div>
      <div v-if="currentBlock" class="magic-cube-blocks__image">
        <image-link-editor v-model="currentBlock.link" :multiple="false" :show-title="false" />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from './mixin'
import { uuid } from '@/utils/foundation'

export default {
  name: 'MagicCubeBlocks',
  mixins: [mixin],
  data() {
    return {
      startOffset: [],
      currentBlock: ''
    }
  },
  watch: {
    '$$FormData.block_density'() {
      this.startOffset = []
      this.$$FormData.blockList = []
    },
    '$$FormData.magic_style': 'handleStyleChange'
  },
  mounted() {
    const { blockList } = this.$$FormData
    if (blockList.length) return
    this.$$FormData.blockList = [...new Array(2)]
      .map((_, index) => this.handleMakeBlock(1, 1, index, 0))
    this.currentBlock = this.$$FormData.blockList[0] || ''
  },
  methods: {
    handleClickItem(x, y) {
      if (this.$$FormData.magic_style !== 'custom') return
      const { startOffset } = this
      if (!startOffset.length) {
        this.startOffset = [x, y]
      } else {
        let s_x = startOffset[0]
        let s_y = startOffset[1]
        const b_w = Math.abs(y - s_y) + 1
        const b_h = Math.abs(y - s_y) + 1
        const b_x = x >= s_x ? s_x : x
        const b_y = y >= s_y ? s_y : y
        const block = this.handleMakeBlock(b_w, b_h, b_x, b_y)
        this.$$FormData.blockList.push(block)
        this.startOffset = []
      }
    },
    handleStyleChange(style) {
      let blocks
      let block_density
      switch (style) {
        case 'row-two':
          block_density = '2x1'
          blocks = blocks = [...new Array(2)]
            .map((_, index) => this.handleMakeBlock(1, 1, index, 0))
          break
        case 'row-three':
          block_density = '3x1'
          blocks = [...new Array(3)]
            .map((_, index) => this.handleMakeBlock(2/3, 2/3, index * 2 / 3, 0))
          break
        case 'row-four':
          block_density = '4x1'
          blocks = [...new Array(4)]
            .map((_, index) => this.handleMakeBlock(2/4, 2/4, index * 2 / 4, 0))
          break
        case 'left-right-two':
          block_density = '2x2'
          blocks = [
            this.handleMakeBlock(1, 1, 0, 0),
            this.handleMakeBlock(1, 1, 1, 0),
            this.handleMakeBlock(1, 1, 0, 1),
            this.handleMakeBlock(1, 1, 1, 1)
          ]
          break
        case 'left-one-right-two':
          block_density = '2x2'
          blocks = [
            this.handleMakeBlock(1, 2, 0, 0),
            this.handleMakeBlock(1, 1, 1, 0),
            this.handleMakeBlock(1, 1, 1, 1)
          ]
          break
        case 'top-one-bottom-two':
          block_density = '2x2'
          blocks = [
            this.handleMakeBlock(2, 1, 0, 0),
            this.handleMakeBlock(1, 1, 0, 1),
            this.handleMakeBlock(1, 1, 1, 1)
          ]
          break
        case 'left-one-right-three':
          block_density = '4x4'
          blocks = [
            this.handleMakeBlock(1, 2, 0, 0),
            this.handleMakeBlock(1, 1, 1, 0),
            this.handleMakeBlock(0.5, 1, 1, 1),
            this.handleMakeBlock(0.5, 1, 1.5, 1)
          ]
          break
        case 'custom':
          block_density = '4x4'
          blocks = []
      }
      this.$$FormData.block_density = block_density
      blocks.forEach((item, index) => {
        const { blockList } = this.$$FormData
        const _item = blockList[index]
         item.link = _item ? this.$$Foundation.cloneDeep(_item.link) : ''
      })
      this.$nextTick(() => {
        this.$$FormData.blockList = blocks
        this.currentBlock = blocks[0] || ''
      })
    },
    handleMakeBlock(w, h, x, y) {
      return {
        __key: uuid(),
        width: w,
        height: h,
        x: x,
        y: y,
        link: ''
      }
    },
    handleClickBlock(block) {
      this.currentBlock = block
    },
    blockTip(block) {
      const blockSize = this.handleGetBlockSize(block, 750)
      const p = Math.ceil
      return `${p(blockSize.width)}x${p(blockSize.height)}像素`
    },
    blockSize(block) {
      return this.handleGetBlockSize(block, 348 / 2)
    }
  }
}
</script>

<style lang="scss" scoped>
.magic-cube-blocks {
  .body-setting {
    overflow: hidden;
  }
  &__list {
    position: relative;
    width: 348px;
    margin-top: 10px;
    clear: both;
    overflow: hidden;
  }
  &__ul {
    float: left;
    list-style: none;
    padding: 0;
    margin: 0;
    &:last-child .magic-cube-blocks__li {
      border-right: 1px solid #e5e5e5;
    }
  }
  &__li {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f8f8;
    border-left: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
    text-align: center;
    &:first-child {
      border-top: 1px solid #e5e5e5;
    }
    &-icon {
      color: #bbb;
      font-size: 20px;
    }
  }
  &__block {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: #ffffff;
    border: 1px solid #ebedf0;
    color: #155bd4;
    z-index: 2;
    cursor: pointer;
    box-sizing: border-box;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    &.has-content {
      border-width: 0;
    }
    &.selected {
      border-width: 1px;
      border-color: #155bd4;
      background-color: #e0edff;
      cursor: auto;
      z-index: 3;
    }
    &-tip {
      text-align: center;
      color: #7d7e80;
      font-size: 12px;
    }
    &-img {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
    }
  }
  &__image {
    margin-top: 10px;
  }
}
</style>
