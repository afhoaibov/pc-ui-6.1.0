<template>
  <div id="order-detail">
    <div v-if="order" class="info-detail">
      <div class="info-order">
        <h2>订单信息</h2>
        <div class="info-list">

          <dl><dt>下单店铺：</dt><dd>{{ order.seller_name }}</dd></dl>
          <dl><dt>订单编号：</dt><dd>
            <clipboard :text="order.sn" />
          </dd></dl>
          <dl><dt>下单时间：</dt><dd>{{ order.create_time | unixToDate }}</dd></dl>
          <template v-if="!isVirtualOrder">
            <dl><dt>收货地址：</dt><dd>{{ order.ship_province }} {{ order.ship_city }} {{ order.ship_county }} {{ order.ship_town }} {{order.ship_address}} - {{ order.ship_addr }}</dd></dl>
            <dl><dt>收货人：</dt><dd>{{ order.ship_name }}</dd></dl>
            <dl><dt>送货时间:</dt><dd>{{ order.receive_time | formatReceiveType }}</dd></dl>
          </template>

          <dl><dt>买家姓名：</dt><dd>{{ order.member_name || '无' }}</dd></dl>
          <dl><dt>客户留言：</dt><dd>{{ order.remark || '无' }}</dd></dl>
          <template v-if="order.receipt_history && order.receipt_history.receipt_title">
            <dl class="top_line"><dt>发票抬头:</dt><dd>{{ order.receipt_history.receipt_title }}</dd></dl>
            <dl><dt>发票内容:</dt><dd>{{ order.receipt_history.receipt_content }}</dd></dl>
            <dl><dt>发票类型:</dt><dd>{{ order.receipt_history.receipt_type | receiptType }}</dd></dl>
            <dl v-if="order.receipt_history.tax_no"><dt>发票税号:</dt><dd>{{ order.receipt_history.tax_no }}</dd></dl>
            <dl>
              <dt>发票详情:</dt>
              <dd>
                <router-link :to="'/member/my-receipt/detail?history_id=' + order.receipt_history.history_id">查看详情</router-link>
              </dd>
            </dl>
          </template>
          <dl v-else><dt>发票信息:</dt><dd>无</dd></dl>
          <dl class="top_line"><dt>付款方式：</dt><dd>{{ (order.payment_type === "ONLINE" ? '在线支付' : '货到付款')  + (order.payment_method_name ? ('-' + order.payment_method_name) : '') }}</dd></dl>
          <dl><dt>支付状态：</dt><dd>{{ order.pay_status_text }}</dd></dl>
          <dl v-if="order.coupon_price"><dt>优惠券抵扣:</dt><dd><en-price :price="order.coupon_price" is-neg size="12"/></dd></dl>
          <dl v-if="order.cash_back"><dt>返现金额:</dt><dd><en-price :price="order.cash_back" is-neg size="12"/></dd></dl>
          <dl v-if="order.paid_point"><dt>积分抵扣:</dt><dd>-{{ order.paid_point }}积分</dd></dl>
          <dl><dt>商品总额：</dt><dd><en-price :price="order.goods_price || 0" size="12"/></dd></dl>
          <dl><dt>优惠：</dt><dd><en-price :price="order.discount_price || 0" size="12"/></dd></dl>
          <dl v-if="!isVirtualOrder"><dt>运费：</dt><dd><en-price :price="order.shipping_price || 0" size="12"/></dd></dl>
          <dl v-for="(discount, index) in order.order_discount_list" :key="index">
            <dt>{{ discount.promotion_name }}：</dt>
            <dd><en-price :price="discount.discount_amount || 0" is-neg size="12"/></dd>
          </dl>
          <dl v-if="order.modify_price !== 0"><dt>商家调价：</dt><dd><en-price :price="order.modify_price || 0" size="12"/></dd></dl>
          <dl><dt>订单总额：</dt><dd class="price"><en-price :price="order.order_price || 0" size="22"/></dd></dl>
          <dl v-if="order.balance > 0"><dt>预存款支付金额：</dt><dd class="price"><en-price :price="order.balance || 0" size="22"/></dd></dl>
        </div>
      </div>
      <div class="status-order">
        <h2>订单状态：{{ order.order_type === 'PINTUAN' ? order.ping_tuan_status : order.order_status_text }}
          <el-tooltip placement="right" v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_check_cancel && order.order_status != 'CANCELLED'">
            <div slot="content">当前订单已申请取消，请进入"售后管理"来查看订单取消进度</div>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </h2>
        <ul class="status-list">
          <li v-if="order.order_type === 'CHANGE'">
            - 当前订单为换货售后服务审核通过后商家为您重新创建的订单
          </li>
          <li v-if="order.order_type === 'SUPPLY_AGAIN'">
            - 当前订单为补发商品售后服务审核通过后商家为您重新创建的订单
          </li>
          <li v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_check_cancel && order.order_status != 'CANCELLED'">
            - 订单申请取消中，您可以进入
            <strong><router-link :to="'/member/service-record'" target="_blank">售后管理</router-link></strong>
            中查看取消进度
          </li>
          <li v-if="order.order_status === 'CANCELLED'">
            - 订单取消原因：
            <strong>{{ order.cancel_reason }}</strong>
          </li>
          <li v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_pay">
            - 如果您尚未对该订单进行支付，请
            <strong><router-link :to="'/checkout/cashier?order_sn=' + order.sn">按此为订单付款</router-link></strong>
            以确保商家及时发货。
          </li>
          <li v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_cancel">
            - 如果您不想购买此订单的商品，您可以
            <strong><a href="javascript:" @click="handleCancelOrder">取消订单</a></strong>
          </li>
          <template v-if="!isVirtualOrder">
            <li v-if="order.order_status == 'PAID_OFF' && order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_service_cancel">
              - 当前订单已经付款成功，正在等待商家发货
            </li>
            <li v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_rog">
              - 如果您已经收到商品，请
              <strong><a href="javascript:" @click="handleRogOrder">确认收货</a></strong>
            </li>
            <li v-if="order.order_operate_allowable_vo && order.order_operate_allowable_vo.allow_rog">
              - 当前订单已发货，您可以在下方发货记录中查看实时物流
              <!-- <strong><a href="javascript:" @click="handleViewExpress">刷新快递</a></strong> -->
            </li>
          </template>

        </ul>
        <!-- <div v-if="express" class="express-box">
          <div class="express-info">
            <span>快递公司：<em>{{ express.name }}</em></span>
            <span style="margin-left: 20px">快递单号：<em>{{ express.courier_num }}</em></span>
          </div>
          <ul class="express-list">
            <li
              v-for="(item, index) in express.data"
              :key="index"
              class="ex-item"
            >
              <div class="inner-ex">
                <div class="ex-circle">
                  <i class="ex-icon iconfont ea-icon-dot"></i>
                  <i v-if="index === 0" class="ex-text">最新</i>
                </div>
                <div class="ex-info">
                  {{ item.time }}
                  <br>
                  {{ item.context }}
                </div>
              </div>
            </li>
          </ul>
        </div> -->
      </div>
    </div>
    <div v-if="flow" class="order-flow">
      <el-steps align-center :active="flow_active" finish-status="success">
        <el-step
          v-for="(step, index) in flow"
          :key="index"
          :title="step.text"
        ></el-step>
      </el-steps>
    </div>
    <div v-if="skuList" class="goods-list">
      <sku-list
        :skuList="skuList"
        :order_type="order_type"
        :pay_status="order.pay_status"
        :order_status="order.order_status"
        name="name"
        price="purchase_price"
        total="subtotal"
        @showQRCode="showQRCode"></sku-list>
    </div>
    <div v-if="order.gift_list">
      <gift-list :giftList="order.gift_list" />
    </div>
    <!-- 优惠卷 -->
    <div v-if="order.gift_coupon">
      <div style="font-size: 16px;color: #939a9f;font-weight: bold;border-bottom: 1px solid #ebeef5;padding: 26px 0 10px 18px;">
        优惠券
      </div>
      <div class="giftCoupon">
      <div class="img">
        <img src="../../../assets/images/coupon.png"/>
      </div>
      <div class="text">
        <span>价值<span style="color:red">
          <!-- {{order.gift_coupon.coupon_price | unitPrice}} -->
          <en-price :price="order.gift_coupon.coupon_price || 0" :sizeRatio="0.7" size="15" direction="column" />
        </span>的优惠券</span>
      </div>
    </div>
    </div>

    <div>
      <div style="font-size: 16px;color: #939a9f;font-weight: bold;border-bottom: 1px solid #ebeef5;padding: 26px 0 10px 18px;">发货记录</div>
      <el-table :data="deliveryRecord" :header-cell-style="{textAlign: 'center'}" :cell-style="{'text-align': 'center'}">
        <el-table-column label="物流公司" prop="logistics_name"></el-table-column>
        <el-table-column label="物流单号" prop="delivery_sn"></el-table-column>
        <el-table-column label="商品">
          <template slot-scope="scope">
              <div v-for="(item, index) in JSON.parse(scope.row.goods_json)" :key="index">
                  <span style="display: inline-block;padding: 0 10px;">{{item.goods_name}}</span>
                  <p v-if="item.spec_list" class="sku-spec">{{ item | formatterSkuSpec }}</p>
              </div>
          </template>
        </el-table-column>
        <el-table-column label="发货时间">
          <template slot-scope="scope">
              {{ scope.row.ship_time | unixToDate }}
          </template>
        </el-table-column>
        <el-table-column label="实时物流" prop="">
          <template slot-scope="scope">
              <el-button @click="checkLogistics(scope.row)" type="text">查看物流</el-button>
          </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 虚拟订单兑换码 -->
    <el-dialog
      title="查看兑换码"
      :visible.sync="isShowQRCode"
      width="15%">
     <qrcode-vue
      :value="verificationData.code_url"
      level="M"
      style="text-align: center"></qrcode-vue>
      <p class="code-text">{{verificationData.redeem_code}}</p>
      <div class="number-box">
          <p>总核销数：{{verificationData.total_num}}</p>
          <p>已核销数：{{verificationData.use_num}}</p>
      </div>
      <p class="code-tips">有效期至：{{verificationData.expired_time | unixToDate}}</p>
    </el-dialog>

    <!--查看物流信息-->
    <el-dialog :visible.sync="logisticsShow" width="400px" align="center">
      <div slot="title">
        <h3 style="margin: 10px 0;">物流信息</h3>
      </div>
      <div class="logistics-info">
        <div v-if="logisticsInfoList">
          <el-steps direction="vertical" :active="1" align-center space="100px">
            <el-step v-for="(row, index) in logisticsInfoList" :title="row.time" :key="index"
              :status="index === 0 ? 'success' : 'wait'" :description="row.context" />
          </el-steps>
        </div>
        <div v-else>暂无物流信息，请您耐心等待！</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import * as API_Order from '@/api/order'
