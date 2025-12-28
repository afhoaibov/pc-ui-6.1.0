<template>
  <div class="area-dropdown" @mouseenter="show_children = true">
    <el-checkbox
      v-model="checked"
      :indeterminate="indeterminate"
      :disabled="area.__disabled"
      @click.native.stop
      @change="handleClickItem"
    />
    <el-popover
      :placement="child ? 'right' : 'bottom'"
      trigger="hover"
      :disabled="!hasChildren"
      :open-delay="child ? 200 : 300"
      :append-to-body="false"
    >
      <div slot="reference" class="area-dropdown__label">
        {{ area.name }}
        <span v-if="hasChildren && deepCheckedLength.checked !== 0" class="area-dropdown__label-num">
          ({{ deepCheckedLength.checked }})
        </span>
        <div class="area-dropdown__label_div">
          <template v-if="hasChildren">
            <i v-if="child" class="el-icon-arrow-right"></i>
            <i v-else class="el-icon-arrow-down"></i>
          </template>
        </div>
      </div>
      <div v-if="show_children && hasChildren" class="area-dropdown__list">
        <area-dropdown
          v-for="item in area.children"
          :key="item.__key"
          :area="item"
          :area-util="areaUtil"
        />
      </div>
    </el-popover>
  </div>
</template>

<script>
import AreaUtil from './AreaUtil'
export default {
  name: 'AreaDropdown',
  props: {
    area: {
      type: Object,
      required: true
    },
    child: {
      type: Boolean,
      required: false,
      default: true
    },
    areaUtil: {
      type: AreaUtil,
      required: true
    }
  },
  data() {
    return {
      show_children: false
    }
  },
  computed: {
    /**
     * 是否还有子集
     * @returns {boolean}
     */
    hasChildren() {
      return this.areaUtil.hasChildren(this.area)
    },
    /**
     * 是否是选中状态
     * @returns {boolean}
     */
    checked: {
      get() {
        let { checked } = this.area
        if (this.indeterminate) {
          checked = false
        } else if (this.hasChildren) {
          checked = this.deepCheckedLength.allChecked
        }
        this.$set(this.area, 'checked', checked)
        return checked
      },
      set(val) {
        this.$set(this.area, 'checked', val)
      }
    },
    /**
     * 计算是否是不确定状态
     * @returns {boolean}
     */
    indeterminate() {
      let { children, __indeterminate: indeterminate } = this.area
      // 如果没有子集，indeterminate存在没有意义，设置为false
      if (!this.hasChildren) {
        indeterminate = false
      } else {
        // 这里检查一下子集中是否包含有indeterminate为true的
        // 如果有的话，那这里的indeterminate直接设为true就可以了
        if (children.some(item => item.__indeterminate === true)) {
          indeterminate = true
        } else {
          // 考虑初始数据没有渲染的情况
          const { length, checked } = this.deepCheckedLength
          indeterminate = checked !== 0 && length !== checked
        }
      }
      this.$set(this.area, '__indeterminate', indeterminate)
      return indeterminate
    },
    /**
     * 深度计算选中集合长度
     * @returns {object}
     */
    deepCheckedLength() {
      if (!this.hasChildren) return this.checked ? 1 : 0
      return this.areaUtil.getChildrenLengthDeep(this.area.children)
    }
  },
  methods: {
    /**
     * CheckBox值发生改变
     * @param value
     * @param event
     */
    handleClickItem(value, event) {
      let { checked } = event.target
      this.$set(this.area, 'checked', checked)
      const { children } = this.area
      if (Array.isArray(children)) {
        // 递归设置子项的checked值
        this.areaUtil.setChildrenCheckboxDeep(children, checked)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.area-dropdown {
  display: flex;
  align-items: center;
  width: 25%;
  height: 30px;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  ::v-deep .el-checkbox {
    margin-right: 5px;
  }
  .area-dropdown__label {
    display: flex;
    align-items: center;
    width: 100%;
    ::v-deep .el-checkbox__label {
      color: inherit;
    }
    .area-dropdown__label-num {
      flex-shrink: 0;
      color: #409EFF;
    }
  }
  .area-dropdown__list {
    max-height: 320px;
    overflow-y: auto;
    .area-dropdown {
      width: 100%;
    }
  }
}
</style>
