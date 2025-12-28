<template>
  <div class="currency-setting">
    <en-table-layout
      :table-data="tableData.data"
      :loading="loading"
      :tips="true"
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          可以通过三方工具获取实时汇率，请根据实际情况进行设置。点击刷新汇率按钮可以手动更新开启自动同步汇率的货币汇率
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="addDataLang">添加</el-button>
          <el-button size="mini" type="primary"  @click="updateRate">刷新汇率</el-button>
          <el-button size="mini" type="primary"  @click="exchangeRate">汇率工具</el-button>
        </div>

        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入货币名称"/>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="sort"  label="序号" />
        <el-table-column prop="currency_code"  label="货币代码" />
        <el-table-column prop="currency_name"  label="货币名称" />
        <el-table-column prop="rate"  label="货币汇率" />
        <el-table-column prop="auto_rate_flag"  label="自动同步汇率">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.auto_rate_flag"
              :active-value="1"
              :inactive-value="0"
              @change="(status) => updateAutoRate(status, scope.row)"  />
          </template>
        </el-table-column>
        <el-table-column prop="symbol"  label="货币符号" />
        <el-table-column prop="create_time"  label="更新时间" >
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column prop="is_enabled"  label="开启状态">
          <template slot-scope="scope">
            <span>{{enableStatus(scope.row.is_enabled)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_default"  label="是否默认">
          <template slot-scope="scope">
          <el-switch
            v-model="scope.row.is_default"
            :active-value="1"
            :inactive-value="0"
            @change="(status) => changeSwitch(status, scope.row.is_default === 1 ? 0 : 1, scope.row)"   />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400">
          <template slot-scope="{row}">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="deleteCurrency(row)">删除</el-button>
            <el-button
              v-if="row.is_enabled && row.is_enabled === 1"
              size="mini"
              type="danger"
              @click="changeStatus(row)">禁用</el-button>
            <el-button
              v-else
              size="mini"
              type="success"
              @click="changeStatus(row)">开启</el-button>
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
      :title="titleText"
      :visible.sync="show"
      width="400px"
      @close="closeDialog"
    >
      <el-form :model="defaultData" :rules="currencyRules" label-width="100px" ref="currencyForm">
        <el-form-item label="货币名称" prop="currency_name">
          <el-input v-model="defaultData.currency_name" placeholder="请输入货币名称"></el-input>
        </el-form-item>
        <el-form-item label="货币代码" prop="currency_code">
          <el-input v-model="defaultData.currency_code" placeholder="请输入货币代码"></el-input>
        </el-form-item>
        <el-form-item label="货币汇率" prop="rate">
          <el-input v-model="defaultData.rate"  placeholder="请输入货币汇率">
            <template slot="append">
              <i class="el-icon-refresh" @click="getRate"></i>
            </template>
          </el-input>

        </el-form-item>
        <el-form-item label="货币符号" prop="symbol" >
          <el-input v-model="defaultData.symbol" placeholder="请输入货币符号"></el-input>
        </el-form-item>
        <el-form-item label="序号" prop="sort">
          <el-input v-model.number="defaultData.sort" type="number" :min="0" :max="255" placeholder="请输入序号"></el-input>
        </el-form-item>
        <el-form-item label="设为默认货币">
          <el-switch v-model="defaultData.is_default"
                     :active-value="1"
                     :inactive-value="0"></el-switch>
          <div>
            <span style="font-size: 12px;color: #909399">默认货币的货币符号将会在会员端中默认展示</span>
          </div>
        </el-form-item>
        <el-form-item label="自动同步汇率">
          <el-switch v-model="defaultData.auto_rate_flag"
                     :active-value="1"
                     :inactive-value="0"></el-switch>
          <div>
            <span style="font-size: 12px;color: #909399">开启后会通过开启的三方汇率插件同步汇率</span>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitEvent">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
    import * as API_currency from '@/api/currencySetting'
    import { cloneObj } from '@/utils/index'

    export default {
      name: 'currencySetting',
      data() {
        return {
          /** 列表loading状态 */
          loading: false,
          /** 列表数据 */
          tableData: {},
          /** 列表参数 */
          params: {
            page_no: 1,
            page_size: 10
          },
          isEdit: false,
          show: false,
          title: '新增',
          defaultData: {
            currency_name: '',
            currency_code: '',
            rate: '',
            symbol: '',
            sort: '',
            is_default: 0,
            auto_rate_flag: 0
          },
          currencyRules: {
            currency_name: [{ required: true, message: '请输入货币名称', trigger: 'blur' }],
            currency_code: [{ required: true, message: '请输入货币代码', trigger: 'blur' }],
            symbol: [{ required: true, message: '请输入货币符号', trigger: 'blur' }],
            rate: [{
              required: true, message: '请输入有效的货币汇率', trigger: 'blur',
              validator: (rule, value, callback) => {
                const reg = /^\d+(\.\d{0,6})?$/ // 允许输入整数或最多两位小数
                if (!reg.test(value)) {
                  callback(new Error('请输入合法的小数，最多保留六位小数'))
                } else {
                  callback()
                }
              }
            }],
            sort: [{ required: true, type: 'number', min: 0, max: 255, message: '请输入0-255之间的数字', trigger: 'blur' }],
          }
        }
      },
      computed: {
        titleText() {
          return this.title || '编辑'
        },
        enableStatus() {
          return (enable) => {
            enable = Number(enable)
            switch (enable) {
              case 0:
                return '已禁用'
              case 1:
                return '已开启'
            }
          }
        }
      },
      mounted() {
        this.getCurrenciesList()
      },
      methods: {
        /** 分页大小发生改变 */
        handlePageSizeChange(size) {
          this.params.page_size = size
          this.getCurrenciesList()
        },

        /** 分页页数发生改变 */
        handlePageCurrentChange(page) {
          this.params.page_no = page
          this.getCurrenciesList()
        },

        /** 搜索事件触发 */
        searchEvent(data) {
          this.params.page_no = 1
          this.params.currency_name = data
          if (!data) delete this.params.currency_name
          this.getCurrenciesList()
        },

        /** 获取列表 */
        getCurrenciesList() {
          this.loading = true
          API_currency.getCurrenciesList(this.params).then(res => {
            this.loading = false
            this.tableData = res
          }).catch(() => {
            this.loading = false
          })
        },
        /** 关闭编辑弹窗 */
        closeDialog() {
          this.show = false
        },
        /** 弹窗编辑回调 */
        submitEvent() {
          const defaultData = this.defaultData
          this.$refs.currencyForm.validate((valid) => {
            if (valid) {
              if (this.isEdit) {
                this.submitEdit(defaultData)
              } else {
                this.submitAdd(defaultData)
              }
            }
          })
        },

        /** 新增提交 */
        submitAdd(defaultData) {
          API_currency.addCurrencies(defaultData).then(res => {
            this.closeDialog()
            this.$message.success('添加成功！')
            this.getCurrenciesList()
          })
        },

        /** 编辑表单提交 */
        submitEdit(list) {
          const defaultData = this.defaultData
          API_currency.updateCurrencies(defaultData.id, defaultData).then(res => {
            this.closeDialog()
            this.$message.success('保存成功！')
            this.getCurrenciesList()
          })
        },
        /** 新增数据 */
        addDataLang() {
          this.title = '新增'
          this.show = true
          this.defaultData = {}
        },
        /** 字典数据 */
        handleEdit(row) {
          this.show = true
          this.isEdit = true
          this.title = '编辑'
          this.defaultData = cloneObj(row)
        },
        /** 删除数据 */
        deleteCurrency(row) {
          API_currency.deleteCurrency(row.id).then(res => {
            this.$message.success('删除成功！')
            this.getCurrenciesList()
          })
        },
        /** 切换状态 */
        changeSwitch(is_default, old, row) {
          if (old === 1 && is_default === 0) {
            this.$message.error('最少保留一个默认货币设置!')
            this.$nextTick(() => {
              row.is_default = 1
            })
            return
          }

          API_currency.updateCurrencies(row.id, {
            is_default
          }).then(res => {
            const msg = is_default ? '开启成功' : '关闭成功'
            this.$message.success(msg)
            this.getCurrenciesList()
            this.$store.dispatch('getBaseCurrency')
          })
        },
        /** 是否自动同步汇率开关 */
        updateAutoRate(auto_rate_flag, row) {
          API_currency.updateAutoRate(row.id, {
            auto_rate_flag
          }).then(res => {
            const msg = is_default ? '开启成功' : '关闭成功'
            this.$message.success(msg)
            this.getCurrenciesList()
            this.$store.dispatch('getBaseCurrency')
          })
        },
        /** 状态切换 */
        changeStatus(row) {
          // enable 是否开启 1-是 0-否
          const params = {
            id: row.id,
            is_enabled: row.is_enabled === 1 ? 0 : 1
          }
          const message = `${params.is_enabled ? '确定要执行此开启吗？' : '确定要执行此禁用吗？'}`
          this.$confirm(message, '提示', { type: 'warning' }).then(() => {
            API_currency.updateEnableStatus(row.id).then(res => {
              this.$message.success('操作成功！')
              this.getCurrenciesList()
            })
          }).catch(() => {})
        },
        exchangeRate() {
          this.$router.push({name: 'exchangeRateSettings'})
        },
        updateRate() {
          API_currency.updateRate().then(res => {
            this.getCurrenciesList()
          })
        },
        getRate() {
          const { currency_code } = this.defaultData
          if (!currency_code) {
            this.$message.error('请先输入货币代码')
            return
          }
          API_currency.getRate(currency_code).then(res => {
            this.defaultData.rate = res
          })
        }
      }
    }
</script>

<style scoped lang="scss">
.currency-setting ::v-deep .inner-toolbar {
  justify-content: space-between !important;
}
.tips-box {
  padding: 8px;
  font-size: 12px;
  margin-left: 10px;
  background-color: #fef0da;
  border-radius: 4px;
}
</style>
