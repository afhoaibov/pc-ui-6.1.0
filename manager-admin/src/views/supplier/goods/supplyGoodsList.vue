<template>
  <en-table-layout
    :tableData="tableData.data"
    :loading="loading"
    class="supply-goods-list"
  >
    <div slot="toolbar" class="inner-toolbar">
      <div class="toolbar-btns"></div>
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
              <el-form-item label="店铺名称">
                <en-shop-picker :api="api" @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
              </el-form-item>
              <el-form-item label="商品类别">
                <en-category-picker @changed="categoryChanged"/>
              </el-form-item>
              <el-form-item label="商品品牌">
                <en-brand-picker @changed="(brand) => { advancedForm.brand_id = brand.brand_id }"/>
              </el-form-item>
              <el-form-item label="价格区间">
                <el-input size="medium" v-model="advancedForm.start_price"
                          @input="() => advancedForm.start_price = advancedForm.start_price.replace(/[^\d|\.]/g, '')"
                          :maxlength="10" style="width: 100px;" clearable></el-input>
                -
                <el-input size="medium" v-model="advancedForm.end_price"
                          @input="() => advancedForm.end_price = advancedForm.end_price.replace(/[^\d|\.]/g, '')"
                          :maxlength="10" style="width: 100px;" clearable></el-input>
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
      <el-table-column label="商品名称">
        <template slot-scope="scope">
          <div class="goods-info">
            <div class="goods-image" style="margin: 0 20px;">
                <img :src="scope.row.thumbnail"/>
            </div>
            <div class="goods-name-box">
              <div class="goods-name">
                <span v-html="scope.row.goods_name" style="color: #00a2d4;">{{ scope.row.goods_name }}</span>
              </div>
              <span>商品编号:{{scope.row.sn}}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="seller_name" label="店铺名称" width="150"/>
      <el-table-column label="商品价格" width="150">
        <template slot-scope="scope">{{ scope.row.price | unitPrice }}</template>
      </el-table-column>
      <el-table-column label="商品状态" width="150" :formatter="marketStatus"/>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.is_auth === 4"
            size="mini"
            :type="scope.row.market_enable === 0 ? 'primary' : 'danger'"
            @click="handleOperateGoods(scope.$index, scope.row)">{{scope.row.market_enable === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button
            v-if="scope.row.is_auth === 1"
            size="mini"
            :type="'danger'"
            @click="handleDownGoods(scope.$index, scope.row)">{{'下架'}}
          </el-button>
          <el-button
            v-if="scope.row.is_auth === 2 ||scope.row.is_auth === 3"
            size="mini"
            :type="'primary'"
            @click="handleUpGoods(scope.$index, scope.row)">{{'上架'}}
          </el-button>
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
  </en-table-layout>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import { RegExp } from '~/ui-utils'

  export default {
    name: 'supplyGoodsList',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          supplier_goods_type: 1
        },

        api: 'admin/shops/list_supplier',

        /** 商品列表数据 */
        tableData: '',

        /** 高级搜索数据 */
        advancedForm: {
          goods_name: '',
          goods_sn: '',
          seller_name: '',
          category_path: ''
        }
      }
    },
    mounted() {
      this.GET_GoodsList()
    },
    activated() {
      this.GET_GoodsList()
    },
    methods: {

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

      /** 单个商品上架、下架操作确认 */
      handleOperateGoods(index, row) {
        if (row.market_enable === 0) {
          this.$confirm('确定要上架这个商品吗？', '提示', { type: 'warning' }).then(() => {
            API_goods.goodsBatchUp(row.goods_id).then(response => {
              row.market_enable = 1
              this.$message.success('上架商品成功！')
              this.GET_GoodsList()
            })
          }).catch(() => {
          })
        } else {
          this.$prompt('请输入下架原因', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: (val) => {
              if (val.length > 200) {
                return '下架原因最多200个字符'
              }
              return true
            },
            inputPattern: /.+/,
            inputErrorMessage: '请填写下架原因！'
          }).then(({ value }) => {
            API_goods.goodsBatchUnder(row.goods_id, { reason: value }).then(() => {
              row.market_enable = 0
              this.$message.success('下架商品成功！')
              this.GET_GoodsList()
            })
          }).catch(() => {
          })
        }
      },
      /** 单个商品上架操作确认 */
      handleUpGoods(index, row) {
        this.$confirm('确定要上架这个商品吗？', '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUp(row.goods_id).then(response => {
            row.market_enable = 1
            this.$message.success('上架商品成功！')
          })
        }).catch(() => {
        })
      },
      /** 单个商品下架操作确认 */
      handleDownGoods(index, row) {
        this.$prompt('请输入下架原因', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (val) => {
            if (val.length > 200) {
              return '下架原因最多200个字符'
            }
            return true
          },
          inputPattern: /.+/,
          inputErrorMessage: '请填写下架原因！'
        }).then(({ value }) => {
          API_goods.goodsBatchUnder(row.goods_id, { reason: value }).then(() => {
            row.market_enable = 0
            this.$message.success('下架商品成功！')
          })
        }).catch(() => {
        })
      },

      /** 销售状态格式化 */
      marketStatus(row, column, cellValue) {
        const { is_auth } = row
        if (is_auth === 0) {
          return '待审核'
        } else if (is_auth === 1 && row.market_enable === 0) {
          return '待上架'
        } else if (is_auth === 1 && row.market_enable === 1) {
          return '售卖中'
        } else if (is_auth === 2) {
          return '未通过'
        } else if (is_auth === 3) {
          return '已下架'
        } else if (is_auth === 4) {
          return '审核通过'
        }
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
  .supply-goods-list ::v-deep .el-table td:not(.is-left) {
    text-align: center;
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

      .goods-name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;

        a:hover {
          color: #f42424 !important;
        }
      }
    }
  }
</style>
