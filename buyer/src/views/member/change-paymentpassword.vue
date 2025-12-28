<template>
  <div id="change-paymentpassword">
    <div v-show="step === 1" class="valid-mobile-container">
      <el-alert type="info" title="" :closable="false">
        <h2>为什么要进行身份验证？</h2>
        <p>1. 为保障您的账户信息安全，在变更账户中的重要信息时需要身份验证，感谢您的理解与支持。 </p>
        <p>2. 验证身份遇到问题？请提供用户名，手机号，历史发票，点击联系我司 在线客服 或者拨打400*****400咨询。</p>
      </el-alert>
      <el-form :model="validMobileForm" :rules="validMobileRules" ref="validMobileForm" label-width="110px">
        <el-form-item label="已验证手机：">
          <h2>{{ validMobileForm.mobile | secrecyMobile }}</h2>
        </el-form-item>
        <div style="margin: 0 0 22px 110px;width:300px" v-if="validateInFO.validator_type === 'ALIYUN'">
          <div id="slider-valid" class="nc-container"></div>
        </div>
        <el-form-item label="图片验证码：" prop="captcha" class="img-code" v-else-if="validateInFO.validator_type === 'IMAGE'">
          <el-input v-model="validMobileForm.captcha" placeholder="请输入图片验证码" clearable :maxlength="4">
            <img slot="append" :src="valid_img_url" @click="getValidImgUrl">
          </el-input>
        </el-form-item>
        <div v-else></div>
        <el-form-item label="短信验证码：" prop="sms_code" class="sms-code" v-if="accountAfsSuccess">
          <el-input v-model="validMobileForm.sms_code" placeholder="请输入短信验证码" clearable :maxlength="6">
            <en-count-down-btn :time="60" :start="sendValidMobileSms" @end="getValidImgUrl" slot="append"/>
          </el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button @click.stop="handleNextStep" v-if="accountAfsSuccess">提交验证</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-show="step === 2" class="change-password-container">
      <el-alert type="warning" title="" :closable="false">
        <h2>提示</h2>
        <p>1. 支付密码只能为6位数字。 </p>
        <p>2. 请务必牢记您的新密码。</p>
      </el-alert>
      <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordForm" label-width="140px">
        <el-form-item label="请输入密码：" prop="password">
          <el-input v-model="changePasswordForm.password" placeholder="请输入密码" type="password" :maxlength="6"></el-input>
        </el-form-item>
        <el-form-item label="请确认密码：" prop="rep_password">
          <el-input v-model="changePasswordForm.rep_password" placeholder="请确认密码" type="password" :maxlength="6" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button @click.stop="submitChangeForm">确认修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import * as API_Common from '@/api/common'
import * as API_Deposit from '@/api/deposit'
import AliyunAfs from '@/components/AliyunAfs'
import { RegExp } from '~/ui-utils'

