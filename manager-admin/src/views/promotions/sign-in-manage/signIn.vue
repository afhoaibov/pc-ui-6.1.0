<template>
  <div>
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleAddSign">添加</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="465"
            placeholder="请输入活动名称"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="活动名称">
                  <el-input size="medium" v-model="advancedForm.act_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="活动状态">
                  <el-select v-model="advancedForm.act_status" placeholder="请选择">
                    <el-option label="全部" value="ALL"/>
                    <el-option label="未开始" value="NOT_STARTED"/>
                    <el-option label="进行中" value="STARTED"/>
                    <el-option label="已结束" value="OVER"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                  <el-date-picker
                    v-model="advancedForm.act_time_range"
                    type="daterange"
                    align="center"
                    :editable="false"
                    unlink-panels
                    :default-time="['00:00:00', '23:59:59']"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="timestamp"
                    :picker-options="{ disabledDate (time) { return time.getTime() - 2592e6 - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column label="活动标题">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template slot-scope="scope">{{ scope.row.start_date | unixToDate }}</template>
        </el-table-column>
        <el-table-column label="结束时间">
          <template slot-scope="scope">{{ scope.row.end_date | unixToDate }}</template>
        </el-table-column>
        <el-table-column prop="status" label="活动状态">
          <template slot-scope="scope">{{ scope.row.status | filterStatus }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              v-if="scope.row.status === 'WAIT'"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handlerView(scope.row)">查看</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleViewRecord(scope.row)">签到记录</el-button>
            <el-button
              v-if="scope.row.status === 'CLOSE' || scope.row.status === 'FINISH'"
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
            <el-button
              v-else-if="scope.row.status === 'OPEN' || scope.row.status === 'WAIT'"
              size="mini"
              type="danger"
              @click="handleClose(scope.row)">关闭</el-button>
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
    </en-table-layout>
  </div>
</template>

<script>
  import * as API_Promotion from '@/api/promotion'

  export default {
    name: 'signIn',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },

        /** 列表数据 */
        tableData: '',

        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    filters: {
      filterStatus(status) {
        switch (status) {
          case 'OPEN':
            return '进行中'
          case 'WAIT':
            return '待开始'
          case 'CLOSE':
            return '已关闭'
          case 'FINISH':
            return '已结束'
        }
      }
    },
    watch: {
      $route: {
        handler(val) {
          if (val.name === 'signIn') {
            this.getSignActiveList()
          }
        },
        immediate: true
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getSignActiveList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getSignActiveList()
      },

      /** 添加签到活动 */
      handleAddSign() {
        this.$router.push({
          name: 'addSignIn'
        })
      },
      /** 查看签到记录 */
      handleViewRecord(row) {
        this.$router.push({
          name: 'signInRecord',
          query: { id: row.id }
        })
      },
      /** 查看活动详情 */
      handlerView(row) {
        this.$router.push({
          path: `/promotions/view-sign-in/${row.id}`
        })
      },

      /** 关闭活动 */
      handleClose(row) {
        API_Promotion.closeSignInActivity(row.id).then(() => {
          this.$message.success('活动已关闭')
          this.getSignActiveList()
        })
      },
      /** 删除活动 */
      handleDelete(row) {
        API_Promotion.deleteSignInActivity(row.id).then(res => {
          this.$message.success('删除成功！')
          this.getSignActiveList()
        })
      },

      /** 修改活动 */
      handleEdit(row) {
        this.$router.push({
          path: `/promotions/edit-sign-in/${row.id}`
        })
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.act_name = data
        if (!data) delete this.params.act_name
        this.getSignActiveList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          ...this.advancedForm
        }
        if (!this.params.act_status) this.params.act_status = 'ALL'
        delete this.params.start_time
        delete this.params.end_time
        const { act_time_range } = this.advancedForm
        if (act_time_range) {
          this.params.start_time = parseInt(act_time_range[0] /= 1000)
          this.params.end_time = parseInt(act_time_range[1] /= 1000)
        }
        delete this.params.act_time_range
        this.params.page_no = 1
        this.getSignActiveList()
      },

      /** 获取活动列表 */
      getSignActiveList() {
        this.loading = true
        API_Promotion.getSignActiveList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style type="text/scss" lang="scss">
  .el-dialog__title {
    font-size:17px;
  }
</style>
