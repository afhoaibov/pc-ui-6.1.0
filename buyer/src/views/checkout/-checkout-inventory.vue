<template>
  <div class="ckt-item inventory">
    <div class="top-ckt">
      <span class="title-top">配送清单</span>
      <span v-if="buyWay !== 'BUY_NOW'" class="other-top"><router-link to="/cart" class="c-back-cart">返回购物车修改</router-link></span>
      <div class="clearfix"></div>
    </div>
    <div class="content-ckt-inventory inventory">
      <div
        v-for="(shop, shopIndex) in cartList"
        :key="shop.seller_id"
        class="item-ckt-inventory"
      >
        <div class="left-item-inventory">
          <template v-if="!isVirtualOrder">
            <div class="express-inventory">
              <div class="title-item-inventory">配送方式</div>
              <div class="content-item-inventory express">
                <div class="ckt-checkbox express selected">
                  运费&nbsp;<en-price :price="shop.price.freight_price" size="16"/>
                </div>
              </div>
              <div style="clear: both;"></div>
            </div>
            <div class="express-weight">总重量：{{ shop.weight }}kg</div>
            <div class="hr-inventory"></div>
          </template>
          <div v-if="shop.coupon_list">
            <div class="discount-inventory" v-if="shop.coupon_list.available_list && shop.coupon_list.available_list.length">
              <div class="title-item-inventory">优惠券</div>
              <div class="content-item-inventory">
                <template>
                  <div
                    v-for="(coupon, couponIndex) in shop.coupon_list.available_list"
                    :key="couponIndex"
                    class="item-discount-inventory"
                    :class="[coupon.selected === 1 && 'selected', coupon.enable === 0 && 'full']"
                    @click="useCoupon(coupon, couponIndex)"
                  >
                    <div class="lace-item-discount">
                      <div class="lace-discount">
                        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                      </div>
                    </div>
                    <div class="select-discount">
                      <span class="bg-select-discount"></span>
                      <i class="iconfont ea-icon-check"></i>
                    </div>
                    <div class="money-item-discount">
                      <en-price :price="coupon.amount" priceColor="#fff" i18nPriceColor="#fff" size="18" />
                      <p class="rule-text">
                        满
                      <en-price :price="coupon.coupon_threshold_price" priceColor="#fff" i18nPriceColor="#fff" size="10" />
                      </p>
                    </div>
                    <div class="detail-item-discount">
                      <p class="first">{{coupon.seller_name}}</p>
                      <p>有效期至{{ coupon.end_time | unixToDate('yyyy-MM-dd') }}</p>
                    </div>
                  </div>
                </template>
                <div style="clear: both;"></div>
              </div>
            </div>
            <div class="discount-inventory" v-else>
              <div class="title-item-inventory">优惠折扣</div>
              <template>
                <p class="no-item-discount-inventory">您在该店铺还没有领到优惠劵，去&nbsp;
                  <router-link :to="'/shop/' + shop.seller_id" target="_blank" style="color: #005ea7;">店铺</router-link>&nbsp;看看吧！
                </p>
              </template>
            </div>
          </div>
          <div class="discount-inventory" v-else>
            <div class="title-item-inventory">优惠折扣</div>
            <template>
              <p class="no-item-discount-inventory">您在该店铺还没有领到优惠劵，去&nbsp;
                <router-link :to="'/shop/' + shop.seller_id" target="_blank" style="color: #005ea7;">店铺</router-link>&nbsp;看看吧！
              </p>
            </template>
          </div>
        </div>
        <div class="right-item-inventory">
          <div class="gooods-inventory">
            <div class="title-item-inventory">
              <div class="store-name">店铺名称：
                <router-link :to="'/shop/' + shop.seller_id" target="_blank">{{ shop.seller_name }}</router-link>
              </div>
              <div class="store-total">
                <div class="store-discount">
                  <div class="discount-store-total">
                    优惠折扣：<en-price :price="shop.price.discount_price" is-neg size="16"/>
                  </div>
                  <div class="discount-store-total">
                    会员折扣：<en-price :price="shop.price.member_level_discount_price" is-neg size="16"/>
                  </div>
                </div>
                <div class="total-store-total">店铺合计 <span v-if="!isVirtualOrder">（含运费）</span> ：
                  <div class="total-store-total-box">
                    <span v-if="shop.price.total_price || shop.price.total_price == 0"><en-price :price="shop.price.total_price" size="16"/></span>
                    <span v-if="shop.price.paid_point && shop.price.paid_point > 0">
                      {{shop.price.total_price ? '+' : ''}}{{ shop.price.paid_point}}积分
                    </span>
                  </div>
                </div>
              </div>
              <input type="hidden" name="storeid" value="18">
            </div>
            <div
              v-if="shop.group_list && shop.group_list.length"
              class="content-item-inventory goods"
              style="border-bottom: 1px solid rgb(255 255 255)"
            >
              <div v-for="(group, groupIndex) in shop.group_list" :key="group.promotion_id">
                <div class="shop-act-info">
                  <span class="sku-act-tag">{{ group.promotion_type_name }}</span>
                  {{promotionTips(group)}}
                  <span
                    class="more-btn"
                    v-if="group.promotion_type_name === '满赠'"
                    @click="handleShowMore(shopIndex, groupIndex, group)"
                    sf-text-rule="more-btn" >
                    {{group.showGiftMore ? '收起>>' : '展开>>'}}
                  </span>
                </div>
                <template v-if="group.showGiftMore">
                  <div class="gift-tips">
                    <span v-if="group.free_freight" class="gift-item">【赠】免邮费</span>
                    <div v-for="gift in group.gift_list" :key="gift.type" >
                      <span v-if="gift.type === 'gift'" class="gift-item">【赠】{{gift.value.gift_name}}  x 1</span>
                      <span v-if="gift.type === 'coupon'" class="gift-item">【赠】<span v-if="gift.value.threshold">满{{ gift.value.threshold }}减</span>{{gift.value.amount}}优惠券</span>
                      <span v-if="gift.type === 'point'" class="gift-item">【赠】{{gift.value}}积分</span>
                    </div>
                  </div>
                </template>
                <table class="table-gooods-inventory">
                  <tbody>
                    <tr v-for="goods in group.sku_list" :key="goods.sku_id">
                      <td class="img-gooods-inventory">
                        <router-link :to="'/goods/' + goods.goods_id" target="_blank">
                          <img :src="goods.goods_image">
                        </router-link>
                        <span v-if="goods.enable_quantity <= 0" class="out-of-stock-tip">该地区无货</span>
                      </td>
                      <td class="name-gooods-inventory">
                        <router-link :to="'/goods/' + goods.goods_id" target="_blank">
                          {{ goods.name }}
                        </router-link>
                        <span class="sku-spec">{{ goods | formatterSkuSpec }}</span>
                        <p>
                          <span v-if="goods.promotion_tags && goods.promotion_tags.length" class="sku-act-tag" v-for="(tag, index) in goods.promotion_tags" :key="index">{{ tag }}</span>
                        </p>
                      </td>
                      <td class="price-gooods-inventory">
                        <span v-if="goods.original_price">
                          <en-price :price="goods.original_price" size="16"/>
                        </span>
                        <span v-if="goods.point && goods.point > 0">{{goods.original_price ? '+' : ''}}{{goods.point}}积分</span>
                        <p class="goods-weight">{{ goods.goods_weight }}kg</p>
                      </td>
                      <td class="num-gooods-inventory">x{{ goods.num }}</td>
                      <td class="subtotal-gooods-inventory">
                        <span v-if="goods.enable_quantity !== 0">
                          <en-price :price="goods.original_price * goods.num" size="16"/>
                        </span>
                        <span v-else>该地区无货</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="shop.sku_list && shop.sku_list.length" class="content-item-inventory goods">
              <table class="table-gooods-inventory">
                <tbody>
                <tr v-for="goods in shop.sku_list" :key="goods.sku_id">
                  <td class="img-gooods-inventory">
                    <router-link :to="'/goods/' + goods.goods_id" target="_blank">
                      <img :src="goods.goods_image">
                    </router-link>
                    <span v-if="goods.enable_quantity <= 0" class="out-of-stock-tip">该地区无货</span>
                  </td>
                  <td class="name-gooods-inventory">
                    <div style="display: flex; align-items: center;">
                      <span class="goods-tag" v-if="goods.goods_type === 'VIRTUAL'">虚拟商品</span>
                      <router-link :to="'/goods/' + goods.goods_id" target="_blank">
                        {{ goods.name }}
                      </router-link>
                    </div>
                    <span class="sku-spec">{{ goods | formatterSkuSpec }}</span>
                    <p v-if="goods.promotion_tags && goods.promotion_tags.length">
                      <span class="sku-act-tag" v-for="(tag, index) in goods.promotion_tags" :key="index">{{ tag }}</span>
                    </p>
                  </td>
                  <td class="price-gooods-inventory">
                    <en-price :price="goods.original_price" size="16"/>
                    <span v-if="goods.point && goods.point > 0">{{goods.original_price ? '+' : ''}}{{goods.point}}积分</span>
                    <p class="goods-weight">{{ goods.goods_weight }}kg</p>
                  </td>
                  <td class="num-gooods-inventory">x{{ goods.num }}</td>
                  <td class="subtotal-gooods-inventory">
                    <en-price :price="goods.original_price * goods.num" size="16"/>
                    <span v-if="goods.point_total && goods.point_total > 0">{{goods.original_price ? '+' : ''}}{{goods.point_total}}积分</span>
                    <span v-else-if="goods.enable_quantity <= 0">该地区无货</span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="gift-item-inventory">
              <div class="gift-item" v-if="shop.gift_coupon_list && shop.gift_coupon_list.length">
                <div class="gf-tit">赠送优惠券：</div>
                <div class="gf-con">
                  <span :key="index" v-for="(coupon, index) in shop.gift_coupon_list">
                    价值{{ coupon.amount }}的优惠券{{ coupon.error_msg }}
                  </span>
                </div>
              </div>
              <div class="gift-item" v-if="shop.gift_list && shop.gift_list.length">
                <div class="gf-tit">赠送礼品：</div>
                <div class="gf-con gift">
                  <span :key="index" v-for="(gift, index) in shop.gift_list">
                    价值
                    <en-price :price=" gift.gift_pric" direction="row" priceColor="#fff" size="10" />的{{ gift.gift_name }}
                    <a :href="gift.gift_img" target="_blank">
                      <img :src="gift.gift_img" alt="" class="gift-img">
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="clear: both;"></div>
        <div class="bottom-item-inventory">
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
    <div class="discount-inventory" v-if="couponsList.available_list && couponsList.available_list.length">
      <div class="title-item-inventory">通用优惠券</div>
      <div class="content-item-inventory">
        <template>
          <div
            v-for="(coupon, couponIndex) in couponsList.available_list"
            :key="couponIndex"
            class="item-discount-inventory"
            :class="[coupon.selected === 1 && 'selected', coupon.enable === 0 && 'full']"
            @click="useCoupon(coupon, couponIndex)"
          >
            <div class="lace-item-discount">
              <div class="lace-discount">
                <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
            </div>
            <div class="select-discount">
              <span class="bg-select-discount"></span>
              <i class="iconfont ea-icon-check"></i>
            </div>
            <div class="money-item-discount">
                      <en-price :price="coupon.amount" priceColor="#fff" i18nPriceColor="#fff" size="18" />
                      <p class="rule-text">
                        满
                      <en-price :price="coupon.coupon_threshold_price" priceColor="#fff" i18nPriceColor="#fff" size="10" />
                      </p>
            </div>
            <div class="detail-item-discount">
              <p class="first">{{coupon.seller_name}}</p>
              <p>有效期至{{ coupon.end_time | unixToDate('yyyy-MM-dd') }}</p>
            </div>
          </div>
        </template>
        <div style="clear: both;"></div>
      </div>
    </div>
    <div class="bottom-ckt-inventory">
      订单备注：
      <el-input v-model="iRemark" size="small" :maxlength="120" clearable>
        <el-button slot="append" @click="handleSetRemark">保存</el-button>
      </el-input>
      <span class="remark-tip">*请勿填写有关支付<span v-if="!isVirtualOrder">、收货、发票</span>方面的信息，如有特殊需要请联系客服人员。</span>
    </div>
    <div class="placeholder-20"></div>
  </div>
