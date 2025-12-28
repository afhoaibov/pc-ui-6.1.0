<template>
  <el-dialog
    :show-close="false"
    :visible.sync="showCouponPop"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="coupon-dialog"
  >
    <div class="popup-wrap" v-if="couponList && couponList.length">
      <div class="title">恭喜您获得</div>
      <div class="sub-title">{{ couponList.length }}张优惠券</div>
      <div class="coupon-content">
        <div class="coupon-item" v-for="coupon of couponList">
          <div class="coupon-left">
            <div class="price-box">
              <!-- <span class="unit">{{MixinUnitOfCurrency}}</span> -->
              <!-- <span class="price">{{coupon.coupon_price}}</span> -->
              <en-price :price="coupon.coupon_price" size="20" />
            </div>
            <div class="tips">
              满{{ coupon.coupon_threshold_price }}使用
            </div>
          </div>
          <div class="coupon-right">
            <div class="name">{{ coupon.title }}</div>
            <div class="date">有效期至{{ coupon.end_time | unixToDate }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-box">
      <div class="btn-icon" @click="handleClose">
        <i class="el-icon-circle-close" />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Dialog, Icon } from 'element-ui'

Vue.use(Dialog).use(Icon)

export default {
  name: 'NewComerCouponReceive',
  props: {
    couponList: {
      type: Array
    }
  },
  data() {
    return {
      // 优惠券弹窗显隐
      showCouponPop: false
    }
  },
  watch: {
    couponList: {
      handler(val) {
        this.showCouponPop = Boolean(val && val.length)
      },
      immediate: true
    }
  },
  methods: {
    /** 关闭弹窗 */
    handleClose() {
      this.$emit('close')
      this.showCouponPop = false
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-dialog {
  border-radius: 10px;
  width: 350px;
  position: relative;
  background-image: url(../assets/images/bg5.png);
  background-size: 100% 100%;

  ::v-deep .el-dialog__header {
    padding: 0;
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
  }
}

.btn-box {
  text-align: center;
  position: absolute;
  left: 0;
  width: 100%;
  bottom: -60px;

  .btn-icon {
    margin: 0 auto;
    font-size: 45px;
    color: #fff;
    cursor: pointer;
  }
}

.popup-wrap {
  width: 100%;
  height: 100%;

  .title {
    text-align: center;
    font-size: 24px;
    color: #fff;
    padding: 10px 0;
  }

  .sub-title {
    text-align: center;
    color: #fff;
    font-size: 16px;
  }

  .coupon-content {
    padding: 10px;
    max-height: 450px;
    overflow: auto;

    .coupon-item {
      background: #fff;
      height: 80px;
      border-radius: 4px;
      text-align: center;
      margin: 10px 0;
      display: flex;
      align-items: center;

      .coupon-right {
        text-align: left;
        padding-left: 10px;
        box-sizing: border-box;

        .name {
          color: #333;
          font-size: 14px;
          font-weight: 600;
          line-height: 32px;
        }

        .date {
          font-size: 12px;
          color: #999;
        }
      }

      .coupon-left {
        color: #338d44;
        background: rgba(235, 246, 237, 1);
        width: 30%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .tips {
          font-size: 12px;
        }

        .price-box {
          margin-bottom: 4px;
          display: flex;
          align-items: flex-end;
          justify-content: center;

          .price {
            font-size: 30px;
            line-height: 30px;
            font-weight: 700;
          }

          .unit {
            color: #f42424;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
