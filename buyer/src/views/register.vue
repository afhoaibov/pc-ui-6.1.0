<template>
  <div id="register" class="register">
    <en-header-other title="欢迎注册">
      <div class="have-account">
        <span>已有账号？</span>
        <router-link :to="'/login' + MixinForward">请登录></router-link>
      </div>
    </en-header-other>
    <div
      v-if="isSuccess"
      class="success-container">
      <div class="w inner">
        <img src="@/assets/images/icon-apply-shop-success.png">
        <span class="tip">恭喜您，注册成功！</span>
      </div>
      <div class="back-index" @click="handlerBack">立即前往</div>
    </div>
    <div class="register-content" v-else>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerForm"
        :status-icon="false"
        label-position="top">
        <span class="label-text">用户名</span>
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" :maxlength="20" placeholder="请输入用户名" :validate-event="validateEvent"
            @input="input"></el-input>
        </el-form-item>
        <span class="label-text" >设置密码</span>
        <el-form-item label="" prop="password" >
          <el-input v-model="registerForm.password" type="password" :maxlength="20" placeholder="密码设置6-20位"
            :validate-event="validateEvent" autocompete="off" @input="input"></el-input>
        </el-form-item>
        <span class="label-text">确认密码</span>
        <el-form-item label="" prop="confirm_password">
          <el-input v-model="registerForm.confirm_password" type="password" :maxlength="20" placeholder="请牢记您的密码"
            :validate-event="validateEvent" autocompete="off" @input="input"></el-input>
        </el-form-item>
        <span class="label-text">手机号码</span>
        <el-form-item label="" :error="requiredMobile" prop="mobile" class="mobile-item">
          <area-select
            ref="AreaSelect"
            v-model="registerForm.mobile"
            :showType="1" />

        </el-form-item>

        <template v-if="validateInFO.validator_type === 'ALIYUN'">
          <div style="margin-bottom: 20px">
            <div id="pc-valid" class="nc-container"></div>
          </div>
          <span class="label-text">短信验证码</span>
          <el-form-item prop="sms_code" class="sms-code" v-if="accountAfsSuccess">
            <el-input v-model="registerForm.sms_code" :maxlength="6" :placeholder="effectiveMinutes"
              :validate-event="validateEvent" @input="input">
              <en-count-down-btn :start="sendValidMobileSms" @end="changeValidCodeUrl" slot="append" />
            </el-input>
          </el-form-item>
        </template>
        <template v-else-if="validateInFO.validator_type === 'TENCENT'">
          <span class="label-text">短信验证码</span>
          <el-form-item prop="sms_code" class="sms-code">
            <el-input v-model="registerForm.sms_code" :maxlength="6" :placeholder="effectiveMinutes"
              :validate-event="validateEvent" @input="input">
              <en-count-down-btn :start="sendValidMobileSms" @end="changeValidCodeUrl" slot="append" />
            </el-input>
          </el-form-item>
        </template>
        <template v-else-if="validateInFO.validator_type === 'IMAGE'">
          <span v-if="showValidCode" class="label-text">图片验证码</span>
          <el-form-item v-if="showValidCode" :error="requiredValCode" prop="vali_code" class="vali-code">
            <el-input v-model="registerForm.vali_code" :maxlength="4" placeholder="请输入图片验证码"
              :validate-event="validateEvent" @input="input">
              <img v-if="valid_code_url" :src="valid_code_url" slot="append" @click="changeValidCodeUrl">
            </el-input>
          </el-form-item>
          <span class="label-text">短信验证码</span>
          <el-form-item prop="sms_code" class="sms-code">
            <el-input v-model="registerForm.sms_code" :maxlength="6" :placeholder="effectiveMinutes"
              :validate-event="validateEvent" @input="input">
              <en-count-down-btn :start="sendValidMobileSms" @end="changeValidCodeUrl" slot="append" />
            </el-input>
          </el-form-item>
        </template>
        <div v-else></div>
        <button type="button" class="register-btn" @click="handleConfirmRegister">立即注册</button>
      </el-form>
    </div>
    <!-- 新人优惠券发放提示 -->
    <new-comer-coupon-receive
      v-if="showCoupon"
      :couponList="registerCouponList"
      @close="showCoupon = false" />
  </div>
</template>

