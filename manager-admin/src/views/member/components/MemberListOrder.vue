<template>
  <div class="member-order-wrap">
    <el-table :data="tableData.data" :header-cell-style="{textAlign: 'center'}">
      <el-table-column prop="sn" label="订单号" width="150"  align="center" />
      <el-table-column prop="order_status_text"  label="订单状态" align="center"></el-table-column>
      <el-table-column prop="pay_status_text"  label="支付状态" align="center"></el-table-column>
      <el-table-column prop="create_time"  align="center" :formatter="MixinUnixToDate" label="下单时间"></el-table-column>
    </el-table>

    <div class="pagination-box">
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
    </div>
  </div>
</template>

<script>
  import * as API_Order from '@/api/order'

  export default {
    name: 'memberListOrder',
    props: ['member-id'],
    data() {
      return {
        // 列表loading状态
        loading: false,
        // 列表参数
        params: {
          page_no: 1,
          page_size: 10,
          member_id: this.memberId
        },
        // 列表数据
        tableData: ''
      }
    },
    mounted() {
      this.GET_MemberListOrder()
    },
    watch: {
      memberId() {
        this.params.member_id = this.memberId
        this.GET_MemberListOrder()
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_MemberListOrder()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MemberListOrder()
      },

      /** 获取会员订单列表 */
      GET_MemberListOrder() {
        this.loading = true
        API_Order.getOrderList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" scoped>
.member-order-wrap {
  .pagination-box {
   margin-top: 20px;
   overflow-x: hidden;
   text-align: right;
  }
}

</style>
