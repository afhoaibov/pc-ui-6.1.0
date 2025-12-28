<template>
  <div class="shop-goods-item-wrap">
    <template v-if="shopList && shopList.length > 0">
      <!-- 商品表头 -->
      <div class="table-header">
        <el-row>
          <el-col :span="2" class="check-all-box" >
            <a href="javascript:" @click="handleCheckAll" :class="['check', 'check-all', allChecked && 'checked']">
              <i class="iconfont ea-icon-check"></i>
            </a>全选
          </el-col>
          <el-col :span="8"><span>商品信息</span></el-col>
          <el-col :span="3" class="col-item">单价</el-col>
          <el-col :span="3" class="col-item">数量</el-col>
          <el-col :span="4" class="col-item">重量（kg）</el-col>
          <el-col :span="3" class="col-item">小计</el-col>
          <el-col :span="1" class="col-item">操作</el-col>
        </el-row>
      </div>
      <div v-for="shop in newShopList" :key="shop.shop_id" class="shop-item">
        <div class="shop-header" :class="[shop.invalid === 1 && 'invalid']">
          <div class="shop-name-box">
            <div v-if="shop.invalid === 1" style="width: 35px"></div>
            <a v-else href="javascript:" :class="['check', shop.checked && 'checked']" @click="handleCheckShop(shop)">
              <i class="iconfont ea-icon-check"></i>
            </a>
            <router-link :to="'/shop/' + shop.seller_id" class="shop-name">{{ shop.seller_name }}</router-link>
            <div class="coupon-tag" v-if="shop.couponList.length">
              <img src="@/assets/images/coupon-tag.png" class="tag-img"  />
              <el-popover
                placement="bottom-start"
                width="400"
                trigger="click">
                <div class="coupon-popover">
                  可领取优惠券
                  <div
                    class="coupon-item"
                    v-for="coupon in shop.couponList"
                    :key="coupon.coupon_id">
                    <div class="left">
                      <div class="discount"><en-price :price="coupon.coupon_price" size="12"/></div>
                      <div>
                        <p class="threshold">满<en-price :price="coupon.coupon_threshold_price"/>可用</p>
                        <p class="tips">仅可购买当前店铺商品</p>
                      </div>
                    </div>
                    <el-button
                      type="danger"
                      size="mini"
                      @click="handleReceiveCoupon(coupon.coupon_id)">领取</el-button>
                  </div>
                </div>
                <div class="tag-content" slot="reference">
                  优惠券
                  <i class="el-icon-arrow-down"></i>
                </div>
              </el-popover>
            </div>

          </div>
          <!-- 店铺商品金额合计 -->
          <div class="shop-price-box">
            <div>
              <span v-if="shop.price.goods_price || shop.price.goods_price == 0"><en-price :price="shop.price.goods_price"/></span>
              <span v-if="shop.price.paid_point && shop.price.paid_point > 0"> +{{ shop.price.paid_point }}积分</span>
            </div>
            <div class="price" v-if="shop.price.discount_price">
              优惠：<en-price :price="shop.price.discount_price" is-neg/>
              <div v-if="shop.price.discount_detail_list && shop.price.discount_detail_list.length">
                <div class="price" v-for="(discount, index) in shop.price.discount_detail_list" :key="index">
                  {{ discount.promotion_type_name }}：<en-price :price="discount.discount_price" is-neg/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="shop-body">
          <div
            v-for="group in shop.group_list"
            :key="group.promotion_id"
            style="border-bottom: 1px solid #c5c5c5;">
            <!-- 促销活动提示 -->
            <div class="discount-tips-box">
              <span :class="['group-discount-name', discountCheck(group) ? 'discount-check' : 'discount-name']">{{ group.promotion_type_name }}</span>
              <span class="group-discount-tips">{{ promotionTips(group) }}</span>
            </div>
            <!-- 商品SKU -->
            <sku-item :skuList="group.sku_list" isGroupSku />
            <!-- 促销赠品 -->
            <div class="gift-tips">
              <span v-if="group.free_freight" class="gift-item">【赠】免邮费</span>
              <div v-for="gift in group.gift_list" :key="gift.type" >
                <span v-if="gift.type === 'gift'" class="gift-item">【赠】{{gift.value.gift_name}}  x 1</span>
                <span v-if="gift.type === 'coupon'" class="gift-item">【赠】<span v-if="gift.value.threshold">满{{ gift.value.threshold }}减</span>{{gift.value.amount}}优惠券</span>
                <span v-if="gift.type === 'point'" class="gift-item">【赠】{{gift.value}}积分</span>
              </div>
            </div>
          </div>

          <!-- 未参与促销商品SKU -->
          <sku-item :skuList="shop.sku_list" />
        </div>
      </div>
    </template>
    <div v-else class="empty-box">
      <div class="empty-cart" >
        <h1>您的购物车中暂无商品</h1>
        <a href="/">挑选心爱的商品</a>
        <router-link to="/member/my-order">查看我的订单</router-link>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Row, Col, Popover, Button } from 'element-ui'
