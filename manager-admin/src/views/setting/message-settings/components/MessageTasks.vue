<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button type="primary" @click="sendMessage">发送短信</el-button>
        </div>
        <div class="toolbar-search">
          <span class="label">任务状态：</span>
          <el-select
            v-model="params.task_status"
            clearable
            placeholder="请选择"
            @change="searchEvent">
            <el-option label="未开始" value="NOT_STARTED" />
            <el-option label="已开始" value="STARTED" />
            <el-option label="已结束" value="OVER" />
            <el-option label="已撤销" value="RECALL" />
          </el-select>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="id" label="任务编号" width="150" />
        <el-table-column prop="create_time" width="140" label="创建时间" :formatter="MixinUnixToDate" />
        <el-table-column prop="send_content" label="内容"/>
        <el-table-column prop="email" label="接收人" width="200">
          <template slot-scope="scope">
            <span v-if="scope.row.receive_type === 'ALL'">全部会员</span>
            <p v-if="scope.row.receive_type === 'CUSTOM'">
              自定义选择
            </p>
            <p v-if="scope.row.manual_receiver">
              <span v-if="scope.row.custom_receiver || scope.row.receive_type === 'ALL'">以上;</span>
              {{scope.row.manual_receiver}}
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="expected_people_num" label="预计接收人数"/>
        <el-table-column prop="success_people_num" label="成功接收人数"/>
        <el-table-column prop="send_time" width="140" label="发送时间" :formatter="MixinUnixToDate" />
        <el-table-column prop="task_status" label="任务状态">
          <template slot-scope="scope">
            {{taskStatus(scope.row.task_status)}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="checkInfo(scope.row)">详情</el-button>
            <el-button
              size="mini"
              type="primary"
              v-if="scope.row.task_status === 'NOT_STARTED'"
              @click="handleWithdraw(scope.row)">撤回</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="checkTaskRecord(scope.row)">发送记录</el-button>
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
  import * as API_Message from '@/api/message'

  export default {
    name: 'MessageTasks',
    props: {
      activeName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        // 地区id数组
        defaultRegion: null,

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
          if (val === 'tasks') {
            this.getSmsTaskList()
          }
        }
      },
      $route: {
        handler(val) {
          if (val.name === 'textMessage') {
            this.getSmsTaskList()
          }
        },
        immediate: true
      }
    },
    computed: {
      taskStatus() {
        return (status) => {
          switch (status) {
            case 'NOT_STARTED': return '未开始'
            case 'STARTED': return '已开始'
            case 'OVER': return '已结束'
            case 'RECALL': return '已撤销'
          }
        }
      }
    },
    methods: {
      /**  撤回任务 */
      handleWithdraw(row) {
        API_Message.withdrawTask(row.id).then(res => {
          this.$message.success('撤回成功！')
          this.getSmsTaskList()
        })
      },
      /** 查看发送任务 */
      checkInfo(row) {
        this.$router.push({
          name: 'checkMessage',
          params: {
            id: row.id
          }
        })
      },
      /** 新增发送任务 */
      sendMessage() {
        this.$router.push({
          name: 'sendMessage'
        })
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getSmsTaskList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getSmsTaskList()
      },

      /** 查看发送记录 */
      checkTaskRecord(row) {
        this.$emit('checkTaskRecord', row.id)
      },

      /** 搜索事件触发 */
      searchEvent() {
        this.params.page_no = 1
        this.getSmsTaskList()
      },

      /** 获取列表 */
      getSmsTaskList() {
        this.loading = true
        const { params } = this
        API_Message.getSmsTaskList(params).then(response => {
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
