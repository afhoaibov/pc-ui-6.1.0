<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            placeholder="请输入手机号"
            :advancedWidth="500"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="任务编号">
                  <el-input size="medium" v-model="advancedForm.task_id" clearable></el-input>
                </el-form-item>
                <el-form-item label="会员手机号">
                  <el-input size="medium" v-model="advancedForm.mobile" clearable></el-input>
                </el-form-item>
                <el-form-item label="发送时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.register_time_range"
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
        <el-table-column prop="mobile" label="手机号">
          <template slot-scope="scope">
            {{scope.row.mobile | formatMobile}}
          </template>
        </el-table-column>
        <el-table-column prop="send_content" label="内容" />
        <el-table-column prop="create_time" label="发送时间" :formatter="MixinUnixToDate" />
        <el-table-column prop="send_status" label="状态">
          <template slot-scope="scope">
            {{taskStatus(scope.row.send_status)}}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="状态描述" />
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
  import * as API_Message from '@/api/message'

  export default {
    name: 'MessageRecord',
    props: {
      taskId: {
        type: String,
        default: ''
      },
      activeName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        advancedForm: {},
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20
        },
        /** 列表数据 */
        tableData: {}
      }
    },
    watch: {
      activeName: {
        handler(val) {
          if (val === 'record') {
            this.getTaskRecord()
          }
        }
      },
      taskId: {
        handler(val) {
          this.params.task_id = val
          this.getTaskRecord()
        },
        immediate: true
      }
    },
    computed: {
      taskStatus() {
        return (status) => {
          switch (status) {
            case 'WAIT_RECEIPT': return '等待回执'
            case 'SUCCESS': return '用户接收成功'
            case 'FAIL': return '用户接收失败'
          }
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getTaskRecord()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getTaskRecord()
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.mobile = keyword
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.getTaskRecord()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = this.advancedForm
        const { register_time_range } = advancedForm

        Object.keys(advancedForm).forEach(key => {
          if (advancedForm[key] !== undefined && key !== 'register_time_range') {
            this.params[key] = advancedForm[key]
          }
        })
        if (register_time_range && register_time_range.length === 2) {
          this.params.start_time = register_time_range[0] / 1000
          this.params.end_time = register_time_range[1] / 1000
        } else {
          delete this.params.start_time
          delete this.params.end_time
        }
        this.params.page_no = 1

        this.getTaskRecord()
      },

      /** 获取会员列表 */
      getTaskRecord() {
        this.loading = true
        const { params } = this
        API_Message.getTaskRecord(params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container {
    background: #fff !important;
    ::v-deep .toolbar {
      height: auto !important;
    }
    .inner-toolbar {
      margin-bottom: 20px;
      padding: 0;
      justify-content: flex-end;
    }
    .toolbar-search {
      display: flex;
      align-items: center;
      .label {
        color: #444;
        font-size: 14px;
      }
      .search-btn {
        margin-left: 10px;
        width: 100px;
      }
    }
  }

</style>
