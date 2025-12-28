<template>
  <div id="change-mobile">
    <el-alert v-if="step === 1" type="info" title="" :closable="false">
      <h2>为什么要进行身份验证？</h2>
      <p>1. 为保障您的账户信息安全，在变更账户中的重要信息时需要身份验证，感谢您的理解与支持。 </p>
      <p>2. 验证身份遇到问题？请提供用户名，手机号，历史发票，点击联系我司 在线客服 或者拨打400*****400咨询。</p>
    </el-alert>
    <el-alert v-if="step === 2 || step === 3" type="info" title="" :closable="false">
      <h2>为什么要验证手机？</h2>
      <p>1. 验证手机可加强账户安全，您可以使用已验证手机快速找回密码或支付密码。 </p>
      <p>2. 已验证手机可用于接收账户余额变动提醒。</p>
    </el-alert>
    <template v-if="step !== 3">
      <div v-show="step === 1" class="valid-mobile-container">
        <el-form v-if="user" :model="validMobileForm" :rules="validMobileRules" ref="validMobileForm" label-width="110px">
          <el-form-item label="已验证手机：">
            <h2>{{ user.mobile | secrecyMobile }}</h2>
          </el-form-item>
          <div style="margin: 0 0 22px 110px;width:300px" v-if="validateInFO.validator_type === 'ALIYUN'">
            <div id="slider-valid" class="nc-container"></div>
          </div>
          <el-form-item label="图片验证码：" prop="captcha" class="img-code"
            v-else-if="validateInFO.validator_type === 'IMAGE'">
            <el-input v-model="validMobileForm.captcha" placeholder="请输入图片验证码" clearable :maxlength="4">
              <img slot="append" :src="valid_img_url" @click="getValidImgUrl">
            </el-input>
          </el-form-item>
          <div v-else></div>
          <el-form-item label="短信验证码：" prop="sms_code" class="sms-code" v-if="accountAfsSuccess">
            <el-input v-model="validMobileForm.sms_code" placeholder="请输入短信验证码" clearable :maxlength="6">
              <en-count-down-btn :time="60" :start="sendValidMobileSms" @end="getValidImgUrl" slot="append" />
            </el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button @click.stop="submitValMobileForm" v-if="accountAfsSuccess">提交验证</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-show="step === 2" class="change-mobile-container">
        <el-form :model="changeMobileForm" :rules="changeMobileRules" ref="changeMobileForm" label-width="160px">
          <el-form-item label="请输入手机号：" prop="mobile" class="mobile-item">
            <Area-select
              :showType="1"
              ref="AreaSelect"
              v-model="changeMobileForm.mobile" />
          </el-form-item>
          <div style="margin: 0 0 22px 160px;width:300px" v-if="validateInFO.validator_type === 'ALIYUN'">
            <div id="step-slider-valid" class="nc-container"></div>
          </div>
          <el-form-item label="图片验证码：" prop="captcha" class="img-code"
            v-else-if="validateInFO.validator_type === 'IMAGE'">
            <el-input v-model="changeMobileForm.captcha" placeholder="请输入图片验证码" clearable :maxlength="4">
              <img slot="append" :src="valid_img_url" @click="getValidImgUrl">
            </el-input>
          </el-form-item>
          <div v-else></div>
          <el-form-item label="请输入短信验证码：" prop="sms_code" v-if="accountAfsSuccess">
            <el-input v-model="changeMobileForm.sms_code" placeholder="请输入短信验证码" auto-complete="off">
              <en-count-down-btn :time="60" :start="sendChangeMobileSms" @end="getValidImgUrl" slot="append" />
            </el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button @click.stop="submitChangeForm" v-if="accountAfsSuccess">确认修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>
    <div v-else class="change-success-container">
      <div class="inner-success">
        <img src="../../assets/images/icon-success.png" class="icon-success">
        <div class="success-title">
          <p class="p1">您已成功更换手机号：<span class="success-mobile">{{ changeMobileForm.mobile | secrecyMobile }}</span></p>
          <p class="p2">您可能需要：
            <router-link to="/member/account-safe">返回安全中心</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AreaSelect } from '@/components'
