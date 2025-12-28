<template>
  <div class="service-list">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :loading="loading"
      :tips="true">
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          导出时，会按右侧高级搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <export-button
            buttonText="导出Excel"
            @exportEvent="exportEvent"
            style="margin-right: 10px;" />
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入售后服务单号、订单编号">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="售后服务单号">
                  <el-input v-model="advancedForm.service_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="订单编号">
                  <el-input v-model="advancedForm.order_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="售后服务类型">
                  <el-select v-model="advancedForm.service_type" placeholder="请选择" clearable>
                    <el-option label="退货" value="RETURN_GOODS"/>
                    <el-option label="换货" value="CHANGE_GOODS"/>
                    <el-option label="补发商品" value="SUPPLY_AGAIN_GOODS"/>
                    <el-option label="取消订单" value="ORDER_CANCEL"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="售后状态">
                  <el-select v-model="advancedForm.service_status" placeholder="请选择" clearable>
                    <el-option v-for="status in serviceStatusList" :key="status.value" :label="status.label" :value="status.value"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="申请时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.apply_time_range"
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
        <!--创建时间-->
        <el-table-column label="申请时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate }}</template>
        </el-table-column>
        <!--售后服务单号-->
        <el-table-column prop="service_sn" label="售后服务单号">
          <template slot-scope="{ row }">
            <clipboard :text="row.service_sn" />
          </template>
        </el-table-column>
        <!--订单号-->
        <el-table-column prop="order_sn" label="订单编号">
          <template slot-scope="{ row }">
            <clipboard :text="row.order_sn" />
          </template>
        </el-table-column>
        <!--售后服务类型-->
        <el-table-column prop="service_type_text" label="售后服务类型"/>
        <!--状态-->
        <el-table-column prop="service_status_text" label="状态"/>
        <!--操作-->
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" @click="handleServiceDetail(scope.row)" v-if="scope.row.allowable.allow_put_in_store">入库</el-button>
            <el-button
              type="primary"
              @click="handleServiceDetail(scope.row)"
              v-if="(!scope.row.allowable.allow_put_in_store && !scope.row.allowable.allow_audit && !scope.row.allowable.allow_seller_refund && !scope.row.allowable.allow_seller_create_order) || MixinIsSupplier()">
              详情
            </el-button>
            <template v-if="!MixinIsSupplier()">
              <el-button type="primary" @click="handleServiceDetail(scope.row)" v-if="scope.row.allowable.allow_audit">审核</el-button>
              <el-button type="primary" @click="handleServiceDetail(scope.row)" v-if="scope.row.allowable.allow_seller_refund">退款</el-button>
              <el-button type="primary" @click="handleServiceDetail(scope.row)" v-if="scope.row.allowable.allow_seller_create_order">创建新订单</el-button>
            </template>
          </template>
        </el-table-column>
      </template>
      <!--分页-->
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
  import * as API_AfterSale from '@/api/afterSale'
  import { exportConfirm } from '@/utils/index'
  import ExportButton from '@/components/ExportButton'

  export default {
    name: 'serviceList',
    components: {
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
          ...this.$route.query
        },
        /** 列表数据 */
        tableData: null,
        /** 列表分页数据 */
        pageData: null,
        /** 高级搜索数据 */
        advancedForm: {
          service_sn: '',
          order_sn: '',
          service_type: '',
          service_status: '',
          apply_time_range: []
        },
        /** 售后服务单状态列表 */
        serviceStatusList: [
          { label: '待审核', value: 'APPLY' },
          { label: '审核通过', value: 'PASS' },
          { label: '审核未通过', value: 'REFUSE' },
          { label: '已退还商品', value: 'FULL_COURIER' },
          { label: '待人工处理', value: 'WAIT_FOR_MANUAL' },
          { label: '退款中', value: 'REFUNDING' },
          { label: '退款失败', value: 'REFUNDFAIL' },
          { label: '已完成', value: 'COMPLETED' },
          { label: '异常状态', value: 'ERROR_EXCEPTION' },
          { label: '已关闭', value: 'CLOSED' }
        ]
      }
    },
    computed: {
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'serviceList') return
          this.GET_AfterSaleService()
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_AfterSaleService()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_AfterSaleService()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params = {
          ...this.params,
          page_no: 1,
          keyword: data
        }
        this.GET_AfterSaleService()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params.keyword = ''
        this.params = {
          ...this.params,
          ...this.advancedForm,
          page_no: 1
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.apply_time_range && this.advancedForm.apply_time_range.length > 0) {
          this.params.start_time = this.advancedForm.apply_time_range[0] / 1000
          this.params.end_time = this.advancedForm.apply_time_range[1] / 1000
        }
        delete this.params.apply_time_range
        this.GET_AfterSaleService()
      },

      /** 展示审核弹出框 */
      handleServiceDetail(row) {
        this.$router.push({ name: 'serviceDetail', params: { service_sn: row.service_sn } })
      },

      /** 获取售后服务列表数据 */
      GET_AfterSaleService() {
        this.loading = true
        API_AfterSale.getAfterSaleList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      },
      /** 导出操作 */
      exportEvent() {
        API_AfterSale.exportAfterSale(this.params).then(res => {
          exportConfirm(this)
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .service-list ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }

  .service-list ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }

  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
  }
</style>
