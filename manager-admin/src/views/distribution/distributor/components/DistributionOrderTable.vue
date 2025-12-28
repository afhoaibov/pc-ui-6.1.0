<template>
  <div class="brokerage-wrap">
    <div class="my-table-out">
      <table class="my-table">
        <thead>
        <tr>
          <th class="shoplist-header">
            <span style="width: 100%;">订单商品信息</span>
          </th>
          <!--<th>退款状态</th>-->
          <th>下单用户</th>
          <th>获佣分销商</th>
          <th>商品结算金额</th>
          <th>佣金信息</th>
          <th>佣金状态</th>
          <th>结算时间</th>
        </tr>
        </thead>
        <tbody v-for="(item, index) in tableData" :key="index">
        <tr class="bg-order">
          <td class="shoplist-content-out" colspan="9">
            <div style="display: flex; display: inline-block; margin-right: 30px;">
              <span class="id-text"> 订单编号：{{item.order_sn}}</span>
            </div>
            <span class="tit-text"> 下单时间: {{ item.order_create_time | unixToDate }}</span>
            <span class="tit-text"> 订单状态： {{ item.order_status_text }}</span>
            <el-button class="theme-color" type="text" @click="handleOperateOrder(item)">订单详情</el-button>
          </td>
        </tr>
        <tr>
          <!-- 商品信息 -->
          <td>
            <div class="goods-info">
              <img :src="item.goods_image" alt="" class="goods-img">
              <div>
                <p>{{item.goods_name}}</p>
                <p>
                  <span>单价：{{item.goods_price | unitPrice}} </span>
                  <span>数量：{{item.goods_num}}</span>
                </p>
              </div>
            </div>
          </td>
          <!-- 下单用户 -->
          <td>
            <div class="user-info">
              <img v-if="item.member_avatar" :src="item.member_avatar" alt="">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
              <p>{{item.member_name}}</p>
            </div>
          </td>
          <!-- 获取佣金的分销商信息 -->
          <td >
            <div class="user-info">
              <img v-if="item.agent_member_avatar" :src="item.agent_member_avatar" alt="">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
              <p>{{item.agent_member_name}}</p>
            </div>
          </td>
          <!-- 结算金额 -->
          <td>
            <span>{{item.goods_total_amount | unitPrice}} </span>
          </td>
          <!-- 分佣金额 -->
          <td>
            <div style="display: flex;flex-direction: column;">
              <span style="color: green;">+{{item.commission | unitPrice}} </span>
              <span style="color: red;">-{{item.return_commission | unitPrice}} </span>
            </div>
          </td>
          <!-- 佣金状态 -->
          <td>
            <span style="font-weight: 500;" :class="`state-${item.commission_status}`">{{commissionStatus(item.commission_status)}}</span>
          </td>
          <!-- 结算时间 -->
          <td>
            <span>{{item.create_time | unixToDate}}</span>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="empty-block" v-if="!tableData.length">
        暂无数据
      </div>
    </div>
    <div class="pagination-box">
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
    </div>
  </div>
</template>

<script>
  import * as API_distribution from '@/api/distribution'

  export default {
    name: 'DistributionOrderTable',
    props: {
      moreParams: {
        type: Object
      }
    },
    data() {
      return {
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
        pageData: {},
        /** 是否显示佣金详细弹出框 */
        dialogVisible: false,
        dialogLine: '',
        dialogTableData: []
      }
    },
    watch: {
      moreParams: {
        handler(val) {
          if (val) {
            this.getDistributionOrderList()
          }
        },
        immediate: true,
        deep: true
      }
    },
    computed: {
      /** 佣金详情 */
      commissionDetail() {
        return (detail) => {
          return JSON.parse(detail)
        }
      },
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
      /** 跳转订单详情 */
      handleOperateOrder(item) {
        this.$router.push({
          name: 'orderDetail',
          params: {
            sn: item.order_sn
          }
        })
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getDistributionOrderList()
        this.$emit('changePage', { page_size: size, page_no: this.page_no })
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.$emit('changePage', { page_size: this.page_size, page_no: page })
        this.getDistributionOrderList()
      },

      /** 获取订单列表 */
      getDistributionOrderList() {
        let params = this.params
        if (Object.keys(this.moreParams).length) {
          params = { ...this.moreParams, ...params }
        }
        API_distribution.getDistributionOrderPage(params).then(response => {
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
  $themeColor: #5441bc;
  .theme-color {
    color: $themeColor;
  }
  .brokerage-wrap {
    .container {
      background: #fff;
    }
  }
  .pagination-box {
    display: flex;
    justify-content: flex-end;
  }
  .my-table-out{
    white-space: nowrap;
    overflow-y: scroll;
    text-overflow: ellipsis;
    width: 100%;
    max-height: 800px;
    margin-top: 30px;
  }
  .my-table {
    width: 100%;
    margin-bottom: 40px;
    background: #fff;
    border-collapse: collapse;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
    font-size: 14px;
    // font-weight: 700;
    .bg-order {
      background: #FAFAFA;
    }
    thead {
      th {
        padding: 10px 0;
        border: 1px solid #ebeef5;
        border-collapse: collapse;
        color: #909399;
      }
      th .shoplist-header {
        padding: 10px 20px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        border-right: none;
      }
    }
    tbody {
      margin-top: 10px;
      td {
        border: 1px solid #ebeef5;
        border-collapse: collapse;
        text-align: center;
        padding: 0;
      }
      td:first-child {
        text-align: left;
      }
      td:not(:first-child) {
        padding: 3px;
      }
      td.shoplist-content-out {
        font-size: 14px;
        color: #999;
        .id-text {
          color: #333;
          margin-right: 10px;
        }

        .tit-text {
          margin-right: 30px;
        }
        padding-left: 20px;
      }
      .state-WAIT {
        color: #fbb026;
      }
      .state-CONFIRM {
        color: #5eb359;
      }
      .state-RETURN {
        color: #d81e06;
      }
      .user-info {
        margin-right: 10px;
        img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
      }

      /*商品信息*/
      .goods-info {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        padding: 10px;
        .goods-img {
          width: 80px;
          height: 80px;
          display: block;
          margin-right: 10px;
          border: 1px solid #efefef;
        }
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
  .empty-block {
    line-height: 60px;
    text-align: center;
    font-size: 14px;
    color: #606266;
  }



</style>
