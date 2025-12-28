<template>
  <div v-loading="loading" class="order-detail-container">
    <el-row v-if="orderDetail && orderDetail.order_operate_allowable_vo" :gutter="0">
      <el-col :span="24" style="padding: 10px 20px">
        <div v-if="orderDetail.order_operate_allowable_vo.allow_check_cancel && orderDetail.order_status != 'CANCELLED'" style="padding: 10px 0px">
          <el-alert title="当前订单已申请取消，可以到'订单管理-售后服务列表'中查看订单取消进度" type="warning" :closable="false" show-icon></el-alert>
        </div>
        <div v-if="orderDetail.order_type === 'CHANGE' || orderDetail.order_type === 'SUPPLY_AGAIN'" style="padding: 10px 0px">
          <el-alert title="当前订单为用户售后服务申请审核通过后重新创建的订单" type="warning" :closable="false" show-icon></el-alert>
        </div>
        <el-button
          type="primary"
          size="mini"
          :disabled="!orderDetail.order_operate_allowable_vo.allow_complete"
          @click="confirmcCmplete"
        >订单完成</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="!orderDetail.order_operate_allowable_vo.allow_pay"
          @click="confirmPay"
        >确认收款</el-button>
        <el-button
          type="danger"
          size="mini"
          :disabled="!orderDetail.order_operate_allowable_vo.allow_cancel"
          @click="cancelOrder"
        >取消订单</el-button>
        <el-button
          type="danger"
          size="mini"
          :disabled="orderDetail.service_status === 'EXPIRED'||orderDetail.order_status !== 'COMPLETE'"
          @click="serviceComplete"
        >售后失效</el-button>
      </el-col>
    </el-row>
    <OrderBaseInfo
      :orderDetail="orderDetail"
    />
  </div>
</template>

<script>
  import * as API_order from '@/api/order'
  import OrderBaseInfo from './components/OrderBaseInfo'

  export default {
    name: 'orderDetail',
    components: {
      OrderBaseInfo
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 订单详情数据 */
        orderDetail: {},
        /** 订单sn */
        sn: this.$route.params.sn
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'orderDetail') return
          this.sn = newVal.params.sn
          if (!this.sn) return
          this.GET_OrderDetail()
        }
      }
    },
    methods: {
      GET_OrderDetail() {
        this.loading = true
        API_order.getOrderDetail(this.sn).then(response => {
          this.loading = false
          this.orderDetail = response
        }).catch(() => { this.loading = false })
      },

      /** 确认收款 */
      confirmPay() {
        this.$confirm('确定要确认收款吗？', '提示', { type: 'warning' }).then(() => {
          API_order.confirmPay(this.sn, this.orderDetail.need_pay_money).then(response => {
            this.$message.success('订单确认收款成功！')
            this.$route.params.callback()
            this.GET_OrderDetail()
          })
        }).catch(() => {})
      },

      /** 订单完成 */
      confirmcCmplete() {
        this.$confirm('确定订单已完成吗？', '提示', { type: 'warning' }).then(() => {
          API_order.completeOrder(this.sn).then(response => {
            this.$message.success('订单确认完成成功！')
            this.$route.params.callback()
            this.GET_OrderDetail()
          })
        }).catch(() => {})
      },
      /** 售后失效 */
      serviceComplete() {
        this.$confirm('确定要完成这个订单的售后吗？', '提示', { type: 'warning' }).then(() => {
          API_order.serviceComplete(this.sn).then(() => {
            this.$message.success('订单售后成功！')
            this.$route.params.callback()
            this.GET_OrderDetail()
          })
        }).catch(() => {})
      },
      /** 取消订单 */
      cancelOrder() {
        this.$confirm('确定要取消这个订单吗？', '提示', { type: 'warning' }).then(() => {
          API_order.cancleOrder(this.sn).then(() => {
            this.$message.success('订单取消成功！')
            this.$route.params.callback()
            this.GET_OrderDetail()
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .order-detail-container {
    background-color: #fff;
  }

</style>