<script>
import { AreaSelect } from '@/components'
import Vue from 'vue'
import { mapActions } from 'vuex'
import * as API_Common from '../api/common'
import * as API_Passport from '../api/passport'
import * as API_Article from '../api/article'
import * as API_Connect from '../api/connect'
import * as API_Promotions from '@/api/promotions'
import * as API_Members from '@/api/members'
import Storage from '../utils/storage'
import AliyunAfs from '../components/AliyunAfs'
import { Button, Form, FormItem, Input } from 'element-ui'
import { RegExp, Foundation } from '~/ui-utils'
import NewComerCouponReceive from '@/components/NewComerCouponReceive'
import { bindRelation } from '@/utils/checkDistribution'

Vue.use(Button).use(Form).use(FormItem).use(Input)

export default {
  name: 'register',
  layout: 'full',
  components: { AreaSelect, NewComerCouponReceive },
  head() {
    return {
      title: `会员注册-${this.site.title}`
    }
  },
  data() {
    return {
      // uuid
      uuid: Storage.getItem('uuid'),
      // 会员注册 表单
      registerForm: {
        scene: 'REGISTER',
        username: '',
        password: '',
        confirm_password: '',
        mobile: '',
        vali_code: '',
        sms_code: ''
      },
      // 会员注册 表单规则
      registerRules: {
        username: [
          this.MixinRequired('请输入账户名！'),
          { min: 4, max: 20, message: '长度在 4 到 20 个字符' },
          {
            validator: (rule, value, callback) => {
              if (!/[^\d]+/.test(value)) {
                callback(new Error('账户名不能为纯数字！'))
              } else {
                callback()
              }
            }
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!RegExp.password.test(value)) {
                callback(new Error('密码应为6-20位数字、英文字母，或者特殊字符！'))
              } else {
                callback()
              }
            }
          }
        ],
        confirm_password: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const { password, confirm_password } = this.registerForm
              if (password !== confirm_password) {
                callback(new Error('两次输入不一致！'))
              } else {
                callback()
              }
            }
          }
        ],
        mobile: [
          {
            validator: (rule, value, callback) => {
              const { mobile_regex, formatValid } = this.$refs.AreaSelect
              if (value && mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                callback(new Error('手机号码格式不正确！'))
              } else {
                callback()
              }
            }
          },
          {
            validator: (rule, value, callback) => {
              const { areaValue_n } = this.$refs.AreaSelect
              if (!value) {
                callback(new Error('请输入手机号码！'))
              } else {
                this.showValidCode = true
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        vali_code: [this.MixinRequired('请输入图片验证码！')],
        sms_code: [this.MixinRequired('请输入短信验证码！')]
      },
      requiredMobile: '',
      requiredValCode: '',
      // 是否显示图片验证码
      showValidCode: false,
      // 图片验证码URL
      valid_code_url: '',
      // 同意注册协议
      agreed: false,
      // 是否为信任登录
      isConnect: false,
      // 初始化校验事件【兼容IE】
      validateEvent: false,
      // 有效分钟数
      effectiveMinutes: '2分钟内有效',
      // 验证信息
      validateInFO: {},
      // 阿里云验证条实例
      afs: null,
      // 当滑动验证成功之后返回的参数
      afsParam: {
        c_sessionid: '',
        sig: '',
        nc_token: ''
      },
      // 阿里云滑动验证是否通过 && 如果不是 阿里云验证则直接设置为 true
      accountAfsSuccess: false,
      protocol: '',
      // 腾讯云滑动验证成功之后返回的参数
      tencentParams: {
        randstr: '',
        ticket: '',
        captcha_app_id: ''
      },
      registerCouponList: [],
      showCoupon: false,
      isSuccess: false
    }
  },
  beforeRouteLeave(x, y, next) {
    this.$layer && this.$layer.closeAll()
    next()
  },
  mounted() {
    this.changeValidCodeUrl()
    this.getProtocol()
    const uuid_connect = Storage.getItem('uuid_connect')
    const isConnect = this.$route.query.form === 'connect' && !!uuid_connect
    this.isConnect = isConnect
    API_Common.getValidator().then(res => {
      this.validateInFO = res
      const { validator_type, aliyun_afs, tencent } = res
      if (validator_type === 'ALIYUN') {
        this.afs = new AliyunAfs('#pc-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
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
    ...mapActions({
      registerByMobile: 'user/registerByMobileAction',
      getUserData: 'user/getUserDataAction'
    }),
    // 阿里云滑动验证 通过后的回调函数
    initCaptcha(data) {
      this.afsParam.c_sessionid = data.csessionid
      this.afsParam.sig = data.sig
      this.afsParam.nc_token = data.nc_token
      this.accountAfsSuccess = true
    },
    /** 发送手机验证码异步方法 */
    sendValidMobileSms() {
      return new Promise((resolve, reject) => {
        const { mobile, vali_code, scene } = this.registerForm

        if (!mobile) {
          this.$message.error('请输入手机号！')
          this.requiredMobile = '手机号不能为空！'
        } else {
          const { areaValue_n } = this.$refs.AreaSelect
          let mobile = this.registerForm.mobile
          if (areaValue_n) {
            mobile = `${areaValue_n},${mobile}`
          }
          if (this.afs) {
            const { c_sessionid, sig, nc_token } = this.afsParam
            API_Passport.sendRegisterSliderSms(mobile, c_sessionid, sig, nc_token).then(response => {
              this.effectiveMinutes = `${response}分钟内有效`
              this.$message.success('短信发送成功，请注意查收！')
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
            if (!vali_code) {
              this.$message.error('请输入图片验证码！')
              this.requiredValCode = '图片验证码不能为空！'
            } else {
              API_Passport.sendRegisterPicSms(mobile, vali_code, scene).then(response => {
                this.effectiveMinutes = `${response}分钟内有效`
                this.$message.success('短信发送成功，请注意查收！')
                resolve()
              }).catch(() => {
                this.changeValidCodeUrl()
                reject()
              })
            }
          }
        }
      })
    },
    /** 获取图片验证码 */
    changeValidCodeUrl() {
      this.valid_code_url = API_Common.getValidateCodeUrl(this.uuid, 'REGISTER')
    },
    /** 输入框输入 */
    input(value) {
      !this.validateEvent && (this.validateEvent = true)
    },
    /** 立即注册 */
    handleConfirmRegister() {
      this.$refs['registerForm'].validate(valide => {
        if (valide) {
          const params = JSON.parse(JSON.stringify(this.registerForm))
          if (this.afs) {
            params.c_sessionid = this.afsParam.c_sessionid
            params.sig = this.afsParam.sig
            params.nc_token = this.afsParam.nc_token
            delete params.scene
            delete params.vali_code
          }
          const { areaValue_n } = this.$refs.AreaSelect
          if (areaValue_n) {
            params.mobile = `${areaValue_n},${params.mobile}`
          }
          this.registerByMobile(params).then(() => {
            if (this.isConnect) {
              API_Connect.registerBindConnect(Storage.getItem('uuid_connect')).then(() => {
                Storage.removeItem('uuid_connect')
                this.registerSuccessCallback()
              })
            } else {
              this.registerSuccessCallback()
            }
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 注册成功回调 */
    registerSuccessCallback() {
      this.getUserData().then((res) => {
        const success = async() => {
          this.$message.success('注册成功！')
          bindRelation()
          // 查询新人优惠券
          const coupon = await API_Promotions.getNewcomerCoupon()
          this.isSuccess = true
          if (coupon.newcomer_is_open && coupon.newcomer_coupon_list.length) {
            this.registerCouponList = coupon.newcomer_coupon_list
            this.showCoupon = true
          }
        }
        success()
      })
    },
    /** 跳转返回 */
    handlerBack() {
      const _forwardMatch = this.MixinForward.match(/\?forward=(.+)/) || []
      let forward = _forwardMatch[1]

      if (!forward || forward.indexOf('/login') > -1) {
        forward = '/'
      }
      setTimeout(() => {
        this.$router.push({ path: forward || '/member' })
      }, 200)
    },
    /** 获取隐私协议 */
    async getProtocol() {
      try {
        this.protocol = await API_Article.getArticleByPosition('REGISTRATION_AGREEMENT')
      } catch (e) {
        this.protocol = { content: '协议获取失败...' }
      }
      this.$layer.open({
        type: 1,
        skin: 'layer-register',
        title: '注册协议',
        area: ['800px', '600px'],
        scrollbar: false,
        btn: ['取消', '同意并继续'],
        btnAlign: 'c',
        id: 'LAY_layuipro',
        yes: () => {
          this.$router.replace('/')
        },
        btn2: () => {
          this.agreed = true
        },
        cancel: () => {
          this.$router.replace('/')
        },
        content: `<div style="padding: 15px">${this.protocol.content}</div>`
      })
    },
    /** 阿里云定义回调函数 */
    callback(res, resolve, reject) {
      const _params = {}
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
        _params.randstr = res.randstr
        _params.ticket = res.ticket

        API_Passport.sendRegisterPSms(this.registerForm.mobile, _params).then(response => {
          this.effectiveMinutes = `${response}分钟内有效`
          this.$message.success('短信发送成功，请注意查收！')
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
@use "sass:color";
@use "../assets/styles/color" as colors;

.success-container {
  .inner {
    display: flex;
    align-items: center;
    width: 850px;
    height: 300px;
  }
  .tip {
    color: #c94136;
    font-size: 36px;
    padding-left: 20px;
    font-family: "微软雅黑";
    line-height: 300px;
    margin-top: 50px;
  }
  .back-index {
    cursor: pointer;
    display: block;
    width: 160px;
    min-height: 30px;
    padding: 15px 30px;
    text-align: center;
    line-height: 30px;
    color: #fff;
    font-size: 28px;
    background-color: #c94136;
    border-radius: 5px;
    margin: 50px auto;
    font-family: 微软雅黑;
  }
}

.have-account {
  font-size: 16px;
  float: right;
  margin-top: 24px;
  color: #999;

  a {
    color: colors.$color-main;
  }
}

.register-content {
  border-top: 2px solid colors.$color-main;
  padding-top: 50px;
  margin-bottom: 50px;
  .label-text {
    margin-bottom: 10px;
    font-size: 14px;
    color: #606266;
    display: inline-block;
  }
}
.mobile-item {
    ::v-deep .el-input__inner {
      padding: 0 10px;
      height: 50px;
      width: 100%;
    }
    ::v-deep .el-input-group__prepend {
      background-color: #fff;
      height: 50px;
      border: none;
      .el-select {
        width: 75px;
      }
    }
}

.register-content ::v-deep .el-form {
  width: 400px;
  margin: 0 auto;

  .el-select {
    width: 100%;
  }

  .el-form-item {
    position: relative;
    margin-bottom: 30px;
    border: 1px solid #ddd;

    &.is-error {
      border-color: #f56c6c
    }

    &.is-error .el-input__inner {
      color: #f56c6c
    }

    &:hover {
      border-color: #999
    }
  }

  .el-input__inner {
    border: none
  }

  .el-form-item__label {
    letter-spacing: 3px;

    &:before {
      content: '' !important
    }
  }

  .vali-code .el-form-item__label,
  .sms-code .el-form-item__label {
    letter-spacing: 1px
  }

  .sms-code .el-input-group__append {
    width: 70px;
    text-align: center;

    .count-down-btn {
      padding: 0;
    }
  }

  .is-error .el-form-item__label {
    color: #f56c6c
  }

  .el-form-item__label,
  .el-form-item__content {
    line-height: 50px;
  }

  .el-form-item__error {
    padding-top: 9px
  }

  .vali-code {
    .el-input-group__append {
      width: 100px;
      padding: 0;
      background-color: transparent;
      border: none;
      position: relative;

      img {
        width: 100%;
        height: 50px;
        cursor: pointer;
        position: absolute;
        top: -6px;
        left: 0;
      }
    }
  }

  .sms-code .el-input-group__append {
    background-color: transparent;
    border: none;
  }

  .register-btn {
    width: 400px;
    height: 52px;
    background-color: colors.$color-main;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    border-radius: 2px;

    &:hover {
      background-color: color.adjust($color: colors.$color-main, $lightness: -10%);
    }
  }
}

.register ::v-deep .count-down-btn {
  line-height: 40px !important;

  ::v-deep .el-input-group--append {
    vertical-align: middle !important;
  }
}
</style>
<style lang="scss">
@use "../assets/styles/color" as colors;

.layer-register {
  .layui-layer-title {
    text-align: center;
    font-size: 16px;
  }

  .layui-layer-content {
    line-height: 30px;
  }

  .layui-layer-btn a {
    min-width: 80px;
    height: 35px;
    line-height: 35px;
  }

  .layui-layer-btn0 {
    background-color: #e3e4e5;
    border-color: #e3e4e5;
    color: #999
  }

  .layui-layer-btn1 {
    background-color: colors.$color-main;
    border-color: colors.$color-main;
    color: #fff;
  }
}
</style>
