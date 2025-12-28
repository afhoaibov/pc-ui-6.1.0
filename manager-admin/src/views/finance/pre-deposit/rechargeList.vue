<template>
  <div class="">
    <div class="total-price">
      <div>
        <el-card shadow="always" style="width: fit-content">
          <div>充值总金额</div>
          <div class="total-price-price">{{ (rechargePrice || '0.00') | unitPrice}}</div>
        </el-card>
      </div>
      <div>
        <el-card shadow="always" style="width: fit-content">
          <div>消费总金额</div>
          <div class="total-price-price">{{ (depositPrice || '0.00') | unitPrice}}</div>
        </el-card>
      </div>
    </div>
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="充值记录" name="recharge">
        <en-table-layout
          :tableData="tableData.data"
          :loading="loading"
        >
          <div slot="toolbar" class="inner-toolbar">
            <div class="table-toolbar-btns">
              <export-button buttonText="导出" @exportEvent="showVerify = true" />
              <div class="table-tips-info">
                <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
                导出时，会按右侧搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
              </div>
            </div>
            <div class="toolbar-search" v-if="!memberLog">
              <en-table-search
                @search="searchEvent"
                @advancedSearch="advancedSearchEvent"
                advanced
                placeholder="请输入会员名"
                :advancedWidth="500"
              >
                <template slot="advanced-content">
                  <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                    <el-form-item label="会员名称">
                      <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="充值编号">
                      <el-input size="medium" v-model="advancedForm.sn" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="充值时间">
                      <el-date-picker
                        style="width: 100%"
                        v-model="advancedForm.recharge_time"
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
            <el-table-column prop="id" label="充值ID" width="180">
              <template slot-scope="{ row }">
                <clipboard :text="row.id" />
              </template>
            </el-table-column>
            <el-table-column prop="recharge_sn" label="充值编号" width="200">
              <template slot-scope="{ row }">
                <clipboard :text="row.recharge_sn" />
              </template>
            </el-table-column>
            <el-table-column prop="member_name" label="会员名称"/>
            <el-table-column label="充值金额">
              <template slot-scope="{ row }">
                <span style="color: #F59F28;font-weight: 600;">{{ row.recharge_money | unitPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="充值时间">
              <template slot-scope="scope">{{ scope.row.recharge_time | unixToDate }}</template>
            </el-table-column>
            <el-table-column prop="recharge_way" label="支付方式"/>
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

        <!-- 身份验证 -->
        <authentication
          :show="showVerify"
          @handlerVerifySuccess="handleExportRecharge"
          @closeDialog="showVerify = false" />

      </el-tab-pane>

      <el-tab-pane label="消费记录" name="deposit">

        <en-table-layout
          :tableData="depositTableData.data"
          :loading="loading"
        >
          <div slot="toolbar" class="inner-toolbar">
            <div class="table-toolbar-btns">
              <export-button buttonText="导出" @exportEvent="depositShowVerify = true" />
              <div class="table-tips-info">
                <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
                导出时，会按右侧搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
              </div>
            </div>
            <div class="toolbar-search" v-if="!memberLog">
              <en-table-search
                @search="depositSearchEvent"
                @advancedSearch="depositAdvancedSearchEvent"
                advanced
                placeholder="请输入会员名"
                :advancedWidth="500"
              >
                <template slot="advanced-content">
                  <el-form ref="advancedForm" :model="depositAdvancedForm" label-width="100px">
                    <el-form-item label="会员名称">
                      <el-input size="medium" v-model="depositAdvancedForm.member_name" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="变更时间">
                      <el-date-picker
                        style="width: 100%"
                        v-model="depositAdvancedForm.change_time"
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
            <el-table-column prop="id" label="日志ID">
              <template slot-scope="{ row }">
                <clipboard :text="row.id" />
              </template>
            </el-table-column>
            <el-table-column prop="member_name" label="会员名称"/>
            <el-table-column prop="money" label="可用金额变更">
              <template slot-scope="{ row }">
                <span v-if="row.money > 0" style="color: #FF605D;font-weight: 600;">+{{ row.money | unitPrice }}</span>
                <span v-else style="color: #4AB9B2;font-weight: 600;">{{ row.money | unitPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变更时间">
              <template slot-scope="scope">{{ scope.row.time | unixToDate }}</template>
            </el-table-column>
            <el-table-column prop="detail" label="日志描述"/>
          </template>
          <el-pagination
            v-if="depositTableData"
            slot="pagination"
            @size-change="depositHandlePageSizeChange"
            @current-change="depositPageCurrentChange"
            :current-page="depositTableData.page_no"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="depositTableData.page_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="depositTableData.data_total">
          </el-pagination>
        </en-table-layout>

        <!-- 身份验证 -->
        <authentication
          :show="depositShowVerify"
          @handlerVerifySuccess="handleExportDeposit"
          @closeDialog="depositShowVerify = false" />

      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import * as API_Member from '@/api/member'
import * as API_order from '@/api/order'
import ExportButton from '@/components/ExportButton'

export default {
  name: 'rechargeList',
  components: {ExportButton},
  data() {
    return {
      /** 列表loading状态 */
      loading: false,

      /** 充值记录列表参数 */
      params: {
        page_no: 1,
        page_size: 20
      },
      /** 充值总额 */
      rechargePrice: 0,
      /** 消费总额 */
      depositPrice: 0,

      /** 充值记录列表数据 */
      tableData: '',

      showVerify: false,
      depositShowVerify: false,

      /** 消费记录列表数据 */
      depositTableData: '',
      member_name: '',
      /** 消费记录列表参数 */
      depositParams: {
        page_no: 1,
        page_size: 20
      },

      /** 高级搜索数据 */
      advancedForm: {},
      /** 高级搜索数据 */
      depositAdvancedForm: {},
      // 是否查看某个会员的流水
      memberLog: false,
      /** 激活充值记录 */
      activeName: 'recharge',
      /** 查询条件 */
      searchParams: {}
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (val.query.name) {
          this.member_name = val.query.name
        }
        if (val.name === 'rechargeList') {
          if (val.query.name) {
            this.memberLog = true
          } else {
            this.memberLog = false
          }
          this.params = {
            member_name: val.query.name,
            page_no: 1,
            page_size: 20
          }
          this.GET_RechargeList()
          this.Get_MemberDepositTotal(this.params)
        }
      },
      immediate: true
    }
  },
  mounted() {
    // this.GET_RechargeList()
  },
  methods: {
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_RechargeList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_RechargeList()
    },

    /** 搜索事件触发 */
    searchEvent(keyword) {
      this.params = {
        page_no: 1,
        page_size: 10,
        member_name: keyword
      }
      this.GET_RechargeList()
      this.Get_MemberDepositTotal('recharge')
    },

    /** 分页大小发生改变 */
    depositHandlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_DepositLogList
    },

    /** 分页页数发生改变 */
    depositPageCurrentChange(page) {
      this.params.page_no = page
      this.GET_DepositLogList()
    },

    /** 消费记录搜索事件触发 */
    depositSearchEvent(keyword) {
      this.depositParams = {
        page_no: 1,
        page_size: 10,
        member_name: keyword
      }
      this.GET_DepositLogList()
      this.Get_MemberDepositTotal('deposit')
    },

    /** 导出充值记录 */
    handleExportRecharge() {
      API_order.exportRecharge(this.params).then(response => {
        this.MixinExportConfirm()
      })
    },

    /** 导出充值记录 */
    handleExportDeposit() {
      API_order.exportDeposit(this.depositParams).then(response => {
        this.MixinExportConfirm()
      })
    },

    /** 高级搜索事件触发 */
    advancedSearchEvent() {
      const { advancedForm } = this
      Object.keys(advancedForm).forEach(key => {
        if (advancedForm[key] !== undefined) {
          this.params[key] = advancedForm[key]
        }
      })
      if (!this.params.member_name) delete this.params.member_name
      if (!this.params.sn) delete this.params.sn

      delete this.params.start_time
      delete this.params.end_time
      if (this.advancedForm.recharge_time) {
        this.params.start_time = this.advancedForm.recharge_time[0] / 1000
        this.params.end_time = this.advancedForm.recharge_time[1] / 1000
      }
      delete this.params.recharge_time
      this.params.page_no = 1
      this.GET_RechargeList()
      this.Get_MemberDepositTotal()
    },

    /** 获取充值列表 */
    GET_RechargeList() {
      this.loading = true
      API_Member.getMemberDepositRecharge(this.params).then(response => {
        this.loading = false
        this.tableData = response
      }).catch(() => { this.loading = false })
    },

    handleClick(tab, event) {
      if (tab.name === 'deposit') {
        this.Get_MemberDepositTotal('deposit')
        this.GET_DepositLogList()
      } else if (tab.name === 'recharge') {
        this.Get_MemberDepositTotal('recharge')
        this.GET_RechargeList()
      }
    },
    /** 获取充值和消费总金额 */
    Get_MemberDepositTotal(tab) {
      if (tab === 'deposit') {
        this.searchParams = this.depositParams
      }
      if (tab === 'recharge') {
        this.searchParams = this.params
      }
      if (this.member_name) {
        this.searchParams.member_name = this.member_name
      }
      API_Member.getMemberDepositTotal(this.searchParams).then(response => {
        this.rechargePrice = response.recharge
        this.depositPrice = response.price
      }).catch(() => { this.loading = false })
    },
    /** 消费记录高级搜索事件触发 */
    depositAdvancedSearchEvent() {
      const { advancedForm } = this
      Object.keys(advancedForm).forEach(key => {
        if (advancedForm[key] !== undefined) {
          this.depositParams[key] = advancedForm[key]
        }
      })
      if (!this.depositParams.member_name) delete this.depositParams.member_name

      delete this.depositParams.start_time
      delete this.depositParams.end_time
      if (this.depositAdvancedForm.change_time) {
        this.depositParams.start_time = this.depositAdvancedForm.change_time[0] / 1000
        this.depositParams.end_time = this.depositAdvancedForm.change_time[1] / 1000
      }
      delete this.depositParams.change_time
      this.depositParams.page_no = 1
      this.GET_DepositLogList()
      this.Get_MemberDepositTotal()
    },
    /** 获取预存款明细 */
    GET_DepositLogList() {
      this.loading = true
      API_Member.getMemberDepositLog(this.depositParams).then(response => {
        this.loading = false
        this.depositTableData = response
      }).catch(() => { this.loading = false })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.total-price{
  display: flex;
  gap: 24px;
  margin:10px 0px 10px 5px
}
.total-price-price{
  color: #2F88FA;
  margin-top: 4px;
  font-size:16px;
  font-weight:bold;
  text-align: center;
  margin-top: 10px;

}
</style>


