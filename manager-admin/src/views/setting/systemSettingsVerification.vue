<template>
  <div class="system-settings-verification">
    <div class="security-container" v-if="showDialog">
      <div class="security-title" v-if="!accountSettingFrom.password_auth && !accountSettingFrom.message_auth">提示：超级管理员未设置验证方式，请联系超级管理员开启</div>
      <el-form :model="securitySettingsForm" :rules="securityRules" ref="securitySettingsForm" label-width="160px">
        <template v-if="accountSettingFrom.password_auth">
          <el-form-item label="开启密码验证：">
            <el-switch v-model="securitySettingsForm.password_auth" @change="passwordVerificationChange"></el-switch>
          </el-form-item>
          <el-form-item label="新密码：">
            <el-input v-model="securitySettingsForm.password" placeholder="请输入新密码" type="password" clearable></el-input>
          </el-form-item>
          <el-form-item label="手机号码：" prop="mobile" v-if="firstSetting">
            <el-input v-model="securitySettingsForm.mobile" placeholder="请输入手机号码" clearable></el-input>
          </el-form-item>
        </template>
        <template v-if="accountSettingFrom.message_auth">
          <el-form-item label="开启短信验证码：">
            <el-switch v-model="securitySettingsForm.message_auth" @change="smsVerificationChange"></el-switch>
          </el-form-item>
          <el-form-item label="手机号码：" prop="mobile">
            <el-input v-model="securitySettingsForm.mobile" placeholder="请输入手机号码" clearable></el-input>
          </el-form-item>
        </template>
        <el-form-item label="">
          <el-button type="primary" @click="submitForm">保存设置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 弹窗组件 -->
    <authentication ref="authRef" @handlerVerifySuccess="showPage"/>
  </div>
</template>

<script>
import * as API_SystemSetting from '@/api/systemSetting'
import { Foundation } from '~/ui-utils'
export default {
  name: 'systemSettingsVerification',
  data() {
    return {
      accountSettingFrom: {
        password_auth: false, // 是否开启密码验证
        message_auth: false // 是否开启短信验证码
      },
      securitySettingsForm: {
        password_auth: false, // 是否开启密码验证
        message_auth: false, // 是否开启短信验证码
        password: '', // 新密码
        mobile: '' // 手机号码
      },
      securityRules: {
        mobile: [
          this.MixinRequired('请输入联系方式！'),
        ],
      },
      firstSetting: false, // 是否为第一次设置
      showDialog: false
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.getAuthSetting()
    })
  },
  mounted() {
    this.getAccountSetting()
    this.getAuthenticationsSetting()
  },
  methods: {
    // 密码验证发生变化时触发
    passwordVerificationChange(val) {
      if (val && this.securitySettingsForm.message_auth) {
        this.securitySettingsForm.message_auth = false
      }
    },
    /** 获取二次鉴权设置 */
    getAuthSetting() {
      if (!this.firstSetting) {
        this.$refs['authRef'].open()
      }
    },
    // 短信验证发生变化时触发
    smsVerificationChange(val) {
      if (val && this.securitySettingsForm.password_auth) {
        this.securitySettingsForm.password_auth = false
      }
    },
    // 保存设置
    submitForm() {
      this.$refs['securitySettingsForm'].validate((valid) => {
        if (valid) {
          let params = this.MixinClone(this.securitySettingsForm)
          if (!params.password_auth && !params.message_auth) {
            return this.$message.error('至少设置一种验证方式')
          } else if (params.message_auth && !params.mobile) {
            return this.$message.error('请输入手机号码')
          }
          params.password_auth ? params.password_auth = 1 : params.password_auth = 0
          params.message_auth ? params.message_auth = 1 : params.message_auth = 0
          API_SystemSetting.editAuthenticationsSetting(params).then((response) => {
            this.password = ''
            this.firstSetting = false
            this.$message.success('保存成功！')
            if (!response) return
            response.password_auth = response.password_auth === 1
            response.message_auth = response.message_auth === 1
            this.securitySettingsForm = response
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    showPage() {
      this.showDialog = true
    },
    /** 获取安全设置 */
    getAccountSetting() {
      API_SystemSetting.getAccountSetting().then(response => {
        this.accountSettingFrom = {
          password_auth: response.password_auth === 1,
          message_auth: response.message_auth === 1
        }
      })
    },
    /** 获取二次验证设置 */
    getAuthenticationsSetting() {
      API_SystemSetting.getAuthenticationsSetting().then(response => {
        if (response) {
          response.password_auth = response.password_auth === 1
          response.message_auth = response.message_auth === 1
          this.securitySettingsForm = response
          this.firstSetting = false
        } else {
          this.firstSetting = true
          this.showDialog = true
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.system-settings-verification ::v-deep .el-input {
  width: 200px;
  margin: 0 5px;
}
.security-container {
  background-color: #FFFFFF;
  padding: 10px;
  .security-title {
    display: flex;
    align-items: center;
    margin: 20px 0;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}
.forget-link {
  text-align: left;
  margin-top: 5px;
  a {
    color: #409EFF; // 链接颜色
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