import { mapGetters } from 'vuex'
import * as API_Common from '@/api/common'
import * as API_Safe from '@/api/safe'
import Storage from '@/utils/storage'
import AliyunAfs from '@/components/AliyunAfs'
import { Foundation } from '~/ui-utils'
export default {
  name: 'change-mobile',
  head() {
    return {
      title: `更改手机号-${this.site.title}`
    }
  },
  components: { AreaSelect },
  data() {
    return {
      uuid: Storage.getItem('uuid'),
      /** 步骤 */
      step: 1,
      /** 校验手机号 表单 */
      validMobileForm: {
        scene: 'VALIDATE_MOBILE'
      }, // 图片验证码
      /** 校验手机号 表单规则 */
      validMobileRules: {
        captcha: [{ required: true, message: '请输入图片验证码', trigger: 'blur' }],
        sms_code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
      },
      /** 图片验证码URL */
      valid_img_url: '',
      /** 更换手机 表单 */
      changeMobileForm: {
        scene: 'BIND_MOBILE'
      },
      /** 更换手机 表单规则 */
      changeMobileRules: {
        mobile: [
          this.MixinRequired('请填写手机号！'),
          {
            validator: (rule, value, callback) => {
              const { mobile_regex, formatValid } = this.$refs.AreaSelect
              if (value && mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                callback(new Error('手机号码格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ],
        captcha: [this.MixinRequired('请输入图片验证码！')],
        sms_code: [this.MixinRequired('请输入短信验证码！')]
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
      /**  阿里云滑动验证是否通过 && 如果不是 阿里云验证则直接设置为 true **/
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
    this.$nextTick(this.getValidImgUrl)
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
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    /** 阿里云滑动验证 通过后的回调函数 **/
    initCaptcha(data) {
      this.afsParam.c_sessionid = data.csessionid
      this.afsParam.sig = data.sig
      this.afsParam.nc_token = data.nc_token
      this.accountAfsSuccess = true
    },
    /** 获取图片验证码URL */
    getValidImgUrl() {
      this.valid_img_url = API_Common.getValidateCodeUrl(this.uuid, this.step === 1 ? 'VALIDATE_MOBILE' : 'BIND_MOBILE')
    },
    /** 发送手机验证码 */
    sendValidMobileSms() {
      return new Promise((resolve, reject) => {
        const params = JSON.parse(JSON.stringify(this.validMobileForm))
        if (this.afs) {
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
          delete params.scene
          API_Safe.sendMobileSms(params).then(() => {
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
          params.uuid = this.uuid
          if (!params.captcha) {
            reject()
            this.$message.error('请输入图片验证码！')
          } else {
            API_Safe.sendMobileSms(params).then(() => {
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
    /** 校验更换手机号验证码 */
    submitValMobileForm() {
      this.$refs['validMobileForm'].validate((valid) => {
        if (valid) {
          const { sms_code } = this.validMobileForm
          if (this.afs) {
            API_Safe.validChangeMobileSms(sms_code).then(() => {
              this.step = 2
              this.accountAfsSuccess = false
              API_Common.getValidator().then(res => {
                this.validateInFO = res
                const { validator_type, aliyun_afs } = res
                if (validator_type === 'ALIYUN') {
                  this.afs = new AliyunAfs('#step-slider-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
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
            API_Safe.validChangeMobileSms(sms_code).then(() => {
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
    // 图片滑动验证
    getTencentCaptcha(callBack) {
      try {
        // 生成一个验证码对象
        // CaptchaAppId：登录验证码控制台，从【验证管理】页面进行查看。如果未创建过验证，请先新建验证。注意：不可使用客户端类型为小程序的CaptchaAppId，会导致数据统计错误。
        // callback：定义的回调函数
        // eslint-disable-next-line no-undef
        const captcha = new TencentCaptcha(
          this.tencentParams.captcha_app_id,
          (res) => {
            this.tencentParams.randstr = res.randstr
            this.tencentParams.ticket = res.ticket
            callBack()
          },
          {}
        )
        // 调用方法，显示验证码
        captcha.show()
      } catch (error) {
        // 加载异常，调用验证码js加载错误处理函数
        this.loadErrorCallback()
      }
    },
    /** 修改手机号 发送验证码 */
    sendChangeMobileSms() {
      return new Promise((resolve, reject) => {
        const params = JSON.parse(JSON.stringify(this.changeMobileForm))
        params.mobile = this.$refs.AreaSelect.mobileValue
        if (this.afs) {
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
          delete params.scene
          API_Safe.sendBindMobileSms(params.mobile, params).then(() => {
            this.$message.success('验证码发送成功，请注意查收！')
            resolve()
          }).catch(() => {
            this.afs.reload()
            this.accountAfsSuccess = false
            reject()
          })
        } else {
          const tencentSendBindMobileSms = () => {
            const { tencentParams } = this
            params.uuid = this.uuid
            params.randstr = tencentParams.randstr
            params.ticket = tencentParams.ticket
            API_Safe.sendBindMobileSms(params.mobile, params).then(() => {
              this.$message.success('验证码发送成功，请注意查收！')
              resolve()
            }).catch(() => {
              this.getValidImgUrl()
              reject()
            })
          }
          if (this.validateInFO.validator_type === 'TENCENT') {
            this.getTencentCaptcha(() => {
              tencentSendBindMobileSms()
            })
          } else {
            tencentSendBindMobileSms()
          }
        }
      })
    },
    /** 确认修改 */
    submitChangeForm() {
      this.$refs['changeMobileForm'].validate((valid) => {
        if (valid) {
          const { sms_code } = this.changeMobileForm
          const mobile = this.$refs.AreaSelect.mobileValue

          API_Safe.changeMobile(mobile, sms_code).then(() => {
            this.$message.success('更换成功！')
            this.$store.dispatch('user/getUserDataAction')
            this.step = 3
          }).catch(() => {
            if (this.afs) {
              this.afs.reload()
              this.accountAfsSuccess = false
            } else {
              this.getValidImgUrl()
            }
          })
        } else {
          this.$message.error('请输入手机验证码！')
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
        this.tencentParams.randstr = res.randstr
        this.tencentParams.ticket = res.ticket
        API_Safe.sendMobileSms(params).then(() => {
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
@use "../../assets/styles/color" as theme;

#change-mobile ::v-deep .el-alert {
  h2 {
    margin: 20px 0
  }

  p {
    margin-bottom: 10px
  }
}

.valid-mobile-container,
.change-mobile-container {
  width: 100%;

  .mobile-item {
    ::v-deep .el-input-group__prepend {
      background-color: #fff;
    }

    ::v-deep .el-select {
      width: 70px;

      .el-input__inner {
        width: 70px;
        padding: 0;
      }
    }
  }

  ::v-deep .el-form {
    margin-top: 10px;
    padding-left: 24px
  }

  ::v-deep .el-input {
    width: auto
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
    .el-input__inner {
      width: 190px
    }
  }
}

.change-success-container {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 300px;

  .inner-success {
    display: flex;
    margin-top: 30px;
  }

  .icon-success {
    width: 50px;
    height: 50px;
    margin-right: 15px;
  }

  .success-title {
    .p1 {
      font-size: 16px;
      color: #333;

      span {
        display: inline-block;
        padding: 3px 5px;
        background-color: #1E9DFF;
        color: #fff;
        border-radius: 10px;
      }
    }

    .p2 {
      font-size: 12px;
      color: #666;

      a {
        color: theme.$color-href;

        &:hover {
          color: theme.$color-main
        }
      }
    }
  }
}
</style>
