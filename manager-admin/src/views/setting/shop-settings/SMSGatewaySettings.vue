<template>
  <div>
    <en-table-layout
      :toolbar="false"
      :tableData="tableData.data"
      :loading="loading"
    >
      <template slot="table-columns">
        <el-table-column prop="platform_name" label="平台名称"/>
        <el-table-column label="启用状态">
          <template slot-scope="scope">
            {{ scope.row.enable_status === 'OPEN' ? '已开启' : '已关闭' }}
            <el-button v-if="scope.row.enable_status === 'CLOSE'" type="text" @click="handleOpenSmsGateway(scope.row)">开启</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEditSmsGateway(scope.$index, scope.row)">编辑参数</el-button>
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
      title="编辑短信网关参数"
      :visible.sync="dialogSmsVisible"
      width="500px"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="smsForm" size="small">
        <el-form-item :label="config.text" v-for="(config, index) in smsForm.config" :key="config.name">
          <desensitization-input
            v-if="config.name === 'access_key_secret'"
            v-model="config.value"
            @change="(e) => config.value = e" />
          <el-input v-else v-model="config.value" clearable/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogSmsVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSmsForm('smsForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_SmsGateway from '@/api/smsGateway'

  export default {
    name: 'SMSGatewaySettings',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },
        /** 列表数据 */
        tableData: '',
        /** sms 表单 */
        smsForm: { open: 0 },
        /** sms表单 dailog */
        dialogSmsVisible: false
      }
    },
    mounted() {
      this.GET_SmsGatewayList()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_SmsGatewayList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SmsGatewayList()
      },

      /** 修改短信网关 */
      handleEditSmsGateway(index, row) {
        this.smsForm = this.MixinClone(row)
        this.dialogSmsVisible = true
      },

      /** 开启短信网关 */
      handleOpenSmsGateway(row) {
        API_SmsGateway.openSmsGatewayById(row.id).then(response => {
          this.$message.success('开启成功！')
          this.GET_SmsGatewayList()
        })
      },

      /** 修改短信网关参数 提交表单 */
      submitSmsForm(formName) {
        const { id } = this.smsForm
        API_SmsGateway.editSmsGateway(id, this.smsForm).then(response => {
          this.dialogSmsVisible = false
          this.$message.success('修改成功！')
          this.GET_SmsGatewayList()
        })
      },

      /** 获取短信网关列表 */
      GET_SmsGatewayList() {
        this.loading = true
        API_SmsGateway.getSmsGatewayList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
