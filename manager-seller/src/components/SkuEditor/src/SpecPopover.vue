<template>
  <div class="spec--popover">
    <div class="spec-list-box">
      <div class="spec-search">
        <el-input
          v-model="search_keyword"
          placeholder="搜索规格"
          size="mini"
          prefix-icon="el-icon-search"
          clearable
        />
      </div>
      <div v-if="specs.length === 0" class="spec-list empty">
        暂无规格
      </div>
      <div v-else class="spec-list">
        <div
          v-for="item in specs"
          :key="item.spec_group_name"
          class="spec-item"
          :class="{active: specActive(item), disabled: isSelected(item)}"
          @click="handleSelectSpec(item)"
        >
          <div class="spec-item-body">
            <span>{{ item.spec_group_name }}</span>
            <i class="el-icon-arrow-right"></i>
          </div>
          <p v-if="isSelected(item)" class="spec-item-tip">该规格已存在，不可重复添加</p>
        </div>
      </div>
    </div>
    <div class="spec-values">
      <spec-values-popover :spec="selectedSpec" nested @handle-add="handleAddSpec" @handle-cancel="handleCancel"/>
    </div>
  </div>
</template>

<script>
import * as Helper from './helper'
import SpecValuesPopover from './SpecValuesPopover'

export default {
  components: { SpecValuesPopover },
  props: {
    specList: {
      type: Array,
      required: true
    },
    selected: {
      type: Array,
      required: false,
      default: () => ([])
    }
  },
  data() {
    return {
      search_keyword: '',
      selectedSpec: null
    }
  },
  computed: {
    specs() {
      return this.filterBySearchKeyword(this.specList)
    }
  },
  methods: {
    // 选择规格
    handleSelectSpec(spec) {
      if (this.isSelected(spec)) return
      this.selectedSpec = Helper.cloneJson(spec)
    },
    // 激活的
    specActive(item) {
      const { selectedSpec: sp } = this
      if (!sp) return false
      return item.spec_group_name === sp.spec_group_name
    },
    // 通过搜索词过滤
    filterBySearchKeyword(values) {
      const { search_keyword: keyword } = this
      return values.filter(item => {
        if (!keyword) return true
        return item.spec_group_name.indexOf(keyword) !== -1
      })
    },
    // 添加规格
    handleAddSpec(spec) {
      this.initData()
      this.$emit('handle-add', spec)
      this.$parent.showPopper = false
    },
    // 取消
    handleCancel() {
      this.initData()
      this.$parent.showPopper = false
    },
    // 是否已选择规格
    isSelected(spec) {
      return Helper.isSelectedSpec(spec, this.selected)
    },
    initData() {
      this.search_keyword = ''
      this.selectedSpec = null
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
.spec--popover {
  display: flex;
  justify-content: space-between;
  .spec-list-box {
    display: flex;
    flex-direction: column;
    width: 220px;
    height: 311px;
    overflow: hidden;
    background-color: #fafafa;
    border-right: 1px solid #dddddd;
    .spec-search {
      padding: 16px;
      height: 60px;
      border-bottom: 1px solid #dddddd;
    }
    .spec-list {
      height: 250px;
      overflow-y: auto;
      &.empty {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      }
    }
    .spec-item {
      display: flex;
      flex-direction: column;
      padding: 8px 16px;
      box-sizing: content-box;
      border-bottom: 1px solid #dddddd;
      cursor: pointer;
      &.active {
        font-weight: bold;
        background-color: #ffffff;
        color: #409EFF;
      }
      &.disabled {
        color: #cacaca;
        cursor: not-allowed;
      }
      &:last-child {
        border-bottom: none;
      }
      .spec-item-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 20px;
      }
      .spec-item-tip {
        color: #e7353b;
        font-size: 12px;
        margin: 5px 0 0;
        padding: 0;
      }
    }
  }
}
</style>