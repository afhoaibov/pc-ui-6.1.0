<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar inner-toolbar2">
        <div class="toolbar-btns">
        </div>
        <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="账号/操作内容/IP地址"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="日志级别">
                  <el-select v-model="advancedForm.level" placeholder="请选择" clearable>
                    <el-option label="一般" value="normal"/>
                    <el-option label="重要" value="important"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="操作时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.order_time_range"
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

      <template slot="table-columns">
        <el-table-column prop="operator_name" label="账号"/>
        <el-table-column prop="operate_detail" label="操作描述"/>
        <el-table-column label="操作时间" align="center">
          <template slot-scope="scope">{{ scope.row.operate_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column prop="operate_ip" label="IP地址">
          <template slot-scope="{ row }">
            <clipboard :text="row.operate_ip" />
          </template>
        </el-table-column>
        <el-table-column label="日志级别" align="center">
          <template slot-scope="scope">{{ scope.row.level === 'important' ? '重要' : '一般' }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleShowDetail(scope.row)">查看</el-button>
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

    <el-dialog title="日志详情" :visible.sync="showLogDetail"  width="40%">
      <div class="logInfo">账号：{{currDetailLog.operator_name}}</div>
      <div class="logInfo">操作描述：{{currDetailLog.operate_detail}}</div>
      <div class="logInfo">请求方法：{{currDetailLog.method}}</div>
      <div class="logInfo">请求参数：{{currDetailLog.params}}</div>
      <div class="logInfo">ip地址：{{currDetailLog.operate_ip}}</div>
      <div class="logInfo">日志级别：{{currDetailLog.level === 'important' ? '重要' : '一般' }}</div>
      <div class="logInfo">操作时间：{{ currDetailLog.operate_time | unixToDate }}</div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_System from '@/api/system'

  export default {
    name: 'systemLogs',
    data() {
      return {
        // 列表loading状态
        loading: false,
        // 列表参数
        params: {
          page_no: 1,
          page_size: 20
        },
        // 列表数据
        tableData: '',
        // 时间输入框
        searchTime: '',
        // 是否显示日志详情弹窗
        showLogDetail: false,
        // 当前日志详情信息
        currDetailLog: {},
        // 高级搜索数据
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_SystemLogs()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_SystemLogs()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SystemLogs()
      },
      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          keyword: data
        }
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_SystemLogs()
      },
      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          ...this.advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.order_time_range) {
          this.params.start_time = this.advancedForm.order_time_range[0] / 1000
          this.params.end_time = this.advancedForm.order_time_range[1] / 1000
        }
        delete this.params.keyword
        delete this.params.order_time_range
        this.params.page_no = 1
        this.GET_SystemLogs()
      },

      /** 获取日志列表 */
      GET_SystemLogs() {
        this.loading = true
        const params = this.MixinClone(this.params)
        Object.keys(params).forEach(key => {
          if (!params[key] && params[key] !== 0) {
            delete params[key]
          }
        })
        API_System.getSystemLogs(params).then(response => {
          this.loading = false
          this.tableData = response
          this.params.page_no = response.page_no
          this.params.page_size = response.page_size
        }).catch(() => { this.loading = false })
      },
      /** 显示日志详情 */
      handleShowDetail(row) {
        this.showLogDetail = true
        this.currDetailLog = row
      }
    }
  }
</script>

<style>
  .inner-toolbar2 {
    justify-content: flex-end !important;
  }
  .inner-toolbar2 .dateSearch{
    margin-right: 20px;
  }
  .toolbar-search{
    display: flex;
    width: 400px;
  }
  .toolbar-search .el-button{
    margin-left: 18px;
  }
</style>
<style type="text/scss" lang="scss" scoped>
  .nc-container{
    height: 32px !important;
    overflow: hidden;

  }
  .face-image {
    display: block;
    width: 50px;
    height: 50px;
    margin: 0 auto;
  }
  .container ::v-deep .el-dialog__body {
    padding: 10px 20px;
  }
  .container ::v-deep .img-code {
    width: 80%;
    .el-input-group__append {
      padding: 0;
      margin: 0;
      img {
        display: block;
        height: 30px;
        cursor: pointer;
      }
    }
  }
  .dateSearch{

  }
  .logInfo{
    margin-bottom: 20px;
  }
</style>
