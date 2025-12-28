<template>
  <div>
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addSignature">新增</el-button>
          <el-button type="primary" @click="syncSignStatus">
            同步签名状态
            <el-tooltip placement="right" effect="light">
              <div slot="content">点击立即由第三方（阿里云等）同步审核状态</div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-button>
        </div>
        <div class="toolbar-search">
          <el-input size="medium" v-model="params.sign_name" clearable placeholder="请输入关键词"></el-input>
          <el-button type="primary" class="search-btn" @click="searchEvent">查询</el-button>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="sign_name" label="签名名称"/>
        <el-table-column prop="apply_explain" label="申请说明" />
        <el-table-column prop="sign_status" label="状态">
          <template slot-scope="scope">
            {{signStatus(scope.row.sign_status)}}
            <el-popover
              v-if="scope.row.fail_reason"
              placement="top-start"
              title=""
              width="200"
              trigger="hover"
              :content="scope.row.fail_reason">
              <el-button slot="reference" type="text">原因</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              v-if="scope.row.sign_status === 'WAIT_INIT' || scope.row.sign_status === 'NOT_PASS'"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              v-if="scope.row.sign_status !== 'AUDITING'"
              @click="deleteSmsSign(scope.row)">删除</el-button>
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
  import * as API_SmsGateway from '@/api/smsGateway'

  export default {
    name: 'MessageSign',
    props: {
      activeName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 列表loading状态
        loading: false,

        // 地区id数组
        defaultRegion: null,

        // 列表参数
        params: {
          page_no: 1,
          page_size: 10
        },
        // 列表数据
        tableData: {},
        // 当前开启的短信网关应用id
        pluginId: ''
      }
    },
    computed: {
      signStatus() {
        return (status) => {
          switch (status) {
            case 'WAIT_INIT': return '待初始化'
            case 'AUDITING': return '审核中'
            case 'PASS': return '审核通过'
            case 'NOT_PASS': return '审核未通过'
          }
        }
      }
    },
    watch: {
      activeName: {
        handler(val) {
          if (val === 'signature') {
            this.getSmsSignList()
          }
        }
      },
      $route: {
        handler(val) {
          if (val.name === 'textMessage') {
            this.getSmsSignList()
            this.getOpenSmsPlatforms()
          }
        },
        immediate: true
      }
    },
    methods: {
      /** 新增签名 */
      addSignature() {
        this.$router.push({ name: 'addMessageSign', params: { pluginId: this.pluginId }})
      },
      /** 编辑签名 */
      handleEdit(row) {
        this.$router.push({ name: 'editMessageSign', params: { pluginId: this.pluginId, id: row.id }})
      },
      /** 删除签名 */
      deleteSmsSign(row) {
        this.$confirm('确认要删除此签名?', '提示', { type: 'warning' }).then(() => {
          API_Message.deleteSmsSign(this.pluginId, row.id).then(res => {
            this.$message.success('删除成功！')
            this.getSmsSignList()
          })
        })
      },

      /** 同步签名状态 */
      syncSignStatus() {
        API_Message.syncSignStatus(this.pluginId).then(res => {
          this.$message.success('同步成功！')
          this.getSmsSignList()
        })
      },

      /** 获取开启的短信网关 */
      getOpenSmsPlatforms() {
        API_SmsGateway.getOpenSmsPlatforms().then(res => {
          this.pluginId = res.plugin_id
        })
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getSmsSignList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getSmsSignList()
      },

      /** 搜索事件触发 */
      searchEvent() {
        this.params.page_no = 1
        this.getSmsSignList()
      },

      /** 获取签名列表 */
      getSmsSignList() {
        this.loading = true
        const { params } = this
        API_Message.getSmsSignList(params).then(response => {
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
      .search-btn {
        margin-left: 10px;
        width: 100px;
      }
    }
  }

</style>
