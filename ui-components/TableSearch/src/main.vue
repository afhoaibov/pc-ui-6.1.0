<template>
  <div class="en-search">
    <div style="width: 330px">
      <el-input
        size="small"
        clearable
        :placeholder="placeholder||'请输入关键字'"
        v-model="keyword"
        @keyup.native.enter="search"
      >
        <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
      </el-input>
    </div>
    <div v-if="advanced">
      <el-popover
        ref="popover"
        placement="bottom-start"
        v-model="popoverVisible"
      >
        <div @click.stop :style="{ width: `${advancedWidth}px` }" class="el-search__advanced-content">
          <slot name="advanced-content"></slot>
        </div>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="popoverVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="advancedSearch">确定</el-button>
        </div>
        <el-button
          size="small"
          style="margin-left: 10px"
          slot="reference"
        >
          高级搜索
        </el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnTableSearch',
  props: {
    // 是否为高级搜索
    advanced: {
      type: Boolean,
      default: false
    },
    advancedWidth: {
      type: [Number, String],
      default: 500
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      keyword: '',
      popoverVisible: false,
      visible_del_popover: false,
      clearFuncs: [],
      clearFuncNames: ['clearValue', 'deleteSelected']
    }
  },
  methods: {
    /** 普通搜索 */
    search() {
      this.popoverVisible = false
      this.$emit('search', this.$data.keyword)
    },
    /** 高级搜索 */
    advancedSearch() {
      this.visible_del_popover = false
      this.popoverVisible = false
      this.$emit('advancedSearch', this.$data.keyword)
    },
    /** 递归查找组件清空的方法 */
    findClearValue(component) {
      let _this = this
      let clearFuncs = _this.clearFuncs
      let clearFuncNames = _this.clearFuncNames
      let $ch = component.$children
      $ch && $ch.length && $ch.forEach(function (item) {
        let funs = clearFuncNames.filter(function (name) {
          return typeof item[name] === 'function'
        })
        if (funs.length) {
          clearFuncs.push(item[funs[0]])
        } else {
          _this.findClearValue(item)
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.en-search {
  display: flex;
  justify-content: center;
  align-items: center;
}
.clean-form {
  color: #f56c6c;
  margin-right: 10px;
}
.el-search__advanced-content {
  ::v-deep .el-date-editor {
    width: 100%;
  }
}
</style>
