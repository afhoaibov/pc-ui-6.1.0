<template>
  <div class="container">
    <el-tabs type="border-card" v-model="tabActiveName">
      <el-tab-pane :label="normalLabel" name="NORMAL">
        <add-coupon :couponId="couponId" />
      </el-tab-pane>
      <el-tab-pane :label="newComerLabel" name="NEWCOMER">
        <add-new-user-coupon :couponId="newComerCouponId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AddCoupon from './components/AddCoupon'
import AddNewUserCoupon from './components/AddNewUserCoupon'
import * as API_Promotion from '@/api/promotion'

export default {
  name: 'coupon',
  components: {
    AddCoupon,
    AddNewUserCoupon
  },
  data() {
    return {
      tabActiveName: 'NORMAL',
      newcomerCoupon: null,
      normalLabel: '新增平台优惠券',
      newComerLabel: '新增新人优惠券',
      // 当前编辑coupon id
      newComerCouponId: '',
      couponId: ''
    }
  },
  computed: {

  },
  watch: {
    $route: {
      handler(val) {
        const query = val.query
        console.log(query)
        if (query.id) {
          this.tabActiveName = query.coupon_type || 'NORMAL'
          if (query.coupon_type === 'NORMAL') {
            this.normalLabel = '编辑平台优惠券'
            this.couponId = query.id
          } else if (query.coupon_type === 'NEWCOMER') {
            this.newComerLabel = '编辑新人优惠券'
            this.newComerCouponId = query.id
          }
        } else {
          this.normalLabel = '新增平台优惠券'
          this.newComerLabel = '新增新人优惠券'
          this.newComerCouponId = ''
          this.couponId = ''
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.GET_CouponsList()
  },
  methods: {
    /** 获取优惠劵列表 */
    GET_CouponsList() {
      this.loading = true
      const params = {
        page_no: 1,
        page_size: 10
      }
      API_Promotion.getCouponsList(params).then(response => {
        this.newcomerCoupon = response.newcomer_coupon_list
      }).catch(() => { this.loading = false })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.container {
  background-color: #fff;
  padding: 10px;
  position: relative;
}
</style>