import * as API_Trade from '@/api/trade'
import SkuList from '../-skuList'
import GiftList from '../-giftList'
import { Steps, Step, Tooltip, Dialog } from 'element-ui'
import QrcodeVue from 'qrcode.vue'

Vue.use(Steps).use(Step).use(Tooltip).use(Dialog)

export default {
  name: 'order-detail',
  validate({ query }) {
    return !!query.order_sn
  },
  components: {
    SkuList,
    GiftList,
    QrcodeVue
  },
  data() {
    return {
      order_sn: this.$route.query.order_sn,
      order: '',
      skuList: [],
      order_type: '',
      express: '',
      flow: '',
      flow_active: 0,
      // 显示兑换码
      isShowQRCode: false,
      // 当前查看虚拟商品核销信息
      verificationData: {
        code_url: '',
        redeem_code: ''
      },
      /** 发货记录 */
      deliveryRecord: [],
      /** 物流信息弹框是否显示 */
      logisticsShow: false,
      /** 发货物流信息 */
      logisticsInfoList: []
    }
  },
  mounted() {
    this.GET_OrderDetail()
  },
  computed: {
    isVirtualOrder() {
      const { order_type, order_sku_list = [] } = this.order || {}
      if (order_type === 'VIRTUAL') return true
      return order_sku_list.some(item => item.goods_type === 'VIRTUAL')
    }
  },
  filters: {
    formatReceiveType(type) {
      switch (type) {
        case 'ANY_TIME' : return '任意时间'
        case 'WORKDAY' : return '仅工作日'
        case 'WEEKEND' : return '仅休息日'
      }
    },
    receiptType(val) {
      switch (val) {
        case 'VATORDINARY':
          return '增值税普通发票'
        case 'ELECTRO':
          return '电子普通发票'
        case 'VATOSPECIAL':
          return '增值税专用发票'
        default:
          return '增值税普通发票'
      }
    }
  },
  methods: {
    /** 查看物流 */
    checkLogistics(row) {
      this.logisticsShow = false
      const orderDetail = this.orderDetail
      let _params = {
        id: row.logistics_id,
        num: row.delivery_sn
      }
      if (!row) {
        _params = {
          id: orderDetail.logi_id,
          num: orderDetail.ship_no
        }
      }
      API_Order.getLogisticsInfo(_params).then(response => {
        this.logisticsShow = true
        this.logisticsInfoList = response.data
      })
    },
    /** 根据某个订单号查询发货记录 */
    expressOrderSn() {
      API_Order.expressOrderSn(this.order_sn).then(res => {
        this.deliveryRecord = res
      })
    },
    /** 显示兑换码弹窗 */
    showQRCode(goods) {
      this.verificationData = {
        redeem_code: goods.redeem_code,
        expired_time: goods.expired_time,
        total_num: goods.total_num,
        use_num: goods.use_num,
        code_url: `${this.MixinDomain.buyer_wap}/pages/verification/verification?seller_id=${goods.seller_id}&redeem_code=${goods.redeem_code}`
      }
      this.isShowQRCode = true
    },
    /** 取消订单 */
    handleCancelOrder() {
      this.$layer.prompt({
        formType: 2,
        maxlength: 200,
        value: ' ',
        zIndex: 210,
        title: '请输入取消原因'
      }, (value, index) => {
        const val = value.trim()
        if (!val) {
          this.$message.error('请填写取消原因！')
        } else if (val.length > 200) {
          this.$message.error('最多输入200个字符！')
        } else {
          API_Order.cancelOrder(this.order_sn, val).then(() => {
            this.$message.success('订单取消申请成功！')
            // eslint-disable-next-line no-undef
            layer.close(index)
            this.GET_OrderDetail()
          })
        }
      })
    },
    /** 确认收货 */
    handleRogOrder() {
      this.$confirm('请确认是否收到货物，否则可能会钱财两空！', () => {
        API_Order.confirmReceipt(this.order_sn).then(() => {
          this.$message.success('确认收货成功！')
          this.GET_OrderDetail()
        })
      })
    },
    /** 查看快递 */
    handleViewExpress() {
      const { logi_id, ship_no } = this.order
      API_Trade.getExpress(logi_id, ship_no).then(response => {
        this.express = response
      })
    },
    /** 获取订单详情 */
    GET_OrderDetail() {
      API_Order.getOrderDetail(this.order_sn).then(response => {
        this.order = response
        if (response.logi_id && response.ship_no) {
          this.handleViewExpress()
        }
        this.expressOrderSn()
        const { order_type, order_sku_list = [] } = response || {}
        this.order_type = response.order_type
        const isVirtualOrder = order_type === 'VIRTUAL' || order_sku_list.some(item => item.goods_type === 'VIRTUAL')
        if (isVirtualOrder) {
          this.getOrderVirtual(order_sku_list)
        } else {
          this.skuList = order_sku_list
        }
      })
      // 订单流程
      API_Trade.getOrderFlow(this.order_sn).then(response => {
        this.flow = response
        const index = response.findIndex(item => item.show_status === 0)
        this.flow_active = index === -1 ? response.length : index
      })
    },

    /** 获取虚拟商品订单数据 */
    getOrderVirtual(skuList) {
      API_Order.getOrderVirtual(this.order_sn).then(response => {
        this.skuList = skuList.map(sku => {
          const s = response.find(item => item.sku_id === sku.sku_id)
          if (!s) return sku
          sku.write_off_btn = true
          sku.redeem_code = s.redeem_code
          sku.use_redeem = s.use_redeem
          sku.expired_time = s.expired_time
          sku.total_num = s.total_num
          sku.use_num = s.use_num
          return sku
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../../assets/styles/color" as theme;
.code-text {
  text-align: center;
  margin: 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.number-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
.code-tips {
  font-size: 14px;
}
.info-detail {
  display: flex;
  border: 1px solid #d8d8d8;
  position: relative;
  z-index: 2;
}
.info-order {
  background-color: #fbfbfb;
  border-right: 1px solid #d8d8d8;
  width: 398px;
  h2 {
    background-color: #f3f3f3;
    border-bottom: 1px solid #d8d8d8;
    font-size: 12px;
    font-weight: 600;
    height: 20px;
    line-height: 20px;
    padding: 9px;
  }
}
.info-list {
  display: block;
  padding: 17px 17px 7px;
  width: auto;
  min-height: 300px;
  dl {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    font-size: 12px;
    letter-spacing: normal;
    line-height: 20px;
    vertical-align: top;
    word-spacing: normal;
    width: 100%;
    &.top_line {
      border-top: 1px dotted #d8d8d8;
      padding-top: 10px;
    }
    &.bottom_line {
      border-bottom: 1px dotted #d8d8d8;
      padding-bottom: 10px;
    }
  }
  dt {
    color: #888;
    width: 28%;
    float: left;
    display: inline;
  }
  dd {
    color: #666;
    width: 72%;
    float: left;
    display: inline;
    word-break:break-all;
  }
}
.status-order {
  width: 970px - 400px;
  background-color: #fff;
  font-size: 12px;
  letter-spacing: normal;
  padding: 20px 30px;
  vertical-align: top;
  word-spacing: normal;
  h2 {
    display: block;
    width: 100%;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px dotted #e7e7e7;
    margin-bottom: 20px;
  }
  .status-list {
    li {
      margin-bottom: 10px;
    }
  }
}
.goods-list {
  margin-top: 10px;
}
.express-box {
  position: relative;
  width: 520px;
  padding: 9px;
  border: 1px solid #e3e3e3;
  border-bottom-color: #e0e0e0;
  border-right-color: #ececec;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, .072);
  .express-info {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    background-color: #fff;
  }
  .express-list {
    height: 350px;
    margin-top: 37px;
    overflow: scroll;
  }
  .ex-item {
    list-style: none;
    border-bottom: solid 1px #f5f5f5;
    width: 500px;
    overflow: hidden;
    &:first-child {
      color: theme.$color-main;
    }
  }
  .inner-ex {
    padding: 10px;
    margin-left: 15px;
    float: left;
    border-left: solid 2px #ececec;
  }
  .ex-circle {
    width: 55px;
    float: left;
    display: inline-block;
    position: relative;
    overflow: hidden;
    background-color: #fff;
    left: -18px;
    margin-top: 17px;
  }
  .ex-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: text-bottom;
    font-style: normal;
    overflow: hidden;
    font-size: 18px;
    text-align: center;
    line-height: 14px;
    margin-left: -2px;
    color: #A2BDE3
  }
  .ex-text {
    display: inline-block;
    padding: 2px 5px;
    margin-left: 5px;
    text-align: center;
    vertical-align: text-bottom;
    font-size: 12px;
    line-height: 100%;
    font-style: normal;
    font-weight: 400;
    color: #fff;
    overflow: hidden;
    background-color: theme.$color-main;
  }
  .ex-info {
    float: left;
    width: 390px;
    margin-left: -10px;
    word-break: normal;
  }
}
.order-flow {
  width: 100%;
  padding-top: 10px;
  ::v-deep .el-step__head,
  ::v-deep .el-step__title {
    &.is-success, &.is-finish {
      color: color.adjust($color: theme.$color-main, $lightness: 10%);
      border-color: color.adjust($color: theme.$color-main, $lightness: 10%);
    }
  }
}
.giftCoupon{
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .img{
      width:100px;
      height: 100px;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .text{
      flex: 1;
      font-size: 15px;
    }
  }
</style>
