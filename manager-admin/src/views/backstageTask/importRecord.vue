<!-- 导入记录代开发中 未完成 by 2023-1-17 -->
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
            placeholder="请输入执行人名称"
            :advancedWidth="500"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="类型：">
                  <el-select clearable v-model="advancedForm.module_type" placeholder="请选择">
                    <el-option label="分类参数导入" value="CategoryParameterImport"/>
                    <el-option label="分类导入" value="CategoryImport"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="状态">
                  <el-select clearable v-model="advancedForm.status" placeholder="请选择">
                    <el-option
                      label="进行中"
                      value="processing">
                    </el-option>
                    <el-option
                      label="已完成"
                      value="success">
                    </el-option>
                    <el-option
                      label="异常"
                      value="error">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column label="任务类型">
          <template slot-scope="scope">
            {{moduleTypeText(scope.row.module_type)}}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">{{ statusText(scope.row.status) }}</template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{ scope.row.created_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column prop="username" label="执行人"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="viewTaskResult(scope.row)"
              >查看结果</el-button>
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

    <el-dialog
      title="导入结果"
      :visible.sync="showDialog"
      width="500px"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="showDialog = false">
      <div v-html="taskResult"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  import * as API_Task from '@/api/task'
  // 导入类型常量
  const ModuleType = [
    { value: 'CategoryParameterImport', name: '分类参数导入' },
    { value: 'CategoryImport', name: '分类导入' }
  ]
  export default {
    name: 'importRecord',
    data() {
      return {
        ModuleType,
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          operate_type: 'IMPORT'
        },
        /** 高级搜索数据 */
        advancedForm: {},
        tableData: {},
        showDialog: false,
        taskResult: ''
      }
    },
    computed: {
      /** 状态 */
      statusText() {
        return (status) => {
          switch (status) {
            case 'processing':
              return '进行中'
            case 'success':
              return '已完成'
            case 'error':
              return '异常'
          }
        }
      },
      /** 报表类型 */
      moduleTypeText() {
        return (type) => {
          const typeItem = ModuleType.find(item => { return item.value === type })
          return typeItem ? typeItem.name : ''
        }
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'importRecord') return
          this.getImportTaskRecord()
        }
      }
    },

    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.username = keyword
        this.params.page_no = 1
        this.getImportTaskRecord()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = this.advancedForm
        Object.keys(advancedForm).forEach(key => {
          if (advancedForm[key] !== undefined) {
            this.params[key] = advancedForm[key]
          }
        })
        this.params.page_no = 1
        this.getImportTaskRecord()
      },

      /** 查看导入结果 */
      viewTaskResult(row) {
        this.showDialog = true
        this.taskResult = row.task_result
      },

      /** 获取导入记录 */
      getImportTaskRecord() {
        const params = this.params
        API_Task.geTaskRecord(params).then(res => {
          this.tableData = res
        })
      }
    }
  }
</script>
