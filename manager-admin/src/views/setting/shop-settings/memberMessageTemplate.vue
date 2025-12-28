<template>
  <div>
    <en-table-layout
      :toolbar="false"
      :tableData="tableData.data"
      :loading="loading"
    >
      <template slot="table-columns">
        <el-table-column prop="template_name" label="模板名称"/>
        <el-table-column label="模板审核状态" :formatter="auditStatus"/>
        <el-table-column label="模板启用状态">
          <template slot-scope="scope">
            {{ scope.row.enable_status === 'OPEN' ? '已开启' : '已关闭' }}
            <el-button v-if="scope.row.audit_status === 'PASS'" type="text" @click="handleOpenSmsTemplate(scope.$index, scope.row)">{{ scope.row.enable_status === 'OPEN' ? '关闭' : '开启'}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              :disabled="scope.row.audit_status === 'AUDITING'|| scope.row.enable_status === 'OPEN' "
              @click="handleEditTemplate(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="primary"
              :disabled="scope.row.audit_status === 'AUDITING' || scope.row.audit_status === 'PASS'"
              v-if="params.bean_id === 'smsAliPlugin'"
              @click="handleAuditTemplate(scope.$index, scope.row)">提交审核</el-button>
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
      :title="dialogTemplateAuditTitle"
      :visible.sync="dialogTemplateVisible"
      width="500px"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="template-content">
        <div class="left">模板内容</div>
        <div class="right">
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入模板内容"
            v-model="templateContent">
          </el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogTemplateVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSmsTemplate">保 存</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提交审核"
      :visible.sync="dialogAuditTemplateVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="template-content">
        <div class="left">申请说明</div>
        <div class="right">
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入申请说明"
            v-model="remark">
          </el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAuditTemplateVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAuditSmsTemplate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_SmsGateway from '@/api/smsGateway'

export default {
  name: 'memberMessageTemplate',
  data() {
    return {
      /** 列表loading状态 */
      loading: false,
      /** 列表参数 */
      params: {
        page_no: 1,
        page_size: 10,
        bean_id: this.$route.params.bean_id,
        service_type: 'MEMBER'
      },
      /** 列表数据 */
      tableData: '',
      /** 模板ID */
      templateID: '',
      /** 模板内容 */
      templateContent: '',
      /** 模板表单 dialog */
      dialogTemplateVisible: false,
      /** 编辑模板 dialogTitle */
      dialogTemplateAuditTitle: '编辑模板',
      /** 审核 dialog */
      dialogAuditTemplateVisible: false,
      /** 审核说明 */
      remark: ''
    }
  },
  mounted() {
    this.GET_SmsTemplateList()
  },
  methods: {
    /** 状态格式化 */
    auditStatus(row) {
      switch (row.audit_status) {
        case 'WAITING': return '待审核'
        case 'AUDITING': return '审核中'
        case 'PASS': return '审核通过'
        case 'NOT_PASS': return '审核未通过'
      }
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_SmsTemplateList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_SmsTemplateList()
    },

    /** 编辑短信模板 */
    handleEditTemplate(index, row) {
      this.dialogTemplateVisible = true
      API_SmsGateway.getSmsTemplateDetail(row.id).then(response => {
        this.templateID = response.id
        this.templateContent = response.template_content
        this.dialogTemplateAuditTitle = '编辑模板 - ' + response.template_name
      })
    },

    /** 提交审核 */
    submitAuditSmsTemplate() {
      if (!this.remark.trim()) {
        return this.$message.error('请输入申请说明')
      }
      API_SmsGateway.getAuditSmsTemplate(this.templateID, this.remark).then(response => {
        this.$message.success('提交成功！')
        this.dialogAuditTemplateVisible = false
        this.GET_SmsTemplateList()
      })
    },

    /** 提交审核 dialog */
    handleAuditTemplate(index, row) {
      this.dialogAuditTemplateVisible = true
      this.templateID = row.id
      this.remark = ''
    },

    /** 开启短信模板 */
    handleOpenSmsTemplate(index, row) {
      let enable_status = row.enable_status === 'OPEN' ? 'CLOSE' : 'OPEN'
      console.log(row.enable_status, enable_status)
      API_SmsGateway.getSmsTemplateStatus(row.id, enable_status).then(response => {
        this.$message.success(enable_status === 'OPEN' ? '开启成功！' : '关闭成功!')
        this.GET_SmsTemplateList()
      })
    },

    /** 修改模板内容 */
    submitSmsTemplate() {
      if (!this.templateContent.trim()) {
        return this.$message.error('请输入模板内容')
      }
      API_SmsGateway.getSmsTemplate(this.templateID, this.templateContent).then(response => {
        this.dialogTemplateVisible = false
        this.$message.success('修改成功！')
      })
    },

    /** 获取短信模板列表 */
    GET_SmsTemplateList() {
      this.loading = true
      API_SmsGateway.getSmsTemplateList(this.params).then(response => {
        this.loading = false
        this.tableData = response
      }).catch(() => { this.loading = false })
    }
  }
}
</script>
