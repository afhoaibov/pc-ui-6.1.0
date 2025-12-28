<template>
  <div class="container">
    <el-tabs type="border-card">
      <el-tab-pane label="站点设置">
        <system-settings-site :message_auth="message_auth" :password_auth="password_auth" />
      </el-tab-pane>
      <el-tab-pane label="商品设置">
        <system-settings-goods :message_auth="message_auth" :password_auth="password_auth" />
      </el-tab-pane>
      <el-tab-pane label="订单设置">
        <system-settings-order :message_auth="message_auth" :password_auth="password_auth" />
      </el-tab-pane>
      <el-tab-pane label="积分设置" class="point-pane">
        <system-settings-point :message_auth="message_auth" :password_auth="password_auth" />
      </el-tab-pane>
      <el-tab-pane label="安全设置" v-if="parseInt(user.role_id) === 0">
        <system-settings-security/>
      </el-tab-pane>
      <el-tab-pane label="新人优惠券设置">
        <setting-coupon-for-new-user />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SystemSettingsSite from './components/SystemSettingsSite'
import SystemSettingsGoods from './components/SystemSettingsGoods'
import SystemSettingsOrder from './components/SystemSettingsOrder'
import SystemSettingsPoint from './components/SystemSettingsPoint'
import SystemSettingsSecurity from './components/SystemSettingsSecurity'
import SettingCouponForNewUser from './components/SettingCouponForNewUser'
import Storage from '@/utils/storage'
import * as API_SystemSetting from '@/api/systemSetting'

export default {
  name: 'systemSettings',
  components: {
    SystemSettingsSite,
    SystemSettingsGoods,
    SystemSettingsOrder,
    SystemSettingsPoint,
    SystemSettingsSecurity,
    SettingCouponForNewUser
  },
  data() {
    return {
      user: JSON.parse(Storage.getItem('admin_user')),
      message_auth: false,
      password_auth: false
    }
  },
  async mounted() {
    API_SystemSetting.getAuthenticationsSetting().then(response => {
      this.message_auth = response.message_auth === 1
      this.password_auth = response.password_auth === 1
    })
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.container {
  background-color: #fff;
  padding: 10px;
  position: relative;
}
.site-tag {
  margin: 0 3px;
}
.site-new-tag-input {
  width: 100px;
}
.container ::v-deep .site-logo .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  &:hover {
    border-color: #409EFF;
  }
}
.logo-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.site-logo-img {
  width: 120px;
  height: 120px;
  display: block;
}

.image-pane .el-input-group {
  width: 200px;
}
.point-pane .el-input-group {
  width: 200px;
}
</style>
