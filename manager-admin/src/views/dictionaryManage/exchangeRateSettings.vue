<template>
  <div class="exchange-rate-settings">
    <en-table-layout
      :toolbar="false"
      :tableData="tableData"
      :loading="loading"
      :tips="true"
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <ul>
            <li>exchangerates平台地址：<a target="_blank" href="https://exchangeratesapi.io">https://exchangeratesapi.io</a></li>
          </ul>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="name" label="汇率平台名称"/>
        <el-table-column label="启用状态">
          <template slot-scope="scope">
            {{ scope.row.open === 1 ? '已开启' : '已关闭' }}
            <el-button v-if="scope.row.open === 0" type="text" @click="handleOpenExchangeRatePlatform(scope.$index, scope.row)">开启</el-button>
            <el-button v-if="scope.row.open === 1" type="text" @click="handleOpenExchangeRatePlatform(scope.$index, scope.row)">关闭</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEditExchangeRatePlatform(scope.$index, scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
    <el-dialog
      :title="'修改汇率平台参数 - ' + exchangeRateForm.name"
      :visible.sync="dialogVisible"
      width="650px"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form :model="exchangeRateForm" label-width="210px">
        <template v-for="(config, index) in exchangeRateForm.config_items">
          <el-form-item :label="config.text" prop="desc">
            <template  v-if="config.type === 'text'">
              <desensitization-input
                v-if="config.name === 'secretId' || config.name === 'secretKey'"
                v-model="config.value"
                @change="(e) => config.value = e" />
              <el-input v-else v-model="config.value" :autosize="{ minRows: 1, maxRows: 4}" clearable></el-input>
            </template>
            <el-radio-group v-else-if="config.type === 'radio'" v-model="config.value">
              <el-radio v-for="option in config.options" :key="option.value" :label="option.value">{{ option.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitexchangeRateForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_ExchangeRatePlatform from '@/api/exchangeRatePlatform'

  export default {
    name: 'exchangeRateSettings',
    data() {
      return {
        // 列表loading状态
        loading: false,
        // 列表数据
        tableData: [],
        // 汇率平台表单
        exchangeRateForm: {},
        // 修改汇率平台 dialog
        dialogVisible: false
      }
    },
    mounted() {
      this.GET_ExchangeRatePlatformList()
    },
    methods: {
      /** 开启汇率平台 */
      handleOpenExchangeRatePlatform(index, row) {
        API_ExchangeRatePlatform.openExchangeRatePlatformById(row.plugin_id).then(response => {
          this.$message.success('操作成功！')
          this.GET_ExchangeRatePlatformList()
        })
      },

      /** 编辑汇率平台参数 */
      handleEditExchangeRatePlatform(index, row) {
        this.exchangeRateForm = this.MixinClone(row)
        this.dialogVisible = true
      },

      /** 提交汇率平台表单 */
      submitexchangeRateForm() {
        const { plugin_id } = this.exchangeRateForm
        API_ExchangeRatePlatform.editExchangeRatePlatform(plugin_id, this.exchangeRateForm).then(response => {
          this.dialogVisible = false
          this.$message.success('修改成功！')
          this.MixinSetTableData(this.tableData, 'plugin_id', plugin_id, response)
        })
      },

      /** 获取汇率平台列表 */
      GET_ExchangeRatePlatformList() {
        this.loading = true
        API_ExchangeRatePlatform.getExchangeRatePlatformList().then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .exchange-rate-settings ::v-deep .el-form-item__content{
    width: 60%;
  }
</style>