</template>

<script>
/**
 * 结算页
 * 购物车清单组件
 */
import * as API_Trade from '@/api/trade'
import { cloneObj } from '@/utils/index'
import Storage from '@/utils/storage'

export default {
  name: 'checkout-inventory',
  props: ['inventoryList', 'couponsList', 'remark', 'isVirtualOrder', 'orderSource'],
  data() {
    return {
      iRemark: this.remark,
      buyWay: this.$route.query.way,
      params: {},
      cartList: []
    }
  },
  computed: {
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
        } else if (group.promotion_type_name === '满赠') {
          if (promotion.current_threshold_value) {
            tips = `已满${promotion.current_threshold_value}${unit}，已享受满赠优惠`
          }
        }
        return tips
      }
    }
  },
  watch: {
    inventoryList: {
      immediate: true,
      handler(newVal) {
        this.cartList = cloneObj(newVal)
      }
    },
    remark: {
      immediate: true,
      handler(newVal) {
        this.iRemark = newVal
      }
    }
  },
  methods: {

    handleShowMore(shopIndex, groupIndex, group) {
      this.$set(this.cartList[shopIndex].group_list[groupIndex], 'showGiftMore', !group.showGiftMore)
    },
    /** 使用优惠券 */
    useCoupon(coupon, couponIndex) {
      // 不可使用
      if (coupon.enable === 0) {
        this.$message.error(coupon.error_msg)
        return
      }
      this.params.way = this.buyWay
      if (coupon.selected === 1) {
        this.params.type = 1
      } else {
        this.params.type = 0
      }
      API_Trade.useCoupon(coupon.member_coupon_id, this.params).then(() => {
        this.$emit('coupon-change')
      })
    },
    /** 设置备注 */
    handleSetRemark() {
      API_Trade.setRemark(this.iRemark).then(() => {
        this.$message.success('保存成功！')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.address-edit {
  margin-left: 30%;
  color: #005CC5;
  cursor:pointer;
  font-size: 14px;
  font-weight: bold;
}
</style>

