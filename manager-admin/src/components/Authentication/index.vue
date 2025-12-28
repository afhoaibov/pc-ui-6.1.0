<template>
  <el-dialog
    title="二次身份验证"
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="31%"
    center
    @close="closeDialog">
    <span>{{tipsText}}</span>
    <el-input
      v-if="authData.message_auth === 1"
      class="two-step-input"
      placeholder="请输入验证码"
      v-model="smsCode"
      clearable>
      <el-button slot="append" @click="onSendSmsCode()" :disabled="codeBtn" >{{ codeMSg }}</el-button>
    </el-input>

    <el-input
      v-else
      class="two-step-input"
      placeholder="请输入密码"
      v-model="password"
      type="password"
      autocomplete="new-password"
      clearable>
    </el-input>
    <el-button type="text" @click="getFindPasswordRoute()" >忘记密码</el-button>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" v-if="authData.message_auth === 1" @click="onCheckSmsCode()">确 定</el-button>
      <el-button type="primary" v-else @click="onCheckPassword()" >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as API_SystemSetting from '@/api/systemSetting'
import * as API_passport from '@/api/passport'

export default {
  name: 'Authentication',
  props: {
    show: Boolean
  },
  data() {
    return {
      showDialog: false,
      authData: {},
      smsCode: '',
      codeMSg: '发送验证码',
      codeBtn: false,
      timer: null,
      password: ''
    }
  },
  computed: {
    tipsText() {
      if (this.authData.message_auth === 1) {
        return '本操作需要二次身份验证，请点击按钮获取验证码来完成本次操作'
      } else {
        return '本操作需要二次身份验证，请输入二次验证密码来完成本次操作'
      }
    }
  },
  watch: {
    show(v) {
      if (v) {
        this.onTwoStep()
      }
    }
  },
  methods: {
    open() {
      this.onTwoStep()
    },
    getFindPasswordRoute() {
      this.closeDialog()
      this.$router.push({ path: '/setting/find-password' })
    },
    closeDialog() {
      this.password = ''
      this.showDialog = false
      this.$emit('closeDialog')
    },
    /** 发送验证码 */
    onSendSmsCode() {
      API_passport.sendSmsCode().then(res => {
        this.$message({
          showClose: true,
          message: '验证码已发送，请查收',
          type: 'success'
        })
        // 禁用按钮
        this.codeBtn = true
        this.countdown()
      })
    },

    /** 倒计时 */
    countdown() {
      const TIME_COUNT = 60
      if (!this.timer) {
        this.count = TIME_COUNT
        this.timer = setInterval(() => {
          if (this.count > 1 && this.count <= TIME_COUNT) {
            this.count--
            this.codeMSg = this.count + '秒后重新获取'
          } else {
            this.codeBtn = false
            this.codeMSg = '获取验证码'
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
      }
    },

    /** 验证验证码 */
    onCheckSmsCode() {
      const params = {
        scene: 'TWO_STEP',
        sms_code: this.smsCode
      }
      API_passport.checkSmsCode(params).then(res => {
        this.checkSuccess()
        this.codeBtn = false
        this.codeMSg = '获取验证码'
        clearInterval(this.timer)
        this.timer = null
      })
    },
    /** 验证成功 */
    checkSuccess() {
      this.showDialog = false
      this.$emit('handlerVerifySuccess')
    },
    /** 验证密码 */
    onCheckPassword() {
      const params = {
        password: this.password
      }
      API_passport.checkPassword(params).then(res => {
        this.checkSuccess()
      })
    },
    /** 二次验证鉴权 */
    onTwoStep() {
      API_SystemSetting.getAuthenticationsSetting().then(res => {
        this.authData = res
        if (res.message_auth === 1 || res.password_auth === 1) {
          this.showDialog = true
        } else {
          // 没有配置安全验证设置
          this.$message({
            showClose: true,
            message: '请先配置 二次验证配置，即将自动跳转至设置页面',
            type: 'warning',
            onClose: () => {
              this.showDialog = false
              this.$router.push({
                name: 'systemSettingsVerification'
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.two-step-input {
  margin-top: 20px;
}
</style>
