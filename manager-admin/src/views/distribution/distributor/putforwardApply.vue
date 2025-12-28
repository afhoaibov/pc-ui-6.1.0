<template>
  <div class="putforawrd-apply">
    <en-table-layout
      pagination
      :tableData="tableData"
      @selection-change="handleSelectionChange"
      :loading="loading"
      ref="tableContainer"
      :tips="true">
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          导出时，会按右侧高级搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" @click="handleBatchAudit">批量审核</el-button>
          <el-button size="mini" type="primary" @click="handleBatchTransfer">批量转账</el-button>
          <el-button size="mini" type="primary" @click="handleBatchClose">批量关闭</el-button>
          <export-button @exportEvent="handleExportApply" />
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入分销商名称或提现单号">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="提现单号">
                  <el-input size="small" v-model="advancedForm.withdraw_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="申请时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.putforward_time_range"
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
                <el-form-item label="提现状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
                    <el-option label="待审核" value="WAIT_AUDIT"/>
                    <el-option label="待转账" value="AUDIT_PASS"/>
                    <el-option label="转账中" value="TRANSFERRING"/>
                    <el-option label="已完成" value="FINISHED"/>
                    <el-option label="已关闭" value="CLOSED"/>
                    <el-option label="审核未通过" value="AUDIT_FAIL"/>
                    <el-option label="提现失败" value="TRANSFER_FAILED"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="提现方式">
                  <el-select v-model="advancedForm.way" placeholder="请选择" clearable>
                    <el-option label="支付宝" value="ALIPAY"/>
                    <el-option label="微信" value="WECHAT"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="分销商">
                  <el-input size="small" v-model="advancedForm.member_name" clearable></el-input>
                </el-form-item>

              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column type="selection" width="55" :selectable="isSelectRow" :reserve-selection="false"></el-table-column>
        <!--提现单号-->
        <el-table-column prop="withdraw_sn" label="提现单号">
          <template slot-scope="scope">
            <clipboard :text="scope.row.withdraw_sn" />
          </template>
        </el-table-column>
        <!--提现金额-->
        <el-table-column label="提现金额">
          <template slot-scope="scope">{{ scope.row.price | unitPrice }}</template>
        </el-table-column>
        <!--提现状态-->
        <el-table-column prop="state" label="提现状态" :formatter="withDrawStatus"/>
        <!--提现方式-->
        <el-table-column prop="way" label="提现方式" :formatter="withDrawWay"/>
        <!--分销商-->
        <el-table-column prop="member_name" label="分销商">
          <template slot-scope="scope">{{ scope.row.member_name}}</template>
        </el-table-column>
        <!--申请时间-->
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="申请时间"/>
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleWithdrawDetail(scope.row)">查看</el-button>
            <el-button v-if="scope.row.state === 'WAIT_AUDIT'" type="primary"  size="mini" @click="handleSingleAudit(scope.row)">审核</el-button>
            <el-button v-if="scope.row.state === 'AUDIT_PASS'" type="primary" size="mini" @click="handleSingleTransfer(scope.row)">转账</el-button>
            <el-button v-if="scope.row.state === 'AUDIT_PASS'" type="primary" size="mini" @click="handleSingleClose(scope.row)">关闭</el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="pageData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>
    <!--查看详细-->
    <el-dialog title="提现详情" :visible.sync="isShowWithdrawDetail" width="30%" align="center">
      <div class="detail-info">
        <span>提现单号：</span>
        {{ withdrawDetail.withdraw_sn }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'WECHAT'">
        <span>微信转账批次单号：</span>
        {{ withdrawDetail.wechat_out_batch_no }}
      </div>
      <div class="detail-info">
        <span>提现金额：</span>
        {{ withdrawDetail.price | unitPrice }}
      </div>
      <div class="detail-info">
        <span>提现状态：</span>
        {{ withDrawStatus(withdrawDetail) }}
      </div>
      <div class="detail-info">
        <span>提现方式：</span>
        {{ withDrawWay(withdrawDetail) }}
      </div>
      <div class="detail-info">
        <span>提现分销商：</span>
        {{ withdrawDetail.member_name }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_sn">
        <span>第三方转账单号：</span>
        {{ withdrawDetail.transfer_sn }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'ALIPAY'">
        <span>真实姓名：</span>
        {{ withdrawDetail.real_name }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'ALIPAY'">
        <span>支付宝账号：</span>
        {{ withdrawDetail.account_info }}
      </div>
      <div class="detail-info">
        <span>申请时间：</span>
        {{ withdrawDetail.create_time | unixToDate }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.complete_time">
        <span>完成时间：</span>
        {{ withdrawDetail.complete_time | unixToDate }}
      </div>
      <div class="detail-info">
        <span>申请提现客户端：</span>
        {{ withDrawClientType(withdrawDetail) }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.audit_operator">
        <span>审核人员：</span>
        {{ withdrawDetail.audit_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.audit_remark">
        <span>审核备注：</span>
        {{ withdrawDetail.audit_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_operator">
        <span>转账人员：</span>
        {{ withdrawDetail.transfer_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_remark">
        <span>转账备注：</span>
        {{ withdrawDetail.transfer_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.close_operator">
        <span>关闭人员：</span>
        {{ withdrawDetail.close_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.close_remark">
        <span>关闭原因：</span>
        {{ withdrawDetail.close_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.fail_reason">
        <span>提现失败原因：</span>
        {{ withdrawDetail.fail_reason }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowWithdrawDetail = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!--批量审核 dialog-->
    <el-dialog title="批量审核" :visible.sync="isShowBatchAuditDialog" width="20%">
      <el-form :model="batchAuditForm" :rules="batchAuditFormRules" ref="batchAuditForm" label-width="100px">
        <!--是否通过=-->
        <el-form-item label="是否通过" prop="status">
          <el-radio-group v-model="batchAuditForm.audit_status">
            <el-radio label="AUDIT_PASS">通过</el-radio>
            <el-radio label="AUDIT_FAIL">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审核备注" prop="remark" v-if="batchAuditForm.audit_status === 'AUDIT_FAIL'">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入审核备注(2-200字符)"
            :maxlength="200"
            v-model="batchAuditForm.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowBatchAuditDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBatchAuditForm">确 定</el-button>
      </span>
    </el-dialog>
    <!--单个审核 dialog-->
    <el-dialog title="审核" :visible.sync="isShowSingleAuditDialog" width="20%">
      <el-form :model="singleAuditForm" :rules="singleAuditFormRules" ref="singleAuditForm" label-width="100px">
        <!--是否通过=-->
        <el-form-item label="是否通过" prop="status">
          <el-radio-group v-model="singleAuditForm.audit_status">
            <el-radio label="AUDIT_PASS">通过</el-radio>
            <el-radio label="AUDIT_FAIL">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审核备注" prop="remark" v-if="singleAuditForm.audit_status === 'AUDIT_FAIL'">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入审核备注(2-200字符)"
            :maxlength="200"
            v-model="singleAuditForm.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowSingleAuditDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSingleAuditForm">确 定</el-button>
      </span>
    </el-dialog>
    <!--批量转账 dialog-->
    <el-dialog title="批量转账" :visible.sync="isShowBatchTransferDialog" width="20%" align="center">
      <el-form :model="batchTransferForm" ref="batchTransferForm" label-width="100px">
        <el-form-item label="转账备注" label-width="80px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入转账备注(2-200字符)"
            :maxlength="200"
            v-model="batchTransferForm.remark"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowBatchTransferDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBatchTransferForm">确 定</el-button>
      </div>
    </el-dialog>
    <!--单个转账 dialog-->
    <el-dialog title="转账" :visible.sync="isShowSingleTransferDialog" width="20%" align="center">
      <el-form :model="singleTransferForm" ref="singleTransferForm" label-width="100px">
        <el-form-item label="转账备注" label-width="80px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入转账备注(2-200字符)"
            :maxlength="200"
            v-model="singleTransferForm.remark"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowSingleTransferDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSingleTransferForm">确 定</el-button>
      </div>
    </el-dialog>
    <!--批量关闭 dialog-->
    <el-dialog title="批量关闭" :visible.sync="isShowBatchCloseDialog" width="20%" align="center">
      <el-form :model="batchCloseForm" :rules="batchCloseFormRules" ref="batchCloseForm" label-width="100px">
        <el-form-item label="关闭原因" prop="remark" label-width="80px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入关闭原因(2-200字符)"
            :maxlength="200"
            v-model="batchCloseForm.remark"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowBatchCloseDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBatchCloseForm">确 定</el-button>
      </div>
    </el-dialog>
    <!--单个关闭 dialog-->
    <el-dialog title="关闭" :visible.sync="isShowSingleCloseDialog" width="20%">
      <el-form :model="singleCloseForm" :rules="singleCloseFormRules" ref="singleCloseForm" label-width="100px">
        <el-form-item label="关闭原因" prop="remark" label-width="80px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入关闭原因(2-200字符)"
            :maxlength="200"
            v-model="singleCloseForm.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowSingleCloseDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSingleCloseForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_distribution from '@/api/distribution'
  import ExportButton from '@/components/ExportButton'

  export default {
    name: 'put-forward-apply',
    components: {
      ExportButton
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表查询参数 */
        params: {
          page_no: 1,
          page_size: 20
        },

        /** 高级搜索参数 */
        advancedForm: {},

        /** 列表数据 */
        tableData: [],

        /** 分页数据 */
        pageData: [],

        /** 是否显示提现详情dialog */
        isShowWithdrawDetail: false,

        /** 提现详情信息 */
        withdrawDetail: {},

        /** 当前已选择的行 */
        multipleSelection: [],

        /** 是否显示批量审核dialog */
        isShowBatchAuditDialog: false,

        /** 批量审核表单 */
        batchAuditForm: {
          ids: [],
          remark: '',
          audit_status: 'AUDIT_PASS'
        },

        /** 批量审核表单校验规则 */
        batchAuditFormRules: {
          remark: [
            { required: true, message: '请输入审核备注！', trigger: 'blur' }
          ]
        },

        /** 是否显示单个审核dialog */
        isShowSingleAuditDialog: false,

        /** 单个审核表单 */
        singleAuditForm: {
          ids: [],
          remark: '',
          audit_status: 'AUDIT_PASS'
        },

        /** 单个审核表单校验规则 */
        singleAuditFormRules: {
          remark: [
            { required: true, message: '请输入审核备注！', trigger: 'blur' }
          ]
        },

        /** 是否显示批量转账dialog */
        isShowBatchTransferDialog: false,

        /** 批量转账表单 */
        batchTransferForm: {
          ids: [],
          remark: ''
        },

        /** 是否显示单个转账dialog */
        isShowSingleTransferDialog: false,

        /** 单个转账表单 */
        singleTransferForm: {
          remark: ''
        },

        /** 单条提现记录ID */
        singleId: '',

        /** 是否显示批量关闭dialog */
        isShowBatchCloseDialog: false,

        /** 批量关闭表单 */
        batchCloseForm: {
          ids: [],
          remark: ''
        },

        /** 批量关闭表单校验规则 */
        batchCloseFormRules: {
          remark: [
            { required: true, message: '请输入关闭原因！', trigger: 'blur' }
          ]
        },

        /** 是否显示单个关闭dialog */
        isShowSingleCloseDialog: false,

        /** 单个关闭表单 */
        singleCloseForm: {
          ids: [],
          remark: ''
        },

        /** 单个关闭表单校验规则 */
        singleCloseFormRules: {
          remark: [
            { required: true, message: '请输入关闭原因！', trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
      this.GET_WithdrawApplyList()
    },
    methods: {
      /** 状态格式化 */
      withDrawStatus(row) {
        switch (row.state) {
          case 'WAIT_AUDIT':
            return '待审核'
          case 'TRANSFERRING':
            return '转账中'
          case 'AUDIT_PASS':
            return '待转账'
          case 'AUDIT_FAIL':
            return '审核未通过'
          case 'FINISHED':
            return '已完成'
          case 'TRANSFER_FAILED':
            return '提现失败'
          case 'CLOSED':
            return '已关闭'
        }
      },

      /** 提现方式格式化 */
      withDrawWay(row) {
        switch (row.way) {
          case 'ALIPAY':
            return '支付宝'
          case 'WECHAT':
            return '微信'
        }
      },

      /** 提现客户端格式化 */
      withDrawClientType(row) {
        switch (row.client_type) {
          case 'PC':
            return '电脑浏览器'
          case 'H5':
            return '手机浏览器'
          case 'WECHAT_H5':
            return '手机浏览器'
          case 'APP':
            return '移动应用'
          case 'MINI':
            return '微信小程序'
        }
      },

      /** 单选或者全选 */
      handleSelectionChange(val) {
        this.multipleSelection = val
      },

      /** 判断 当前行是否可以选中 */
      isSelectRow(row) {
        if (row.state === 'WAIT_AUDIT' || row.state === 'AUDIT_PASS') {
          return 1
        } else {
          return 0
        }
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_WithdrawApplyList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_WithdrawApplyList()
      },

      /** 获取提现申请列表 */
      GET_WithdrawApplyList() {
        this.loading = true
        API_distribution.getWithdrawApplyList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data.map(item => {
            return item
          })
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          page_no: 1,
          keyword: data
        }
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.GET_WithdrawApplyList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          page_no: 1,
          ...this.advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.putforward_time_range) {
          this.params.start_time = this.advancedForm.putforward_time_range[0] / 1000
          this.params.end_time = this.advancedForm.putforward_time_range[1] / 1000
        }
        delete this.params.keyword
        delete this.params.putforward_time_range
        this.GET_WithdrawApplyList()
      },

      /** 查看提现详情 */
      handleWithdrawDetail(row) {
        this.isShowWithdrawDetail = true
        this.withdrawDetail = row
      },

      /** 批量审核 */
      handleBatchAudit() {
        if (!this.multipleSelection.length) {
          return this.$message.error('请选择要审核的提现申请！')
        }
        if (!this.multipleSelection.every(item => item.state === 'WAIT_AUDIT')) {
          return this.$message.error('只能选择待审核状态的提现申请进行审核！')
        }
        this.isShowBatchAuditDialog = true
      },

      /** 批量审核 表单提交 */
      async submitBatchAuditForm() {
        let flag = false
        let params = JSON.parse(JSON.stringify(this.batchAuditForm))
        params.ids = this.multipleSelection.map(item => item.id)
        if (params.audit_status === 'AUDIT_PASS') {
          delete params.remark
          flag = true
        } else {
          await this.$refs.batchAuditForm.validate(valid => {
            if (valid) {
              flag = true
            } else {
              return false
            }
          })
        }
        if (flag) {
          await API_distribution.batchAuditWithdrawApply(params).then(() => {
            this.GET_WithdrawApplyList()
            this.params.page_no = 1
            this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
            this.isShowBatchAuditDialog = false
            this.$message.success('批量审核成功！')
          })
        }
      },

      /** 审核 */
      handleSingleAudit(row) {
        if (row.state !== 'WAIT_AUDIT') {
          return this.$message.error('只有状态为待审核的提现申请可以被审核')
        }
        this.singleAuditForm.ids[0] = row.id
        this.isShowSingleAuditDialog = true
      },

      /** 单个审核 表单提交 */
      async submitSingleAuditForm() {
        let flag = false
        let params = JSON.parse(JSON.stringify(this.singleAuditForm))
        if (params.audit_status === 'AUDIT_PASS') {
          delete params.remark
          flag = true
        } else {
          await this.$refs.singleAuditForm.validate(valid => {
            if (valid) {
              flag = true
            } else {
              return false
            }
          })
        }
        if (flag) {
          await API_distribution.batchAuditWithdrawApply(params).then(() => {
            this.GET_WithdrawApplyList()
            this.params.page_no = 1
            this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
            this.isShowSingleAuditDialog = false
            this.$message.success('审核成功！')
          })
        }
      },

      /** 批量转账 */
      handleBatchTransfer() {
        if (!this.multipleSelection.length) {
          return this.$message.error('请选择要转账的提现申请！')
        }
        if (!this.multipleSelection.every(item => item.state === 'AUDIT_PASS' && item.state === 'WECHAT')) {
          return this.$message.error('只有提现方式为微信并且状态为待转账的提现申请才可以进行批量转账操作！')
        }
        this.isShowBatchTransferDialog = true
      },

      /** 批量转账 表单提交*/
      async submitBatchTransferForm() {
        let params = {
          ids: this.multipleSelection.map(item => item.id),
          remark: this.batchTransferForm.remark
        }
        await API_distribution.batchTransferWithdrawApply(params).then(() => {
          this.GET_WithdrawApplyList()
          this.params.page_no = 1
          this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
          this.isShowBatchTransferDialog = false
          this.$message.success('批量转账成功！')
        })
      },

      /** 转账 */
      handleSingleTransfer(row) {
        if (row.state !== 'AUDIT_PASS') {
          return this.$message.error('只有状态为待转账的提现申请可以进行转账操作')
        }
        this.singleId = row.id
        this.isShowSingleTransferDialog = true
      },

      /** 单个转账 表单提交*/
      async submitSingleTransferForm() {
        let params = {
          remark: this.singleTransferForm.remark
        }
        await API_distribution.singleTransferWithdrawApply(this.singleId, params).then(() => {
          this.GET_WithdrawApplyList()
          this.params.page_no = 1
          this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
          this.isShowSingleTransferDialog = false
          this.$message.success('转账成功！')
        })
      },

      /** 批量关闭 */
      handleBatchClose() {
        if (!this.multipleSelection.length) {
          return this.$message.error('请选择要关闭的提现申请！')
        }
        if (!this.multipleSelection.every(item => item.state === 'AUDIT_PASS')) {
          return this.$message.error('只能选择待转账状态的提现申请进行关闭！')
        }
        this.isShowBatchCloseDialog = true
      },

      /** 批量关闭 表单提交 */
      async submitBatchCloseForm() {
        let flag = false
        let params = JSON.parse(JSON.stringify(this.batchCloseForm))
        params.ids = this.multipleSelection.map(item => item.id)
        await this.$refs.batchCloseForm.validate(valid => {
          if (valid) {
            flag = true
          } else {
            return false
          }
        })
        if (flag) {
          await API_distribution.batchCloseWithdrawApply(params).then(() => {
            this.GET_WithdrawApplyList()
            this.params.page_no = 1
            this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
            this.isShowBatchCloseDialog = false
            this.$message.success('批量关闭成功！')
          })
        }
      },

      /** 关闭 */
      handleSingleClose(row) {
        if (row.state !== 'AUDIT_PASS') {
          return this.$message.error('只有状态为待转账的提现申请可以被关闭')
        }
        this.singleCloseForm.ids[0] = row.id
        this.isShowSingleCloseDialog = true
      },

      /** 单个关闭 表单提交 */
      async submitSingleCloseForm() {
        let flag = false
        let params = JSON.parse(JSON.stringify(this.singleCloseForm))
        await this.$refs.singleCloseForm.validate(valid => {
          if (valid) {
            flag = true
          } else {
            return false
          }
        })
        if (flag) {
          await API_distribution.batchCloseWithdrawApply(params).then(() => {
            this.GET_WithdrawApplyList()
            this.params.page_no = 1
            this.$refs.tableContainer && this.$refs.tableContainer.$refs && this.$refs.tableContainer.$refs.table && this.$refs.tableContainer.$refs.table.clearSelection()
            this.isShowSingleCloseDialog = false
            this.$message.success('关闭成功！')
          })
        }
      },

      /** 导出Excel */
      handleExportApply() {
        API_distribution.exportWithdrawApplyList(this.params).then(response => {
          this.MixinExportConfirm()
        })
      }
    }
  }
</script>
<style type="text/scss" lang="scss" scoped>
  .putforawrd-apply ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }
  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
  }
  .conditions {
    span {
      font-size: 14px;
      color: #666;
    }
  }

  /*提现基本信息*/
  .putforawrd-baseinfo {
    width: 100%;
    border: 1px solid #ddd;
    border-collapse: collapse;
    tr, td {
      border: 1px solid #ddd;
      border-collapse: collapse;
      line-height: 40px;
      padding: 0 15px;
    }
    td:first-child {
      width: 200px;
    }
  }
  /*提现日志*/
  div.d-header {
    width: 100%;
    line-height: 40px;
    background-color: #eee;
    text-align: left;
    padding:0 15px;
    & + .container {
      padding: 0;
      ::v-deep .toolbar {
        display: none;
      }
    }
  }
  div.detail-info {
    text-align: left;
    padding: 10px 0;
    span {
      font-weight: bold;
    }
  }
</style>










