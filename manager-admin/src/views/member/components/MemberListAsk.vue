<template>
  <div>
    <el-table :data="tableData.data" :header-cell-style="{textAlign: 'center'}">
      <el-table-column prop="create_time" width="160" align="center" :formatter="MixinUnixToDate" label="咨询日期"/>
      <el-table-column prop="content" label="咨询内容" width="500" align="center"/>
      <el-table-column label="审核状态" align="center">
        <template slot-scope="scope">{{ scope.row.auth_status | statusFilter }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" v-if="!preview">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleViewAsk(scope.$index, scope.row)">查看</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDeleteAsk(scope.$index, scope.row)">删除</el-button>
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


    <el-dialog
      title="查看咨询详情"
      :visible.sync="dialogReviewVisible"
      width="50%"
    >
      <el-form :model="reviewAsk">
        <el-form-item label="咨询内容：">
          <br>
          <span class="review-ask-content">{{ reviewAsk.content }}</span>
        </el-form-item>
        <template v-if="reviewAsk.reply_status === 1">
          <el-form-item :label="replyLabel(reviewAsk)">
            <br>
            <span class="review-reply-content">{{ reviewAsk.reply }}</span>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogReviewVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Member from '@/api/member'
  import { Foundation } from '~/ui-utils'

  export default {
    name: 'MemberListAsk',
    props: ['member-id', 'preview'],
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
      this.GET_MemberListAsk()
    },
    watch: {
      memberId() {
        this.params.member_id = this.memberId
        this.GET_MemberListAsk()
      }
    },
    filters: {
      statusFilter(val) {
        switch (val) {
          case 'WAIT_AUDIT': return '审核中'
          case 'PASS_AUDIT': return '审核通过'
          case 'REFUSE_AUDIT': return '审核未通过'
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_MemberListAsk()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MemberListAsk()
      },

      /** 查看咨询 */
      handleViewAsk(index, row) {
        this.reviewAsk = row
        this.dialogReviewVisible = true
      },

      /** 删除咨询 */
      handleDeleteAsk(index, row) {
        this.$confirm('确定要删除这个咨询吗？', '提示', { type: 'warning' }).then(() => {
          API_Member.deleteMemberAsk(row.ask_id).then(() => {
            this.$message.success('删除成功！')
            let totalPage = Math.ceil((this.tableData.data_total - 1) / this.pageData.page_size)
            let page = this.params.page_no > totalPage ? totalPage : this.params.page_no
            this.params.page_no = page < 1 ? 1 : page
            this.GET_MemberListAsk()
          })
        }).catch(() => {})
      },

      /** 回复时间 */
      replyLabel() {
        const ask = this.reviewAsk
        return `商家于[${Foundation.unixToDate(ask.reply_time)}]${ask.reply_status === 1 ? '审核通过' : '审核未通过'}并回复：`
      },

      /** 获取会员咨询列表 */
      GET_MemberListAsk() {
        this.loading = true
        API_Member.getMemberAsks(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" type="text/scss" scoped>
	.review-ask-content {
		word-break: break-all;
		color: #409EFF;
	}
	.review-reply-content{
		color: #FF5722;
		word-break: break-all;
	}
  .pagination-box {
    margin-top: 20px;
    overflow-x: hidden;
    text-align: right;
  }
</style>
