<template>
  <div>
    <el-table :data="tableData.data" :header-cell-style="{textAlign: 'center'}">
      <el-table-column prop="create_time" width="160" :formatter="MixinUnixToDate" align="center" label="评论日期"/>
      <el-table-column prop="content" label="评论内容" align="center" width="500"/>
      <el-table-column label="审核状态" align="center">
        <template slot-scope="scope">{{ scope.row.audit_status | statusFilter }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" v-if="!preview">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleViewComments(scope.$index, scope.row)">查看</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDeleteComments(scope.$index, scope.row)">删除</el-button>
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
      title="查看评论详情"
      :visible.sync="dialogReviewVisible"
      width="50%"
    >
      <el-form :model="reviewComments">
        <el-form-item label="评论内容：">
          <br>
          <span class="comment-content">{{ reviewComments.content }}</span>
          <div v-if="reviewComments.images && reviewComments.images.length">
            <div class="comments-image" v-for="image in reviewComments.images" :key="image.url">
              <a :href="image" target="_blank">
                <img :src="image" width="60" height="60">
              </a>
            </div>
          </div>
        </el-form-item>
        <template v-if="reviewComments.reply_status === 1">
          <el-form-item label="商家回复：">
            <br>
            <span class="reply-content">{{ reviewComments.reply.content || '暂无回复' }}</span>
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

  export default {
    name: 'MemberListComments',
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
        // 查看评论 dialog
        dialogReviewVisible: false,
        // 查看评论
        reviewComments: {}
      }
    },
    mounted() {
      this.GET_MemberListComments()
    },
    watch: {
      memberId() {
        this.params.member_id = this.memberId
        this.GET_MemberListComments()
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
        this.GET_MemberListComments()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MemberListComments()
      },

      /** 查看评论 */
      handleViewComments(index, row) {
        this.reviewComments = row
        this.dialogReviewVisible = true
      },

      /** 删除评论 */
      handleDeleteComments(index, row) {
        this.$confirm('确定要删除这个评论吗？', '提示', { type: 'warning' }).then(() => {
          API_Member.deleteMemberComments(row.comment_id).then(() => {
            this.$message.success('删除成功！')
            this.GET_MemberListComments()
          })
        }).catch(() => {})
      },

      /** 获取会员咨询列表 */
      GET_MemberListComments() {
        this.loading = true
        API_Member.getMemberComments(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .comments-image {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .pagination-box {
    margin-top: 20px;
    overflow-x: hidden;
    text-align: right;
  }
  /*评论内容*/
	.comment-content {
		color: #409EFF;
		word-break: break-all;
	}
	/*商家回复*/
  .reply-content {
	  color: #FF5722;
	  word-break: break-all;
  }
</style>
