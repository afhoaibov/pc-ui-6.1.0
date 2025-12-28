<template>
  <div class="security-container">
    <el-form :model="securitySettingsForm" ref="securitySettingsForm" label-width="160px">
      <div class="security-title">二次身份验证设置
        <span class="security-hint">请在身份验证设置中修改密码或手机号</span>
      </div>
      <el-form-item label="开启密码验证：">
        <el-switch v-model="securitySettingsForm.password_auth"></el-switch>
      </el-form-item>
      <el-form-item label="开启短信验证码：">
        <el-switch v-model="securitySettingsForm.message_auth"></el-switch>
      </el-form-item>
      <div class="security-title">账户安全设置</div>
      <div class="security-one">1. <el-input class="input-item" v-model="securitySettingsForm.retry_cycle" :maxlength="8"
          type="number" />小时内，密码错误 <el-input class="input-item" v-model="securitySettingsForm.retry_times" :maxlength="8"
          type="number" />次，锁定 <el-input class="input-item" v-model="securitySettingsForm.lock_duration" :maxlength="8" type="number" />分钟
      </div>
      <div class="security-two">2. <el-input class="input-item" v-model="securitySettingsForm.sleep_threshold" :maxlength="8"
          type="number" />天不访问账户自动休眠</div>
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
import { formatIn18Mobile } from '@/utils/index'
export default {
  name: 'systemSettingsSecurity',
  data() {
    return {
      open_i18n: process.env.I18N,
      securitySettingsForm: {
        password_auth: false, // 是否开启密码验证
        message_auth: false, // 是否开启短信验证码
        retry_cycle: 0, // 密码重试累加周期
        retry_times: 0, // 密码重试次数
        lock_duration: 0, // 锁定时长
        sleep_threshold: 0 // 休眠门槛
      }
    }
  },
  mounted() {
    /** 获取安全设置 */
    API_SystemSetting.getAccountSetting().then(response => {
      response.password_auth = response.password_auth === 1
      response.message_auth = response.message_auth === 1

      this.securitySettingsForm = response
      const { mobileValue, areaCode } = formatIn18Mobile(response.mobile)
      this.securitySettingsForm.mobile = mobileValue
      this.areaCode = areaCode
    })
  },
  methods: {
    // 保存设置
    submitForm() {
      this.$refs['securitySettingsForm'].validate((valid) => {
        if (valid) {
          const params = this.MixinClone(this.securitySettingsForm)
          if (!params.password_auth && !params.message_auth) {
            return this.$message.error('至少设置一种验证方式')
          }
          params.password_auth ? params.password_auth = 1 : params.password_auth = 0
          params.message_auth ? params.message_auth = 1 : params.message_auth = 0
          API_SystemSetting.editAccountSetting(params).then(() => {
            this.$message.success('保存成功！')
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
.security-container {
  ::v-deep .input-item {
    width: 100px;
    margin: 0 5px;
  }

  // 处理input type = number的上下箭头
  ::v-deep input::-webkit-outer-spin-button,
  ::v-deep input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::v-deep input[type="number"] {
    -moz-appearance: textfield;
  }
}

.security-container {
  background-color: #FFFFFF;
  padding: 10px;

  .security-title {
    margin-bottom: 20px;
  }
  .security-hint {
    color: #909399;
    font-size: 12px;
    margin-left: 10px;
  }
  .security-one,
  .security-two {
    display: flex;
    align-items: center;
    margin: 20px 50px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

}

.mobileItem {
  ::v-deep .el-input-group__prepend {
    background-color: #fff;
    padding: 0 5px;
  }

  .el-select {
    width: 95px;

    ::v-deep .el-input__inner {
      width: 95px;
    }
  }

  ::v-deep .el-input__suffix {
    right: 22px !important;
  }
}
</style>
