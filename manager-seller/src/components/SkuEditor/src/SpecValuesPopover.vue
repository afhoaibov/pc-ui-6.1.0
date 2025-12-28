<template>
  <div class="spec-values-popover">
    <div class="svp__body">
      <div class="svp__body-title">
        <el-input
          v-model="search_keyword"
          placeholder="搜索规格值"
          size="mini"
          prefix-icon="el-icon-search"
          clearable
          style="width: 150px"
        />
      </div>
      <div v-if="nested && !spec" class="svp__body-list empty">
        请从左侧选择规格
      </div>
      <div v-else class="svp__body-list">
        <el-button
          v-for="item in specValues"
          :key="item.id"
          class="svp__body-list-item"
          :class="{ selected: isSelected(item) }"
          @click="handleSelectSpecVal(item)"
        >
          {{ item.spec_value_name }}
        </el-button>
      </div>
    </div>
    <div class="svp__footer">
      <el-checkbox v-model="allChecked" @click.native.prevent="handleClickAllCheck">全选</el-checkbox>
      <div class="svp__footer-btn">
        <el-button class="sv-btn" @click="handleCancel">取消</el-button>
        <el-button type="danger" @click="handleConfirm">添加({{ selectedSpecValues.length }})</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as Helper from './helper'

export default {
  props: {
    spec: {
      type: Object | null,
      required: true
    },
    nested: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      allChecked: false,
      search_keyword: '',
      selectedSpecValues: []
    }
  },
  computed: {
    specValues() {
      if (!this.spec) return []
      return this.filterBySearchKeyword(this.spec.spec_values)
    }
  },
  watch: {
    selectedSpecValues: 'computedIsAllSelected',
    specValues: 'computedIsAllSelected',
    spec: 'initData'
  },
  methods: {
    // 选择规格值
    handleSelectSpecVal(item) {
      item = Helper.cloneJson(item)
      const index = this.selectedSpecValues.findIndex(sv => sv.id === item.id)
      if (index === -1) {
        this.selectedSpecValues.push(item)
      } else {
        this.selectedSpecValues.splice(index, 1)
      }
    },
    // 是否已选
    isSelected(item) {
      return this.selectedSpecValues.some(sv => sv.id === item.id)
    },
    // 全选框发生改变
    handleClickAllCheck() {
      if (!this.allChecked) {
        const inters = this.filterBySearchKeyword(this.specValues)
        let values = [...this.selectedSpecValues, ...inters]
        values = Helper.uniqueObjArr(values, 'id')
        values = Helper.cloneJson(values)
        this.selectedSpecValues = [...values]
      } else {
        this.selectedSpecValues = []
      }
    },
    // 通过搜索词过滤
    filterBySearchKeyword(values) {
      if (!values) return []
      const { search_keyword: keyword } = this
      return values.filter(item => {
        if (!keyword) return true
        return item.spec_value_name.indexOf(keyword) !== -1
      })
    },
    // 计算是否全选
    computedIsAllSelected() {
      const { selectedSpecValues: ss, specValues: sv } = this
      if (ss.length === 0 || sv.length === 0) {
        this.allChecked = false
      } else {
        const inters = ss.filter(item => sv.some(v => v.id === item.id))
        const isSelectedArr = inters.filter(item => this.isSelected(item))
        this.allChecked = isSelectedArr.length === sv.length
      }
    },
    // 初始化数据
    initData() {
      this.allChecked = false
      this.search_keyword = ''
      this.selectedSpecValues = []
    },
    // 确认添加
    handleConfirm() {
      const { selectedSpecValues: spv } = this
      if (spv.length === 0) return this.$message.error('请至少选择一项规格值！')
      const spec = Helper.cloneJson(this.spec)
      spec.spec_values = Helper.cloneJson(spv)
      this.$emit('handle-add', spec)
      this.closePopover()
    },
    // 取消
    handleCancel() {
      this.closePopover()
      if (this.nested) {
        this.$emit('handle-cancel')
      }
    },
    // 关闭弹窗
    closePopover() {
      this.initData()
      if (this.nested) return
      this.$parent.showPopper = false
    }
  }
}
</script>

<style lang="scss" scoped>
.sv-btn {
  color: #333333;
  background-color: #f5f5f5;
  border-color: #dddddd;
}
.spec-values-popover {
  display: flex;
  flex-direction: column;
  width: 500px;
  background-color: #fff;
  .svp__body {
    display: flex;
    flex-direction: column;
    height: 250px;
    padding: 16px;
    .svp__body-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      h4 {
        font-size: 14px;
        color: #333333;
        font-weight: bold;
        margin: 0;
        padding: 0;
      }
    }
    .svp__body-list {
      display: flex;
      flex-wrap: wrap;
      margin-top: 16px;
      &.empty {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      }
    }
    .svp__body-list-item {
      color: #606266;
      background: #FFF;
      border: 1px solid #DCDFE6;
      margin-bottom: 10px;
      margin-left: 0;
      margin-right: 10px;
      &:hover,
      &.selected {
        background-color: #f5f5f5;
      }
      &.selected {
        color: #409EFF;
        border-color: #409EFF;
      }
    }
  }
  .svp__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    border-top: 1px solid #dddddd;
    padding: 0 16px 10px;
    box-sizing: content-box;
    .svp__footer-btn {
      margin-top: 10px;
    }
  }
}
</style>