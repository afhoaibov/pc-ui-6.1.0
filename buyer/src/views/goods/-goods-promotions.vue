<template>
  <div v-if="promotions && promotions.length !== 0" class="promotions-container">
    <div class="pro-list promotions-box" v-if="promotions.length > 1 || promotions[0].promotion_type !== 'PINTUAN'">
      <div class="pro-title">促销信息</div>
      <div>
        <div v-for="(prom, index) in promotions" :key="index" class="promotions-item">
          <template v-if="prom.promotion_type !== 'PINTUAN'">
            <p :class="['promotions-text', {'ellipsis': !prom.unfold}]" :id="`promotionText${index}`">
              <em class="promotions-tag">{{ prom.promotion_tag }}</em>
              {{promotionText(prom)}}
              <span class="more-btn" v-if="prom.showMore" @click="prom.unfold = !prom.unfold">
                收起&lt;&lt;
              </span>
            </p>
            <span class="more-btn" v-if="prom.promotion_type === 'FULL_GIVE'" @click="showFullGiveInfo(prom)">
              查看详情&gt;&gt;
            </span>
            <span class="more-btn" v-if="prom.showMore && !prom.unfold" @click="prom.unfold = true">
              显示更多&gt;&gt;
            </span>
            <router-link class="more-btn" v-if="prom.promotion_type === 'SECKILL'" to="/seckill">查看更多 &gt;&gt;</router-link>
          </template>
        </div>
      </div>
    </div>
    <!-- 满赠侧边栏展示 -->
    <div :class="['full-give-drawer',{'open-drawer': showFullInfo} ]" @click.stop>
      <div class="drawer-title">
        <span >满赠活动详情</span>
        <i class="iconfont el-icon-close" @click="closeDrawer"></i>
      </div>
      <div class="give-box"
        v-for="item in fullGiveData.step_list">
        <div class="title-box">
          <span class="line"></span>
          <span class="item-title">购满{{item.threshold}}{{fullGiveData.discount_type === 2 ? '件' : ''}}可享</span>
          <span class="line"></span>
        </div>
        <div class="give-item" v-if="item.is_free_ship === 1">
          <img class="give-icon" src="@/assets/images/baoyou.png" alt="">
          <span>免邮费</span>
        </div>
        <div class="give-item" v-if="item.is_send_point === 1">
          <img class="give-icon" src="@/assets/images/jifen.png" alt="">
          <span sf-text-rule="given_point">送{{item.point_value}}积分</span>
        </div>
        <div class="give-item" v-if="item.is_send_bonus === 1">
          <img class="give-icon" src="@/assets/images/youhuiquan.png" alt="">
          <span sf-text-rule="given_coupon">送满{{item.coupon.coupon_threshold_price}}减{{item.coupon.coupon_price}}优惠券一张</span>
        </div>
        <div class="give-item" v-if="item.is_send_gift === 1">
          <img class="give-icon" src="@/assets/images/zengping.png" alt="">
          <span>送价值{{item.gift.gift_price}}的{{item.gift.gift_name}}一份</span>
        </div>
      </div>
    </div>
</div>
</template>

<script>

export default {
  name: 'goods-promotions',
  props: ['promotions'],
  data() {
    return {
      showFullInfo: false,
      // 满赠详情
      fullGiveData: {}
    }
  },
  computed: {
    /** 促销活动话术拼接 */
    promotionText() {
      return (promotion) => {
        let text = ''
        const { promotion_type, full_minus_info } = promotion
        if (promotion_type === 'FULL_MINUS') {
          // 满减
          // discount_type 活动优惠方式 1：满额减，2：满件减
          // step_list 阶梯优惠数据
          const { discount_type, step_list } = full_minus_info
          const unit = discount_type === 1 ? '' : '件'

          step_list.forEach(child => {
            // type 优惠方式 1：满减，2：满折
            if (child.type === 1) {
              text += `购满${child.threshold}${unit}减${child.discount};`
            } else {
              text += `购满${child.threshold}${unit}享${child.discount}折;`
            }
          })
        } else if (promotion_type === 'HALF_PRICE') {
          // 第二件半价
          text = '购买双数商品即可享受第二件半价优惠，优惠可叠加，多买多减！'
        } else if (promotion_type === 'MINUS') {
          // 单面立减
          text = `购买1件直接立减${promotion.single_reduction_value}，优惠可叠加，多买多减！`
        } else if (promotion_type === 'FULL_GIVE') {
          // 满赠
          text = '购满指定金额即可享受免邮费或得赠品的优惠'
        } else if (promotion_type === 'SECKILL') {
          // 限时抢购
          text = '活动时间有限，请尽快购买！'
        }
        return text
      }
    }
  },
  methods: {
    /** 关闭侧边优惠展示 */
    closeDrawer(e) {
      if (e.target.classList.contains('more-btn')) return
      this.showFullInfo = false
      window.removeEventListener('click', this.closeDrawer)
    },
    showFullGiveInfo(prom) {
      this.fullGiveData = prom.full_give_info
      this.showFullInfo = true
      window.addEventListener('click', this.closeDrawer)
    }

  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
.open-drawer {
  right: 0 !important;
}
.full-give-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  right: -300px;
  overflow-x: hidden;
  overflow-y: scroll;
  transition: all .2s ease-out;
  height: 100%;
  width: 300px;
  box-shadow: 0 10px 10px 0 rgba(0, 0, 0, .4);
  background: #fff;
  opacity: 1;
  z-index: 999;

  .give-box {
    .give-item {
      padding: 0 10px;
      display: flex;
      align-items: center;
      font-size: 14px;
      margin: 14px 0;
      .give-icon {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }
    }

    .title-box {
      text-align: center;
      margin: 20px 0;
      .line {
        display: inline-block;
        min-width: 80px;
        border-top: 1px solid #ccc;
      }
      .item-title {
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        margin: 0 10px;
        vertical-align: middle;
      }
    }

  }
  .drawer-title {
    line-height: 40px;
    text-align: center;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .1);
    font-size: 14px;
    font-weight: 500;
    position: relative;
    .el-icon-close {
      font-size: 20px;
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
}
.promotions-container {
  .promotions-box {
    background: url("../../assets/images/background-price.png") 0 -12px repeat-x #efefef;
    padding-bottom: 5px;
  }
  .pro-title {
    min-width: 60px;
    padding-right: 17px;
    height: 33px;
    line-height: 33px;
    white-space: nowrap;
  }
  .promotions-item {
    display: flex;
    align-items: center;
    min-height: 33px;
    width: 480px;
    .promotions-tag {
      padding: 2px 3px;
      line-height: 20px;
      text-align: center;
      color: theme.$color-main;
      border: 1px solid theme.$color-main;
      margin-right: 4px;
    }
    .more-btn {
      cursor: pointer;
      white-space: nowrap;
    }
    .ellipsis {

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .promotions-text {
      max-width: 400px;
      line-height: 24px;
      margin-right: 10px;
    }
  }
}
</style>
