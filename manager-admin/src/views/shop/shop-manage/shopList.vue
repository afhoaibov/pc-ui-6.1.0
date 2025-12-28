<template>
  <div class="container shop-list">
    <en-table-layout
      ref="shopTable"
      :tableData="tableData.data"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.shop_name"
      @closeDrawer="showDrawer = false"
      @selection-change="handleSelectionChange"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary"  @click="handleAddShop">添加店铺</el-button>
          <el-button size="mini" type="primary"  @click="showSettlementDialog">设置结算日</el-button>
          <el-button size="mini" type="primary"  @click="immediatelySettlement">立即结算</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入店铺或会员名称"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="店铺名称">
                  <el-input size="medium" v-model="advancedForm.shop_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="会员名称">
                  <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="店铺状态">
                  <el-select v-model="advancedForm.shop_disable" placeholder="请选择">
                    <el-option label="全部" value="ALL"/>
                    <el-option label="已开启" value="OPEN"/>
                    <el-option label="已关闭" value="CLOSED"/>
                    <el-option label="待审核" value="APPLY"/>
                    <el-option label="审核未通过" value="REFUSED"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="注册日期">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.shop_time_range"
                    type="datetimerange"
                    :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
                    range-separator="-"
                    align="right"
                    :editable="false"
                    unlink-panels
                    value-format="timestamp"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column
          type="selection"
          width="55" />
        <!--店铺ID-->
        <el-table-column prop="shop_id" label="店铺ID" width="180">
          <template slot-scope="{ row }">
            <clipboard :text="row.shop_id" />
          </template>
        </el-table-column>
        <!--店铺名称-->
        <el-table-column prop="shop_name" label="店铺名称">
          <template slot-scope="scope">
            <span v-if="scope.row.shop_disable === 'WAIN_IMPROVED'">{{scope.row.shop_name}}</span>
            <span v-else class="drawer-text" @click="handlePreView(scope.row)">{{ scope.row.shop_name }}</span>
          </template>
        </el-table-column>
        <!--会员名称-->
        <el-table-column prop="member_name" label="会员名称"/>
        <!--创建时间-->
        <el-table-column prop="shop_createtime" :formatter="MixinUnixToDate" label="创建时间"/>
        <!--店铺状态-->
        <el-table-column label="店铺状态">
          <template slot-scope="scope">{{ scope.row.shop_disable | statusFilter }}</template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作" width="220" align="left">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.shop_disable !== 'APPLY'"
              size="mini"
              type="primary"
              @click="handleEditShop(scope.$index, scope.row)">修改</el-button>
            <el-button
              v-if="scope.row.shop_disable === 'APPLY'"
              size="mini"
              type="primary"
              @click="handleExamine(scope.$index, scope.row)">审核</el-button>
            <el-button
              v-if="scope.row.shop_disable === 'OPEN'"
              size="mini"
              type="danger"
              @click="handleCloseShop(scope.$index, scope.row)">关闭</el-button>
            <el-button
              v-if="scope.row.shop_disable === 'CLOSED'"
              size="mini"
              type="success"
              @click="handleOpenShop(scope.$index, scope.row)">开启</el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="tableData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.data_total">
      </el-pagination>
      <!-- 侧边预览 -->
      <shop-detail-preview slot="drawer" :shopId="currentRow.shop_id" />
    </en-table-layout>
    <el-dialog
      title="设置结算日"
      width="550px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="dialog-wrap"
    >
      <el-form  label-width="80px"  @submit.native.prevent>
        <el-form-item required label="结算日" >
          <span>已添加{{settlementDate.length}}个结算日，最多可添加5个结算日</span>
        </el-form-item>
        <el-form-item label="每月：" >
          <el-tag
            class="tag-item"
            :key="tag"
            v-for="(tag, index) in settlementDate"
            closable
            :disable-transitions="false"
            @close="handleCloseTag(index)">
            {{tag}}
          </el-tag>
          <el-input
            v-model="tagValue"
            ref="saveTagInput"
            size="small"
            oninput="value = value = (value < 1 || value > 31) ? '' : value.replace(/[^\d]/g, '')"
            @keyup.enter.native="handleInputConfirm"
          >
          </el-input>
          <span class="tips">输入1-31之间的数字，点击“enter回车键”添加，当月不包含所设日期时，将会顺延到下一个结算日</span>

        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setSettlementDate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Shop from '@/api/shop'
  import ShopDetailPreview from './components/ShopDetailPreview'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'shopList',
    components: {
      ShopDetailPreview
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20,
          shop_disable: 'ALL',
          shop_type: 'NORMAL'
        },
        /** 列表数据 */
        tableData: '',
        /** 高级搜索数据 */
        advancedForm: {},
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览会员数据
        currentRow: {},
        // 结算日设置弹窗显隐
        dialogVisible: false,
        settlementDate: [],
        tagValue: '',
        // 当前已选择的行
        multipleSelection: []
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'shopList') return
          this.GET_ShopList()
        }
      }
    },
    filters: {
      statusFilter(val) {
        switch (val) {
          case 'REFUSED': return '审核未通过'
          case 'APPLY': return '待审核'
          case 'OPEN': return '开启中'
          case 'CLOSED': return '已关闭'
          case 'WAIN_IMPROVED': return '待完善'
          default: return '未知状态'
        }
      }
    },
    computed: {
      /** 获取已选择店铺 */
      shopIds() {
        return this.multipleSelection.map(item => { return item.shop_id }).join(',')
      }
    },
    methods: {
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      /** 更新结算日期配置 */
      setSettlementDate() {
        const settlementDate = this.settlementDate
        if (!settlementDate.length) {
          this.$message.error('请至少填写一个结算日期！')
          return
        }
        const param = settlementDate.join(',')

        API_Shop.updateShopSettlementDate({ param }, this.shopIds).then(res => {
          this.dialogVisible = false
          this.multipleSelection = []
          this.settlementDate = []
          console.log(this.$refs.shopTable)
          this.$refs.shopTable.$refs.table.clearSelection()
          this.$message.success('保存成功！')
        })
      },
      /** 立即结算 */
      immediatelySettlement() {
        if (!this.multipleSelection.length) {
          this.$message.error('请选择需要结算的店铺！')
          return
        }
        API_Shop.immediatelySettlement(this.shopIds).then(res => {
          this.$message.success('结算成功！')
        })
      },
      /** 获取结算日配置 */
      showSettlementDialog() {
        if (!this.multipleSelection.length) {
          this.$message.error('请选择需要设置的店铺！')
          return
        }
        this.dialogVisible = true
      },
      /** 删除结算日日期 */
      handleCloseTag(index) {
        this.settlementDate.splice(index, 1)
      },

      /** 结算日配置 */
      handleInputConfirm() {
        const tagValue = this.tagValue
        const settlementDate = this.settlementDate
        if (tagValue) {
          let errorMsg = ''
          if (settlementDate.length === 5) {
            errorMsg = '最多可添加5个结算日'
          } else if (settlementDate.some(v => { return v === tagValue })) {
            errorMsg = `已存在${tagValue}, 请重新添加`
          }
          if (errorMsg) {
            this.$message.error(errorMsg)
          } else {
            this.settlementDate.push(tagValue)
          }
        }
        this.tagValue = ''
      },
      /** 添加店铺 */
      handleAddShop() {
        this.$router.push({ name: 'shopAdd' })
      },
      /** 显示预览 */
      handlePreView(row) {
        this.showDrawer = true
        this.currentRow = row
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_ShopList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_ShopList()
      },

      /** 编辑店铺 */
      handleEditShop(index, row) {
        this.$router.push({ name: 'shopEdit', params: { id: row.shop_id }})
      },

      /** 关闭店铺 */
      handleCloseShop(index, row) {
        this.$confirm('确定要关闭这个店铺吗？', '提示', { type: 'warning' }).then(() => {
          API_Shop.closeShop(row.shop_id).then(response => {
            this.$message.success('关闭成功！')
            this.GET_ShopList()
          })
        }).catch(() => {})
      },
      handleExamine(index, row) {
        this.$router.push({ name: 'shopEdit', params: { id: row.shop_id }, query: { audit: 1 } })
      },
      /** 开启店铺 */
      handleOpenShop(index, row) {
        this.$confirm('确定要开启这个店铺吗？', '提示', { type: 'warning' }).then(() => {
          API_Shop.recoverShop(row.shop_id).then(response => {
            this.$message.success('开启成功！')
            this.GET_ShopList()
          })
        }).catch(() => {})
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        delete this.params.start_time
        delete this.params.end_time
        this.params.page_no = 1
        this.params.keyword = data
        this.GET_ShopList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        const params = cloneObj(this.params)

        this.params = Object.assign(params, advancedForm)

        if (!this.params.shop_disable) this.params.shop_disable = 'ALL'
        delete this.params.start_time
        delete this.params.end_time
        const { shop_time_range } = advancedForm
        if (shop_time_range) {
          this.params.start_time = parseInt(shop_time_range[0] /= 1000)
          this.params.end_time = parseInt(shop_time_range[1] /= 1000)
        }
        delete this.params.keyword
        delete this.params.shop_time_range
        this.params.page_no = 1
        this.GET_ShopList()
      },

      /** 获取店铺列表 */
      GET_ShopList() {
        this.loading = true
        API_Shop.getShopList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" scoped>
.shop-list {
  ::v-deep .dialog-wrap {
    .tag-item {
      margin-right: 10px;
    }
    .tips {
      font-size: 13px;
      color: #999;
    }

  }
}
.drawer-text {
  color: #006BB4;
  cursor: pointer;
  &:hover {
    text-decoration:underline;
  }
}
</style>
