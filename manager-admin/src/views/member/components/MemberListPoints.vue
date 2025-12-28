<template>
  <div>
    <el-table :loading="loading" :data="tableData.data" :header-cell-style="{textAlign: 'center'}">
      <el-table-column prop="time" :formatter="MixinUnixToDate" width="140" align="center" label="日期"/>
      <el-table-column prop="operator" label="操作者" align="center"></el-table-column>
      <el-table-column prop="reason" label="明细" align="center"></el-table-column>
      <el-table-column label="等级积分" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.grade_point === 0">{{ row.grade_point }}</span>
          <span v-else-if="row.grade_point_type === 0">
                -{{ row.grade_point }}
              </span>
          <span v-else>+{{ row.grade_point }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费积分" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.consum_point === 0">{{ row.consum_point }}</span>
          <span v-else-if="row.consum_point_type === 0">
                -{{ row.consum_point }}
              </span>
          <span v-else>+{{ row.consum_point }}</span>
        </template>
      </el-table-column>
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
  import * as API_Member from '@/api/member'

  export default {
    name: 'MemberListPoints',
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
        tableData: '',
        // 查看咨询dialog
        dialogReviewVisible: false,
        // 查看的详情
        reviewAsk: {}
      }
    },
    mounted() {
      this.GET_MemberListPoints()
    },
    watch: {
      memberId() {
        this.params.member_id = this.memberId
        this.GET_MemberListPoints()
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_MemberListPoints()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MemberListPoints()
      },

      /** 获取会员积分列表 */
      GET_MemberListPoints() {
        this.loading = true
        API_Member.getMemberPointList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" scoped>
.pagination-box {
   margin-top: 20px;
   overflow-x: hidden;
   text-align: right;
}
</style>
