<template>
  <div class="activity-goods-data">
    <en-table-layout
      pagination
      :tableData="tableData"
      :loading="loading">

      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns"></div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="465"
            placeholder="请输入商品名称"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="商品名称">
                  <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="审核状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="申请中" value="APPLY"/>
                    <el-option label="已通过" value="PASS"/>
                    <el-option label="已驳回" value="FAIL"/>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column label="商品名称" width="400">
          <template slot-scope="scope">
            <div class="goods-info">
              <div class="goods-image" style="margin: 0 20px;">
                <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'">
                  <img :src="scope.row.goods_image"/>
                </a>

              </div>
              <div class="goods-name-box">
                <div class="goods-name">
                  <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;">{{ scope.row.goods_name }}</a>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="original_price" :formatter="MixinFormatPrice" label="商品原价"/>
        <el-table-column prop="price" :formatter="MixinFormatPrice" label="活动价格"/>
        <el-table-column prop="specs" label="规格SKU"/>
        <el-table-column label="抢购开始时间">
          <template slot-scope="scope">
            <span>{{ scope.row.start_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态">
          <template slot-scope="scope">
            <span>{{ scope.row.status_text }}</span>
            <br>
            <el-button
              v-if="scope.row.status === 'FAIL'"
              type="text"
              @click="lookReason(scope.row)">（查看原因）</el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        slot="pagination"
        v-if="pageData"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="pageData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>
  </div>
</template>

<script>
  import * as API_activity from '@/api/activity'
  import { CategoryPicker } from '@/components'

  export default {
    name: 'activityGoodsData',
    components: {
      [CategoryPicker.name]: CategoryPicker
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 限时抢购活动ID */
        activityID: '',

        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    filters: {
      timeLine(val) {
        return parseInt(val) < 10 ? '0' + val + ':00:00' : val + ':00:00'
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'activityGoodsData') return
          this.activityID = newVal.params.id
          if (!this.activityID) return
          this.GET_ActivityGoodsList()
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_ActivityGoodsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_ActivityGoodsList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.goods_name = data
        if (!data) delete this.params.goods_name
        this.GET_ActivityGoodsList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          ...this.advancedForm
        }
        this.params.page_no = 1
        this.GET_ActivityGoodsList()
      },
      /** 获取规格列表 */
      getSkuList(val) {
        const _val = typeof val === 'string' ? JSON.parse(val) : val
        if (_val) {
          let _specs = []
          _val.forEach(elem => {
            _specs.push(elem.spec_value)
          })
          _specs = _specs.join('/')
          return _specs
        }
        return '/'
      },

      /** 获取活动商品信息*/
      GET_ActivityGoodsList() {
        this.loading = true
        const _params = {
          ...this.params,
          seckill_id: this.activityID
        }
        API_activity.getLimitTimeGoodsList(_params).then(response => {
          this.loading = false
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
          this.tableData = response.data
        })
      },

      /** 查看原因 */
      lookReason(row) {
        this.$alert(row.fail_reason, '驳回原因')
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .activity-goods-data ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }

  /*平铺*/
  div.base-info-item {
    h4 {
      margin-bottom: 10px;
      padding:0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }
    .el-form-item {
      margin-left: 5%;
      width: 22%;
      min-width: 300px;
    }
    .el-form-item__content {
      margin-left: 120px;
      text-align: left;
    }
    p.goods-group-manager {
      padding-left: 12.3%;
      text-align: left;
      color: #999;
      font-size: 13px;
    }

    /*积分提示*/
    p.exchange-tip {
      margin:0;
      padding: 10px;
      padding-left: 15%;
      text-align: left;
      color: #8a6d3b;
      background: #fcf8e3;
      border: 1px solid #faebcc;
    }
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
      }
    }
  }
</style>