export default {
  name: 'change-password',
  head() {
    return {
      title: `修改密码-${this.site.title}`
    }
  },
  data() {
    return {
      /** 步骤 */
      step: 1,
      /** 验证手机 表单 */
      validMobileForm: {
        mobile: '',
        uuid: '',
        scene: 'SET_PAY_PWD'
      },
      /** 验证手机 表单规则 */
      validMobileRules: {
        captcha: [this.MixinRequired('请输入图片验证码！')],
        sms_code: [this.MixinRequired('请输入短信验证码！')]
      },
      /** 图片验证码URL */
      valid_img_url: '',
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
              if (!RegExp.integer.test(value)) {
                callback(new Error('密码应为正整数！'))
              } else if (!/^[A-Za-z0-9!#$%^&*.~,]{6}$/.test(value)) {
                callback(new Error('密码应为6位数字！'))
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
      /** 阿里云验证条实例 **/
      afs: null,
      /** 当滑动验证成功之后返回的参数 **/
      afsParam: {
        c_sessionid: '',
        sig: '',
        nc_token: ''
      },
      /** 阿里云滑动验证是否通过 && 如果不是 阿里云验证则直接设置为 true **/
      accountAfsSuccess: false,
      // 腾讯云滑动验证成功之后返回的参数
      tencentParams: {
        randstr: '',
        ticket: '',
        captcha_app_id: ''
      }
    }
  },
  mounted() {
    this.GET_MemberAccount()
    /** 获取验证方式 **/
    API_Common.getValidator().then(res => {
      this.validateInFO = res
      const { validator_type, aliyun_afs, tencent } = res
      if (validator_type === 'ALIYUN') {
        this.afs = new AliyunAfs('#slider-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
        this.afs.init()
      } else if (validator_type === 'TENCENT') {
        this.tencentParams.captcha_app_id = tencent.captcha_app_id
        this.accountAfsSuccess = true
      } else {
        this.accountAfsSuccess = true
      }
    })
  },
  methods: {
    /**  阿里云滑动验证 通过后的回调函数 **/
    initCaptcha(data) {
      this.afsParam.c_sessionid = data.csessionid
      this.afsParam.sig = data.sig
      this.afsParam.nc_token = data.nc_token
      this.accountAfsSuccess = true
    },
    GET_MemberAccount() {
      API_Deposit.getMemberAccount().then(response => {
        this.validMobileForm.mobile = response.mobile
        this.validMobileForm.uuid = response.uuid
        this.getValidImgUrl()
      })
    },
    /** 获取图片验证码URL */
    getValidImgUrl() {
      this.valid_img_url = API_Common.getValidateCodeUrl(this.validMobileForm.uuid, 'SET_PAY_PWD')
    },
    /** 发送验证手机验证码 */
    sendValidMobileSms() {
      return new Promise((resolve, reject) => {
        const params = JSON.parse(JSON.stringify(this.validMobileForm))
        delete params.mobile
        if (this.afs) {
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
          delete params.scene
          API_Deposit.sendMobileSms(params).then(() => {
            this.$message.success('验证码发送成功，请注意查收！')
            resolve()
          }).catch(() => {
            this.afs.reload()
            this.accountAfsSuccess = false
            reject()
          })
        } else if (this.validateInFO.validator_type === 'TENCENT') {
          // 如果是腾讯图形验证码
          console.log('获取验证码')
          try {
            // 生成一个验证码对象
            // CaptchaAppId：登录验证码控制台，从【验证管理】页面进行查看。如果未创建过验证，请先新建验证。注意：不可使用客户端类型为小程序的CaptchaAppId，会导致数据统计错误。
            // callback：定义的回调函数
            // eslint-disable-next-line no-undef
            const captcha = new TencentCaptcha(
              this.tencentParams.captcha_app_id,
              (res) => this.callback(res, resolve, reject),
              {}
            )
            // 调用方法，显示验证码
            captcha.show()
          } catch (error) {
            // 加载异常，调用验证码js加载错误处理函数
            this.loadErrorCallback()
          }
          return false
        } else {
          if (!params.captcha) {
            reject()
            this.$message.error('请输入图片验证码！')
          } else {
            API_Deposit.sendMobileSms(params).then(() => {
              this.$message.success('验证码发送成功，请注意查收！')
              resolve()
            }).catch(() => {
              this.getValidImgUrl()
              reject()
            })
          }
        }
      })
    },
    /** 下一步 */
    handleNextStep() {
      this.$refs['validMobileForm'].validate((valid) => {
        if (valid) {
          const { sms_code } = this.validMobileForm
          if (this.afs) {
            API_Deposit.validChangePasswordSms(sms_code).then(() => {
              this.step = 2
              this.accountAfsSuccess = false
              API_Common.getValidator().then(res => {
                this.validateInFO = res
                const { validator_type, aliyun_afs } = res
                if (validator_type === 'ALIYUN') {
                  this.afs = new AliyunAfs('#slider-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
                  this.afs.init()
                } else {
                  this.accountAfsSuccess = true
                }
              })
            }).catch(() => {
              this.afs.reload()
              this.accountAfsSuccess = false
            })
          } else {
            API_Deposit.validChangePasswordSms(sms_code).then(() => {
              this.step = 2
              this.getValidImgUrl()
            }).catch(this.getValidImgUrl)
          }
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 修改密码 */
    submitChangeForm() {
      this.$refs['changePasswordForm'].validate((valid) => {
        if (valid) {
          const { uuid, sms_code } = this.validMobileForm
          const { password } = this.changePasswordForm
          const params = {
            uuid,
            sms_code,
            password
          }
          API_Deposit.setPaymentPassword(params, this.$store.getters.user.uname).then(() => {
            this.$message.success('密码设置成功，请牢记您的新密码！')
            setTimeout(() => {
              this.$router.push(`/member/account-safe`)
            }, 200)
          }).catch(this.getValidImgUrl)
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 阿里云定义回调函数 */
    callback(res, resolve, reject) {
      const params = JSON.parse(JSON.stringify(this.validMobileForm))
      // 第一个参数传入回调结果，结果如下：
      // ret         Int       验证结果，0：验证成功。2：用户主动关闭验证码。
      // ticket      String    验证成功的票据，当且仅当 ret = 0 时 ticket 有值。
      // CaptchaAppId       String    验证码应用ID。
      // bizState    Any       自定义透传参数。
      // randstr     String    本次验证的随机串，后续票据校验时需传递该参数。
      console.log('callback:', res)

      // res（用户主动关闭验证码）= {ret: 2, ticket: null}
      // res（验证成功） = {ret: 0, ticket: "String", randstr: "String"}
      // res（请求验证码发生错误，验证码自动返回terror_前缀的容灾票据） = {ret: 0, ticket: "String", randstr: "String",  errorCode: Number, errorMessage: "String"}
      // 此处代码仅为验证结果的展示示例，真实业务接入，建议基于ticket和errorCode情况做不同的业务处理
      if (res.ret === 0) {
        params.randstr = res.randstr
        params.ticket = res.ticket

        API_Deposit.sendMobileSms(params).then(() => {
          this.$message.success('验证码发送成功，请注意查收！')
          resolve()
        }).catch(() => {
          reject()
        })
      }
    },
    /** 定义验证码js加载错误处理函数 */
    loadErrorCallback() {
      const appid = this.tencentParams.captcha_app_id
      // 生成容灾票据或自行做其它处理
      const ticket = 'terror_1001_' + appid + '_' + Math.floor(new Date().getTime() / 1000)
      this.callback({
        ret: 0,
        randstr: '@' + Math.random().toString(36).substr(2),
        ticket: ticket,
        errorCode: 1001,
        errorMessage: 'jsload_error'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.verification-account-container, .valid-mobile-container, .change-password-container {
  width: 100%;
  ::v-deep .el-alert {
    h2 {
      margin: 20px 0
    }
    p {
      margin-bottom: 10px
    }
  }
  ::v-deep .el-form {
    margin-top: 10px;
    padding-left: 24px
  }
  ::v-deep .el-input__inner {
    width: 190px
  }
  ::v-deep .img-code {
    .el-input {
      width: auto
    }
    .el-input-group__append {
      padding: 0;
      cursor: pointer;
      img {
        height: 38px
      }
    }
  }
  ::v-deep .sms-code {
    .el-input {
      width: auto
    }
  }
}
</style>
