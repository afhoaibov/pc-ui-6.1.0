<template>
  <div class="container order-list">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
      :stripe="false"
      :row-class-name="tableRowClassName"
      :showDrawer="showDrawer"
      :drawerTitle="drawerTitle"
      @closeDrawer="showDrawer = false"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="table-toolbar-btns">
          <export-button buttonText="导出订单" @exportEvent="$refs['authRef'].open()" />
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
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="收货人">
                  <el-input size="medium" v-model="advancedForm.ship_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品名称">
                  <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="店铺名称">
                  <en-shop-picker
                  shopType="NORMAL"
                  @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
                </el-form-item>
                <el-form-item label="下单日期">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.order_time_range"
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
                <el-form-item label="订单状态">
                  <el-select v-model="advancedForm.tag" placeholder="请选择" clearable>
                    <el-option label="待付款" value="WAIT_PAY"/>
                    <el-option label="待发货" value="WAIT_SHIP"/>
                    <el-option label="已发货" value="WAIT_ROG"/>
                    <el-option label="已收货" value="ROG"/>
                    <el-option label="已完成" value="COMPLETE"/>
                    <el-option label="已取消" value="CANCELLED"/>
                    <el-option label="已核销" value="REDEEM_OFF"/>

                  </el-select>
                </el-form-item>
                <el-form-item label="支付方式">
                  <el-select v-model="advancedForm.payment_type" placeholder="请选择" clearable>
                    <el-option label="在线支付" value="ONLINE"/>
                    <el-option label="货到付款" value="COD"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="订单来源">
                  <el-select v-model="advancedForm.client_type" placeholder="请选择" clearable>
                    <el-option label="PC" value="PC"/>
                    <el-option label="H5" value="H5"/>
                    <el-option label="微信H5" value="WECHAT_H5"/>
                    <el-option label="小程序" value="MINI"/>
                    <el-option label="APP" value="APP"/>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <!--订单编号-->
        <el-table-column prop="sn" label="订单编号" width="180">
          <template slot-scope="scope">
            <div>
              <el-tag type="success" v-if="scope.row.enterprise_id">企业订单</el-tag>
            </div>
            <span class="drawer-text"
             @click="getOrderDetail(scope.row.sn)">{{ scope.row.sn }}</span>
            <clipboard buttonCopy :text="scope.row.sn" />
          </template>
        </el-table-column>
        <!--下单时间-->
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="下单时间"/>
        <!--订单总额-->
        <el-table-column label="订单总额">
          <template slot-scope="scope">{{ scope.row.order_amount | unitPrice }}</template>
        </el-table-column>
        <!--收货人-->
        <el-table-column prop="ship_name" label="收货人"/>
        <!--订单状态-->
        <el-table-column prop="order_status_text" label="订单状态"/>
        <!--付款状态-->
        <el-table-column prop="pay_status_text" label="付款状态"/>
        <!--发货状态-->
        <el-table-column prop="ship_status_text" label="发货状态"/>
        <!--售后是否失效状态-->
        <el-table-column prop="service_status_text" label="售后是否失效"/>
        <!--支付方式-->
        <el-table-column label="支付方式">
          <template slot-scope="scope">{{ scope.row.payment_type | paymentTypeFilter }}</template>
        </el-table-column>
        <!--订单来源-->
        <el-table-column prop="client_type_text"  label="订单来源"/>
        <!--操作-->
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.order_status !== 'COMPLETE'"
              size="mini"
              type="primary"
              @click="handleOperateOrder(scope.$index, scope.row)">操作</el-button>
            <el-button
              v-else
              size="mini"
              @click="handleOperateOrder(scope.$index, scope.row)">查看</el-button>
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

      <order-base-info slot="drawer" :orderDetail="orderDetail" />
    </en-table-layout>

    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="handleExportOrders"/>
  </div>
</template>

<script>
import * as API_order from '@/api/order'
import OrderBaseInfo from './components/OrderBaseInfo'
import ExportButton from '@/components/ExportButton'

export default {
  name: 'orderList',
  components: {
    OrderBaseInfo,
    ExportButton
  },
  data() {
    return {
      // 列表loading状态
      loading: false,
      // 列表参数
      params: {
        page_no: 1,
        page_size: 20
      },
      // 列表数据
      tableData: '',
      // 高级搜索数据
      advancedForm: {},
      // 当前预览详情
      orderDetail: {},
      showDrawer: false
    }
  },
  filters: {
    paymentTypeFilter(val) {
      return val === 'ONLINE' ? '在线支付' : '货到付款'
    }
  },
  computed: {
    drawerTitle() {
      if (this.orderDetail.sn) {
        return `订单编号：${this.orderDetail.sn}`
      }
      return ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'orderList') return
        this.GET_OrderList()
      }
    }
  },
  methods: {
    getOrderDetail(sn) {
      this.showDrawer = true
      API_order.getOrderDetail(sn).then(response => {
        this.orderDetail = response
      })
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_OrderList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_OrderList()
    },

    /** 搜索事件触发 */
    searchEvent(data) {
      this.params = {
        page_no: 1,
        page_size: 10,
        order_sn: data
      }
      this.GET_OrderList()
    },

    /** 高级搜索事件触发 */
    advancedSearchEvent() {
      this.params = {
        ...this.params,
        ...this.advancedForm
      }
      delete this.params.start_time
      delete this.params.end_time
      if (this.advancedForm.order_time_range) {
        console.log(this.advancedForm.order_time_range)
        this.params.start_time = this.advancedForm.order_time_range[0]
        this.params.end_time = this.advancedForm.order_time_range[1]
      }
      delete this.params.order_sn
      delete this.params.order_time_range
      this.params.page_no = 1
      this.GET_OrderList()
    },

    /** 被篡改的数据 */
    tableRowClassName({ row }) {
      // if (!row.sign_result) {
      //   return 'warning-row'
      // }
      return ''
    },

    /** 查看、操作订单 */
    handleOperateOrder(index, row) {
      this.$router.push({
        name: 'orderDetail',
        params: {
          sn: row.sn,
          callback: this.GET_OrderList
        }
      })
    },

    /** 导出订单 */
    handleExportOrders() {
      const params = this.MixinClone(this.params)
      if (params.start_time && params.end_time) {
        params.start_time = parseInt(params.start_time / 1000)
        params.end_time = parseInt(params.end_time / 1000)
      }
      if (params.seller_id === 0) delete params.seller_id
      API_order.exportOrders(params).then(response => {
        this.MixinExportConfirm()
      })
    },

    /** 获取订单列表 */
    GET_OrderList() {
      this.loading = true
      const params = this.MixinClone(this.params)
      if (params.start_time && params.end_time) {
        params.start_time = parseInt(params.start_time / 1000)
        params.end_time = parseInt(params.end_time / 1000)
      }
      if (params.seller_id === 0) delete params.seller_id
      API_order.getOrderList(params).then(response => {
        this.loading = false
        this.tableData = response
      }).catch(() => { this.loading = false })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.order-list ::v-deep .el-table td:not(.is-left) {
  text-align: center;
}

.order-list ::v-deep .el-table .warning-row {
  background: #fef0f0;
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
  padding: 0 20px;
}

.goods-image {
  width: 50px;
  height: 50px;
}

.two-step-input {
  margin-top: 20px;
}
</style>

