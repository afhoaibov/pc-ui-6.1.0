<template>
  <div class="link-editor" :class="{'show-image': showImage}">
    <draggable
      v-if="Array.isArray(links)"
      v-bind="dragOption"
      :list="links"
      :disabled="!sort"
      prevent-on-filter
      animation="200"
      filter=".ignore-drag"
      class="link-editor__list"
      :class="{'is-sort': sort}"
    >
      <transition-group>
        <div
          v-for="(item, index) in links"
          :key="item.__key"
          class="link-editor__item"
          :class="{hotarea: type === 'hotarea'}"
        >
          <div v-if="type === 'link'" class="link-editor__item-wrap">
            <div v-if="showImage" class="link-editor__item-image">
              <image-selector v-model="item.image" />
            </div>
            <div class="link-editor__item-info">
              <div class="item-info-label">
                <p v-if="showTitle" class="title-item-info">标题</p>
                <p v-if="showSubTitle" class="title-item-info">附标题</p>
                <p class="title-item-info">链接</p>
              </div>
              <div class="item-info-value">
                <el-input v-if="showTitle" v-model="item.title" :placeholder="titlePlaceholder" size="mini" class="ignore-drag" />
                <el-input v-if="showSubTitle" v-model="item.sub_title" :placeholder="subTitlePlaceholder" size="mini" class="ignore-drag" />
                <link-selector v-model="item.link" />
              </div>
            </div>
          </div>
          <div v-if="type === 'hotarea'" class="link-editor__item-wrap">
            <image-hotarea-editor v-model="links[index]" readonly />
          </div>
          <i v-if="multiple" class="ri-close-circle-fill del-icon" @click="handleDeleteItem(item, index)"></i>
        </div>
      </transition-group>
    </draggable>
    <div v-if="showAdd" class="link-editor__add" @click="handleAddItem">
      <i class="ri-add-line link-editor__add-icon"></i>
      <span>{{ addBtnText }}</span>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
export default {
  name: 'ImageLinkEditor',
  components: { Draggable },
  props: {
    value: {
      type: [Array, Object, String],
      required: true
    },
    // 是否为多个
    multiple: {
      type: Boolean,
      required: false,
      default: true
    },
    // 类型【link：链接，hotarea：热区】
    type: {
      type: String,
      required: false,
      default: 'link'
    },
    // 是否展示图片
    showImage: {
      type: Boolean,
      required: false,
      default: true
    },
    // 是否显示标题
    showTitle: {
      type: Boolean,
      required: false,
      default: true
    },
    // 是否可以输入附标题
    showSubTitle: {
      type: Boolean,
      required: false,
      default: false
    },
    // 最大个数限制
    limit: {
      type: Number,
      required: false,
      default: 1
    },
    // 添加文字
    addText: {
      type: String,
      required: false,
      default: ''
    },
    // 标题输入框占位
    titlePlaceholder: {
      type: String,
      required: false,
      default: ''
    },
    // 附标题输入框占位
    subTitlePlaceholder: {
      type: String,
      required: false,
      default: ''
    },
    // 是否可以排序
    sort: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      links: [],
      dragOption: {
        sort: true
      }
    }
  },
  model: { event: 'update', prop: 'value' },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (!this.multiple) {
          if (!newVal || !newVal.__key) newVal = this.handleMakeItem()
          this.links = [newVal]
          this.$emit('update', newVal)
        } else {
          this.links = newVal
        }
      }
    }
  },
  computed: {
    showAdd() {
      if (!this.multiple) return false
      return this.links.length < this.limit
    },
    addBtnText() {
      return this.addText || '添加'
    }
  },
  methods: {
    /**
     * 添加一项
     */
    handleAddItem() {
      if (!this.links) this.links = []
      if (this.links.length >= this.limit) {
        return this.$message.error(`超过最大个数${this.limit}个`)
      }
      this.links.push(this.handleMakeItem())
      this.$emit('update', this.links)
    },
    /**
     * 删除一项
     * @param item
     * @param index
     */
    handleDeleteItem(item, index) {
      this.links.splice(index, 1)
      this.$emit('update', this.links)
    },
    /**
     * 产生一个item
     * @returns {{image: string, __key: string, title: string}}
     */
    handleMakeItem() {
      const item = {
        __key: this.$$Foundation.uuid(),
        image: '',
        title: ''
      }
      if (this.showSubTitle) item.sub_title = ''
      if (this.type === 'link') item.link = ''
      if (this.type === 'hotarea') item.hotAreas = ''
      return item
    }
  }
}
</script>

<style lang="scss" scoped>
.link-editor {
  &.show-image {
    ::v-deep .link-selector__tag-content {
      max-width: 170px !important;
    }
  }
  .link-editor__list {
    &.is-sort .link-editor__item {
      cursor: move;
    }
    .link-editor__item {
      position: relative;
      box-sizing: border-box;
      background-color: #ffffff;
      box-shadow: 0 0 4px 0 rgba(10,42,97,0.2);
      user-select: none;
      padding: 0 12px;
      &.hotarea {
        padding: 0;
        .link-editor__item-wrap {
          padding: 0;
        }
      }
      & + .link-editor__item {
        margin-top: 12px;
      }
      &:hover .del-icon {
        display: block;
      }
      .del-icon {
        display: none;
        position: absolute;
        top: -10px;
        right: -10px;
        color: #bbbbbb;
        font-size: 20px;
        background-color: #ffffff;
        border-radius: 50%;
        cursor: pointer;
      }
      .link-editor__item-wrap {
        display: flex;
        align-items: center;
        padding: 6px 0;
        border-radius: 2px;
        overflow: hidden;
      }
    }
    .link-editor__item-image {
      flex-shrink: 0;
      margin-right: 12px;
    }
    .link-editor__item-info {
      flex: 1;
      display: flex;
      .item-info-label {
        flex-shrink: 0;
        margin-right: 16px;
        .title-item-info {
          min-height: 44px;
          color: #969799;
          font-size: 14px;
          line-height: 44px;
          white-space: nowrap;
        }
      }
      .item-info-value {
        flex: 1;
        &>div {
          display: flex;
          align-items: center;
          min-height: 44px;
        }
      }
    }
  }
  .link-editor__add {
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    padding: 9px 16px;
    border: 1px solid #155bd4;
    border-radius: 2px;
    color: #155bd4;
    background-color: #ffffff;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    user-select: none;
    transition: all ease .2s;
    &:hover {
      background-color: rgba(#155bd4, 0.1);
    }
    .link-editor__add-icon {
      margin-right: 5px;
    }
  }
  ::v-deep .link-selector__tag-content {
    max-width: 230px !important;
  }
}
</style>
