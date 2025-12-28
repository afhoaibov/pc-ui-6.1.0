<template>
  <div class="image-hotarea-editor" :class="{'image-hotarea-editor__empty-image': !hotArea.image}">
    <div class="image-hotarea-editor__inner">
      <div class="image-hotarea-editor__content" @click="handleOpenDialog">
        <img
					v-if="hotArea.image"
          :src="hotArea.image.src"
          alt
          class="image-hotarea-editor__content-img"
          @load="handlePreviewImageLoad"
        />
				<div
						v-for="(area, index) in previewAreas"
						:key="area.__key"
						class="image-hotarea-editor__area"
						:style="{
							transform: `translate(${area.x}px, ${area.y}px)`,
							width: area.width + 'px',
							height: area.height + 'px',
							zIndex: opt_index === index ? 2 : 1
						}"
					>
						<link-selector v-model="area.link" disabled />
					</div>
      </div>
    </div>
    <image-selector v-if="!hotArea.image" v-model="hotArea.image" />
    <el-dialog
      title="热区编辑器"
      :visible.sync="showDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="600px"
      style="cursor: auto"
    >
      <div class="image-hotarea-editor__dialog">
        <div class="image-hotarea-editor_steps">
          <span class="step-hotarea">
              <span class="step-num">1</span>
              <span class="step-text">添加热区</span>
              <span>-</span>
            </span>
          <span class="step-hotarea">
              <span class="step-num">2</span>
              <span class="step-text">调整热区大小和位置</span>
              <span>-</span>
            </span>
          <span class="step-hotarea">
              <span class="step-num">3</span>
              <span class="step-text">设置关联链接</span>
              <span>-</span>
            </span>
          <span class="step-hotarea">
              <span class="step-num">4</span>
              <span class="step-text">保存生效</span>
              <span></span>
            </span>
        </div>
        <div class="image-hotarea-editor__content" style="min-height: 200px; border: 1px solid #cccccc">
          <img
            :src="hotArea.image.src"
            alt
            class="image-hotarea-editor__content-img"
            @load="handleImageLoad"
          />
          <div
            v-for="(area, index) in hotArea.hotAreas"
            :key="area.__key"
            class="image-hotarea-editor__area"
            :style="{
              transform: `translate(${area.x}px, ${area.y}px)`,
              width: area.width + 'px',
              height: area.height + 'px',
              zIndex: opt_index === index ? 2 : 1
            }"
            :area-index="index"
            @mousedown="handleMousedown('main', index, $event)"
            @mouseup="clearOpt"
          >
            <div class="image-hotarea-editor__area-del-icon" @click="handleDeleteArea(area, index)">x</div>
            <div class="image-hotarea-editor__area-opts">
              <div
                v-for="(opt, opt_index) in operateSpaces"
                :key="opt_index"
                class="opt-area"
                :style="{
                  top: opt.top,
                  right: opt.right,
                  bottom: opt.bottom,
                  left: opt.left,
                  width: opt.width,
                  height: opt.height,
                  cursor: opt.cursor,
                }"
                @mousedown.stop="handleMousedown(opt.type, index, $event)"
              >
              </div>
            </div>
            <link-selector v-model="area.link" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleAddHotarea">添加热区</el-button>
        <el-button @click="handleSaveHotarea">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const CLASS_LIST = ['image-hotarea-editor__area', 'opt-area', 'el-input__inner', 'el-input__icon', 'image-hotarea-editor__content-img', 'image-hotarea-editor__content', 'el-tag', 'link-selector__tag-content', 'image-hotarea-editor__area-del-icon']

