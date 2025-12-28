<template>
  <div v-loading="loading" class="order-detail-container">
    <div v-if="orderType === 'CHANGE' || orderType === 'SUPPLY_AGAIN'" style="padding: 10px 0px">
      <el-alert title="当前订单为用户售后服务申请审核通过后重新创建的订单" type="warning" :closable="false" show-icon></el-alert>
    </div>
    <div class="order-info" v-if="orderDetail">
      <!--accordion-->
      <el-collapse class="order-collapse" :value="['order', 'promotions', 'other']">
        <!--订单信息-->
        <el-collapse-item title="订单信息" name="order">
          <template v-if="!['PINTUAN', 'VIRTUAL'].includes(orderDetail.order_type)">
            <div class="order-item">
              <span class="item-name">收货地址：</span>
              <span class="item-value">
                {{ MixinFormatRegions(orderDetail, 'ship_') }} {{ orderDetail.ship_addr }}
              </span>
            </div>
            <div class="order-item">
              <span class="item-name">收货人：</span>
              <span class="item-value">{{ orderDetail.ship_name }}</span>
            </div>
						<div class="order-item">
							<span class="item-name">联系电话：</span>
							<span class="item-value">
                <clipboard :text="orderDetail.ship_mobile | formatMobile" />
              </span>
						</div>
            <hr>
          </template>
          <!--订单编号 付款方式 下单时间-->
          <div class="order-item">
            <span class="item-name">订单编号：</span>
            <span class="item-value">
              <clipboard :text="orderDetail.sn" />
            </span>
          </div>
          <div class="order-item">
            <span class="item-name">付款方式：</span>
            <span class="item-value">{{ orderDetail.payment_type | paymentTypeFilter }}</span>
          </div>
          <div class="order-item">
            <span class="item-name">付款渠道：</span>
            <span class="item-value">{{ orderDetail.payment_method_name || '无' }}</span>
          </div>
          <div class="order-item">
            <span class="item-name">下单时间：</span>
            <span class="item-value">{{ orderDetail.create_time | unixToDate }}</span>
          </div>
          <template v-if="orderDetail.enterprise_id">
            <hr>
            <div class="order-item">
              <span class="item-name">申请单标题：</span>
              <span class="item-value">{{ orderDetail.apply_title }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">申请原因：</span>
              <span class="item-value">{{ orderDetail.apply_reason }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">申请备注：</span>
              <span class="item-value">{{ orderDetail.apply_remark }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">期望到货时间：</span>
              <span class="item-value">{{ (orderDetail.expect_time / 1000) | unixToDate('yyyy-MM-dd') }}</span>
            </div>
          </template>
          <hr>
          <!--相关费用-->
          <div class="order-item">
            <span class="item-name">商品金额：</span>
            <span class="item-value">{{ orderDetail.goods_price | unitPrice }}</span>
          </div>
          <div class="order-item">
            <span class="item-name">优惠金额：</span>
            <span class="item-value">{{ orderDetail.discount_price | unitPrice }}</span>
          </div>
          <template v-if="orderDetail.order_discount_list">
            <div
              class="order-item"
              v-for="item in orderDetail.order_discount_list"
              :key="item.promotion_id"
            >
              <span class="item-name">{{ item.promotion_name }}：</span>
              <span class="item-value">{{ item.discount_amount | unitPrice }}</span>
            </div>
          </template>
          <div class="order-item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-name">运费：</span>
            <span class="item-value">{{ orderDetail.shipping_price | unitPrice }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.modify_price && orderDetail.modify_price !== 0">
            <span class="item-name">商家调价：</span>
            <span class="item-value">{{ orderDetail.modify_price | unitPrice }}</span>
          </div>
          <div class="order-item">
            <span class="item-name">订单金额：</span>
            <span class="item-value">{{ orderDetail.order_price | unitPrice }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.balance && orderDetail.balance > 0">
            <span class="item-name">预存款支付金额：</span>
            <span class="item-value">{{ orderDetail.balance | unitPrice }}</span>
          </div>
        </el-collapse-item>
        <!--促销信息-->
        <el-collapse-item title="促销信息" name="promotions"
          v-if="orderDetail.cash_back || orderDetail.paid_point || orderDetail.coupon_price">
          <div class="order-item" v-if="orderDetail.cash_back">
            <span class="item-name">返现金额：</span>
            <span class="item-value">-{{ orderDetail.cash_back | unitPrice }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.coupon_price">
            <span class="item-name">优惠券抵扣：</span>
            <span class="item-value">-{{ orderDetail.coupon_price | unitPrice }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.paid_point">
            <span class="item-name">积分抵扣：</span>
            <span class="item-value">-{{ orderDetail.paid_point }}积分</span>
          </div>
          <div class="order-item" v-if="orderDetail.gift_point">
            <span class="item-name">赠送积分：</span>
            <span class="item-value">{{ orderDetail.gift_point }}</span>
          </div>
        </el-collapse-item>
        <!--其他信息（发票、备注）-->
        <el-collapse-item sf-attr-rule="text_order_msg_other" :title="orderDetail.order_type === 'VIRTUAL' ? '其他信息' : '其他信息（发票、备注）'" name="other">
          <div class="order-item">
            <span class="item-name">订单备注：</span>
            <span class="item-value">{{ orderDetail.remark || '无' }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.cancel_reason">
            <span class="item-name">取消原因：</span>
            <span class="item-value" style="overflow:hidden;word-wrap: break-word;">{{ orderDetail.cancel_reason }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-name">送货时间：</span>
            <span class="item-value">{{ orderDetail.receive_time | formatReceiveType }}</span>
          </div>
          <template v-if="orderDetail.receipt_history">
            <div class="order-item">
              <span class="item-name">发票类型：</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'ELECTRO'">电子普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATORDINARY'">增值税普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
            </div>
            <div class="order-item">
              <span class="item-name">发票抬头：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_title }}</span>
            </div>
            <div v-if="orderDetail.receipt_history.tax_no" class="order-item">
              <span class="item-name">税号：</span>
              <span class="item-value">{{ orderDetail.receipt_history.tax_no }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">发票内容：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_content }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">发票详情：</span>
              <span class="item-value" style="cursor: pointer;"
                @click="toReceiptDetail(orderDetail.receipt_history.history_id)">查看详情</span>
            </div>
          </template>
        </el-collapse-item>
      </el-collapse>
      <!--订单状态 / 物流信息-->
      <div class="order-status-info">
        <!--订单状态-->
        <div v-if="logisticsStatus">
          <div class="order-status">
            <i class="el-icon-check"></i> 订单状态：{{ orderDetail.order_status_text }}
          </div>
          <div class="order-item"
            v-if="orderDetail.order_operate_allowable_vo.allow_check_cancel && orderDetail.order_status != 'CANCELLED'">
            <el-alert title="当前订单已申请售后服务，请到'售后管理-售后服务列表'中查看相关信息" type="warning" :closable="false"></el-alert>
          </div>
          <div class="order-item">
            <span class="item-name"> 订单备注：</span>
            <span class="item-value remark-value">{{ orderDetail.remark || '无' }}</span>
          </div>
          <div class="order-item" v-if="orderDetail.order_type !== 'VIRTUAL'">
            <span class="item-name">送货时间：</span>
            <span class="item-value">{{ orderDetail.receive_time | formatReceiveType }}</span>
          </div>
          <template v-if="orderDetail.receipt_history">
            <div class="order-item">
              <span class="item-name">发票类型：</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'ELECTRO'">电子普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATORDINARY'">增值税普通发票</span>
              <span class="item-value" v-if="orderDetail.receipt_history.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
            </div>
            <div class="order-item">
              <span class="item-name">发票抬头：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_title }}</span>
            </div>
            <div v-if="orderDetail.receipt_history.tax_no" class="order-item">
              <span class="item-name"> 税 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 号：</span>
              <span class="item-value">{{ orderDetail.receipt_history.tax_no }}</span>
            </div>
            <div class="order-item">
              <span class="item-name">发票内容：</span>
              <span class="item-value">{{ orderDetail.receipt_history.receipt_content }}</span>
            </div>
          </template>
          <!-- <div class="order-item" v-if="isLooklogistics">
            <span class="item-name">物流信息：</span>
            <span>物流公司：{{ logisticsName }}</span>
            <span>
              快递单号：
              <clipboard :text="logisticsNo" />
            </span>
            <span class="item-value" style="margin-left: 10px;">
              <el-button type="text" @click="looklogistics">查看物流</el-button>
            </span>
          </div> -->
        </div>
        <!--物流信息-->
        <!-- <div v-if="!logisticsStatus">
          <el-card class="box-card" style="border: 0px;box-shadow:none;">
            <div slot="header" class="clearfix">
              <span>物流信息</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="addLogisticsInfo">添加物流信息</el-button>
            </div>
            <el-form
              status-icon
              ref="cainiaoForm"
              label-width="100px">
              <el-form-item label="物流公司:">
                <el-select v-model="selectLogisticId" placeholder="请选择物流公司" clearable style="width: 300px;"
                           @change="onLogisticChange"
                           :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != '' ">
                  <el-option
                    v-for="item in logisticsData"
                    :key="item.logistics_company_do.id"
                    :label="item.logistics_company_do.name"
                    :value="item.logistics_company_do.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="物流单号:">
                <el-input maxlength="100" style="width: 300px;" v-model="selectLogistic.ship_no" :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != ''"></el-input>
                <el-button-group v-if="selectLogistic.logistics_company_do.is_waybill == 1">
                  <el-button
                    type="primary"
                    plain
                    :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != ''"
                    :loading="produceElectronicLoading"
                    @click="produceElectronicSurface()">生成电子面单
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    :disabled="selectLogistic.logistics_company_do.is_waybill !== 1 || selectLogistic.ship_no === ''"
                    :loading="printWaybillLoading"
                    @click="printWaybill()">打印电子面单
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    :disabled="selectLogistic.logistics_company_do.is_waybill !== 1 || selectLogistic.ship_no === ''"
                    :loading="cancelWaybillLoading"
                    @click="cancelWaybill()">取消电子面单
                  </el-button>
                </el-button-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="deliverGoods()" style="width: 80px;">发货</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div> -->

        <div class="opera-btn">
          <template v-if="orderDetail.order_type !== 'VIRTUAL'">
						<el-button plain type="primary" @click="deliveryClick" style="width: 80px;" v-if="orderDetail.order_operate_allowable_vo.allow_ship && allowShip">发货</el-button>
            <!-- <el-button plain type="primary" @click="printWaybill" v-if="this.orderWaybill && this.orderWaybill.print_data && this.orderWaybill.print_data !== ''">打印电子面单</el-button> -->
            <template v-if="!['PINTUAN', 'VIRTUAL'].includes(orderDetail.order_type)">
              <el-button plain type="primary" @click="confirmInvoice" v-if="allowShip">打印发货单</el-button>
              <el-button v-if="isShowEditShipName && !MixinIsSupplier()" plain type="primary" @click="adjustConsignee">修改收货人信息</el-button>
            </template>
          </template>
          <el-button v-if="isShowEditOrderPrice && !MixinIsSupplier()" plain type="primary" @click="adjustPrice">调整价格</el-button>
          <el-button v-if="isShowConfirmReceive" plain type="primary" @click="confirmReceive">确认收款</el-button>
          <el-button v-if="isShowCancelOrder && orderDetail.payment_type === 'COD'" plain type="primary"
            @click="cancelDialogShow = true">取消订单</el-button>
        </div>
      </div>
    </div>
    <!--订单状态 步骤条-->
    <el-steps align-center style="margin-top: 20px;" simple>
      <el-step v-for="item in stepList" :title="item.text" :key="item.text" :status="item.show_status"></el-step>
    </el-steps>
    <!--商品列表-->
    <div>
      <el-table :data="productList" :header-cell-style="{ textAlign: 'center' }">
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
            <span v-else>{{scope.row.name}}</span>
            <p class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
            <p class="sku-act-tags" v-if="scope.row.promotion_tags && scope.row.promotion_tags.length">
              <span class="sku-act-tag" v-for="(tag, index) in scope.row.promotion_tags" :key="index">{{ tag }}</span>
            </p>
						<p style="color: #E6A23C;" v-if="scope.row.supplier_goods">供应商：<span>{{scope.row.supplier_goods.supplier_name}}</span></p>
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
            <div v-if="scope.row.point && scope.row.point !== 0">{{ (scope.row.num * scope.row.original_price) | unitPrice
            }}+{{ scope.row.num * scope.row.point }}积分</div>
            <div v-else>{{ (scope.row.num * scope.row.original_price) | unitPrice }}</div>
          </template>
        </el-table-column>

        <template v-if="orderType === 'VIRTUAL'">
          <el-table-column label="有效期至" align="center" width="180">
            <template slot-scope="scope">{{ scope.row.expired_time | unixToDate }}</template>
          </el-table-column>

          <el-table-column label="兑换码" align="center" width="180" v-if="orderDetail.pay_status === 'PAY_YES' && orderDetail.order_status !== 'CANCELLED'">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" v-if="!scope.row.use_redeem"
                @click="showQRCode(scope.row)">查看兑换码</el-button>
              <el-button size="mini" type="primary" v-else disabled>已核销</el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <!--赠品列表-->
    <div v-if="gift_list && gift_list.length">
      <el-table :data="gift_list" :header-cell-style="{ textAlign: 'center' }">
        <el-table-column label="赠品列表" width="180">
          <template slot-scope="scope">
            <img src="../../assets/icon-color-point.png" class="goods-image" v-if="scope.row.meta_key === 'GIFT_POINT'">
            <img src="../../assets/icon-color-coupon.png" class="goods-image" v-else-if="scope.row.meta_key === 'COUPON'">
            <img src="../../assets/baoyou.png" class="goods-image" v-else-if="scope.row.meta_key === 'FREE_FREIGHT'">
            <img :src="scope.row.meta_value.giftImage" class="goods-image" v-else>
          </template>
        </el-table-column>
        <el-table-column label="赠品名称">
          <template slot-scope="scope">
            <span class="goods-name">{{ scope.row.meta_value.giftName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="赠品价值" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.meta_key === 'GIFT_POINT'">{{ scope.row.meta_value.giftValue + '积分' }}</span>
            <span v-else-if="scope.row.meta_key === 'FREE_FREIGHT'"></span>
            <span v-else>{{ scope.row.meta_value.giftValue | unitPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.meta_key === 'COUPON'"> 满{{scope.row.meta_value.thresholdPrice}}，减{{scope.row.meta_value.giftValue}}</span>
            <span v-if="scope.row.meta_key === 'GIFT_POINT'">赠送{{scope.row.meta_value.giftValue + '积分'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="" width="120" />
        <el-table-column label="" width="120" />
      </el-table>
    </div>
		<!--发货记录-->
    <div v-if="orderDetail && !['PINTUAN', 'VIRTUAL'].includes(orderDetail.order_type)">
      <div style="font-size: 20px;border-bottom: 1px solid #ebeef5;padding: 18px 0 10px 18px;">发货记录</div>
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
    </div>

    <!--调整价格 / 修改收货人信息-->
    <el-dialog :title="dialogTitle" :visible.sync="orderDetailShow" :width="dialogWidth">
      <div >
        <!--调整订单总价-->
        <el-form v-show="triggerStatus === 1" status-icon
          label-position="right">
          <el-form-item prop="adjustedPrice">
            <el-input placeholder="请输入订单总价" v-model="adjustedPrice"
              @change="() => { adjustedPrice = adjustedPrice.trim() }" :maxlength="10">
              <template slot="prepend">{{ MixinUnitOfCurrency }}</template>
            </el-input>
          </el-form-item>
        </el-form>
        <!--修改收货人信息-->
        <el-form label-position="top" :model="ConsigneeForm" ref="ConsigneeForm" :rules="orderRules" status-icon v-show="triggerStatus === 2" label-width="120px">
          <el-form-item label="收货人：" prop="ship_name">
            <el-input v-model="ConsigneeForm.ship_name"
              @change="() => { ConsigneeForm.ship_name = ConsigneeForm.ship_name.trim() }" maxlength="20"
              placeholder="限20字"></el-input>
          </el-form-item>
          <en-area-select
            :showType="1"
            ref="AreaSelect"
            v-model="ConsigneeForm.ship_mobile" />

          <en-region-picker ref="regionPickerRef" :api="MixinRegionApi" :default="defaultRegion" />

          <el-form-item label="详细地址：" prop="ship_addr">
            <el-input v-model="ConsigneeForm.ship_addr"
              @change="() => { ConsigneeForm.ship_addr = ConsigneeForm.ship_addr.trim() }" placeholder="限20字"
              maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="送货时间：" prop="receive_time" style="text-align: left;">
            <el-select v-model="ConsigneeForm.receive_time" placeholder="请选择">
              <el-option label="任意时间" value="ANY_TIME"></el-option>
              <el-option label="仅工作日" value="WORKDAY"></el-option>
              <el-option label="仅休息日" value="WEEKEND"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单备注：" prop="remark">
            <el-input type="textarea" rows="4" v-model="ConsigneeForm.remark" placeholder="限500字"
              maxlength="500"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelOrderDetail">取 消</el-button>
        <el-button type="primary" @click="reserveOrderDetail">确 定</el-button>
      </div>
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
    <!--发货单-->
    <el-dialog title="发货单" :visible.sync="invoiceShow" width="844px">
      <div>
        <el-button type="primary" @click="handlePrintInvoice">打印</el-button>
      </div>
      <div class="invoice-box" id="deliverySheet">
        <div class="invoice-item site-content">
          <div class="site-item site-logo">
            <img :src="invoiceDetail.logo" alt />
          </div>
          <div class="site-item site-info">
            <p class="site-text">{{ invoiceDetail.site_name }}</p>
            <p class="site-text">{{ invoiceDetail.site_address }}</p>
          </div>
          <div class="site-item site-user">
            <p class="site-text">收货人：{{ invoiceDetail.consignee }}</p>
            <p class="site-text">会员：{{ invoiceDetail.member_name }}</p>
          </div>
        </div>
        <div class="invoice-item order-info">
          <span>编号：{{ invoiceDetail.sn }}</span>
          <span>创建日期：{{ invoiceDetail.order_create_time | unixToDate }}</span>
          <span>打印日期：{{ invoiceDetail.create_time | unixToDate }}</span>
        </div>
        <div class="invoice-item sku-list">
          <div class="sku-header">
            <span class="sku-index">序号</span>
            <span class="sku-sn">编号</span>
            <span class="sku-name">名称</span>
            <span class="sku-num">数量</span>
          </div>
          <div class="sku-body">
            <div v-for="(sku, index) in invoiceDetail.order_sku_list" :key="sku.sku_id" class="sku-item">
              <span class="sku-index">{{ index + 1 }}</span>
              <span class="sku-sn">{{ sku.sku_sn }}</span>
              <span class="sku-name">{{ sku.name }}</span>
              <span class="sku-num">{{ sku.num }}</span>
            </div>
          </div>
        </div>
        <div class="invoice-item ship-info">
          <p class="ship-tem">收货人：{{ invoiceDetail.consignee }}</p>
          <p class="ship-tem">地址：{{ invoiceDetail.region }} {{ invoiceDetail.address }}</p>
          <p class="ship-tem">电话：{{ invoiceDetail.phone | formatMobile }}</p>
        </div>
      </div>
    </el-dialog>
    <!--物流信息-->
    <!-- <en-logistics-company :logisticsShow="logisticsCompanyShow" @logisticsChanged="logisticsChanged"
      @logstictisClosed="logstictisClosed" /> -->
    <!--取消订单-->
    <el-dialog title="取消订单" :visible.sync="cancelDialogShow" width="400px">
      <div align="center">
        <el-form :model="cancelOrderForm" :rules="cancelOrderRules" ref="cancelOrderForm">
          <el-form-item prop="reason">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 4 }" placeholder="请输入取消原因~(3-120字之间)"
              :maxlength="120" v-model="cancelOrderForm.reason">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="submitCancelOrder">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 虚拟订单兑换码 -->
    <el-dialog title="查看兑换码" :visible.sync="isShowQRCode" width="20%">
      <qrcode-vue :value="verificationData.code_url" level="H" style="text-align: center"></qrcode-vue>
      <p class="code-text">{{ verificationData.redeem_code }}</p>
      <p class="code-tips">有效期至：{{verificationData.expired_time | unixToDate}}</p>
    </el-dialog>
  </div>
</template>

<script>
import * as API_order from '@/api/order'
import * as API_logistics from '@/api/expressCompany'
import { CategoryPicker } from '@/components'
import { LogisticsCompany } from './components'
import { RegExp, Foundation } from '~/ui-utils'
import Print from 'print-js'
import QrcodeVue from 'qrcode.vue'
// import { CaiNiaoPrinter } from '@/components/CaiNiaoPrinter'

// 菜鸟电子面单打印组件
// var printer = null

export default {
  name: 'orderDetail',
  components: {
    [LogisticsCompany.name]: LogisticsCompany,
    [CategoryPicker.name]: CategoryPicker,
    QrcodeVue
  },
  data() {
    /** 取消原因 */
    const checkReason = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('取消原因不能为空'))
      }
      setTimeout(() => {
        if (value.length < 3 || value.length > 120) {
          callback(new Error('请输入3-120个字符的取消原因'))
        } else {
          callback()
        }
      }, 300)
    }
    return {
      /** 列表loading状态 */
      loading: false,

      /** 订单详情数据 */
      orderDetail: null,

      /** 订单类型 */
      orderType: '',

      /** 订单sn */
      sn: '',

      /** 产品列表 */
      productList: [],

      /** 是否可以查看物流信息 默认不可以*/
      // isLooklogistics: false,

      /** 是否显示修改收货人信息按钮 默认不显示*/
      isShowEditShipName: false,

      /** 是否显示调整价格按钮  默认不显示*/
      isShowEditOrderPrice: false,

      /** 是否显示确认收款按钮 默认不显示 */
      isShowConfirmReceive: false,

      /** 是否显示取消订单按钮 默认不显示 */
      isShowCancelOrder: false,

      /** 订单状态/物流信息状态显示 */
      logisticsStatus: true,

      /** 物流信息 */
      logisticsData: [],

      /** 物流信息弹框是否显示 */
      logisticsShow: false,

      /** 是否显示物流信息弹框 */
      logisticsCompanyShow: false,

      /** 是否显示调整价格/修改收货人信息显示 */
      orderDetailShow: false,

      /** 发货物流信息 */
      logisticsInfoList: [],

      /** 物流快递名称 */
      logisticsName: '',

      /** 物流快递单号 */
      logisticsNo: '',

      /** 弹框标题 */
      dialogTitle: '调整订单总价',

      /** 弹框宽度 */
      dialogWidth: '25%',

      /** 触发状态 1调整订单总价 2修改收货人信息*/
      triggerStatus: -1,

      /** 被调整的价格 */
      adjustedPrice: 0,

      /** 收货人信息 */
      ConsigneeForm: {
        /** 收货人 */
        ship_name: '',

        /** 手机号码 */
        ship_mobile: '',

        /** 地区 */
        region: '',

        /** 详细地址 */
        ship_addr: '',

        /** 送货时间 */
        receive_time: '',

        /** 备注 */
        remark: ''
      },

      /** 地区信息*/
      defaultRegion: null,

      /** 步骤list*/
      stepList: [],

      /**
         * 菜鸟电子面单数据
         */
      orderWaybill: {},

      /** 是否显示发货单 */
      invoiceShow: false,

      /** 发货单信息 */
      invoiceDetail: '',

      /** 校验规则 */
      orderRules: {
        /** 收货人 */
        ship_name: [
          { required: true, message: '请填写收货人姓名', trigger: 'blur' }
        ],

        /** 详细地址 */
        ship_addr: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
          { mix: 5, max: 100, message: '详细地址为5～100个字符', trigger: 'blur' }
        ]
      },

      /** 是否显示取消订单dialog */
      cancelDialogShow: false,

      /** 取消订单信息 */
      cancelOrderForm: {
        reason: ''
      },

      /** 取消订单校验规则 */
      cancelOrderRules: {
        /** 取消原因 */
        reason: [
          { required: true, message: '请填写取消原因', trigger: 'blur' },
          { validator: checkReason, trigger: 'blur' }
        ]
      },
      /** 赠品列表 */
      gift_list: [],
      // 显示兑换码
      isShowQRCode: false,
      // 当前查看虚拟商品核销信息
      verificationData: {
        code_url: '',
        redeem_code: ''
      },
      // 选择的物流公司id
      // selectLogisticId: null,
      // selectLogistic: {
      //   logistics_company_do: {}
      // },
      // produceElectronicLoading: false,
      // cancelWaybillLoading: false,
      // printWaybillLoading: false,
      deliveryRecord: [],
      // 是否允许发货
      allowShip: true
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
    paymentTypeFilter(val) {
      return val === 'ONLINE' ? '在线支付' : '货到付款'
    },
    secrecyMobile(mobile) {
      mobile = String(mobile)
      if (!/\d{11}/.test(mobile)) {
        return mobile
      }
      return mobile
    }
  },
  watch: {
    '$route'(newVal) {
      const { path, params } = newVal
      if (!/\/order\/detail\//.test(path) || !params.sn) return
      this.sn = params.sn
      this.GET_OrderDetail()
    }
  },
  mounted() {
    this.sn = this.$route.params.sn
    this.GET_OrderDetail()
    // this.getCainiao()
  },
  methods: {
    /** 发货流程 */
    deliveryClick() {
      const orderDetail = this.orderDetail
      this.$router.push({
        name: 'orderDelivery',
        query: { order_sn: orderDetail.sn, order_status: orderDetail.order_status }})
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
      this.loading = true
      API_order.getLogisticsInfo(_params).then(response => {
        this.logisticsShow = true
        this.loading = false
        this.logisticsInfoList = response.data
      })
    },
    /** 根据某个订单号查询发货记录 */
    expressOrderSn() {
      API_order.expressOrderSn(this.orderDetail.sn).then(res => {
        this.deliveryRecord = res
      })
    },

    /** 获取菜鸟配置 **/
    // getCainiao() {
    //   API_logistics.getCainiaoWaybillToken().then((response) => {
    //     if (!response.token || response.token === '') {
    //       return
    //     }
    //     printer = new CaiNiaoPrinter(response.ip, response.port)
    //   })
    // },

    /** 显示兑换码弹窗 */
    showQRCode(goods) {
      this.verificationData.redeem_code = goods.redeem_code
      this.verificationData.expired_time = goods.expired_time
      this.verificationData.code_url = `${this.MixinDomain.buyer_wap}/pages/verification/verification?seller_id=${goods.seller_id}&redeem_code=${goods.redeem_code}`
      this.isShowQRCode = true
    },

    /** 获取订单详情信息 */
    GET_OrderDetail() {
      this.loading = true
      API_order.getOrderDetail(this.sn).then(response => {
        this.loading = false
        // 订单信息
        this.orderDetail = response
        // 赠品信息
        this.gift_list = this.orderDetail.gift_list
        this.handleGift()
        // 订单类型
        this.orderType = this.orderDetail.order_type
        const hasVirtualSku = response.order_sku_list.some(item => item.goods_type === 'VIRTUAL')
        if (response.order_type === 'VIRTUAL' || hasVirtualSku) {
          // 当前为虚拟商品订单
          this.getOrderVirtual(response.order_sku_list)
        } else {
          // 商品信息
          this.productList = this.orderDetail.order_sku_list
        }
        // 物流信息 快递单号 快递公司
        this.logisticsNo = this.orderDetail.ship_no
        this.logisticsName = this.orderDetail.logi_name
        // 修改收货人信息地区选择器信息
        this.defaultRegion = this.MixinGetRegionDefaultData(this.orderDetail, 'ship_')
        // 步骤条信息
        this.getStepList()
        // 是否可发货
        if (!this.orderDetail.order_operate_allowable_vo.allow_ship) {
          this.logisticsStatus = true
        }

        // 获取已经生成的电子面单
        // if (this.orderDetail.order_status === 'SHIPPED') {
        //   this.getCainiaoWaybill()
        // }

        // 是否可以修改收货人信息
        this.isShowEditShipName = !!this.orderDetail.order_operate_allowable_vo.allow_edit_consignee

        // 是否可以调整价格
        this.isShowEditOrderPrice = !!this.orderDetail.order_operate_allowable_vo.allow_edit_price

        // 是否可以确认收款
        this.isShowConfirmReceive = !!this.orderDetail.order_operate_allowable_vo.allow_pay

        // 是否可以查看物流信息
        // this.isLooklogistics = !!this.orderDetail.order_operate_allowable_vo.allow_check_express

        // 是否可以取消订单
        this.isShowCancelOrder = !!this.orderDetail.order_operate_allowable_vo.allow_cancel
        if (['PINTUAN', 'VIRTUAL'].includes(this.orderDetail.order_type)) return
        // 查询发货记录
        this.expressOrderSn()
        // this.selectLogisticId = null
        // this.selectLogistic = {
        //   logistics_company_do: {}
        // }
      })
    },

    /** 获取虚拟商品订单数据 */
    getOrderVirtual(skuList) {
      API_order.getOrderVirtual(this.sn).then(response => {
        skuList.map(item => {
          response.some(v => {
            if (v.sku_id === item.sku_id && v.goods_id === item.goods_id) {
              item.redeem_code = v.redeem_code
              item.use_redeem = v.use_redeem
              item.expired_time = v.expired_time
            }
          })
        })
        this.productList = skuList
      })
    },

    toReceiptDetail(history_id) {
      this.$router.push({ name: 'receiptDetail', params: { history_id: history_id } })
    },

    /** 获取订单步骤条信息 */
    getStepList() {
      API_order.getStepList(this.sn).then(response => {
        this.stepList = response
        this.stepList = this.stepList.map(key => {
          switch (key.show_status) {
            case 0: key.show_status = 'wait'
              break
            case 1: key.show_status = 'success'
              break
            case 2: key.show_status = 'success'
              break
            case 3: key.show_status = 'error'
              break
          }
          return key
        })
      })
    },

    /** 获取物流公司信息列表 */
    // getLogisticsCompanies() {
    //   API_logistics.getEnabledExpressCompanyList({}).then(response => {
    //     this.logisticsData = response
    //     this.logisticsData.forEach(key => {
    //       this.$set(key, 'ship_no', '')
    //     })
    //     this.logisticsStatus = false
    //     this.getCainiaoWaybill()
    //   })
    // },

    /** 获取生成的菜鸟电子面单 */
    // getCainiaoWaybill() {
    //   API_order.getCaiNiaoWaybill({ order_sn: this.sn }).then((response) => {
    //     this.orderWaybill = response
    //     this.logisticsData.forEach(key => {
    //       if (response.logistics_id === key.logistics_company_do.id) {
    //         key.ship_no = this.orderWaybill.waybill_code
    //         this.selectLogisticId = key.logistics_company_do.id
    //         this.onLogisticChange(this.selectLogisticId)
    //       }
    //     })
    //   })
    // },

    /** 查看物流信息*/
    // looklogistics() {
    //   this.logisticsShow = false
    //   const _params = {
    //     id: this.orderDetail.logi_id,
    //     num: this.orderDetail.ship_no
    //   }
    //   this.loading = true
    //   API_order.getLogisticsInfo(_params).then(response => {
    //     this.logisticsShow = true
    //     this.loading = false
    //     this.logisticsInfoList = response.data
    //   })
    // },

    /** 调整价格 */
    adjustPrice() {
      this.dialogTitle = '调整订单总价'
      this.dialogWidth = '15%'
      this.orderDetailShow = true
      this.triggerStatus = 1
      this.adjustedPrice = this.orderDetail.order_price
    },

    /** 生成电子面单 */
    // produceElectronicSurface() {
    //   const _params = {
    //     order_sn: this.sn,
    //     logistics_id: this.selectLogistic.logistics_company_do.id
    //   }
    //   this.$confirm('确认生成电子面单?', '提示', { type: 'warning' }).then(() => {
    //     this.produceElectronicLoading = true
    //     API_order.generateCaiNiaoWaybill(_params).then((response) => {
    //       this.orderWaybill = response
    //       this.logisticsData.forEach(key => {
    //         if (_params.logistics_id === key.logistics_company_do.id) {
    //           key.ship_no = this.orderWaybill.waybill_code
    //         }
    //       })
    //       this.produceElectronicLoading = false
    //       this.$message.success('生成电子面单成功！')
    //       // eslint-disable-next-line handle-callback-err
    //     }).catch(function(error) {
    //       setTimeout(() => {
    //         this.produceElectronicLoading = false
    //       }, 3000)
    //     })
    //   })
    // },

    // printWaybill() {
    //   if (!this.orderWaybill || !this.orderWaybill.print_data || this.orderWaybill.print_data === '') {
    //     this.$message.error('电子面单数据异常！')
    //     return false
    //   }
    //   if (!printer) {
    //     this.$message.error('请配置菜鸟电子面单后再进行打印！')
    //     return false
    //   }
    //   printer.setCallBack((data) => {
    //     this.printWaybillLoading = false
    //     if (data && data.status === 'success') {
    //       this.$message.success('电子面单打印任务添加成功')
    //     }
    //   })
    //   this.printWaybillLoading = true
    //   const printData = JSON.parse(this.orderWaybill.print_data)
    //   printer.doPrint(this.orderWaybill.print_data, this.orderWaybill.waybill_code, printData.templateURL)
    // },

    // 取消电子面单
    // cancelWaybill() {
    //   const _params = {
    //     waybill_code: this.orderWaybill.waybill_code,
    //     logistics_id: this.selectLogistic.logistics_company_do.id
    //   }
    //   this.$confirm('确认取消生成的电子面单?', '提示', { type: 'warning' }).then(() => {
    //     this.cancelWaybillLoading = true
    //     API_order.cancelCaiNiaoWaybill(_params).then((response) => {
    //       this.cancelWaybillLoading = false
    //       if (!response) {
    //         this.$message.error('取消电子面单失败！')
    //         return false
    //       }
    //       this.orderWaybill = {}
    //       this.logisticsData.forEach(key => {
    //         if (_params.logistics_id === key.logistics_company_do.id) {
    //           key.ship_no = ''
    //         }
    //       })
    //       this.$message.success('取消电子面单成功！')
    //       // eslint-disable-next-line handle-callback-err
    //     }).catch(function(error) {
    //       setTimeout(() => {
    //         this.cancelWaybillLoading = false
    //       }, 3000)
    //     })
    //   })
    // },

    // onLogisticChange(value) {
    //   this.selectLogistic = this.logisticsData.filter(item => item.logistics_company_do.id === value)[0]
    // },

    /** 获取发货单数据 */
    GET_Invoice() {
      const _params = {
        order_id: this.orderDetail.order_id
      }
      API_order.getInvoiceList(_params).then(response => {
        this.invoiceDetail = response
        this.invoiceShow = true
      })
    },
    /** 打印发货单 */
    handlePrintInvoice() {
      Print({
        printable: 'deliverySheet',
        type: 'html',
        // 继承原来的所有样式
        targetStyles: ['*']
      })
    },
    /** 显示发货单 */
    confirmInvoice() {
      this.GET_Invoice()
    },
    /** 发货 */
    // deliverGoods() {
    //   if (!this.selectLogistic.ship_no) {
    //     this.$message.error('请填写快递单号')
    //     return
    //   } else if (!/^[A-Za-z0-9]+$/.test(this.selectLogistic.ship_no)) {
    //     this.$message.error('快递单号不符合规则，请输入字母或者数字')
    //     return
    //   }
    //   const _params = {
    //     /** 发货单号 */
    //     ship_no: this.selectLogistic.ship_no,
    //     /** 物流公司id */
    //     logi_id: this.selectLogistic.logistics_company_do.id,
    //     /** 物流公司名称 */
    //     logi_name: this.selectLogistic.logistics_company_do.name
    //   }
    //   this.$confirm('确认发货?', '提示', { type: 'warning' }).then(() => {
    //     API_order.deliveryGoods(this.sn, _params).then(() => {
    //       this.$message.success('发货成功')
    //       this.GET_OrderDetail()
    //     })
    //   })
    // },

    /** 添加物流信息 */
    // addLogisticsInfo() {
    //   this.logisticsCompanyShow = true
    // },

    /** 监听物流公司信息开启/关闭操作 */
    // logisticsChanged() {
    //   this.getLogisticsCompanies()
    // },

    // logstictisClosed(target) {
    //   this.logisticsCompanyShow = target
    // },

    /** 操作地区选择器改变时 触发*/
    handleChangeArea(val) {
      this.ConsigneeForm.region = val.last_id
    },

    /** 修改收货人信息 */
    adjustConsignee() {
      const orderDetail = this.orderDetail
      this.dialogTitle = '修改收货人信息'
      this.dialogWidth = '35%'
      this.orderDetailShow = true
      this.triggerStatus = 2
      /** 为收货人信息赋予数据信息 */
      this.ConsigneeForm = {
        /** 收货人 */
        ship_name: orderDetail.ship_name,

        /** 手机号码 */
        ship_mobile: orderDetail.ship_mobile,
        // 国家
        country_name: orderDetail.ship_country_name || '',
        // 国家编码
        country_code: orderDetail.ship_country_code || '',
        province: orderDetail.ship_province || '',
        city: orderDetail.ship_city || '',
        region: orderDetail.ship_county_id || '',
        /** 详细地址 */
        ship_addr: orderDetail.ship_addr,

        /** 送货时间 */
        receive_time: orderDetail.receive_time,

        /** 备注 */
        remark: orderDetail.remark
      }
    },

    /** 取消保存 */
    cancelOrderDetail() {
      this.orderDetailShow = false
      this.triggerStatus = -1
    },

    /** 保存按钮 */
    reserveOrderDetail() {
      if (this.triggerStatus === 2) { // 修改收货人信息
        const ConsigneeForm = this.ConsigneeForm
        const params = {
          receive_time: ConsigneeForm.receive_time,
          remark: ConsigneeForm.remark,
          ship_name: ConsigneeForm.ship_name,
          ship_addr: ConsigneeForm.ship_addr
        }
        params.region = JSON.stringify(this.$refs.regionPickerRef.regionData)
        params.ship_mobile = this.$refs.AreaSelect.mobileValue

        this.$refs['ConsigneeForm'].validate((valid) => {
          if (!valid) return
          API_order.updateConsigneeInfo(this.sn, params).then(() => {
            this.$message.success('收货人信息修改成功')
            this.GET_OrderDetail()
            this.orderDetailShow = false
            this.triggerStatus = -1
          })
        })
      } else if (this.triggerStatus === 1) { // 调整价格
        const adjustedPrice = this.adjustedPrice
        const _params = {
          order_price: adjustedPrice
        }
        if (!adjustedPrice) {
          this.$message.error('订单总价不能为空')
          return
        } else if (!RegExp.money.test(adjustedPrice)) {
          this.$message.error('请填写正确的金额')
          return
        }
        API_order.updateOrderPrice(this.sn, _params).then(() => {
          this.$message.success('价格修改成功')
          this.GET_OrderDetail()
          this.orderDetailShow = false
          this.triggerStatus = -1
        })
      }
    },

    /** 确认收款 */
    confirmReceive() {
      this.$confirm('确认执行此操作?', '提示', { type: 'warning' }).then(() => {
        API_order.confirmGetAmount(this.sn, { pay_price: this.orderDetail.order_price }).then(() => {
          this.$message.success('收款成功！')
          this.GET_OrderDetail()
        })
      })
    },

    /** 取消订单 */
    submitCancelOrder() {
      this.$refs['cancelOrderForm'].validate((valid) => {
        if (valid) {
          this.$confirm('确定要取消当前订单吗?', '提示', { type: 'warning' }).then(() => {
            API_order.cancelOrder(this.sn, this.cancelOrderForm.reason).then(() => {
              this.cancelDialogShow = false
              this.$message.success('取消成功！')
              this.GET_OrderDetail()
            })
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    },
    /* 处理赠品 */
    handleGift() {
      const newGiftList = []
      this.gift_list.forEach((gift) => {
        let metaValue = gift.meta_value
        if (gift.meta_key === 'COUPON' || gift.meta_key === 'GIFT') {
          metaValue = JSON.parse(gift.meta_value)
          if (metaValue.length) {
            if (gift.meta_key === 'COUPON') {
              gift.meta_value = { giftValue: metaValue[0].couponPrice, giftName: metaValue[0].title, thresholdPrice: metaValue[0].couponThresholdPrice, giftImage: '../../assets/images/coupon.png' }
              newGiftList.push(gift)
            } else {
              gift.meta_value = { giftValue: metaValue[0].giftPrice, giftName: metaValue[0].giftName, giftImage: metaValue[0].giftImg }
              newGiftList.push(gift)
            }
          }
        } else if (gift.meta_key === 'GIFT_POINT' && metaValue) {
          gift.meta_value = { giftValue: metaValue, giftName: '积分', giftImage: 'http://shoptnt-statics.oss-cn-beijing.aliyuncs.com/test/goods/552BE6AE90C246F1BC890CFB27EA3352.jpeg_400x400' }
          newGiftList.push(gift)
        } else if (gift.meta_key === 'FREE_FREIGHT' && metaValue) {
          gift.meta_value = { giftName: '免邮费' }
          newGiftList.push(gift)
        }
      })
      this.gift_list = newGiftList
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
/*背景颜色*/
.order-detail-container {
  background-color: #fff;

  .code-text {
    text-align: center;
    margin: 10px 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }

  .code-tips {
    font-size: 14px;
  }
}
.remark-value {
  word-break:break-all;
}

/*订单信息*/
.order-info {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-between;

  div.order-collapse {
    width: 25%;
    border: 1px solid #e5e5e5;

    /*折叠面板*/
    .el-collapse-item {
      ::v-deep .el-collapse-item__header {
        text-align: left;
        background-color: #f8f8f8;
        padding: 0 10px;
        font-weight: bold;
        color: #333;
        font-size: 14px;
      }

      ::v-deep .el-collapse-item__content {
        padding: 15px;
        text-align: left;

        div {
          margin: 5px 10px;

          span.item-name {
            font-weight: bold;
            color: #888;
            font-size: 14px;
            text-align: right;
          }
        }

        hr {
          border-top: 1px dotted #e5e5e5;
        }
      }
    }

    /* 订单信息中的名值对布局 */
    .order-item {
      display: flex;
      flex-wrap: nowrap;
      justify-content: flex-start;
      flex-direction: row;
      align-items: flex-start;

      span {
        display: inline-block;
      }

      span:first-child {
        min-width: 75px;
      }

      span:last-child {
        text-align: left;
        word-break: break-word;
      }
    }
  }

  /*** 订单状态 */
  div.order-status-info {
    width: 75%;
    padding: 0 20px;
    border: 1px solid #e5e5e5;
    border-left: none;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: stretch;

    div.order-status {
      line-height: 40px;
      color: #333;
      font-size: 20px;
      padding: 5px;
      border-bottom: 1px solid #e5e5e5;

      i {
        color: #5cb85c;
        font-weight: bold;
        font-size: 25px;
      }
    }

    div.opera-btn {
      text-align: right;
      margin-bottom: 10px;
    }

    div.order-item {
      color: #333;
      font-size: 15px;
      margin: 5px 0;
      line-height: 25px;

      .el-button--text {
        padding: 0;
      }
    }
  }
}

/*商品列表*/
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

/*地区选择器*/
.order-detail-container ::v-deep .area-select {
  .el-form-item__content {
    text-align: left;

    .app-address {
      text-align: left;
    }
  }
}

.order-detail-container ::v-deep .el-table td:not(.is-left) {
  text-align: center;
}

/*商品图片大小*/
.goods-image {
  width: 50px;
  height: 50px;
}

.order-detail-container ::v-deep .el-dialog__footer {
  padding-top: 0;
}

/*物流信息*/

.order-detail-container ::v-deep .el-dialog__body {
  padding: 20px 25px;

  .logistics-info {
    max-height: 500px;
    overflow-y: scroll;
  }
}

/*电子面单*/
.order-detail-container ::v-deep .electronic-surface {
  border: 1px solid #ddd;
  padding: 5px;

  div,
  tr,
  td {
    color: #333;
    font-weight: bold;
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

.invoice-box {
  width: 794px;
  font-weight: bold;
  word-break: break-all;

  .invoice-item {
    display: flex;
    width: 100%;
    height: 100%;
    border-bottom: 1px solid #ebeef5;
    padding: 10px 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .site-content {
    .site-item {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }

    .site-logo {
      flex: 1;
      flex-shrink: 0;

      img {
        width: 165px;
      }
    }

    .site-info {
      flex: 2;
    }

    .site-user {
      flex: 1;
    }

    .site-text {
      margin: 5px 0;
      padding: 0;
    }
  }

  .order-info {
    span {
      flex: 1;
      text-align: left;
      line-height: 30px;
    }
  }

  .sku-list {
    flex-direction: column;
    padding-bottom: 0;

    .sku-header,
    .sku-item {
      width: 100%;
      display: flex;
      border-bottom: 1px dashed #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      span {
        text-align: center;
        padding: 10px 0;
      }

      .sku-index {
        flex: 1;
        flex-shrink: 0;
      }

      .sku-sn {
        flex: 3;
        flex-shrink: 0;
      }

      .sku-name {
        flex: 5;
        line-height: 18px;
      }

      .sku-num {
        flex: 1;
        flex-shrink: 0;
      }
    }

    .sku-header {
      background-color: rgba(214, 219, 222, .6);
    }
  }

  .ship-info {
    flex-direction: column;

    .ship-tem {
      margin: 0;
      padding: 8px 0;
    }
  }
}
.picker-i18n {
  ::v-deep .el-select {
    display: block;
  }
}
</style>

