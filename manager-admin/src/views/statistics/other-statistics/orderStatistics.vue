<template>
  <div class="container">
    <div class="description">
      <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
      订单付款之后计入统计，售后换货，补发重新创建的订单 不计入统计！
    </div>
    <el-card>
      <div slot="header" class="chart-header">
        <div class="chart-header-item">
          <span>查询周期：</span>
          <en-year-month-picker @changed="handleYearMonthChanged"/>
        </div>
        <div class="chart-header-item">
          <span>店铺：</span>
          <en-shop-picker shopType="NORMAL" @changed="(shop) => { params.seller_id = shop.shop_id }"/>
        </div>
        <div class="chart-header-item">
          <span>订单状态：</span>
          <el-select
            v-model="params.order_status"
            placeholder="选择状态"
            style="width: 150px"
            clearable
          >
            <el-option
              v-for="item in orderStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </div>
      </div>
      <el-tabs v-model="cur_tab" type="card">
        <el-tab-pane label="下单金额" name="price">
          <order-statistics-price :params="params" :cur-tab="cur_tab" @update="GET_OrderStatisticsPage"/>
        </el-tab-pane>
        <el-tab-pane label="下单量" name="order">
          <order-statistics-order :params="params" :cur-tab="cur_tab" @update="GET_OrderStatisticsPage"/>
        </el-tab-pane>
      </el-tabs>
      <el-table
        :data="tableData.data"
        border
        class="table-container"
      >
        <el-table-column prop="sn" label="订单编号"/>
        <el-table-column prop="buyer_name" label="会员名称"/>
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="下单日期"/>
        <el-table-column prop="order_price" :formatter="MixinFormatPrice" label="订单金额"/>
        <el-table-column label="订单状态">
          <template slot-scope="scope">{{ scope.row.order_status | unixOrderStatus }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
          style="text-align: right;"
          v-if="tableData"
          @size-change="handlePageSizeChange"
          @current-change="handlePageCurrentChange"
          :current-page="tableData.page_no"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="tableData.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.data_total">
        </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import * as API_Statistics from '@/api/statistics'
  import orderStatisticsPrice from './orderStatisticsPrice'
  import orderStatisticsOrder from './orderStatisticsOrder'

  export default {
    name: 'orderStatistics',
    components: {
      orderStatisticsPrice,
      orderStatisticsOrder
    },
    data() {
      return {
        cur_tab: 'price',
        params: {
          year: '',
          month: '',
          start_time: '',
          end_time: '',
          cycle_type: 'MONTH',
          order_status: '',
          seller_id: 0,
          page_size: 20
        },
        loading: false,
        tableData: '',
        orderStatus: [
          { label: '已确认', value: 'CONFIRM' },
          { label: '已付款', value: 'PAID_OFF' },
          { label: '已发货', value: 'SHIPPED' },
          { label: '已收货', value: 'ROG' },
          { label: '已完成', value: 'COMPLETE' }
        ]
      }
    },
    mounted() {
      this.GET_OrderStatisticsPage()
    },
    methods: {
      /** 年月份发生变化 */
      handleYearMonthChanged(object) {
        this.params.year = object.year
        this.params.month = object.month
        this.params.cycle_type = object.type
      },
      /** 获取订单统计表格数据 */
      GET_OrderStatisticsPage() {
        this.loading = true
        API_Statistics.getOrderStatisticsPage(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_OrderStatisticsPage()
      },
      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_OrderStatisticsPage()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container {
    padding: 10px;
    .table-container {
      height: calc(100vh - 600px);
      overflow: auto;
    }
  }
  .chart-header {
    padding: 0 10px;
  }
  .chart-header-item {
    display: inline-block;
    margin-right: 30px;
  }
  .tab-chart {
    height: 300px;
  }
  .description {
    color: #ef022f;
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
