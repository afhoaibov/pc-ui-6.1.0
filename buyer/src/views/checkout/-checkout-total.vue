<template>
  <div v-if="orderTotal" class="total-ckt-total">
    <div class="details-ckt-total">
      <ul class="ul-details-ckt-total">
        <li>
          <span class="title-details-ckt-total">商品总金额：</span>
          <em class="price-details-ckt-total">
            <en-price :price="orderTotal.original_price" size="14"/>
          </em>
          <div class="clear-details-ckt-total"></div>
        </li>
        <li class="li_discount_price" v-if="orderTotal.member_level_discount_price">
          <span class="title-details-ckt-total">会员折扣：</span>
          <em class="price-details-ckt-total">
            <en-price :price="orderTotal.member_level_discount_price" size="14"/>
          </em>
          <div class="clear-details-ckt-total"></div>
        </li>
        <li>
          <span class="title-details-ckt-total">运费总计：</span>
          <em class="price-details-ckt-total">
            <en-price :price="orderTotal.freight_price" size="14"/>
          </em>
          <div class="clear-details-ckt-total"></div>
        </li>
        <li class="li_discount_price" v-if="orderTotal.discount_price">
          <span class="title-details-ckt-total">优惠总额：</span>
          <em class="price-details-ckt-total">
            <en-price :price="orderTotal.discount_price" is-neg size="14"/>
          </em>
          <!-- <div class="clear-details-ckt-total"></div> -->
          <!-- 促销优惠明细 -->
          <el-popover
            placement="top-start"
            width="200"
            trigger="hover"
            v-if="orderTotal.discount_detail_list && orderTotal.discount_detail_list.length"
            class="discount-box">
            <div>
              <p v-for="(discount, index) in orderTotal.discount_detail_list"
                :key="index">
                {{discount.promotion_type_name}}：<en-price :price="discount.discount_price" is-neg size="14"/>
              </p>
            </div>
            <i slot="reference" class="el-icon-s-opportunity discount-icon"></i>
          </el-popover>
        </li>
        <li class="li_discount_price" v-if="orderTotal.coupon_price">
          <span class="title-details-ckt-total">优惠券抵扣：</span>

          <en-price :price="orderTotal.coupon_price" is-neg size="14"/>
          <div class="clear-details-ckt-total"></div>
        </li>
        <li class="li_discount_price" v-if="orderTotal.paid_point && orderTotal.paid_point !== '0'">
          <span class="title-details-ckt-total">抵扣积分：</span>
          <em class="price-details-ckt-total">-{{ orderTotal.paid_point }}积分</em>
          <div class="clear-details-ckt-total"></div>
        </li>
      </ul>
    </div>
    <div class="summary-ckt-total">
      <div class="amounts-payable-ckt">
        <span class="title-details-ckt-total amounts">应付金额：</span>
        <em class="price-details-ckt-total amounts">
          <en-price :price="orderTotal.total_price" size="30"/>
        </em>
        <div class="clear-details-ckt-total"></div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import { Popover } from 'element-ui'
Vue.use(Popover)

export default {
  name: 'checkout-total',
  props: ['orderTotal']
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
.tip-details-ckt-total {
  text-align: right;
  color: theme.$color-main;
  line-height: 22px;
}
.discount-box {
  cursor: pointer;
  margin-right: 4px;
  .discount-icon {
    color: #ff9800;
    font-size: 17px;
  }
}
</style>
