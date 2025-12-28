<template>
  <div id="find-password" class="container">
    <div class="find-container">
      <h1>重置密码<span>请您填写下面的表单来修改密码</span></h1>
      <div class="find-content">
        <div v-show="step === 1" class="find-item RegExp">
          <el-form :model="validMobileForm" :rules="validMobileRules" ref="validMobileForm" label-width="120px" style="width: 370px">
            <el-form-item label="手机号码：">
              <span>{{ validMobileForm.mobile | formatMobile }}</span>
            </el-form-item>
            <el-form-item label="短信验证码：" prop="sms_code">
              <el-input v-model="validMobileForm.sms_code" :maxlength="6">
                <en-count-down-btn :time="60" :start="sendValidMobileSms" @end="getValidImgUrl" slot="append"/>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="next-btn" @click="handleNextStep">
                下一步
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-show="step === 2" class="find-item RegExp">
          <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordForm" label-width="140px">
            <el-form-item label="请输入密码：" prop="password">
              <el-input v-model="changePasswordForm.password" placeholder="请输入密码" type="password" style="width: 220px"/>
            </el-form-item>
            <el-form-item label="请确认密码：" prop="rep_password">
              <el-input v-model="changePasswordForm.rep_password" placeholder="请确认密码" type="password" auto-complete="off" style="width: 220px"/>
            </el-form-item>
            <el-form-item>
              <el-button @click.stop="submitChangeForm">确认修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as API_SystemSetting from '@/api/systemSetting'
import * as API_Common from '@/api/common'
import Storage from '@/utils/storage'
import { RegExp } from '~/ui-utils'
import EnCountDownBtn from '@/components/CountDownBtn'

export default {
  name: 'find-password',
  layout: 'full',
  components: { EnCountDownBtn },
  data() {
    return {
      // uuid
      uuid: Storage.getItem('uuid'),
      // 步骤
      step: 1,
      /** 校验账户信息 表单 */
      validAccountForm: {
        scene: 'FIND_PASSWORD'
      },
      accountError: '',
      /** 校验手机 表单 */
      validMobileForm: {
        mobile: ''
      },
      /** 校验手机 表单规则 */
      validMobileRules: {
        sms_code: [this.MixinRequired('请输入短信验证码！')]
      },
      /** 修改密码 表单 */
      changePasswordForm: {
        password: '',
        rep_password: ''
      },
      /** 修改密码 表单规则 */
      changePasswordRules: {
        password: [
          this.MixinRequired('请输入新的登录密码！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.password.test(value)) {
                callback(new Error('密码应为6-20位英文或数字！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        rep_password: [
          this.MixinRequired('请再次输入密码！'),
          {
            validator: (rule, value, callback) => {
              if (value !== this.changePasswordForm.password) {
                callback(new Error('两次输入的密码不相同'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      /** 验证信息 **/
      validateInFO: {},
      backPath: ''
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.backPath = from.fullPath
    })
  },
  mounted() {
    this.getAuthenticationsSetting()
  },
  methods: {
    /** 发送手机验证码异步方法 */
    sendValidMobileSms() {
      return new Promise((resolve, reject) => {
        const params = this.validMobileForm.mobile
        API_SystemSetting.smsCode(params).then(() => {
          this.$message.success('发送成功，请注意查收！')
          resolve()
        }).catch(() => {
          this.getValidImgUrl()
          reject()
        })
      })
    },
    getValidImgUrl() {
      const uuid = this.step === 1 ? this.uuid : this.validMobileForm.uuid
      this.valid_img_url = API_Common.getValidateCodeUrl(uuid, 'FIND_PASSWORD')
    },
    /** 下一步 */
    handleNextStep() {
      this.$refs['validMobileForm'].validate((valid) => {
        if (!valid) return this.$message.error('表单填写有误，请检查！')
        const params = JSON.parse(JSON.stringify(this.validMobileForm))
        API_SystemSetting.validCode(params).then(() => {
          this.step = 2
        })
      })
    },
    /** 获取二次验证设置 */
    getAuthenticationsSetting() {
      API_SystemSetting.getAuthenticationsSetting().then(response => {
        this.validMobileForm.mobile = response.mobile
      })
    },
    /** 确认修改 */
    submitChangeForm() {
      this.$refs['changePasswordForm'].validate((valid) => {
        if (!valid) return this.$message.error('表单填写有误，请检查！')
        const params = JSON.parse(JSON.stringify(this.changePasswordForm))
        API_SystemSetting.updatePassword(params).then(() => {
          this.$message.success('密码重置成功，请牢记您的新密码！')
          setTimeout(() => {
            if (this.backPath) {
              this.$router.push(this.backPath)
            } else {
              this.$router.push('/')
            }
          }, 200)
        }).catch(() => {
          this.getValidImgUrl()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.container {
  background: #f5f5f5;
  overflow: hidden;
  padding: 30px 0;
  .find-container {
    width: 794px;
    padding: 0 30px;
    background: #fff;
    h1 {
      font-size: 30px;
      font-weight: 600;
      color: #333;
      line-height: 1.5;
      font-family: arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "微軟正黑體", "儷黑 Pro", sans-serif;
      span {
        color: #757575;
        font-size: 12px;
        line-height: 1.5;
        margin-left: 10px;
        font-weight: normal;
      }
    }
  }
  .find-title {
    margin: 30px 0 0;
    overflow: hidden;
    width: 794px;
    ul {
      font-size: 16px;
      line-height: 1.25;
      list-style-type: none;
      margin: 0;
      width: 800px;
      overflow: hidden;
      li {
        color: #757575;
        cursor: pointer;
        float: left;
        font-size: 16px;
        line-height: 1.25;
        list-style-type: none;
        border-left: 1px solid #e0e0e0;
        width: 397px;
        text-align: center;
      }
    }
  }
  .find-content {
    border-top: 1px solid #e0e0e0;
    margin-top: 20px;
    padding: 25px 0;
    position: relative;
    width: 794px;
  }
  .find-item.RegExp {
    ::v-deep .vali-img .el-input-group__append {
      padding: 0
    }
    img {
      height: 38px;
      cursor: pointer
    }
    .next-btn {
      width: 250px
    }
  }
}
</style>
