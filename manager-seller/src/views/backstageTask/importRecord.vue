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
                    <el-option label="SPU导入" value="SpuImport"></el-option>
                    <el-option label="SKU导入" value="SkuImport"></el-option>
                    <el-option label="商品参数导入" value="ParameterImport"></el-option>
                    <el-option label="商品相册导入" value="GalleryImport"></el-option>
                    <el-option label="商品详情导入" value="GoodsDetailImport"></el-option>
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
                <el-form-item label="注册时间区间">
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
        <el-table-column label="任务类型">
          <template slot-scope="scope">{{ typeText(scope.row.module_type) }}</template>
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
              @click="handleShowDetail(scope.row)"
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
    <!--详情-->
    <el-dialog title="详情" :visible.sync="isShowDetail" width="36%" >
      <div class="detail-task">任务类型：{{ typeText(detailInfo.module_type) }}</div>
      <div class="detail-task">任务状态：{{ statusText(detailInfo.status) }}</div>
      <div class="detail-task">创建时间：{{ detailInfo.created_time | unixToDate }}</div>
      <div class="detail-task">执行人：{{ detailInfo.username }}</div>
      <div class="detail-task" v-if="detailInfo.status === 'error'">异常信息：
        <span v-for="item in errorList" :key="item">{{item}}</span>
      </div>
      <div class="detail-task" v-if="detailInfo.status === 'success'">
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-download"
        ><a :href="detailInfo.task_result" :download="detailInfo.task_name">下载文件</a></el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Task from '@/api/backstageTask'

  export default {
    name: 'importRecord',
    data() {
      return {
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
        isShowDetail: false,
        detailInfo: '',
        errorList: []
      }
    },
    computed: {
      /** 类型 */
      typeText() {
        return (type) => {
          switch (type) {
            case 'SpuImport':
              return 'SPU导入'
            case 'SkuImport':
              return 'SKU导入'
            case 'ParameterImport':
              return '商品参数导入'
            case 'GalleryImport':
              return '商品相册导入'
            case 'GoodsDetailImport':
              return '商品详情导入'
          }
        }
      },
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
        this.getImportTaskRecord()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getImportTaskRecord()
      },

      /** 查看结果 */
      handleShowDetail(row) {
        this.detailInfo = row
        if (row.status === 'error') {
          this.errorList = JSON.parse(row.task_result)
        }
        this.isShowDetail = true
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params = {
          page_no: 1,
          page_size: 10,
          operate_type: 'IMPORT',
          username: keyword
        }
        this.getImportTaskRecord()
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
        this.getImportTaskRecord()
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
<style type="text/scss" lang="scss" scoped>
  .detail-task {
    padding: 5px;
    span {
      display: block;
      padding: 10px;
      margin-left: 10px;
      color: red;
    }
  }
</style>
