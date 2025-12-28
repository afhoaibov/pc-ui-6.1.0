<template>
  <div class="refund-detail-container">
    <el-card v-if="settlement">
      <div slot="header" class="clearfix">
        <span>结算单详细信息</span>
        <el-button type="primary" size="mini" @click="handleExportBill" style="margin-left: 10px">导出结算单</el-button>
        <el-button v-if="settlement.operate_allowable.allow_pay" type="primary" size="mini" @click="handleNextOperate">确认付款</el-button>
      </div>
      <el-row :gutter="0">
        <el-col :span="4">结算单号</el-col>
        <el-col :span="8">
          <clipboard v-if="settlement.bill_sn" :text="settlement.bill_sn" />
          <span v-else>无</span>
        </el-col>
        <el-col :span="4">起止日期</el-col>
        <el-col :span="8">{{ settlement.start_time | unixToDate }} - {{ settlement.end_time | unixToDate }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">出账日期</el-col>
        <el-col :span="8">{{ settlement.create_time | unixToDate }}</el-col>
        <el-col :span="4">结算状态</el-col>
        <el-col :span="8">{{ settlement.status_text || '无' }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">店铺名称</el-col>
        <el-col :span="20">{{ settlement.shop_name || '无' }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">银行开户名</el-col>
        <el-col :span="8">{{ settlement.bank_account_name || '无' }}</el-col>
        <el-col :span="4">公司银行账号</el-col>
        <el-col :span="8">
          <clipboard v-if="settlement.bank_account_number" :text="settlement.bank_account_number" />
          <span v-else>无</span>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">开户银行支行名称</el-col>
        <el-col :span="8">{{ settlement.bank_name || '无' }}</el-col>
        <el-col :span="4">支行联行号</el-col>
        <el-col :span="8">
          <clipboard v-if="settlement.bank_code" :text="settlement.bank_code" />
          <span v-else>无</span>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">银行地址</el-col>
        <el-col :span="20">{{ settlement.bank_address || '无' }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">订单收入总金额</el-col>
        <el-col :span="8">{{ settlement.order_total_price | unitPrice }}</el-col>
        <el-col :span="4">订单退款总金额</el-col>
        <el-col :span="8">{{ settlement.refund_total_price | unitPrice }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">在线支付订单收入总金额</el-col>
        <el-col :span="8">{{ settlement.price | unitPrice }}</el-col>
        <el-col :span="4">在线支付订单退款总金额</el-col>
        <el-col :span="8">{{ settlement.refund_price | unitPrice }}</el-col>
      </el-row>
      <template v-if="settlement.shop_type !== 'SUPPLIER'">
      <el-row :gutter="0">
        <el-col :span="4">货到付款订单收入总金额</el-col>
        <el-col :span="8">{{ settlement.cod_price | unitPrice }}</el-col>
        <el-col :span="4">货到付款订单退款总金额</el-col>
        <el-col :span="8">{{ settlement.cod_refund_price | unitPrice }}</el-col>
      </el-row>
      </template>
      <el-row :gutter="0">
        <el-col :span="4">平台收取佣金总金额</el-col>
        <el-col :span="8">{{ settlement.commi_price | unitPrice }}</el-col>
        <el-col :span="4">平台退还佣金总金额</el-col>
        <el-col :span="8">{{ settlement.refund_commi_price | unitPrice }}</el-col>
      </el-row>
      <template v-if="settlement.shop_type !== 'SUPPLIER'">
      <el-row :gutter="0">
        <el-col :span="4">分销支付佣金总金额</el-col>
        <el-col :span="8">{{ settlement.distribution_rebate | unitPrice }}</el-col>
        <el-col :span="4">站点优惠券佣金</el-col>
        <el-col :span="8">{{ settlement.site_coupon_commi | unitPrice }}</el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="4">平台承担会员等级优惠金额</el-col>
        <el-col :span="8">{{ settlement.platform_member_level_price | unitPrice }}</el-col>
        <el-col :span="4">平台承担会员等级优惠退款金额</el-col>
        <el-col :span="8">{{ settlement.platform_member_level_refund_price | unitPrice }}</el-col>
      </el-row>
      </template>
      <el-row :gutter="0">
        <el-col :span="4">平台应付金额</el-col>
        <el-col :span="20">
          <em class="plus">{{ settlement.bill_price | unitPrice }}</em>
          <em class="equal"> = </em>
          <em class="plus">{{ settlement.price | unitPrice }}</em>（在线支付订单收入总金额）
          <em class="plus"> + {{ settlement.refund_commi_price | unitPrice }}</em>（平台退还佣金总金额）
          <template v-if="settlement.shop_type !== 'SUPPLIER'">
            <em class="plus"> + {{ settlement.platform_member_level_price | unitPrice }}</em>（平台承担会员等级优惠金额）
          </template>
          <template v-if="settlement.shop_type !== 'SUPPLIER'">
            <em class="minus"> + {{ settlement.site_coupon_commi | unitPrice }}</em>（站点优惠券佣金）
          </template>
          <em class="minus"> - {{ settlement.refund_price | unitPrice }}</em>（在线支付订单退款总金额）
          <em class="minus"> - {{ settlement.commi_price | unitPrice }}</em>（平台收取佣金总金额）
          <template v-if="settlement.shop_type !== 'SUPPLIER'">
            <em class="minus"> - {{ settlement.distribution_rebate | unitPrice }}</em>（分销支付佣金总金额）
          </template>
          <template v-if="settlement.shop_type !== 'SUPPLIER'">
            <em class="minus"> - {{ settlement.platform_member_level_refund_price | unitPrice }}</em>（平台承担会员等级优惠退款金额）
          </template>
        </el-col>
      </el-row>
    </el-card>
    <el-card v-loading="loading_order" style="margin-top: 10px">
      <div slot="header" class="clearfix">
        <span>订单列表</span>
      </div>
      <en-table-layout :tableData="tableDataOrder.data" :toolbar="false">
        <template slot="table-columns">
          <!--订单编号-->
          <el-table-column prop="order_sn" label="订单编号">
            <template slot-scope="scope">
              <clipboard :text="scope.row.order_sn" />
            </template>
          </el-table-column>
          <!--下单时间-->
          <el-table-column prop="add_time" :formatter="MixinUnixToDate" label="下单时间"/>
          <!--订单总额-->
          <el-table-column prop="price" :formatter="MixinFormatPrice" label="订单总额"/>
          <!--支付方式-->
          <el-table-column label="支付方式">
            <template slot-scope="scope">{{ scope.row.payment_type === 'COD' ? '货到付款' : '在线支付' }}</template>
          </el-table-column>
          <!--操作-->
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.order_status !== 'COMPLETE'"
                size="mini"
                type="primary"
                @click="() => { $router.push({ path: '/order/detail/' + scope.row.order_sn }) }"
              >查看</el-button>
            </template>
          </el-table-column>
        </template>
        <el-pagination
          v-if="tableDataOrder"
          slot="pagination"
          @size-change="handlePageSizeChangeOrder"
          @current-change="handlePageCurrentChangeOrder"
          :current-page="params_order.page_no"
          :page-sizes="[5, 10, 50, 100]"
          :page-size="params_order.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableDataOrder.data_total">
        </el-pagination>
      </en-table-layout>
    </el-card>
    <el-card v-loading="loading_refund" style="margin-top: 10px">
      <div slot="header" class="clearfix">
        <span>退款单</span>
      </div>
      <en-table-layout :tableData="tableDataRefund.data" :toolbar="false">
        <template slot="table-columns">
          <el-table-column prop="refund_sn" label="退款单号">
            <template slot-scope="scope">
              <clipboard :text="scope.row.refund_sn" />
            </template>
          </el-table-column>
          <el-table-column prop="order_sn" label="退款订单号">
            <template slot-scope="scope">
              <clipboard :text="scope.row.order_sn" />
            </template>
          </el-table-column>
          <el-table-column label="支付方式">
            <template slot-scope="scope">{{ scope.row.payment_type === 'COD' ? '货到付款' : '在线支付' }}</template>
          </el-table-column>
          <el-table-column prop="refund_time" :formatter="MixinUnixToDate" label="操作时间"/>
          <el-table-column prop="price" :formatter="MixinFormatPrice" label="退款金额"/>
        </template>
        <el-pagination
          v-if="tableDataRefund"
          slot="pagination"
          @size-change="handlePageSizeChangeRefund"
          @current-change="handlePageCurrentChangeRefund"
          :current-page="params_refund.page_no"
          :page-sizes="[5, 10, 50, 100]"
          :page-size="params_refund.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableDataRefund.data_total">
        </el-pagination>
      </en-table-layout>
    </el-card>
  </div>
</template>

<script>
  import * as API_Order from '@/api/order'
  import { mapGetters } from 'vuex'

  export default {
    name: 'settlementDetail',
    data() {
      return {
        // 结算单详情
        settlement: '',
        /** 订单sn */
        id: this.$route.params.id,
        /** 商品 */
        goods: '',
        // 结算单里的订单参数
        params_order: {
          page_no: 1,
          page_size: 5
        },
        // 结算单订单 loading
        loading_order: false,
        // 结算单里的订单列表
        tableDataOrder: '',
        // 结算单里的退款单参数
        params_refund: {
          page_no: 1,
          page_size: 5
        },
        // 结算单退款单loading
        loading_refund: false,
        // 结算单里的退款单列表
        tableDataRefund: ''
      }
    },
    computed: {
      ...mapGetters(['havePermission'])
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'settlementDetail') return
          this.id = newVal.params.id
          if (!this.id) return
          this.GET_SettlementDetail()
        }
      }
    },
    methods: {
      /** 导出结算单 */
      handleExportBill() {
        API_Order.exportBill(this.settlement.bill_id).then(response => {
          this.$confirm('下载任务已进入队列，可能需要花费一些时间，请稍后在导出记录中查看！', '下载报表', {
            confirmButtonText: '查看进度',
            cancelButtonText: '关闭'
          }).then(() => {
            // 检查是否有导出权限
            const havePermission = this.havePermission('deriveRecord')
            if (havePermission) {
              this.$router.push({
                name: 'deriveRecord'
              })
            } else {
              this.$message.error('当前角色未开启后台任务权限，请开启后查看！')
            }
          })
        })
      },
      /** 订单列表分页大小发生改变 */
      handlePageSizeChangeOrder(page_size) {
        this.params_order.page_size = page_size
        this.GET_SettlementOrderList()
      },
      /** 订单列表分页数发生改变 */
      handlePageCurrentChangeOrder(page_no) {
        this.params_order.page_no = page_no
        this.GET_SettlementOrderList()
      },
      /** 退款单列表分页大小发生改变 */
      handlePageSizeChangeRefund(page_size) {
        this.params_refund.page_size = page_size
        this.GET_SettlementRefundList()
      },
      /** 退款单列表分页数发生改变 */
      handlePageCurrentChangeRefund(page_no) {
        this.params_refund.page_no = page_no
        this.GET_SettlementRefundList()
      },
      /** 对结算单进行下一步操作 【通过审核、确认付款】 */
      handleNextOperate() {
        this.$confirm('确定进行此操作吗？', '提示', { type: 'warning' }).then(() => {
          API_Order.operateSettlement(this.settlement.bill_id).then(() => {
            this.$message.success('操作成功！')
            this.GET_SettlementDetail()
          })
        }).catch(() => {})
      },
      /** 获取售后订单详情 */
      GET_SettlementDetail() {
        API_Order.getSettlementDetail(this.id).then(response => {
          this.settlement = response
          this.GET_SettlementOrderList()
          this.GET_SettlementRefundList()
        })
      },
      /** 获取结算单里的订单 */
      GET_SettlementOrderList() {
        this.loading_order = true
        API_Order.getSettlementOrderList(this.settlement.bill_id, 'PAYMENT', this.params_order).then(response => {
          this.loading_order = false
          this.tableDataOrder = response
        }).catch(() => { this.loading_order = false })
      },
      /** 获取结算单里的退款单 */
      GET_SettlementRefundList() {
        this.loading_refund = true
        API_Order.getSettlementOrderList(this.settlement.bill_id, 'REFUND', this.params_refund).then(response => {
          this.loading_refund = false
          this.tableDataRefund = response
        }).catch(() => { this.loading_refund = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .refund-detail-container {
    padding: 10px;
    font-size: 12px;
    background-color: #fff;
  }

  .el-row {
    border-bottom: 1px solid #ebeef5;
    position: relative;
  }

  .el-col {
    padding: 10px;
    position: relative;
    &:not(:first-child)::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background-color: #ebeef5;
    }
  }
  .refund-detail-container ::v-deep .el-card__body {
    margin: 10px;
    padding: 0;
    border: 1px solid #ebeef5;
    border-bottom: 0;
  }
  .refund-btn {
    position: relative;
    top: -1px;
    margin-left: 5px;
  }
  .refund-tip {
    color: red;
    font-size: 12px;
    margin: 5px 0 0 0;
    padding: 0;
  }
  .equal, .plus, .minus {
    font-weight: 700;
    font-style: normal;
  }
  // 等于
  .equal {
    color: #409EFF
  }
  // 加
  .plus {
    color: #67C23A
  }
  // 减
  .minus {
    color: #F56C6C
  }
</style>