import * as API_promotions from '@/api/promotions'
import * as API_Members from '@/api/members'
import SkuItem from './SkuItem.vue'
import { cloneObj } from '@/utils/index'

Vue.use(Row).use(Col).use(Popover).use(Button)

export default {
  name: 'ShopGoodsItem',
  components: { SkuItem },
  data() {
    return {
      newShopList: []
    }
  },
  computed: {
    ...mapGetters({
      shopList: 'cart/shopList',
      allCount: 'cart/allCount',
      checkedData: 'cart/checkedData'
    }),
    /** 是否全部选中 */
    allChecked() {
      return !!this.checkedData.checkedCount && this.checkedData.checkedCount === this.allCount
    },
    /** 是否满足优惠条件 */
    discountCheck() {
      return (group) => {
        const promotion = group.promotion_tips
        if (promotion.current_threshold_value) {
          return true
        }
        return false
      }
    },
    /** 促销提示 */
    promotionTips() {
      return (group) => {
        const promotion = group.promotion_tips
        let tips = ''
        const unit = promotion.discount_type === 2 ? '件' : ''
        if (group.promotion_type_name === '满减') {
          // current_threshold_value：当前已满足档位 current_discount_amount：当前已减金额
          if (promotion.current_threshold_value && promotion.current_discount_amount) {
            tips += `已购满${promotion.current_threshold_value}${unit}`
            if (promotion.current_type === 1) {
              // 满额减
              tips += `，已减${promotion.current_discount_amount}`
            } else {
              // 满折
              tips += `，享${promotion.current_discount_amount}折优惠`
            }
          }
          if (promotion.next_threshold_value && promotion.next_discount_amount) {
            // next_threshold_value: 距离下一档位金额 next_discount_amount： 下一档位减金额
            tips += `${tips ? '，' : ''}在凑${promotion.next_threshold_value}${unit}`
            if (promotion.next_type === 1) {
              // 满额减
              tips += `可减${promotion.next_discount_amount}`
            } else {
              // 满折
              tips += `可享${promotion.next_discount_amount}折优惠`
            }
          }
        } else if (group.promotion_type_name === '满赠') {
          if (promotion.current_threshold_value) {
            tips = `已满${promotion.current_threshold_value}${unit}享受满赠优惠`
          }
          if (promotion.next_threshold_value) {
            if (tips) {
              tips += `，再凑${promotion.next_threshold_value}${unit}可享受更大优惠`
            } else {
              tips += `再凑${promotion.next_threshold_value}${unit}可享受满赠优惠`
            }
          }
        }
        return tips
      }
    }
  },
  watch: {
    shopList: {
      async handler(val) {
        const list = cloneObj(val)
        for (const item of list) {
          await API_promotions.getShopAllCoupons({ seller_id: item.seller_id }).then(res => {
            item.couponList = res
          })
        }
        this.newShopList = list
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions({
      // 全选、取消全选
      checkAll: 'cart/checkAllAction',
      // 选择、取消选择店铺内所有商品
      checkShopSku: 'cart/checkShopSkuAction'
    }),
    /** 全选、取消全选 */
    handleCheckAll() {
      this.checkAll(this.allChecked ? 0 : 1)
    },

    /** 勾选、取消勾选店铺 */
    handleCheckShop(shop) {
      this.checkShopSku({ shop_id: shop.seller_id, checked: shop.checked ? 0 : 1 })
    },
    /** 优惠券领取 */
    handleReceiveCoupon(coupon_id) {
      API_Members.receiveCoupons(coupon_id).then(() => {
        this.$message.success('领取成功！')
      })
    }

  }

}
</script>

<style lang="scss" scoped>
  @use "../../../assets/styles/color" as theme;
  .coupon-popover {
    .coupon-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .left {
        display: flex;
        align-items: center;
        .discount {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid theme.$color-main;
          min-width: 60px;
          min-height: 30px;
          border-radius: 2px;
          color: theme.$color-main;
          font-weight: 500;
          text-align: center;
          margin-right: 20px;
        }
        .threshold {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }
        .tips {
          font-size: 13px;
          color: #333;
        }
      }
    }
  }
  .shop-goods-item-wrap {
    padding-bottom: 50px;
  }
  .table-header {
    background: #f5f5f5;
    height: 32px;
    padding: 5px 0;
    line-height: 32px;
    border: 1px solid #e9e9e9;
    .check-all-box {
      padding-left: 10px;
    }
    .col-item {
      display:flex;
      justify-content: center;
    }
  }
  .shop-header {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0px 15px 10px;
    // height: 25px;
    line-height: 25px;
    box-sizing: border-box;
    border-bottom: 2px solid #ccc;
    .coupon-tag {
      width: 70px;
      height: 30px;
      margin-left: 20px;
      position: relative;
      .tag-img {
        width: 100%;
      }
      .tag-content {
        top: 0;
        left: 10px;
        right: 0;
        bottom: 0;
        position: absolute;
        color: #fff;
        line-height: 30px;
        font-weight: 500;
        cursor: pointer;
      }

    }
    .shop-name-box {
      display: flex;
      align-items: center;
    }
    .shop-price-box {
      text-align: right;
      color: #333;
      font-size: 13px;
    }
    .shop-name {
      font-size: 12px;
      color: #333;
      font-weight: 600;
    }
  }
  .shop-body {
    border: 1px solid #f1f1f1;
    .gift-tips {
      color: #666;
      padding-left: 25px;
      font-size: 12px;
      background: #fff4e8;
      .gift-item {
        line-height: 24px;
      }
    }
    .discount-tips-box {
      height: 26px;
      padding: 5px 10px 5px 0;
      margin-left: 10px;
      line-height: 26px;
      color: #999;
      .discount-check {
        color: #fff;
        background: #f48719;
      }
      .discount-check::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 0;
        height: 0;
        border-color: transparent #f48719;
        border-width: 0 0 8px 8px;
        border-style: solid;
      }
      .discount-name {
        color: #f48719;
        border: 1px solid #f48719;
      }

      .group-discount-name {

        font-size: 13px;
        padding: 1px 10px;
        height: 16px;
        line-height: 16px;
        position: relative;
        margin-left: 6px;
      }
      .discount-name::after {
        content: '';
        position: absolute;
        left: 0px;
        bottom: -6px;
        width: 0;
        height: 0;
        border-color: transparent #fff;
        border-width: 0 0 6px 6px;
        border-style: solid
      }
      .discount-name::before {
        content: '';
        position: absolute;
        left: -1px;
        bottom: -8px;
        width: 0;
        height: 0;
        border-color: transparent #f48719;
        border-width: 0 0 8px 8px;
        border-style: solid;
      }
    }

  }
  .empty-box {
    width: 100%;
    border-top: 2px solid #e9e9e9;

  }
  .empty-cart {
    height: 280px;
    margin: 0 auto;
    overflow: hidden;
    position: relative;
    width: 380px;
    z-index: 1;
    padding: 50px 0 20px 280px;
    background: url(../../../assets/images/icon-empty-cart.jpg) no-repeat left 40px;
    h1 {
      color: #333;
      font: lighter 22px/30px "microsoft yahei";
      width: 380px;
      line-height: 30px;
      margin: 55px 0 10px 0;
    }
    a {
      min-width: 100px;
      height: 25px;
      line-height: 25px;
      float: left;
      text-align: center;
      margin-right: 10px;
      border: 1px solid #dcdcdc;
      background: #f5f5f5;
      font-size: 12px;
      color: #666;
      &:hover { color: theme.$color-main }
    }
  }

</style>
