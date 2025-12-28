<template>
	<div class="new-center-coupon">
    <el-dialog
      :show-close="false"
      :visible.sync="showCouponPop"
      :close-on-press-escape="false"
      @close="handleClose" >
      <div class="popup-wrap">
        <div class="bg-one"></div>
        <div scroll-y class="bg-two">
            <i class="el-icon-circle-close close-icon" @click="handleClose" />
            <div class="title">
              <p class="line" />
              <p class="title-text">新人好礼</p>
            </div>
            <div class="coupon-box">
                <div
                    class="coupon-item"
                    v-for="(item, index) of couponList"
                    :key="item.coupon_id"
                >
                <div class="left">
                    <!-- <span class="unit">{{ MixinUnitOfCurrency }}</span> -->
                    <!-- {{item.coupon_price}} -->
                    <span class="unit">
                      <en-price :price="item.coupon_price" size="16" priceColor="#fff" i18nPriceColor="#fff" />
                    </span>
                </div>
                <div class="right"> {{item.title}}</div>
                </div>
            </div>
        </div>
        <div class="bg-three">
          <img class="bg-icon" src="@/assets/images/coupon-bg.png" alt=""/>
          <div class="btn-box">
              <div>注册即可领取优惠券</div>
              <div class="btn" @click="toRegister">立即注册</div>
          </div>
        </div>
      </div>
      </el-dialog>
      <template v-if="showFixedPop">
        <div v-drag v-if="open_i18n" class="fixed-red-box" @click="handleShowPop"></div>
        <div v-drag v-else class="fixed-box"  @click="handleShowPop">
          <div>新人红包</div>
          <div>点击查看</div>
        </div>
      </template>
	</div>
</template>

<script>

import * as API_Promotions from '@/api/promotions'
import Vue from 'vue'
import { Dialog, Divider, Icon} from 'element-ui'

Vue.use(Dialog).use(Divider).use(Icon)

export default {
  name: 'NewComerCoupon',
  data() {
    return {
      open_i18n: process.env.I18N,
      // 优惠券弹窗显隐
      showCouponPop: false,
      // 右下角浮窗显隐
      showFixedPop: false,
      couponList: []
    }
  },
  created() {
    this.getNewcomerCoupon()
  },
  methods: {
    /** 获取新人优惠券 */
    getNewcomerCoupon() {
      API_Promotions.getNewcomerCoupon().then(res => {
        if (!res.newcomer_is_open) return
        this.couponList = res.newcomer_coupon_list
        if (this.couponList.length <= 0) return
        this.showCouponPop = true
      })
    },
    /** 关闭弹窗 */
    handleClose() {
      this.showFixedPop = true
      this.showCouponPop = false
    },
    /** 显示红包弹窗 */
    handleShowPop(e) {
      this.showCouponPop = true
      this.showFixedPop = false
    },
    /** 去注册 */
    toRegister() {
      this.$router.push({
        path: '/register'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// TODO
.new-center-coupon ::v-deep .el-dialog {
  border-radius: 10px;
  background: none;
  box-shadow: none;
  width: 380px;
  position: relative;
}
.fixed-red-box {
  position: fixed;
  bottom: 120px;
  right: 20px;
  z-index: 999;
  cursor: pointer;
  width: 120px;
  height: 80px;
  background-image: url('../assets/images/hongbao2.png');
  background-size: 100% 100%;
}
.fixed-box {
  position: fixed;
  bottom: 120px;
  right: 20px;
  z-index: 999;
  cursor: pointer;
  width: 90px;
  height: 70px;
  background-image: url('../assets/images/hongbao.png');
  background-size: 100% 100%;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}
.popup-wrap {
  width: 100%;
  height: 500px;
  position: relative;
  .bg-one {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 50%;
    border-radius: 10px;
    background: #f90007;
  }
  .bg-two {
      height: 90%;
      position: absolute;
      bottom: 40px;
      width: calc(100% - 20px);
      left: 10px;
      right: 10px;
      border-radius: 15px;
      background: #fdf7d2;
      padding: 40px 14px;
      box-sizing: border-box;
      .close-icon {
        font-size: 28px;
        color: #ff5000;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
      }
      .title {
          color: #ff5000;
          font-size: 22px;
          font-weight: 500;
          text-align: center;
          margin-bottom: 30px;
          position: relative;
          .line {
            z-index: 1;
            position: absolute;
            left: 20px;
            right: 20px;
            top: 10px;
            height: 2px;
            background: #ff5000;
            margin-top: 2px;
          }
          .title-text {
            position: absolute;
            left: 0;
            right: 0;
            z-index: 9;
            width: 120px;
            margin: 0 auto;
            background: #fdf7d2;
          }
      }
      .coupon-box {
          height: calc(100% - 90px);
          overflow: auto;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }
      .coupon-box::-webkit-scrollbar {
        display: none;
      }
      .coupon-item {
          background: #fff;
          border-radius: 10px;
          text-align: center;
          color: #ff5000;
          width: 100%;
          height: 70px;
          line-height: 70px;
          margin: 20px 0;
          font-size: 16px;
          display: flex;
          .left {
              border-radius: 6px 0 0 6px;
              width: 30%;
              background: #f23b24;
              color: #fff;
              font-weight: 600;
              font-size: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              background: radial-gradient(circle at right top, transparent 4px,#f23b24 0) right top / 100% 50% no-repeat,
              radial-gradient(circle at right bottom, transparent 4px, #f23b24 0) right bottom / 100% 50% no-repeat;
              &::after {
                  content: ' ';
                  height: 100%;
                  position: absolute;
                  border-left: 6px dotted white;
                  top: 0;
                  right: -3px;
              }
              .unit {
                  font-size: 16px;
                  font-weight: 400;
                  margin: 2px 5px 0 0;
              }
          }
          .right {
              width: 70%;
              display: flex;
              align-items: center;
              justify-content: center;
          }

      }
  }
  .bg-three {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 150px;
      overflow: hidden;
      .bg-icon {
          position: absolute;
          bottom: -10px;
          left: 0;
          right: 0;
          width: 100%;
          height: 100%;
          transform: scaleX(1.1);
      }
      .btn-box {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          .btn {
              width: 50%;
              height: 40px;
              line-height: 40px;
              background: #fff;
              border-radius: 20px;
              font-size: 20px;
              color: #ff5000;
              text-align: center;
              z-index: 3;
              margin: 10px 0 10px;
              cursor: pointer;
          }
      }

  }

}
</style>
