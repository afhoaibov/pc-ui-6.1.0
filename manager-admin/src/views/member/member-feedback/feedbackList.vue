<template>
  <div>
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns"></div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="手机号">
                  <el-input size="medium" v-model="advancedForm.mobile" clearable></el-input>
                </el-form-item>
                <el-form-item label="反馈内容">
                  <el-input v-model="advancedForm.content" clearable></el-input>
                </el-form-item>
                <el-form-item label="反馈类型">
                  <el-select v-model="advancedForm.feedback_type" placeholder="请选择" clearable>
                    <el-option label="遇到问题" value="TROUBLE"/>
                    <el-option label="功能建议" value="FUNCTION"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="反馈日期">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.create_time_range"
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
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="反馈日期"/>
        <el-table-column prop="mobile" label="手机号"/>
        <el-table-column prop="content" label="反馈内容"/>
        <el-table-column label="反馈类型">
          <template slot-scope="scope">{{ scope.row.feedback_type | typeFilter }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteFeekback(scope.$index, scope.row)">删除</el-button>
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
  import * as API_O2O from '@/api/o2o'
  import { Foundation } from '~/ui-utils'

  export default {
    name: 'feedbackList',
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
        tableData: {},
        // 关键字
        keyword: '',
        // 高级搜索
        advancedForm: {},
        // 当前已选择的行
        multipleSelection: []
      }
    },
    mounted() {
      this.GET_FeedbackList()
    },
    filters: {
      typeFilter(val) {
        switch (val) {
          case 'TROUBLE': return '遇到问题'
          case 'FUNCTION': return '功能建议'
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_FeedbackList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_FeedbackList()
      },
      /** 删除意见反馈 */
      handleDeleteFeekback(index, row) {
        this.$confirm('确定要删除这条意见反馈吗？', '提示', { type: 'warning' }).then(() => {
          API_O2O.deleteMemberFeedback(row.id).then(() => {
            this.$message.success('删除成功！')
            this.GET_FeedbackList()
          })
        }).catch(() => {})
      },
      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.keyword = keyword
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_FeedbackList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const { advancedForm } = this
        Object.keys(advancedForm).forEach(key => {
          if (advancedForm[key] !== undefined) {
            this.params[key] = advancedForm[key]
          }
        })

        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.create_time_range) {
          this.params.start_time = this.advancedForm.create_time_range[0]
          this.params.end_time = this.advancedForm.create_time_range[1]
        }
        delete this.params.create_time_range
        delete this.params.keyword
        this.params.page_no = 1
        this.GET_FeedbackList()
      },
      /** 获取咨询列表 */
      GET_FeedbackList() {
        this.loading = false
        const params = this.MixinClone(this.params)
        Object.keys(params).forEach(key => {
          if (!params[key] && params[key] !== 0) {
            delete params[key]
          }
        })
        if (params.start_time && params.end_time) {
          params.start_time = parseInt(params.start_time / 1000)
          params.end_time = parseInt(params.end_time / 1000)
        }
        API_O2O.getMemberFeedback(params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
