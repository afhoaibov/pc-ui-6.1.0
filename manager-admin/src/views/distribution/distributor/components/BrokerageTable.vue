<template>
  <div class="brokerage-wrap">
    <en-table-layout
      pagination
      :border="true"
      :tableData="tableData"
      :loading="loading">
      <template slot="table-columns">
        <el-table-column
          min-width="100"
          :label="item.label"
          v-for="item in TableRow"
          :key="item.label">
          <template slot-scope="scope">
            <div v-if="item.prop === 'order_user'" class="user-info">
              <img v-if="scope.row.member_avatar" :src="scope.row.member_avatar" alt="" class="user-img">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">

              <span class="theme-color">{{scope.row.member_name}}</span>
            </div>
            <div v-else-if="item.prop === 'dis_user'" class="user-info">
              <img v-if="scope.row.agent_member_avatar" :src="scope.row.agent_member_avatar" alt="" class="user-img">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
              <span class="theme-color">{{scope.row.agent_member_name}}</span>
            </div>
            <span v-else-if="item.prop === 'commission'">
              {{scope.row[item.prop] | unitPrice}}
            </span>
            <span v-else-if="item.prop === 'commission_status'" :class="`state-${scope.row[item.prop]}`">
              {{commissionStatus(scope.row[item.prop])}}
            </span>
            <span v-else-if="item.prop === 'create_time'">
              {{scope.row[item.prop] | unixToDate}}
            </span>
            <span v-else-if="item.prop === 'order_sn'" class="theme-color">
              <clipboard :text="scope.row[item.prop]" />
            </span>
            <span v-else >{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        v-if="tableData"
        slot="pagination"
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
  import * as API_distribution from '@/api/distribution'
  const TableRow = [
    { label: '订单号', prop: 'order_sn' },
    { label: '下单用户', prop: 'order_user' },
    { label: '分销用户', prop: 'dis_user' },
    { label: '分佣金额', prop: 'commission' },
    { label: '入账状态', prop: 'commission_status' },
    { label: '分佣时间', prop: 'create_time' }
  ]
  export default {
    name: 'BrokerageTable',
    props: {
      moreParams: {
        type: Object
      }
    },
    data() {
      return {
        TableRow,
        // 列表loading状态
        loading: false,

        // 列表参数
        params: {
          page_no: 1,
          page_size: 10
        },
        // 列表数据
        tableData: [],

        /** 分页信息 */
        pageData: {}
      }
    },
    watch: {
      moreParams: {
        handler(val) {
          if (val) {
            this.getDistributionCommissionList()
          }
        },
        immediate: true,
        deep: true
      }
    },
    computed: {
      /** 结算状态 */
      commissionStatus() {
        return (state) => {
          switch (state) {
            case 'WAIT':
              return '待入账'
            case 'CONFIRM':
              return '已入账'
            case 'RETURN':
              return '已退回'
          }
        }
      }
    },

    methods: {

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getDistributionCommissionList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getDistributionCommissionList()
      },

      /** 获取模板列表 */
      getDistributionCommissionList() {
        let params = this.params
        if (Object.keys(this.moreParams).length) {
          params = { ...this.moreParams, ...params }
        }
        API_distribution.getDistributionCommissionList(params).then(response => {
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .brokerage-wrap ::v-deep .toolbar {
    height: auto !important;
  }
  .theme-color {
    color: #5441bc;
    font-weight: 500;
  }
  .brokerage-wrap {
    .container {
      background: #fff;
    }
    .state-WAIT {
      color: #fbb026;
      font-weight: 500;
    }
    .state-CONFIRM {
      color: #5eb359;
      font-weight: 500;
    }
    .state-RETURN {
      color: #d81e06;
      font-weight: 500;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-top: 10px;
      }
    }
  }
</style>
