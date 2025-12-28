<template>
  <en-table-layout
    :tableData="tableData.data"
    :loading="loading"
    :tips="true"
    class="collection-list"
  >
    <div slot="toolbar" class="inner-toolbar">
      <div class="table-toolbar-btns">
        <export-button @exportEvent="handleExportCollection" />
        <div class="table-tips-info">
            <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
            导出时，会按右侧搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
          </div>
      </div>
      <div class="toolbar-search">
        <en-table-search
          @search="searchEvent"
          @advancedSearch="advancedSearchEvent"
          advanced
          advancedWidth="500"
          placeholder="请输入订单编号"
        >
          <template slot="advanced-content">
            <el-form ref="advancedForm" :model="advancedForm" label-width="110px">
              <el-form-item label="付款人">
                <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
              </el-form-item>
              <el-form-item label="支付方式">
                <el-select v-model="advancedForm.pay_way" placeholder="请选择" clearable>
                  <el-option label="支付宝" value="支付宝"/>
                  <el-option label="微信支付" value="微信"/>
                  <el-option label="预存款" value="预存款"/>
                  <el-option label="管理员收款" value="管理员收款"/>

                </el-select>
              </el-form-item>
              <el-form-item label="付款方式">
                <el-select v-model="advancedForm.payment_type" placeholder="请选择" clearable>
                  <el-option label="在线支付" value="ONLINE"/>
                  <el-option label="货到付款" value="COD"/>
                </el-select>
              </el-form-item>
              <el-form-item label="付款状态">
                <el-select v-model="advancedForm.pay_status" placeholder="请选择" clearable>
                  <el-option label="已支付" value="PAY_YES"/>
                  <el-option label="未支付" value="PAY_NO"/>
                </el-select>
              </el-form-item>
              <el-form-item label="付款日期">
                <el-date-picker
                  style="width: 100%"
                  v-model="advancedForm.refund_time_range"
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
      <el-table-column prop="order_sn" label="订单号" width="180">
        <template slot-scope="scope">
          <clipboard :text="scope.row.order_sn" />
        </template>
      </el-table-column>
      <el-table-column label="付款方式">
        <template slot-scope="scope">
          {{ scope.row.pay_way === 'ONLINE' ? '在线支付' : '货到付款' }}
        </template>
      </el-table-column>
      <el-table-column prop="pay_type" label="支付方式"/>
      <el-table-column prop="pay_time" :formatter="MixinUnixToDate" label="付款日期"/>
      <el-table-column prop="pay_money" :formatter="MixinFormatPrice" label="付款金额"/>
      <el-table-column prop="pay_member_name" label="付款人"/>
      <el-table-column label="付款状态">
        <template slot-scope="scope">{{ scope.row.pay_status === 'PAY_YES' ? '已支付' : '未支付' }}</template>
      </el-table-column>
      <el-table-column prop="seller_name" label="商家名称"/>
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
  import * as API_Colection from '@/api/collection'
  import ExportButton from '@/components/ExportButton/index.vue'

  export default {
    name: 'collectionList',
    components: {
      ExportButton
    },
    mounted() {
      this.advancedSearchEvent()
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20
        },

        /** 列表数据 */
        tableData: '',

        /** 高级搜索数据 */
        advancedForm: {
          payment_type: '',
          pay_status: ''
        },

        /** 导出Excel日期 */
        exportDateRange: []
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_CollectionOrder()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_CollectionOrder()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          order_sn: data
        }
        this.GET_CollectionOrder()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          page_no: 1,
          ...this.advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.refund_time_range) {
          this.params.start_time = parseInt(this.advancedForm.refund_time_range[0] / 1000)
          this.params.end_time = parseInt(this.advancedForm.refund_time_range[1] / 1000)
        }
        delete this.params.order_sn
        delete this.params.refund_time_range
        this.GET_CollectionOrder()
      },

      /** 导出收款单 */
      handleExportCollection() {
        API_Colection.exportCollection(this.params).then(response => {
          this.MixinExportConfirm()
        })
      },

      /** 获取退款单列表数据 */
      GET_CollectionOrder() {
        this.loading = true
        API_Colection.getCollectionList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .collection-list ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }
  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
  }

  .goods-image {
    width: 50px;
    height: 50px;
  }

  /** 申请时间 */
  .apply-time {
	  width: 100%;
  }
</style>
