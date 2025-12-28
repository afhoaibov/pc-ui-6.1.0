<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.goods_name"
      :selectionChange="handleSelectionChange"
      @closeDrawer="showDrawer = false"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <export-button
            buttonText="导出商品"
            @exportEvent="$refs['authRef'].open()"
            style="margin-right: 10px;" />
          <el-button type="success" @click="handlerBatchUp">批量上架</el-button>
          <el-button type="danger" @click="showUnderReason">批量下架</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="商品名称">
                  <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品编号">
                  <el-input size="medium" v-model="advancedForm.goods_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品类型">
                  <el-select v-model="advancedForm.goods_type" placeholder="请选择" clearable>
                    <el-option label="普通商品" value="NORMAL"/>
                    <el-option label="虚拟商品" value="VIRTUAL"/>
                  </el-select>
                </el-form-item>
                 <el-form-item label="积分兑换">
                  <el-select v-model="advancedForm.point_disable" placeholder="请选择" clearable>
                    <el-option label="是" :value="1"/>
                    <el-option label="否" :value="0"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="店铺名称">
                  <en-shop-picker
                    shopType="NORMAL"
                    @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
                </el-form-item>
                <el-form-item label="商品分类">
                  <en-category-picker @changed="categoryChanged"/>
                </el-form-item>
                <el-form-item label="商品品牌">
                  <en-brand-picker @changed="(brand) => { advancedForm.brand_id = brand.brand_id }"/>
                </el-form-item>
                <el-form-item label="价格区间">
                  <el-input size="medium" v-model="advancedForm.start_price" @input="() => advancedForm.start_price = advancedForm.start_price.replace(/[^\d|\.]/g, '')" :maxlength="10" style="width: 100px;" clearable></el-input>
                  -
                  <el-input size="medium" v-model="advancedForm.end_price" @input="() => advancedForm.end_price = advancedForm.end_price.replace(/[^\d|\.]/g, '')" :maxlength="10" style="width: 100px;" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品状态">
                  <el-select v-model="advancedForm.market_enable" placeholder="请选择" clearable>
                    <el-option label="售卖中" value="1"/>
                    <el-option label="已下架" value="0"/>
                  </el-select>
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
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <div class="goods-info">
              <div class="goods-image" style="margin: 0 20px;">
                <img :src="scope.row.thumbnail"/>
              </div>
              <div class="goods-name-box">
                <div
                  class="name drawer-text"
                  :class="[isO2O ? '' : 'goods-name']"
                  @click="handlePreview(scope.row)"
                >
                  {{ scope.row.goods_name }}
                </div>
                <span>
                  商品编号:
                  <clipboard :text="scope.row.sn" />
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="搜索优先级">
          <template slot-scope="scope">
            <el-rate v-model="scope.row.priority"
                    @change="handleModifyPriority(scope.row)"
                    :max="3"
                    show-text
                    :texts="['低', '中', '高']">
            </el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="seller_name" label="店铺名称" width="150"/>
        <el-table-column prop="seller_name" label="是否推荐" width="150">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.recommend"
              :active-value="1"
              :inactive-value="0"
              @change="changeRecommendStatus(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="商品价格" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.point_disable === 0">
              <span>{{ scope.row.price | unitPrice }}</span>
            </div>
            <div v-if="scope.row.point_disable === 1">
              <span v-if="scope.row.price && scope.row.price !== 0">{{ scope.row.price | unitPrice }} + {{ scope.row.exchange_point }}积分</span>
              <span v-else>{{ scope.row.exchange_point }}积分</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品状态" width="150" :formatter="marketStatus"/>
        <el-table-column label="操作" width="150" >
          <template slot-scope="scope" v-if="scope.row.is_auth === 1">
            <el-button
              size="mini"
              v-if="scope.row.market_enable === 0"
              type="primary"
              @click="handlerBatchUp(scope.row)">上架</el-button>

            <el-button
              size="mini"
              v-else
              type="danger"
              @click="handlerGoodsUnder(scope.row)">下架</el-button>
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

      <goods-base-info
        slot="drawer"
        :goodsId="currentRow.goods_id"
        :sellerId="currentRow.seller_id" />
    </en-table-layout>

    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="handleExportGoods"/>

    <el-dialog
      title="下架原因"
      :visible.sync="showReasonDialog"
      width="650px"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-input
        type="textarea"
        :rows="3"
        placeholder="请输入下架原因，200字符以内"
        :maxlength="200"
        v-model="underReason">
      </el-input>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showReasonDialog = false">取 消</el-button>
        <el-button type="primary" @click="handlerBatchUnder">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import * as API_SystemSetting from '@/api/systemSetting'
  import GoodsBaseInfo from '@/components/GoodsBaseInfo'
  import ExportButton from '@/components/ExportButton'

  export default {
    name: 'goodsList',
    components: {
      GoodsBaseInfo,
      ExportButton
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          supplier_goods_type: 0,
          shop_type: 'NORMAL'
        },

        /** 商品列表数据 */
        tableData: '',

        /** 高级搜索数据 */
        advancedForm: {
          goods_name: '',
          goods_sn: '',
          seller_name: '',
          category_path: ''
        },
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览操作商品数据
        currentRow: {},
        // 批量操作ids
        goodsIds: [],
        // 下架原因填写
        showReasonDialog: false,
        underReason: ''
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'goodsList') return
          this.GET_GoodsList()
        }
      }
    },
    methods: {
      showUnderReason() {
        if (!this.goodsIds.length) {
          this.$message.error('请选择要下架的商品！')
          return
        }
        this.showReasonDialog = true
        this.underReason = ''
      },
      /** 批量操作商品选中 */
      handleSelectionChange(val) {
        this.goodsIds = val.map(item => item.goods_id)
      },
      /** 批量上架 */
      handlerBatchUp(row = null) {
        let goodsIds = this.goodsIds
        if (row && row.goods_id) {
          // 单个商品上架架操作
          goodsIds = [row.goods_id]
        }
        if (!goodsIds.length) {
          this.$message.error('请选择要上架的商品！')
          return
        }
        let tips = '确认要上架这些商品吗？'
        if (goodsIds.length === 1) {
          tips = '确认要上架此商品吗？'
        }
        this.$confirm(tips, '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUp(goodsIds).then(res => {
            this.$message.success('上架成功！')
            this.goodsIds = []
            this.GET_GoodsList()
          })
        }).catch(() => {})
      },

      /** 批量下架 */
      handlerBatchUnder() {
        let { goodsIds, underReason, currentRow } = this
        let tips = '确认要下架这些商品吗？'
        if (!goodsIds.length && currentRow.goods_id) {
          goodsIds = [currentRow.goods_id]
          tips = '确认要下架此商品吗？'
        }
        this.$confirm(tips, '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUnder(goodsIds, { reason: underReason }).then(res => {
            this.showReasonDialog = false
            this.underReason = ''
            this.goodsIds = []
            this.$message.success('下架成功！')
            this.GET_GoodsList()
          })
        })
      },

      /** 单个商品下架操作 */
      handlerGoodsUnder(row) {
        this.currentRow = row
        this.showReasonDialog = true
      },
      /** 设置推荐商品 */
      changeRecommendStatus(row) {
        const params = {
          recommend: row.recommend,
          goods_id: row.goods_id
        }
        API_goods.changeRecommendStatus(params)
      },
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },

      /** 导出商品 */
      handleExportGoods() {
        API_goods.exportGoods(this.params).then(() => {
          this.MixinExportConfirm()
        })
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_GoodsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_GoodsList()
      },

      /** 销售状态格式化 */
      marketStatus(row, column, cellValue) {
        const { market_enable, is_auth } = row
        if (is_auth === 1) {
          return row.market_enable === 1 ? '售卖中' : '已下架'
        } else {
          return is_auth === 2 ? '审核拒绝' : '待审核'
        }
      },

      /** 改变优先级 */
      handleModifyPriority(row) {
        API_goods.modifyPriority(row.goods_id, row.priority).then(_ => {
          this.loading = false
        }).catch()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          keyword: data
        }
        this.params.page_no = 1
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.GET_GoodsList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          page_no: 1,
          ...this.advancedForm
        }
        delete this.params.keyword
        this.params.page_no = 1
        this.GET_GoodsList()
      },

      /** 高级搜索中 分类选择组件值发生改变 */
      categoryChanged(data) {
        this.advancedForm.category_path = data.category_path || ''
      },

      GET_GoodsList() {
        this.loading = true
        API_goods.getGoodsList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => (this.loading = false))
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }
  .drawer-text {
    color: #006BB4;
    cursor: pointer;
    &:hover {
      text-decoration:underline;
    }
  }

  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-search {
    margin-right: 10px;
  }

  .goods-info {
    display: flex;
    align-items: center;
    .goods-image {
      img {
        width: 80px;
        height: 80px;
      }
    }
    .goods-name-box {
      text-align: left;
      .name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .goods-name {
        a:hover {
          color: #f42424 !important;
        }
      }
    }
  }
</style>
