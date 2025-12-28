<template>
  <div>
    <en-table-layout
      :toolbar="false"
      :tableData="tableData.data"
      :loading="loading"
    >
      <template slot="table-columns">
        <el-table-column prop="name" label="名称"/>
        <el-table-column prop="open" label="状态" :formatter="tplStatus"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.open === 1"
              size="mini"
              type="danger"
              @click="handleOpenAndStopWechatMessage(scope.row, 0)">停用</el-button>
            <el-button
              v-else
              size="mini"
              type="primary"
              @click="handleOpenAndStopWechatMessage(scope.row, 1)">启用</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleConfigWechatMessage(scope.row)">配置</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleWechatMessageTemplate(scope.row)">模板列表</el-button>
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
      title="修改配置"
      :visible.sync="dialogVisible" width="40%"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="messageForm" label-width="150px">
        <el-form-item label="消息令牌（Token）" prop="token">
          <el-input v-model="messageForm.notice_token" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item v-if="noticeType === 'Wechat_Mini_Program'" label="消息加密密钥（EncodingAESKey）" prop="aes_key">
          <el-input v-model="messageForm.aes_key" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="小程序ID（AppID）" prop="app_id" v-if="noticeType === 'Wechat_Mini_Program'">
          <el-input v-model="messageForm.app_id" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitWechatMessage">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Message from '@/api/message'

export default {
  name: 'wechatMessage',
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
      tableData: '',
      // 消息模板 表单
      messageForm: {},
      // 消息模板 dialog
      dialogVisible: false,
      // 订阅消息类型
      noticeType: ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'wechatMessage') return
        this.params.page_no = 1
        this.GET_MessageSettingList()
      }
    }
  },
  methods: {
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_MessageSettingList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_MessageSettingList()
    },

    /** 销售状态格式化 */
    tplStatus(row) {
      return row.open === 1 ? '已启用' : '已停用'
    },

    handleConfigWechatMessage(row) {
      this.messageForm = {}
      this.noticeType = row.notice_type
      if (row.config_items) {
        this.messageForm = JSON.parse(JSON.stringify(row.config_items))
      }
      this.dialogVisible = true
    },

    /** 启用或停用微信订阅通知 */
    async handleOpenAndStopWechatMessage(row, open) {
      this.$confirm(`确定要${open ? '启用' : '停用'}吗？`, '提示', { type: 'warning' }).then(() => {
        API_Message.openAndCloseWechatNotice(row.notice_type, open).then(() => {
          this.$message.success('操作成功')
          this.GET_MessageSettingList()
        })
      }).catch(() => {})
    },

    /** 提交(修改)微信消息 */
    submitWechatMessage() {
      API_Message.modifyWechatConfigItem(this.noticeType, this.messageForm).then(res => {
        this.$message.success('修改成功')
        this.dialogVisible = false
        this.GET_MessageSettingList()
      })
    },

    /** 跳转模板列表 */
    handleWechatMessageTemplate(row) {
      this.$router.push({
        name: 'wechatTemplate',
        params: {
          notice_type: row.notice_type
        }
      })
    },

    /** 获取微信服务消息列表 */
    GET_MessageSettingList() {
      this.loading = true
      API_Message.getWechatSubScribeNoticeList(this.params).then(response => {
        this.tableData = response
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
