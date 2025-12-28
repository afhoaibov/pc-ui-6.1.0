<template>
  <div class="magic-cube">
    <div v-if="showEmpty" class="magic-cube__empty"/>
    <!--UniApp非H5端不支持使用:style="styleObject"发方式-->
    <div
      v-else
      class="magic-cube__list"
      :style="{
        width: cubeStyles.width,
        height: cubeStyles.height,
        margin: cubeStyles.margin
      }"
    >
      <div
        v-for="(block, index) in $$FormData.blockList"
        :key="block.__key"
        class="magic-cube__block"
        :style="{
          width: blockStyles(block, index).width,
          height: blockStyles(block, index).height,
          top: blockStyles(block, index).top,
          left: blockStyles(block, index).left,
          margin: blockStyles(block, index).margin,
          backgroundImage: blockStyles(block, index).backgroundImage
        }"
      >
        <img
          v-if="block.link && block.link.image"
          :src="block.link.image.src"
          alt=""
          class="magic-cube__block-img"
        />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from './mixin'
export default {
  name: 'MagicCubePreview',
  mixins: [mixin],
  computed: {
    showEmpty() {
      const { blockList } = this.$$FormData
      if (!blockList.length) return true
      return !blockList.filter(item => item.link && item.link.image).length
    },
    cubeStyles() {
      const { image_space, page_edge, block_density } = this.$$FormData
      const size_x = block_density.split('x')[0]
      const size_y = block_density.split('x')[1]
      const size_r = size_y / size_x
      let margin = -image_space / 2
      let width = 750
      let height = this.getCubeHeight(750 / 2)

      // page_edge
      width -= page_edge * 2
      height -= (size_y / size_x * 2 * page_edge)
      // image_space
      width += image_space
      height += (image_space * size_r)

      return {
        margin: margin + 'rpx',
        width: width + 'rpx',
        height: height + 'rpx'
      }
    }
  },
  methods: {
    blockStyles(block, index) {
      const size = this.handleGetBlockSize(block)
      let margin, width, height, top, left

      width = size.width
      height = size.height
      top = size.top
      left = size.left
      margin = 0

      const { page_edge, image_space, magic_style } = this.$$FormData

      if (index === 0) left += page_edge
      margin += image_space / 2
      switch (magic_style) {
        case 'row-two':
          width -= page_edge * 2 / 2
          height -= page_edge * 2 / 2
          width -= image_space / 2
          height -= image_space / 2
          if (index === 1) left += image_space / 2
          break
        case 'row-three':
          if (index === 1) left += page_edge / 3
          if (index === 2) left -= page_edge / 3
          width -= page_edge * 2 / 3
          height -= page_edge * 2 / 3
          width -= image_space * 2 / 3
          height -= image_space * 2 / 3
          if (index === 1) left += image_space / 3
          if (index === 2) left += image_space * 2 / 3
          break
        case 'row-four':
          if (index === 1) left += page_edge / 2
          if (index === 3) left -= page_edge / 2
          width -= page_edge * 2 / 4
          height -= page_edge * 2 / 4
          width -= image_space * 3 / 4
          height -= image_space * 3 / 4
          if (index === 1) left += image_space / 4
          if (index === 2) left += image_space / 2
          if (index === 3) left += image_space * 3 / 4
          break
        case 'left-right-two':
          if (index === 2) left += page_edge
          if (index > 1) top -= page_edge
          width -= page_edge
          height -= page_edge
          width -= image_space / 2
          height -= image_space / 2
          if (index === 2 || index === 3) top += image_space / 2
          if (index === 1 || index === 3) left += image_space / 2
          break
        case 'left-one-right-two':
          width -= page_edge * block.width
          height -= page_edge * block.height
          top -= page_edge * block.y * block.height
          width -= image_space / 2
          if (index !== 0) {
            height -= image_space / 2
            left += image_space / 2
          }
          if (index === 2) top += image_space / 2
          break
        case 'top-one-bottom-two':
          width -= page_edge * block.width
          height -= page_edge * block.height
          top -= page_edge * block.y * block.height
          if (index === 1) left += page_edge
          height -= image_space / 2
          if (index !== 0) {
            width -= image_space / 2
            top += image_space / 2
          }
          if (index === 2) left += image_space / 2
          break
        case 'left-one-right-three':
          width -= page_edge * block.width
          height -= page_edge * block.height
          top -= page_edge * block.y * block.height
          if (index === 3) left -= page_edge / 2
          if (index !== 0) height -= image_space / 2
          if (index === 0 || index === 1) width -= image_space / 2
          if (index === 2 || index === 3) width -= image_space * 3 / 4
          if (index === 1 || index === 2) left += image_space / 2
          if (index === 3) left += image_space * 3 / 4
          if (index === 2 || index === 3) top += image_space / 2
          break
      }

      let image = ''
      if (block.link && block.link.image) image = block.link.image.src

      return {
        left: left + 'rpx',
        top: top + 'rpx',
        height: height + 'rpx',
        width: width + 'rpx',
        margin: margin + 'rpx',
        backgroundImage: `url(${image})`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.magic-cube {
  width: 100%;
  overflow: hidden;
  &__empty {
    background-image: url('../../../../assets/placeholder-magic-cube.png');
    background-size: cover;
    background-position: center center;
    width: 100%;
    height: 400rpx;
  }
  &__list {
    position: relative;
  }
  &__block {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: #ffffff;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    &-img {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
    }
  }
}
</style>
