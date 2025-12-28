<template>
  <div>
    <el-form :model="couponSettingForm" :rules="SettingFormRules" ref="couponSettingForm" label-width="180px" v-loading="loading" style="width: 500px">
      <el-form-item label="是否开启新人优惠券功能" prop="new_comer_coupon">
        <el-radio v-model="couponSettingForm.new_comer_coupon" :label="1">开启</el-radio>
        <el-radio v-model="couponSettingForm.new_comer_coupon" :label="0">关闭</el-radio>
      </el-form-item>
      <el-form-item label="设置优惠券有效期" prop="effective_day">
        <el-select v-model="couponSettingForm.effective_day" placeholder="请选择" clearable>
          <el-option
            v-for="item of dayOptions"
            :key="item"
            :label="item"
            :value="item"/>
        </el-select>
      </el-form-item>

      <el-form-item label="">
        <el-button type="primary" @click="$refs['authRef'].open()">保存设置</el-button>
      </el-form-item>
    </el-form>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="submitForm"/>
  </div>
</template>

<script>
import * as API_SystemSetting from '@/api/systemSetting'

export default {
  name: 'SettingCouponForNewUser',
  components: {

  },
  data() {
    return {
      loading: false,
      couponSettingForm: {},
      SettingFormRules: {
        new_comer_coupon: [this.MixinRequired('请选择是否开启新人优惠券！')],
        effective_day: [this.MixinRequired('请设置优惠券有效期！')]
      }
    }
  },
  computed: {
    dayOptions() {
      return Array.from({ length: 30 }, (v, i) => i + 1)
    }
  },
  created() {
    this.getNewComerCouponSetting()
  },

  methods: {
    /** 获取新用户优惠券设置 */
    getNewComerCouponSetting() {
      API_SystemSetting.getNewComerCouponSetting().then(res => {
        this.couponSettingForm = res
      })
    },

    submitForm() {
      this.$refs['couponSettingForm'].validate((valid) => {
        if (valid) {
          const params = this.MixinClone(this.couponSettingForm)
          API_SystemSetting.editNewComerCouponSetting(params).then(() => {
            this.$message.success('修改成功！')
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
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
