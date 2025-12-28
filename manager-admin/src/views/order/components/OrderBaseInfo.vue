<template>
  <div v-loading="loading" class="order-base-info">
    <el-row v-for="(row, index) in orderInfo" :key="index" :gutter="0">
      <el-col
        v-for="col in row"
        :key="col.key"
        :span="col.spanCol">
        <div class="d-header">{{ col.title }}</div>
        <div class="d-content">
          <div v-for="item in col.items" :key="item.key" class="item">
            <div v-if="item.label === '发票详情' && item.value !== '无' && item.value !== '不需要发票'">
              <span class="item-label">发票详情</span>
              <span class="item-value"><span style="cursor: pointer;" @click="toReceiptDetail(item.value)">查看详情</span></span>
            </div>
            <div v-else-if="item.label === '订单编号'">
              <span class="item-label" v-html="item.label"></span>
              <clipboard :text="item.value" />
            </div>
            <div v-else>
              <span class="item-label" v-html="item.label"></span>
              <span class="item-value" v-if="item.label === '联系方式'">
                <clipboard :text="item.value | secrecyMobile" />
              </span>
              <span class="item-value" v-else-if="item.label === '快递单号'">
                <clipboard :text="item.value" />
              </span>
              <span class="item-value" v-else>{{ item.value }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!--产品列表-->
    <el-row v-if="productList" :gutter="0">
      <el-col :span="24">
        <div class="d-header">商品列表</div>
        <el-table :data="productList" :header-cell-style="{ textAlign: 'center' }">
          <el-table-column label="商品图片" width="180">
            <template slot-scope="scope">
              <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`"
                :target="isO2O ? '' : '_blank'">
                <img :src="scope.row.goods_image" class="goods-image" />
              </a>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" align="center">
            <template slot-scope="scope">
              <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`"
                :target="isO2O ? '' : '_blank'" :class="[isO2O ? 'o2o-goods-name' : 'goods-name']"
                v-html="scope.row.name">{{ scope.row.name }}</a>
              <p class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
              <p class="sku-act-tags" v-if="scope.row.promotion_tags && scope.row.promotion_tags.length">
                <span class="sku-act-tag" v-for="(tag, index) in scope.row.promotion_tags" :key="index">{{ tag }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column label="商品价格" width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.point && scope.row.point !== 0">{{ scope.row.original_price | unitPrice }}+{{
                scope.row.point }}积分</div>
              <div v-else>{{ scope.row.original_price | unitPrice }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="num" label="购买数量" width="120" />
          <el-table-column label="小计" width="120">
            <template slot-scope="scope">
              <div v-if="scope.row.point && scope.row.point !== 0">{{ (scope.row.num * scope.row.original_price) |
                unitPrice }}+{{ scope.row.num * scope.row.point }}积分</div>
              <div v-else>{{ (scope.row.num * scope.row.original_price) | unitPrice }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--赠品列表-->
    <el-row v-if="giftList && giftList.length" :gutter="0">
      <el-col :span="24">
        <div class="d-header">赠品列表</div>
        <el-table :data="giftList" :header-cell-style="{ textAlign: 'center' }">
          <el-table-column label="赠品图片" width="180">
            <template slot-scope="scope">
              <img src="../../../assets/icon-color-point.png" class="goods-image"
                v-if="scope.row.metaKey === 'GIFT_POINT'">
              <img src="../../../assets/baoyou.png" class="goods-image"
                   v-else-if="scope.row.metaKey === 'FREE_FREIGHT'">
              <img src="../../../assets/icon-color-coupon.png" class="goods-image"
                v-else-if="scope.row.metaKey === 'COUPON'">
              <img :src="scope.row.giftImage" class="goods-image" v-else>
            </template>
          </el-table-column>
          <el-table-column label="赠品名称" align="center">
            <template slot-scope="scope">
              <span class="goods-name">{{ scope.row.giftName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="赠品价值" width="150">
            <template slot-scope="scope">
              <span v-if="scope.row.metaKey === 'GIFT_POINT'">{{ scope.row.giftValue + '积分' }}</span>
              <span v-else-if="scope.row.metaKey === 'FREE_FREIGHT'"></span>
              <span v-else>{{ scope.row.giftValue | unitPrice }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述" width="100" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.metaKey === 'COUPON'">满{{scope.row.thresholdPrice}}，减{{scope.row.giftValue}}</span>
              <span v-if="scope.row.metaKey === 'GIFT_POINT'">赠送{{scope.row.giftValue + '积分'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="" width="120" />
          <el-table-column label="" width="120" />
        </el-table>
      </el-col>
    </el-row>
    <!--订单日志-->
    <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header">订单日志</div>
        <el-table :data="orderLog" :header-cell-style="{ textAlign: 'center' }">
          <el-table-column prop="op_name" label="操作人员" width="200" />
          <el-table-column prop="op_time" :formatter="MixinUnixToDate" label="操作时间" width="250" />
          <el-table-column prop="message" label="操作详情" width="400" />
          <el-table-column />
        </el-table>
      </el-col>
    </el-row>
     <!--发货记录-->
     <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header">发货记录</div>
        <el-table :data="deliveryRecord" :header-cell-style="{textAlign: 'center'}">
          <el-table-column label="物流公司" prop="logistics_name"></el-table-column>
          <el-table-column label="物流单号" prop="delivery_sn"></el-table-column>
          <el-table-column label="商品">
              <template slot-scope="scope">
                  <div v-for="(item, index) in JSON.parse(scope.row.goods_json)">
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
      </el-col>
    </el-row>
    <!--查看物流信息-->
    <el-dialog :modal="false" :visible.sync="logisticsShow" width="400px" align="center">
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
import * as API_order from '@/api/order'
import * as API_ExpressPlatform from '@/api/expressPlatform'
import { Foundation } from '~/ui-utils'
import { cloneObj } from '@/utils/index'

export default {
  name: 'OrderBaseInfo',
  props: {
    orderDetail: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      /** 订单日志 */
      orderLog: [],
      /** 基本信息、发票信息、买家信息、商家信息 */
      orderInfo: [],
      /** 产品列表 */
      productList: [],
      /** 赠品列表 */
      giftList: [],
      loading: true,
      /** 发货记录 */
      deliveryRecord: [],
      /** 物流信息弹框是否显示 */
      logisticsShow: false,
      /** 发货物流信息 */
      logisticsInfoList: []
    }
  },
  watch: {
    orderDetail: {
      handler(value) {
        this.loading = true
        if (Object.keys(value).length) {
          this.productList = value.order_sku_list
          this.giftList = value.gift_list
          this.handleGift()
          this.countShowData()
          this.GET_OrderLog()
          this.expressOrderSn()
        }
      },
      immediate: true
    }
  },
  filters: {
    secrecyMobile(mobile) {
      mobile = String(mobile)
      if (process.env.I18N && mobile.indexOf(',') !== -1) {
        return '+' + mobile.split(',')[0] + mobile.split(',')[1].replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
      }
      if (!/\d{11}/.test(mobile)) {
        return mobile
      }
      return mobile
    }
  },

  methods: {
    formatMobile(val) {
      if (!val) return val
      if (val.indexOf(',') !== -1) {
        const areaValue_n = val.split(',')[0]
        const mobile = val.split(',')[1]
        return '+' + areaValue_n + mobile
      } else {
        return val
      }
    },
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
      API_ExpressPlatform.getLogisticsInfo(_params).then(response => {
        this.logisticsShow = true
        this.logisticsInfoList = response.data
      })
    },
    /** 获取订单日志 */
    GET_OrderLog() {
      API_order.getOrderLog(this.orderDetail.sn).then(response => {
        this.orderLog = response
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    /** 根据某个订单号查询发货记录 */
    expressOrderSn() {
      API_order.expressOrderSn(this.orderDetail.sn).then(res => {
        this.deliveryRecord = res
      })
    },
    /** 查看发票详情 */
    toReceiptDetail(history_id) {
      this.$router.push({ name: 'receiptDetail', params: { id: history_id } })
    },
    /** 发票类型映射 */
    receiptType(type) {
      switch (type) {
        case 'VATORDINARY': return '增值税普通发票'
        case 'ELECTRO': return '电子普通发票'
        case 'VATOSPECIAL': return '增值税专用发票'
        default: return '增值税普通发票'
      }
    },
    /** 组合基本信息、发票信息、买家信息、商家信息 */
    countShowData() {
      const o = this.orderDetail
      const f = Foundation
      const promotions = []
      if (o.coupon_price) {
        promotions.push({ label: '优惠券抵扣', value: '-' + f.formatPrice(o.coupon_price) })
      }
      if (o.cash_back) {
        promotions.push({ label: '返现金额', value: '-' + f.formatPrice(o.cash_back) })
      }
      if (o.paid_point) {
        promotions.push({ label: '积分抵扣', value: '-' + o.paid_point + '积分' })
      }
      if (o.order_type !== 'VIRTUAL') {
        promotions.push({ label: '运&ensp;&ensp;&ensp;&ensp;费', value: f.formatPrice(o.shipping_price) })
      }
      if (o.gift_point) {
        promotions.push({ label: '赠送积分', value: o.gift_point })
      }
      if (o.modify_price) {
        promotions.push({ label: '商家调价', value: f.formatPrice(o.modify_price) })
      }

      const buyerItems = [
        { label: '收&ensp;货&ensp;人', value: o.ship_name },
        { label: '收货地址', value: o.ship_province + o.ship_city + (o.ship_county || '') + (o.ship_town || '') + '-' + o.ship_addr },
        { label: '联系方式', value: this.formatMobile(o.ship_mobile) },
        { label: '买家留言', value: o.remark || '无' }
      ]
      if (o.order_type === 'PINTUAN') {
        buyerItems.splice(0, 3)
      }
      const sellerItems = [
        { label: '卖家账号', value: o.seller_name }
      ]
      const baseList = [
        {
          title: '基本信息',
          key: 'base',
          spanCol: o.order_type === 'VIRTUAL' ? 24 : 12,
          items: [
            { label: '订单编号', value: o.sn },
            { label: '订单状态', value: o.order_status_text + (o.cancel_reason ? '（' + o.cancel_reason + '）' : '') },
            { label: '下单时间', value: f.unixToDate(o.create_time) },
            { label: '支付方式', value: (o.payment_type === 'ONLINE' ? '在线支付' : '货到付款') + (o.payment_method_name ? ('-' + o.payment_method_name) : '') },
            { label: '商品金额', value: f.formatPrice(o.goods_price) },
            { label: '优惠金额', value: f.formatPrice(o.discount_price) },
            { label: '等级优惠', value: f.formatPrice(o.member_level_discount_price) },
            ...promotions,
            { label: '订单金额', value: f.formatPrice(o.order_price) },
            { label: '预存款支付金额', value: f.formatPrice(o.balance) }
          ]
        },
        {
          title: '发票信息',
          key: 'receipt',
          spanCol: 12,
          items: [
            { label: '发票类型', value: o.receipt_history ? this.receiptType(o.receipt_history.receipt_type) || '无' : '不需要发票' },
            { label: '发票抬头', value: o.receipt_history ? o.receipt_history.receipt_title || '无' : '无' },
            { label: '发票内容', value: o.receipt_history ? o.receipt_history.receipt_content || '无' : '无' },
            { label: '发票税号', value: o.receipt_history ? o.receipt_history.tax_no || '无' : '无' },
            { label: '发票金额', value: o.receipt_history ? f.formatPrice(o.receipt_history.order_price) || '无' : '不需要发票' },
            { label: '发票详情', value: o.receipt_history ? o.receipt_history.history_id || '无' : '不需要发票' }
          ]
        }
      ]
      /** 企业采购申请信息 */
      const applyItems = [
        { label: '申请单标题', value: o.apply_title },
        { label: '申请原因', value: o.apply_reason },
        { label: '申请备注', value: o.apply_remark },
        { label: '期望到货时间', value: f.unixToDate((o.expect_time / 1000), 'yyyy-MM-dd') }
      ]
      const orderItems = [
        {
          title: '买家信息',
          key: 'buyer',
          spanCol: o.enterprise_id ? 8 : 12,
          items: buyerItems
        },
        {
          title: '商家信息',
          key: 'seller',
          spanCol: o.enterprise_id ? 8 : 12,
          items: sellerItems
        }
      ]

      if (o.order_type === 'VIRTUAL') {
        buyerItems.splice(0, 3)
        baseList.splice(1, 1)
      }
      if (o.enterprise_id) {
        orderItems.push({
          title: '采购申请',
          key: 'apply',
          spanCol: 8,
          items: applyItems
        })
      }

      this.orderInfo = [
        baseList,
        orderItems
      ]
    },
    /* 处理赠品 */
    handleGift() {
      if (!this.giftList.length) return
      const list = cloneObj(this.giftList)
      const giftList = []

      list.map((gift) => {
        const metaKey = gift.meta_key
        if ((metaKey === 'COUPON' || metaKey === 'GIFT') && gift.meta_value) {
          const metaData = JSON.parse(gift.meta_value)
          if (metaData.length) {
            if (metaKey === 'COUPON') {
              giftList.push({
                metaKey,
                giftValue: metaData[0].couponPrice,
                thresholdPrice: metaData[0].couponThresholdPrice,
                giftName: metaData[0].title
              })
            } else {
              giftList.push({
                metaKey,
                giftValue: metaData[0].giftPrice,
                giftName: metaData[0].giftName,
                giftImage: metaData[0].giftImg
              })
            }
          }
        } else if (metaKey === 'GIFT_POINT' && gift.meta_value) {
          giftList.push({
            metaKey,
            giftValue: gift.meta_value,
            giftName: '积分'
          })
        } else if (metaKey === 'FREE_FREIGHT' && gift.meta_value) {
          giftList.push({
            metaKey,
            giftValue: gift.meta_value,
            giftName: '免邮费'
          })
        }
      })
      this.giftList = giftList
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.d-header {
  padding: 10px 0 10px 20px;
  font-size: 14px;
  color: #333;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e1e8ed;

  &h2 {
    font-size: 14px;
    font-weight: 400;
  }
}

.item {
  width: 100%;
  position: relative;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding: 16px 0 16px 20px;
  line-height: 24px;
  white-space: nowrap;

  & .item-label {
    float: left;
    margin-right: 20px;
    font-size: 14px;
    color: #999;
  }


  & .item-value {
    overflow: hidden;
    white-space: normal;
    word-break: break-all;
    font-size: 14px;
    color: #666;
  }
}

.order-base-info ::v-deep .el-table td:not(.is-left) {
  text-align: center;
}

.goods-image {
  width: 50px;
  height: 50px;
}

.goods-name {
  color: #4183c4;

  &:hover {
    color: #f42424
  }
}

.o2o-goods-name {
  color: #4183c4;
}

.sku-spec {
  color: #ff9800;
  margin: 0;
}

.sku-act-tags {
  padding: 0;
  margin: 0;
}

.sku-act-tag {
  display: inline-block;
  padding: 0 5px;
  line-height: 15px;
  margin-right: 5px;
  border: 1px solid #f42424;
  color: #f42424;
}
</style>

