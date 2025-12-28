<template>
  <div class="container" v-loading="loading">
    <div class="tips-info" v-if="tips" ref="tips">
      <slot name="tips"></slot>
    </div>
    <div v-if="toolbar" class="toolbar" ref="toolbar">
      <slot name="toolbar"></slot>
    </div>
    <el-table
      v-bind="$attrs"
      v-on="$listeners"
      ref="table"
      :data="tableData"
      :row-key="rowKey"
      :stripe="stripe"
      :header-cell-style="{textAlign: 'center'}"
      :style="{width: '100%'}"
      @selection-change="selectionChange"
      highlight-current-row
      :maxHeight="TableMaxHeight"
    >
      <slot name="table-columns"></slot>
    </el-table>
    <div v-if="pagination" class="pagination" ref="pagination">
      <div class="pagination-toolbar">
        <slot name="pagination-toolbar"></slot>
      </div>
      <slot name="pagination"></slot>
    </div>

    <el-drawer
        v-if="drawerVisible"
        :wrapperClosable="false"
        :title="drawerTitle"
        :visible.sync="drawerVisible"
        :modal="false"
        @close="closeDrawer">
        <slot name="drawer"></slot>
      </el-drawer>
  </div>
</template>

<script>
  export default {
    name: 'EnTableLayout',
    props: {
      /** 是否显示斑纹 */
      stripe: {
        type: Boolean,
        default: true
      },
      /** 行数据的 Key */
      rowKey: {
        type: [String,Function],
        default: null
      },
      /** 是否显示工具栏 */
      toolbar: {
        type: Boolean,
        default: true
      },
      /** 是否显示操作提示 */
      tips: {
        type: Boolean,
        default: false
      },
      /** 是否显示分页 */
      pagination: {
        type: Boolean,
        default: true
      },
      /** 表格数据 */
      tableData: {
        default: function () {
          return []
        }
      },
      /** 加载状态 */
      loading: {
        type: Boolean,
        default: false
      },
      /** 当选择项发生变化 */
      selectionChange: {
        type: Function,
        default: function () {
          return []
        }
      },
      /** 是否侧边展开 */
      showDrawer: {
        type: Boolean,
        default: false
      },
      /** 侧边预览title */
      drawerTitle: {
        type: String,
        default: 'title'
      }
    },
    data() {
      return { 
        TableMaxHeight: 0,
        drawerVisible: false
      }
    },
    watch: {
      tableData: {
        immediate: true,
        handler() {
          this.calcTableMaxHeight()
        }
      },
      showDrawer: {
        immediate: true,
        handler(val) {
          this.drawerVisible = val
        }
      }
    },
    methods: {
      /** 侧边预览关闭*/
      closeDrawer() {
        this.drawerVisible = false
        this.$emit('closeDrawer')
      },
      
      calcTableMaxHeight() {
				setTimeout(() => {
					let toolbarHeight = 0
          let paginationHeight = 0
          let tipsHeight = 0
          if (this.$refs['pagination']) {
            paginationHeight = this.$refs['pagination'].offsetHeight
          }
          if (this.$refs['tips']) {
            tipsHeight = this.$refs['tips'].offsetHeight + 10
          }
          if (this.$refs['toolbar']) {
            toolbarHeight = this.$refs['toolbar'].offsetHeight
          }
					// 70为顶部navbar高度 + 10 间隙高度
          this.TableMaxHeight = (document.body.clientHeight - (70 + toolbarHeight + paginationHeight + tipsHeight))
				}, 300)
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
 .container ::v-deep .el-drawer__wrapper {
  width: 46%;
  left: 54%;
  .el-drawer__open .el-drawer.rtl {
    animation: rtl-drawer-in 100ms 1ms !important;
  }
  .el-drawer.rtl {
    animation: rtl-drawer-out 10ms !important;
  }
  .el-drawer {
    width: 98% !important;
    box-shadow: -2px 0 10px 2px rgba(0,0,0, .2) !important; 
    .el-drawer__header {
      box-shadow: 0 -2px 10px 2px rgba(0,0,0, .2) !important; 
      margin-bottom: 2px;
      padding-bottom: 10px;
      color: #555;
      font-weight: 600;
    }
  }
 }
  .container {
    width: 100%;
    height: 100%;
    position: relative;
    background: #e9eef3;
  }
  /** 工具栏样式 */
  .toolbar {
    display: flex;
    align-items: center;
    height: 44px;
    border-bottom: 1px solid #e6ebf5;
    background-color: #fff;
  }
  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
  }

  .toolbar-search {
    margin-right: 10px;
  }
  /** 分页样式 */
  .pagination {
    display: flex;
    justify-content: space-between;
    padding: 5px 20px;
    text-align: right;
    background-color: #ffffff;
    .pagination-toolbar {
      display: flex;
      align-items: center;
    }
  }
  .container ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }

</style>
