<template>
  <div v-loading="loading" class="order-info-wrap" ref="orderInfoWrap">
    <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header" ref="orderInfo">订单信息</div>

        <div class="d-content">
          <div class="item">
            <span class="item-label">订单状态：</span>
            <span class="item-value">{{ orderDetail.order_status_text }}</span>
          </div>
          <template v-if="!['PINTUAN', 'VIRTUAL'].includes(orderDetail.order_type)">
            <div class="item">
              <span class="item-label">收货地址：</span>
              <span class="item-value">
                {{ MixinFormatRegions(orderDetail, 'ship_') }} {{ orderDetail.ship_addr }}
              </span>
            </div>
            <div class="item">
              <span class="item-label">收货人：</span>
              <span class="item-value">{{ orderDetail.ship_name }}</span>
            </div>
            <div class="item">
              <span class="item-label">联系电话：</span>
              <span class="item-value">
              <clipboard :text="orderDetail.ship_mobile | formatMobile" />
            </span>
            </div>
          </template>
          <div class="item">
            <span class="item-label">订单编号：</span>
            <span class="item-value">
              <clipboard :text="orderDetail.sn" />
            </span>
          </div>
          <div class="item">
            <span class="item-label">付款方式：</span>
            <span class="item-value">{{ orderDetail.payment_type === 'ONLINE' ? '在线支付' : '货到付款' }}</span>
          </div>
          <div class="item">
            <span class="item-label">付款渠道：</span>
            <span class="item-value">{{ orderDetail.payment_method_name || '无' }}</span>
          </div>
          <div class="item">
            <span class="item-label">下单时间：</span>
            <span class="item-value">{{ orderDetail.create_time | unixToDate }}</span>
          </div>
          <div class="item">
            <span class="item-label">商品金额：</span>
            <span class="item-value">{{ orderDetail.goods_price | unitPrice }}</span>
          </div>
          <div class="item">
            <span class="item-label">优惠金额：</span>
            <span class="item-value">{{ orderDetail.discount_price | unitPrice }}</span>
          </div>
          <div class="item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-label">运费：</span>
            <span class="item-value">{{ orderDetail.shipping_price | unitPrice }}</span>
          </div>
          <div class="item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-label">送货时间：</span>
            <span class="item-value">{{ orderDetail.receive_time | formatReceiveType }}</span>
          </div>
          <div class="item">
            <span class="item-label">订单金额：</span>
            <span class="item-value">{{ orderDetail.order_price | unitPrice }}</span>
          </div>
          <div class="item">
            <span class="item-label">预付款支付金额：</span>
            <span class="item-value">{{ orderDetail.balance | unitPrice }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="0" v-if="orderDetail.cash_back || orderDetail.paid_point || orderDetail.coupon_price">
      <el-col :span="24">
        <div class="d-header" ref="orderInfo">促销信息</div>
        <div class="d-content">
          <div class="item" v-if="orderDetail.cash_back">
            <span class="item-label">返现金额：</span>
            <span class="item-value">
              -{{ orderDetail.cash_back | unitPrice }}
            </span>
          </div>
          <div class="item" v-if="orderDetail.coupon_price">
            <span class="item-label">优惠券抵扣：</span>
            <span class="item-value">-{{ orderDetail.coupon_price | unitPrice }}</span>
          </div>
          <div class="item" v-if="orderDetail.paid_point">
            <span class="item-label">积分抵扣：</span>
            <span class="item-value">-{{ orderDetail.paid_point }}积分</span>
          </div>
          <div class="item" v-if="orderDetail.gift_point">
            <span class="item-label">赠送积分：</span>
            <span class="item-value">{{ orderDetail.gift_point }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header" ref="other" sf-text-rule="text_order_msg_other">{{ orderDetail.order_type === 'VIRTUAL' ? '其他信息' : '其他信息（发票、备注）' }}</div>
        <div class="d-content">
          <div class="item">
            <span class="item-label">订单备注：</span>
            <span class="item-value">{{ orderDetail.remark || '无' }}</span>
          </div>
          <div class="item" v-if="orderDetail.cancel_reason">
            <span class="item-label">取消原因：</span>
            <span class="item-value" style="overflow:hidden;word-wrap: break-word;">{{ orderDetail.cancel_reason }}</span>
          </div>
          <div class="item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-label">送货时间：</span>
            <span class="item-value">{{ orderDetail.receive_time | formatReceiveType }}</span>
          </div>
          <template v-if="orderDetail.receipt_history">
            <div class="item">
              <span class="item-label">发票类型：</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'ELECTRO'">电子普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATORDINARY'">增值税普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
            </div>
            <div class="item">
              <span class="item-label">发票抬头：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_title }}</span>
            </div>
            <div v-if="orderDetail.receipt_history.tax_no" class="item">
              <span class="item-label">税号：</span>
              <span class="item-value">{{ orderDetail.receipt_history.tax_no }}</span>
            </div>
            <div class="item">
              <span class="item-label">发票内容：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_content }}</span>
            </div>
          </template>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header" ref="other">商品信息</div>
        <div class="d-content">
          <el-table :data="orderDetail.order_sku_list" :header-cell-style="{ textAlign: 'center' }">
            <el-table-column label="商品图片" width="180">
              <template slot-scope="scope">
                <a v-if="!MixinIsSupplier()" :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`"
                  :target="isO2O ? '' : '_blank'">
                  <img :src="scope.row.goods_image" class="goods-image" />
                </a>
                <img v-else :src="scope.row.goods_image" class="goods-image" />
              </template>
            </el-table-column>
            <el-table-column label="商品名称">
              <template slot-scope="scope">
                <a v-if="!MixinIsSupplier()" :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`"
                  :target="isO2O ? '' : '_blank'" style="color: #00a2d4;" v-html="scope.row.name">{{ scope.row.name }}</a>
                <span v-else>{{ scope.row.name }}</span>
                <p class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
                <p class="sku-act-tags" v-if="scope.row.promotion_tags && scope.row.promotion_tags.length">
                  <span class="sku-act-tag" v-for="(tag, index) in scope.row.promotion_tags" :key="index">{{ tag }}</span>
                </p>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150">
              <template slot-scope="scope">
                <div v-if="scope.row.point && scope.row.point !== 0">{{ scope.row.original_price | unitPrice }}+{{
                  scope.row.point }}积分</div>
                <div v-else>{{ scope.row.original_price | unitPrice }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" width="120" />
            <el-table-column label="小计" width="120">
              <template slot-scope="scope">
                <div v-if="scope.row.point && scope.row.point !== 0">{{ (scope.row.num * scope.row.original_price) |
                  unitPrice }}+{{ scope.row.num * scope.row.point }}积分</div>
                <div v-else>{{ (scope.row.num * scope.row.original_price) | unitPrice }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import * as API_order from '@/api/order'

export default {
  name: 'OrderBaseInfo',
  props: {
    orderSn: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      // 订单详情数据
      orderDetail: {},
      floatTab: [],
      floatTabIndex: 0
    }
  },
  watch: {
    orderSn: {
      handler(value) {
        this.loading = true
        this.floatTabIndex = 0
        if (value) {
          // this.floatTab = [
          //   { name: '订单信息', type: 'orderInfo' },
          //   { name: '其他信息', type: 'orderInfo' },
          //   { name: '商品信息', type: 'orderInfo' }
          // ]
          this.getOrderDetail()
        }
      },
      immediate: true
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
    secrecyMobile(mobile) {
      mobile = String(mobile)
      if (!/\d{11}/.test(mobile)) {
        return mobile
      }
      return mobile
    }
  },

  methods: {
    /** 切换滑动距离 */
    // changePosition(item, index) {
    //   if (index === this.floatTabIndex) return
    //   this.floatTabIndex = index
    //   this.$refs.orderInfoWrap.scroll({ top: item.top, behavior: 'smooth' })
    // },
    rowClass({ rowIndex }) {
      if (rowIndex === 0) {
        return { background: '#ededed', textAlign: 'center' }
      }
    },
    /** 获取订单详情 */
    getOrderDetail() {
      API_order.getOrderDetail(this.orderSn).then(res => {
        this.orderDetail = res
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.order-info-wrap {
  padding-bottom: 30px;
  position: relative;
  height: 100%;
  overflow: auto;

  .float-tab-content {
    position: fixed;
    background: #fff;
    min-width: 72px;
    max-width: 100px;
    right: 45%;
    top: 0;
    border-radius: 0 0 0 4px;
    padding: 20px 10px;
    font-size: 14px;
    color: #7d8089;
    box-shadow: -2px 0 4px 0 rgba(0, 0, 0, .1);

    .active-tab {
      color: #000;
    }

    .btn-item {
      margin: 0;
      padding: 10px 0;
      margin-bottom: 10px;
      text-align: center;
      cursor: pointer;
    }
  }
}

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

.goods-image {
  width: 80px;
  height: 80px;
}</style>