export default {
  name: 'ImageHotareaEditor',
  props: {
    value: {
      type: [Object, String],
      required: true
    },
    // 是否只读
    readonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  model: { event: 'update', prop: 'value' },
  watch: {
    value: {
      immediate: true,
      handler: 'handleDefaultChange'
    },
    'hotArea.image': {
      deep: true,
      handler(newVal) {
        if (!newVal) return
        this.$emit('update', this.hotArea)
      }
    }
  },
  data() {
    return {
      hotArea: '',
      previewAreas: [],
      showDialog: false,
      operateSpaces: [
        { width: '100%', height: '10px', top: '-5px', left: 0, cursor: 'row-resize', type: 'top' },
        { width: '10px', height: '100%', top: 0, right: '-5px', cursor: 'col-resize', type: 'right' },
        { width: '100%', height: '10px', bottom: '-5px', left:0, cursor: 'row-resize', type: 'bottom' },
        { width: '10px', height: '100%', top: 0, left: '-5px', cursor: 'col-resize', type: 'left' },
        { width: '20px', height: '20px', right: '-10px', top: '-10px', cursor: 'ne-resize', type: 'top-right' },
        { width: '20px', height: '20px', right: '-10px', bottom: '-10px', cursor: 'se-resize', type: 'bottom-right' },
        { width: '20px', height: '20px', left: '-10px', bottom: '-10px', cursor: 'sw-resize', type: 'bottom-left' },
        { width: '20px', height: '20px', left: '-10px', top: '-10px', cursor: 'nw-resize', type: 'top-left' }
      ],
      opt_type: '',
      opt_index: 0,
      opt_start_x: 0,
      opt_start_y: 0,
      opt_timer: null,
      opt_max_height: 200,
      img_height: 0,
      pre_img_height: 0
    }
  },
  mounted() {
    document.body.addEventListener('mousemove', this.handleDocMousemove.bind(this))
    document.body.addEventListener('mouseup', this.clearOpt.bind(this))
  },
  destroyed() {
    document.body.removeEventListener('mousemove', this.handleDocMousemove.bind(this))
    document.body.removeEventListener('mouseup', this.clearOpt.bind(this))
  },
  methods: {
    handleOpenDialog() {
      this.showDialog = true
      const { hotAreas } = this.hotArea
      if (!hotAreas || !hotAreas.length) {
        this.handleAddHotarea()
      }
    },
    /**
     * 添加热区
     */
    handleAddHotarea() {
      if (!this.hotArea.hotAreas) {
        this.hotArea.hotAreas = []
      }
      this.hotArea.hotAreas.push({
        __key: this.$$Foundation.uuid(),
        x: 0,
        y: 0,
        width: 115,
        height: 115,
        link: ''
      })
      this.opt_index = this.hotArea.hotAreas.length - 1
    },
    /**
     * 删除热区
     * @param item
     * @param index
     */
    handleDeleteArea(item, index) {
      this.hotArea.hotAreas.splice(index, 1)
    },
    /**
     * 按下鼠标
     * @param type
     * @param index
     * @param event
     */
    handleMousedown(type, index, event) {
      this.opt_type = type
      this.opt_index = index
      this.opt_start_x = event.clientX
      this.opt_start_y = event.clientY
    },
    /**
     * 热区移动、大小调整
     * @param event
     */
    handleDocMousemove(event) {
      if (!this.showDialog || !this.opt_type) return
      if (!CLASS_LIST.some(name => event.target.classList.contains(name))) {
        this.clearOpt()
        return
      }
      let moveX = event.clientX - this.opt_start_x
      let moveY = event.clientY - this.opt_start_y
      const area = this.hotArea.hotAreas[this.opt_index]
      switch (this.opt_type) {
        case 'main':
          area.x += moveX;
          area.y += moveY;
          break;
        case 'top':
          area.y += moveY
          area.height -= moveY
          break
        case 'right':
          area.width += moveX
          break
        case 'bottom':
          area.height += moveY
          break
        case 'left':
          area.x += moveX
          area.width -= moveX
          break
        case 'top-right':
          area.y += moveY
          area.width += moveX
          area.height -= moveY
          break
        case 'bottom-right':
          area.width += moveX
          area.height += moveY
          break
        case 'bottom-left':
          area.x += moveX
          area.width -= moveX
          area.height += moveY
          break
        case 'top-left':
          area.x += moveX
          area.y += moveY
          area.width -= moveX
          area.height -= moveY
          break
      }
      if (area.x < 0) area.x = 0
      if (area.y < 0) area.y = 0
      if (area.x > (560 - area.width)) {
        area.x = 560 - area.width
      }
      if (area.y > (this.opt_max_height - area.height)) {
        area.y = this.opt_max_height - area.height
      }
      if (area.width < 65) area.width = 65
      if (area.height < 30) area.height = 30
      this.$set(this.hotArea.hotAreas, this.opt_index, area)
      this.opt_start_x = event.clientX
      this.opt_start_y = event.clientY
    },
    /**
     * 图片加载完成
     * @param event
     */
    handleImageLoad(event) {
      const imgHeight = event.target.offsetHeight
      this.img_height = imgHeight
      this.opt_max_height = imgHeight > 200 ? imgHeight : 200
      if (this.$$IsMobile) return
      const hotAreas = this.$$Foundation.cloneDeep(this.hotArea.hotAreas)
      this.hotArea.hotAreas = this.getNoPerHotAreas(hotAreas, 560, this.img_height)
    },
    /**
     * 预览图片加载完成
     * @param event
     */
    handlePreviewImageLoad(event) {
      this.pre_img_height = event.target.offsetHeight
      if (this.$$IsMobile) return
      const hotAreas = this.$$Foundation.cloneDeep(this.hotArea.hotAreas)
      this.previewAreas = this.getNoPerHotAreas(hotAreas, 348, this.pre_img_height)
    },
    handleSaveHotarea() {
      const hotArea = this.$$Foundation.cloneDeep(this.hotArea)
      const preHotArea = this.$$Foundation.cloneDeep(this.hotArea)
      if (this.$$IsMobile) {
        hotArea.hotAreas = this.computedHotAreasSize(hotArea.hotAreas, 750, 560)
        this.previewAreas = this.computedHotAreasSize(preHotArea.hotAreas, 348, 560)
      } else {
        hotArea.hotAreas = this.computedHotAreasPer(hotArea.hotAreas, 560, this.img_height)
        this.previewAreas = this.getNoPerHotAreas(hotArea.hotAreas, 348, this.pre_img_height)
      }
      this.$emit('update', hotArea)
      this.showDialog = false
    },
    computedHotAreasPer(hotAreas, width, height) {
      const areas = this.$$Foundation.cloneDeep(hotAreas)
      return areas.map(area => {
        area.x = `${area.x / width * 100}%`
        area.y = `${area.y / height * 100}%`
        area.width = `${area.width / width * 100}%`
        area.height = `${area.height / height * 100}%`
        return area
      })
    },
    getNoPerHotAreas(hotAreas, width, height) {
      if (!hotAreas || !Array.isArray(hotAreas)) return hotAreas
      const areas = this.$$Foundation.cloneDeep(hotAreas)
      return areas.map(item => {
        if (String(item.x).includes('%')) {
          item.x = Math.round(Number(String(item.x).replace('%', '')) / 100 * width)
        }
        if (String(item.y).includes('%')) {
          item.y = Math.round(Number(String(item.y).replace('%', '')) / 100 * height)
        }
        if (String(item.width).includes('%')) {
          item.width = Math.round(Number(String(item.width).replace('%', '')) / 100 * width)
        }
        if (String(item.height).includes('%')) {
          item.height = Math.round(Number(String(item.height).replace('%', '')) / 100 * height)
        }
        return item
      })
    },
    /**
     * 清理操作数据
     */
    clearOpt() {
      this.opt_type = ''
      this.opt_start_x = 0
      this.opt_start_y = 0
    },
    /**
     * 计算热区各种大小
     * @param areas
     * @param width
     * @param design_width
     * @returns {*}
     */
    computedHotAreasSize(areas, width, design_width) {
      if (!Array.isArray(areas)) return areas
      const _areas = this.$$Foundation.cloneDeep(areas)
      const ratios = ['width', 'height', 'x', 'y']
      return _areas.map(item => {
        ratios.forEach(key => item[key] = (width / design_width) * item[key])
        return item
      })
    },
    /**
     * 默认值发生改变
     * @param newVal
     */
    handleDefaultChange(newVal) {
      if (this.hotArea) return
      const hotArea = this.$$Foundation.cloneDeep(newVal)
      if (this.$$IsMobile) {
        hotArea.hotAreas = this.computedHotAreasSize(hotArea.hotAreas, 560, 750)
        this.previewAreas = this.computedHotAreasSize(hotArea.hotAreas, 348, 560)
      }
      this.hotArea = hotArea
    }
  }
}
</script>

<style lang="scss" scoped>
.image-hotarea-editor {
  position: relative;
	min-height: 70px;
  width: 100%;
  &__inner {
    width: 100%;
    .image-hotarea-editor__content {
      cursor: pointer;
    }
    .image-hotarea-editor__area {
      cursor: pointer !important;
    }
    ::v-deep .link-selector .el-input__inner {
      cursor: pointer;
    }
  }
  &__image {
    width: 100%;
    cursor: pointer;
  }
  &__empty-image .image-selector {
    height: 100% !important;
  }
  ::v-deep .image-selector {
    padding: 6px;
    z-index: 10;
    bottom: 0;
    top: 0;
    width: 100%;
    border: 0;
    border-radius: 0 0 2px 2px;
  }
  ::v-deep .image-selector__change {
    height: 100%;
    line-height: 28px;
  }
  ::v-deep .image-selector__image-img {
    display: none;
  }
  ::v-deep .el-dialog__body {
    padding: 16px 20px;
  }
  ::v-deep .image-hotarea-editor__dialog {
    max-width: 600px;
    box-sizing: border-box;
  }
  ::v-deep .image-hotarea-editor_steps {
    color: #969799;
    margin-bottom: 12px;
    .step-hotarea {
      margin-right: 10px;
    }
    .step-num {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      border: 1px solid #e5e5e5;
      border-radius: 13px;
      text-align: center;
    }
    .step-text {
      margin: 0 10px;
    }
  }
  ::v-deep .image-hotarea-editor__content {
    position: relative;
    max-height: 420px;
    min-height: 50px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    .image-hotarea-editor__content-img {
      width: 100%;
      height: 100%;
      user-select: none;
    }
    .image-hotarea-editor__area {
      position: absolute;
      top: 0;
      left: 0;
      color: #ffffff;
      font-size: 12px;
      border: 1px solid #155bd4;
      background-color: rgba(51,136,255,.5);
      cursor: move;
      user-select: auto;
      touch-action: none;
      box-sizing: border-box;
      &:hover .image-hotarea-editor__area-del-icon {
        display: block;
      }
      .image-hotarea-editor__area-del-icon {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        line-height: 15px;
        border-radius: 9px;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        background-color: rgba(0,0,0,.5);
        display: none;
        z-index: 2;
      }
    }
    .image-hotarea-editor__area-opts {
      .opt-area {
        position: absolute;
        user-select: none;
      }
    }
    .link-selector {
      position: absolute;
      bottom: 0;
      .el-input__inner {
        background-color: rgba(0,0,0,.5);
        border-radius: 0;
        border: none;
      }
      .el-tag {
        border-right: 0;
        border-bottom: 0;
        border-left: 0;
        border-radius: 0;
      }
    }
  }
}
</style>
