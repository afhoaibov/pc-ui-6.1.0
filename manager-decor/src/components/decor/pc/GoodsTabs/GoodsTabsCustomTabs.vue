<template>
  <div>
    <div class="form-item__container tabs">
      <div class="form-item__left-col">
        <span class="form-item__label">Tab列表</span>
      </div>
      <div class="form-item__right-col tabs">
        <div class="input-box">
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="mini" @click="showInput">新建</el-button>
        </div>
        <div class="tag-list">
          <el-tag
            v-for="(tab, index) in $$FormData.tabList"
            :key="tab.__key"
            closable
            :type="currenTabIndex === index ? 'danger' : ''"
            :disable-transitions="false"
            @close="handleClose(tab, index)"
            @click="handleSelectTab(tab, index)"
          >
            {{ tab.name }}
          </el-tag>
        </div>
      </div>
    </div>
    <template v-if="currenTab">
      <div class="item-setting">
        <div class="header-setting">
          <div class="header-setting__label">添加图片</div>
          <div class="header-setting__value">
          </div>
        </div>
        <div class="body-setting">
          <image-link-editor v-model="currenTab.imageList" :show-title="false" :limit="20"/>
        </div>
      </div>
      <goods-selector v-model="currenTab.goodsList"/>
    </template>
  </div>
</template>

<script>
import { uuid } from '@/utils/foundation'

export default {
  name: 'GoodsTabsCustomTabs',
  data() {
    return {
      inputValue: '',
      inputVisible: false,
      currenTabIndex: 0
    }
  },
  computed: {
    currenTab: {
      get() {
        return this.$$FormData.tabList[this.currenTabIndex]
      },
      set(newVal) {
        this.$set(this.$$FormData.tabList, this.currenTabIndex, newVal)
      }
    }
  },
  methods: {
    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        const tab = {
          __key: uuid(),
          name: inputValue,
          imageList: [],
          goodsList: []
        }
        this.$$FormData.tabList.push(tab)
      }
      this.inputVisible = false
      this.inputValue = ''
      this.currenTabIndex = this.$$FormData.tabList.length - 1
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose(tab, index) {
      this.$confirm('确定要删除这个Tab吗？', '提示', { type: 'warning' }).then(() => {
        this.$$FormData.tabList.splice(index, 1)
      }).catch(() => {})
    },
    handleSelectTab(tab, index) {
      this.currenTabIndex = index
      const previewRef = window.$$HomeRefs[`preview_${this.activated}`][0]
      if (!previewRef) return
      previewRef.currentTabIndex = index
    }
  }
}
</script>

<style scoped lang="scss">
.form-item__container.tabs {
  align-items: flex-start !important;
  .form-item__right-col {
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px;
    .tag-list {
      display: flex;
      gap: 12px;
      ::v-deep .el-tag {
        cursor: pointer;
      }
    }
  }
}
</style>