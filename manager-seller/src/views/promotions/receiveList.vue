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
            advancedWidth="465"
            advanced
            placeholder="请输入领取会员名称">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="会员名称">
                  <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="是否使用">
                  <el-select v-model="advancedForm.used_status" placeholder="请选择" clearable>
                    <el-option label="未使用" value="0"/>
                    <el-option label="已使用" value="1"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="订单编号">
                  <el-input size="medium" v-model="advancedForm.order_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="advancedForm.coupon_status" placeholder="请选择" clearable>
                    <el-option label="未生效" value="0"/>
                    <el-option label="生效中" value="1"/>
                    <el-option label="已失效" value="2"/>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="member_name" label="领取会员"/>
        <el-table-column prop="coupon_price" label="优惠券面额" :formatter="MixinFormatPrice" />
        <el-table-column prop="time" :formatter="MixinUnixToDate" label="有效期">
          <template slot-scope="scope" >
            {{ formatterDate(scope.row.start_time )}} 至 {{ formatterDate(scope.row.end_time )}}
          </template>
        </el-table-column>
        <el-table-column label="是否使用">
          <template slot-scope="scope">
            <span v-if="scope.row.used_status === 0">未使用</span>
            <span v-if="scope.row.used_status === 1">已使用</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_sn" label="使用订单编号"/>
        <el-table-column prop="status_text" label="状态" :formatter="formatterStatus" />
        <el-table-column prop="cancel_reason" label="失效原因" :formatter="formatterCancelReason"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              v-if="scope.row.used_status === 0 && scope.row.status_text !== '已失效'"
              @click="handleNullify(scope.$index, scope.row)"
            >作废</el-button>
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
      title="作废优惠券"
      :visible.sync="cancelShow"
      width="450px"
    >
      <el-form :model="cancelForm" ref="cancelForm" :rules="cancelFormRule" label-width="100px">
        <el-form-item label="作废原因" prop="cancel_reason">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入作废原因(120字以内)"
            :maxlength="120"
            v-model="cancelForm.cancel_reason">
          </el-input>
          <p style="margin: auto;font-size: 10px;color: red;">注意：优惠券作废后会员将不能使用，请谨慎操作</p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelShow = false">取 消</el-button>
        <el-button type="primary" @click="handleCancelCoupon">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_coupon from '@/api/coupon'
  import { Foundation } from '~/ui-utils'
  export default {
    name: 'receiveList',
    data() {
      return {
        // 列表loading状态
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          coupon_id: this.$route.params.id
        },
        /** 列表数据 */
        tableData: '',
        /** 高级搜索数据 */
        advancedForm: {},
        /** 是否显示作废优惠券弹框 */
        cancelShow: false,
        cancelForm: {
          mc_id: '',
          cancel_reason: ''
        },
        cancelFormRule: {
          cancel_reason: this.MixinRequired('请输入作废原因')
        }
      }
    },
    watch: {
      $route({ params }) {
        if (params.id) {
          this.params.coupon_id = params.id
          this.GET_CouponsList()
        } else {
          this.tableData = ''
        }
      }
    },
    mounted() {
      this.GET_CouponsList()
    },
    methods: {
      /** 格式化时间 */
      formatterDate(date) {
        return Foundation.unixToDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      /** 状态显示格式化 */
      formatterStatus(row) {
        if (row.used_status !== 1) {
          return row.status_text
        }
        return '-'
      },
      /** 格式化失效原因 */
      formatterCancelReason(row) {
        if (row.used_status !== 1) {
          if (row.is_cancel === 1 && row.cancel_reason) {
            return row.cancel_reason
          } else {
            if (row.status_text === '已失效') {
              return '到期自动失效'
            }
          }
        } else {
          return '-'
        }
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_CouponsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_CouponsList()
      },
      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.member_name = data
        this.GET_CouponsList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          ...this.advancedForm
        }
        this.params.page_no = 1
        this.GET_CouponsList()
      },
      /** 获取优惠劵领取列表 */
      GET_CouponsList() {
        API_coupon.queryReceiveCouponsList(this.params).then(response => {
          this.tableData = response
        })
      },
      /** 显示作废优惠券弹出框 */
      handleNullify(index, row) {
        this.cancelShow = true
        this.cancelForm.mc_id = row.mc_id
      },
      /** 作废会员优惠券 */
      handleCancelCoupon() {
        this.$refs.cancelForm.validate((valid) => {
          if (valid) {
            let mc_id = this.cancelForm.mc_id
            let params = {
              cancel_reason: this.cancelForm.cancel_reason
            }
            API_coupon.nullifyCoupons(mc_id, params).then(response => {
              this.$message.success('操作成功！')
              this.cancelShow = false
              this.GET_CouponsList()
            })
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
