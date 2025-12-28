<template>
  <div id="login">
    <en-header-other title="欢迎登录" />
    <!-- 大图 -->
    <div class="login-content">
      <div class="login-banner">
        <div class="bg-banner">
          <div class="banner-img"></div>
          <!-- 登录页 -->
          <div class="login-box">
            <div class="login-form">
              <div class="login-tab">
                <ul>
                  <li @click="!isConnect && (login_type = 'quick')">
                    <a href="javascript:;" class="tab-a"
                      :class="[login_type === 'quick' && 'active', isConnect && 'disabled']">快捷登录</a>
                  </li>
                  <li @click="login_type = 'account'">
                    <a href="javascript:;" :class="[login_type === 'account' && 'active']">账号登录</a>
                  </li>
                </ul>
              </div>
              <div class="login-interface">
                <!-- ========== 快捷登录 =========== -->
                <div v-show="login_type === 'quick'" class="login-show quick-login">
                  <form class="quick-form" @keyup.enter="handleLogin">
                    <div class="item item-form-o mobile-item">
                      <label for="mobile">
                        <i class="iconfont ea-icon-mobile"></i>
                      </label>
                      <Area-select ref="AreaSelect" slot="prepend" />
                      <input id="mobile" v-model="quickForm.mobile" placeholder="请输入手机号" autofocus>
                    </div>
                    <div class="item" v-if="validateInFO.validator_type === 'IMAGE'">
                      <label for="validcode-mobile">
                        <i class="iconfont ea-icon-safe"></i>
                      </label>
                      <input id="validcode-mobile" v-model="quickForm.captcha" placeholder="图片验证码" maxlength="4">
                      <img v-if="val_code_url" class="validcode-img" :src="val_code_url" @click="handleChangeValUrl">
                    </div>
                    <div class="item item-form-t">
                      <en-count-down-btn v-if="validateInFO.validator_type === 'IMAGE'" :start="sendValidMobileSms"
                        :disabled="!accountAfsSuccess" @end="handleChangeValUrl"
                        :class="['send-sms-btn', !accountAfsSuccess && 'is-disabled']" />
                      <en-count-down-btn v-else-if="validateInFO.validator_type === 'TENCENT'" ref="CaptchaId"
                        class="send-sms-btn" :start="sendValidMobileSms" />
                    </div>
                    <div class="item item-form-p">
                      <label for="sms-code">
                        <i class="iconfont ea-icon-sms"></i>
                      </label>
                      <input id="sms-code" v-model="quickForm.sms_code" placeholder="短信验证码" maxlength="6">
                    </div>
                    <div class="forget">
                      <span><router-link :to="'/find-password' + MixinForward">忘记密码</router-link></span>
                    </div>
                    <button class="form-sub" type="button" @click="handleLogin">登&nbsp;&nbsp;&nbsp;录</button>
                  </form>
                </div>
                <!-- ========== 账号登录 =========== -->
                <div v-show="login_type === 'account'" class="login-show account-login">
                  <form class="account-form" @keyup.enter="handleLogin">
                    <div class="item">
                      <label for="username">
                        <i class="iconfont ea-icon-persion"></i>
                      </label>
                      <input id="username" v-model="accountForm.username" placeholder="邮箱/用户名/已验证手机">
                    </div>
                    <div class="item">
                      <label for="password">
                        <i class="iconfont ea-icon-password"></i>
                      </label>
                      <input id="password" v-model="accountForm.password" type="password" placeholder="请输入密码"
                        autocompete="off">
                    </div>
                    <div class="item" style="border: none;" v-if="validateInFO.validator_type === 'ALIYUN'">
                      <div id="pc-valid" class="nc-container" v-if="login_type === 'quick'"></div>
                    </div>
                    <div class="item" v-else-if="validateInFO.validator_type === 'IMAGE'">
                      <label for="validcode">
                        <i class="iconfont ea-icon-safe"></i>
                      </label>
                      <input id="validcode" v-model="accountForm.captcha" placeholder="图片验证码" maxlength="4">
                      <img v-if="val_code_url" class="validcode-img" :src="val_code_url" @click="handleChangeValUrl">
                    </div>
                    <div class="forget">
                      <span><router-link :to="'/find-password' + MixinForward">忘记密码</router-link></span>
                    </div>
                    <button :class="['form-sub', !accountAfsSuccess && 'is-disabled']" type="button"
                      :disabled="!accountAfsSuccess" @click="handleLogin">
                      登&nbsp;&nbsp;&nbsp;录
                    </button>
                  </form>
                </div>
              </div>
              <!-- 第三方登录、立即注册 -->
              <div class="other-login">
                <ul>
                  <li class="other-one"><a :href="getConnectUrl('pc', 'qq')" target="_blank"><span>QQ</span></a></li>
                  <li class="other-one"><a :href="getConnectUrl('pc', 'wechat')" target="_blank"><span>微信</span></a>
                  </li>
                  <li class="other-one"><a :href="getConnectUrl('pc', 'weibo')" target="_blank"><span>微博</span></a></li>
                  <li><a :href="getConnectUrl('pc', 'alipay')" target="_blank"><span>支付宝</span></a></li>
                  <li class="other-right">
                    <router-link :to="'/register' + MixinForward" class="registered">
                      <b></b>立即注册
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AreaSelect } from '@/components'
import { mapActions, mapGetters } from 'vuex'
import Storage from '@/utils/storage'
import jwt_decode from 'jwt-decode'
import * as API_Common from '@/api/common'
import * as API_Passport from '@/api/passport'
import * as API_Connect from '@/api/connect'
import * as API_Article from '@/api/article'
import * as API_Members from '@/api/members'
import AliyunAfs from '@/components/AliyunAfs'
import { Foundation } from '~/ui-utils'
import { bindRelation } from '@/utils/checkDistribution'

export default {
  name: 'login',
  layout: 'full',
  head() {
    return {
      title: `会员登录-${this.site.title}`
    }
  },
  components: { AreaSelect },
  data() {
    return {
      // uuid
      uuid: Storage.getItem('uuid'),
      // 登录类型
      login_type: 'quick',
      // 图片验证码
      val_code_url: '',
      // 快捷登录 表单
      quickForm: {
        scene: 'LOGIN'
      },
      // 普通登录 表单
      accountForm: {
        scene: 'LOGIN'
      },
      // 是否为信任登录
      isConnect: false,
      // 验证信息
      validateInFO: {},
      // 阿里云验证条实例
      afs: null,
      // 阿里云当滑动验证成功之后返回的参数
      afsParam: {
        c_sessionid: '',
        sig: '',
        nc_token: ''
      },
      // 阿里云滑动验证是否通过 && 如果不是 阿里云验证则直接设置为 true
      accountAfsSuccess: false,
      // 腾讯云滑动验证成功之后返回的参数
      tencentParams: {
        randstr: '',
        ticket: '',
        captcha_app_id: ''
      },
      // 是否请求完成
      isRequestFinish: true,
      protocol: ''
    }
  },
  watch: {
    login_type: {
      handler(newValue) {
        this.accountAfsSuccess = false
        this.afs = null
        this.afsParam.c_sessionid = this.afsParam.sig = this.afsParam.nc_token = ''
        const { validator_type, aliyun_afs } = this.validateInFO
        if (validator_type === 'ALIYUN') {
          this.afs = new AliyunAfs('#pc-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
          this.afs.init()
        } else {
          this.accountAfsSuccess = true
        }
      }
    }
  },
  mounted() {
    if (Storage.getItem('user')) return this.$router.replace('/')
    setTimeout(this.handleChangeValUrl)
    const uuid_connect = Storage.getItem('uuid_connect')
    const isConnect = this.$route.query.form === 'connect' && !!uuid_connect
    this.isConnect = isConnect
    if (isConnect) {
      this.login_type = 'account'
    }
    this.getProtocolData()
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
        this.handleChangeValUrl()
      }
    })
  },
  computed: {
    ...mapGetters(['site', 'user'])
  },
  methods: {
    getConnectUrl: API_Connect.getConnectUrl,
    ...mapActions({
      login: 'user/loginAction',
      getCartData: 'cart/getCartDataAction',
      setAccessToken: 'user/setAccessTokenAction',
      removeAccessToken: 'user/removeAccessTokenAction',
      setRefreshToken: 'user/setRefreshTokenAction',
      removeRefreshToken: 'user/removeRefreshTokenAction',
      getUserData: 'user/getUserDataAction'
    }),
    // 隐私政策
    handleArticle() {
      this.$layer.open({
        type: 1,
        title: '隐私政策',
        area: ['800px', '600px'],
        scrollbar: false,
        cancel: () => {
          this.$router.replace('/login')
        },
        content: `<div style="padding: 15px">${this.protocol.content}</div>`
      })
    },
    // 阿里云滑动验证 通过后的回调函数
    initCaptcha(data) {
      this.afsParam.c_sessionid = data.csessionid
      this.afsParam.sig = data.sig
      this.afsParam.nc_token = data.nc_token
      this.accountAfsSuccess = true
    },
    /** 发送短信验证码异步回调 */
    sendValidMobileSms() {
      const params = JSON.parse(JSON.stringify(this.quickForm))
      const { mobile_regex, areaValue_n } = this.$refs.AreaSelect
      return new Promise((resolve, reject) => {
        if (!params.mobile) {
          this.$message.error('请输入手机号码！')
          reject()
        } else if (!Foundation.eval2(mobile_regex).test(areaValue_n + params.mobile)) {
          this.$message.error('手机号码格式有误！')
          reject()
        } else {
          if (areaValue_n) {
            params.mobile = `${areaValue_n},${params.mobile}`
          } else {
            params.mobile = `${params.mobile}`
          }
          if (this.afs) {
            params.c_sessionid = this.afsParam.c_sessionid
            params.sig = this.afsParam.sig
            params.nc_token = this.afsParam.nc_token
            delete params.scene
            API_Passport.sendLoginSms(params.mobile, params).then(() => {
              this.$message.success('短信发送成功，请注意查收！')
              resolve()
            }).catch(() => {
              this.afs.reload()
              this.accountAfsSuccess = false
              reject()
            })
          } else if (this.validateInFO.validator_type === 'TENCENT') {
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
          } else {
            if (!params.captcha) {
              this.$message.error('请输入图片验证码！')
            } else {
              params.uuid = Storage.getItem('uuid')
              API_Passport.sendLoginSms(params.mobile, params).then(() => {
                this.$message.success('短信发送成功，请注意查收！')
                resolve()
              }).catch(() => {
                this.handleChangeValUrl()
                reject()
              })
            }
          }
        }
      })
    },
    /** 改变图片验证码URL */
    handleChangeValUrl() {
      this.isRequestFinish = true
      this.val_code_url = API_Common.getValidateCodeUrl(this.uuid, 'LOGIN')
    },
    /** 登录事件 */
    handleLogin() {
      if (!this.isRequestFinish) return
      if (!this.accountAfsSuccess) return

      const login_type = this.login_type
      const form = login_type === 'quick' ? this.quickForm : this.accountForm
      const { mobile_regex, areaValue_n } = this.$refs.AreaSelect
      if (login_type === 'quick') {
        if (!form.mobile || !Foundation.eval2(mobile_regex).test(areaValue_n + form.mobile) || !form.sms_code) {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      } else {
        // 如果是 阿里云滑动验证
        if (this.afs) {
          if (!form.username || !form.password) {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        } else if (this.validateInFO.validator_type === 'TENCENT') {
          if (!form.username || !form.password) {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        } else {
          if (!form.username || !form.password || !form.captcha) {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        }
      }
      this.isRequestFinish = false
      if (this.isConnect) {
        const uuid = Storage.getItem('uuid_connect')
        if (!uuid) {
          this.$message.error('参数异常，请刷新页面！')
          this.isRequestFinish = true
          return false
        }
        const params = JSON.parse(JSON.stringify(form))
        params.uuid = this.uuid
        // 如果是阿里云验证
        if (this.afs) {
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
        }
        const _forwardMatch = this.MixinForward.match(/\?forward=(.+)/) || []
        let forward = _forwardMatch[1]
        if (!forward || forward.indexOf('/login') > -1) {
          forward = '/'
        }
        API_Connect.loginByConnect(uuid, params).then(async response => {
          if (response.result === 'bind_success') {
            this.setAccessToken(response.access_token)
            this.setRefreshToken(response.refresh_token)
            const expires = new Date(jwt_decode(response.refresh_token).exp * 1000)
            Storage.setItem('uid', response.uid, { expires })
            await this.getUserData()
            Storage.removeItem('uuid_connect')
            this.$router.replace(forward)
          } else {
            this.$alert('当前用户已绑定其它账号！', () => {
              this.removeAccessToken()
              this.removeRefreshToken()
              Storage.removeItem('uuid_connect')
            })
          }
        }).catch(this.handleChangeValUrl)
      } else {
        const params = JSON.parse(JSON.stringify(form))
        if (areaValue_n) {
          params.mobile = `${areaValue_n},${params.mobile}`
        }
        if (this.afs) {
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
          delete params.scene
          delete params.captcha
          this.handlerLogin(params).catch(() => {
            this.afs.reload()
            this.isRequestFinish = true
            this.accountAfsSuccess = false
          })
        } else if (this.validateInFO.validator_type === 'TENCENT') {
          if (login_type === 'quick') {
            params.uuid = Storage.getItem('uuid')
            this.handlerLogin(params).catch(() => {
              this.isRequestFinish = true
            })
          } else {
            this.handleTencent()
          }
        } else {
          params.uuid = Storage.getItem('uuid')
          this.handlerLogin(params).catch(() => {
            this.handleChangeValUrl
            this.isRequestFinish = true
          })
        }
      }
    },
    /** 登录操作 */
    handlerLogin(params) {
      return new Promise((resolve, reject) => {
        const login_type = this.login_type

        this.login({ login_type, form: params }).then(async() => {
          this.loginSuccess()
        }).catch(() => {
          reject()
        })
      })
    },
    /** 成功登录回调 */
    async loginSuccess() {
      const _forwardMatch = this.MixinForward.match(/\?forward=(.+)/) || []
      let forward = _forwardMatch[1]
      if (!forward || forward.indexOf('/login') > -1) {
        forward = '/'
      }
      await this.getCartData()
      bindRelation()
      this.$message.success('登录成功！')
      this.$router.replace(forward)
    },
    /** 获取隐私政策 */
    async getProtocolData() {
      try {
        this.protocol = await API_Article.getArticleDetail('115')
      } catch (e) {
        this.protocol = { content: '隐私政策获取失败...' }
      }
    },
    /** 读取腾讯验证码 */
    handleTencent() {
      try {
        // 生成一个验证码对象
        // CaptchaAppId：登录验证码控制台，从【验证管理】页面进行查看。如果未创建过验证，请先新建验证。注意：不可使用客户端类型为小程序的CaptchaAppId，会导致数据统计错误。
        // callback：定义的回调函数
        // eslint-disable-next-line no-undef
        const captcha = new TencentCaptcha(this.tencentParams.captcha_app_id, this.callback, {})
        // 调用方法，显示验证码
        captcha.show()
      } catch (error) {
        // 加载异常，调用验证码js加载错误处理函数
        this.loadErrorCallback()
      }
    },
    // 定义回调函数
    callback(res, resolve, reject) {
      const login_type = this.login_type
      const form = login_type === 'quick' ? this.quickForm : this.accountForm
      const params = JSON.parse(JSON.stringify(form))
      params.login_type = this.login_type

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
        this.tencentParams.randstr = res.randstr
        this.tencentParams.ticket = res.ticket
        params.randstr = res.randstr
        params.ticket = res.ticket
        // 如果是手机号登录
        if (login_type === 'quick') {
          API_Passport.sendLoginSms(params.mobile, this.tencentParams).then(() => {
            this.$message.success('短信发送成功，请注意查收！')
            resolve()
          }).catch(() => {
            reject()
          })
        } else {
          this.handlerLogin(params).catch(() => {
            this.isRequestFinish = true
          })
        }
      }
    },
    // 定义验证码js加载错误处理函数
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
@use "../assets/styles/color" as theme;

.layui-layer-title {
  text-align: center;
  font-size: 16px;
}

.layui-layer-content {
  line-height: 30px;
}

.login-content .prompt {
  width: 100%;
  text-align: center;
  background: #fff8f0;
  margin: 0 auto;
  padding: 10px 0;

  a {
    color: black
  }
}

.login-content .login-banner {
  background: linear-gradient(145deg,#ff9000,#ff5000 77%);
  width: 100%;
  .bg-banner {
    width: 1200px;
    margin: 0 auto;
    position: relative;
    .banner-img {
      // background: url(../assets/images/background-banner.jpg) no-repeat center center;
      // background-size: cover;
      height: 560px;
    }
  }
}

.login-box {
  float: right;
  position: absolute;
  right: 20px;
  top: 20px;
  width: 346px;
  background: #ffffff;
}

.login-box .login-form .tips-wapper {
  background: #fff8f0;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;

  p {
    font-size: 12px;
    color: #999;
  }
}

.login-box .login-form .login-tab {
  height: 60px;
  border-bottom: 1px solid #f4f4f4;

  ul li {
    float: left;
    width: 50%;
    padding: 20px 0;
    text-align: center;
    font-size: 20px;

    a {
      display: block;
      height: 18px;
      width: 99%;
      color: #666;

      &:hover,
      &.active {
        color: theme.$color-main
      }

      &.disabled {
        cursor: not-allowed;
        color: #ccc
      }
    }

    .tab-a {
      border-right: 1px solid #f4f4f4
    }
  }
}

.login-form .login-interface .account-login {
  display: block
}

.mobile-item {
  ::v-deep .el-input-group__prepend {
    background-color: #fff;
    border: none;
  }

  ::v-deep .el-input__icon {
    line-height: 30px;
  }

  .el-select {
    width: 85px;

    ::v-deep .el-input__inner {
      width: 85px;
      border: none;
      height: 35px;
      line-height: 35px;
      padding-left: 11px;
    }
  }
}
.client-type {
  ::v-deep .el-select {
    width: 235px;
    height: 35px;
    overflow: hidden;
    .el-input__inner {
      border: none;
      height: 35px;
    }
  }
}
.item-form-o {
  display: flex;

  .areaSelect {
    width: 51px;
    z-index: 2;
    margin: 0 3px 0 0;

    ::v-deep .el-input__inner {
      height: 35px !important;
      padding: 0 !important;
      text-align: center;
      border: none !important;
    }

    ::v-deep .el-input__suffix {
      display: flex;
      align-items: center;
      right: -17px !important;
    }
  }
}

.login-form .login-interface .login-show form {
  width: 280px;
  margin: 25px auto;
}

.active {
  color: theme.$color-main
}

.login-interface form .item.focus {
  border-color: #666;

  label {
    border-color: #666;

    .iconfont {
      color: #666
    }
  }
}

.login-interface form .item-form-t {
  height: 30px;
  border: 0 !important;

  button {
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 3px;
  }
}

.login-interface .quick-form .item {
  position: relative;
  width: 100%;
  height: 35px;
  margin-bottom: 10px;
  border: 1px solid #bdbdbd;
}

.login-interface .account-form .item {
  position: relative;
  width: 100%;
  height: 35px;
  margin-bottom: 25px;
  border: 1px solid #bdbdbd;
}

.validcode-img {
  position: absolute;
  top: 0;
  right: 0;
  width: 85px;
  height: 35px;
  cursor: pointer;
}

.login-interface form .item label {
  width: 35px;
  height: 35px;
  float: left;
  display: inline-block;
  border-right: 1px solid #bdbdbd;
}

.login-interface form .item .iconfont {
  display: block;
  width: 35px;
  height: 35px;
  text-align: center;
  line-height: 35px;
  color: #666;
}

.login-interface form .item input {
  display: inline-block;
  height: 35px;
  line-height: 35px;
  width: 225px;
  padding-left: 10px;
}

.login-interface form .forget {
  height: 18px;
  margin: 20px 0;
}

.login-interface form .forget span {
  float: right;
}

.login-interface form .form-sub {
  width: 100%;
  height: 35px;
  background-image: linear-gradient(145deg,#ff9000,#ff5000 77%);
  text-align: center;
  margin: 10px 0;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  transition: background ease-out .2s;
  &.is-disabled {
    cursor: not-allowed;
    background-color: rgba($color: theme.$color-main, $alpha: .6);
    &:hover {
      background-color: rgba($color: theme.$color-main, $alpha: .6);
    }
  }
}
.login-interface form .form-sub:hover {
  background: color.adjust($color: theme.$color-main, $lightness: -10%);
}

.login-box .login-form .other-login {
  height: 50px;
  border-top: 1px solid #f4f4f4;
  padding: 0 20px;
  background-color: #fcfcfc;
}

.login-box .login-form .other-login ul li {
  float: left;
  line-height: 50px;

  a>span {
    padding: 0 10px;
    color: #666666;

    &:hover {
      color: theme.$color-main
    }
  }
}

.login-box .login-form .other-login ul .other-one a>span {
  border-right: 1px solid #bdbdbd;
}

.login-box .login-form .other-login ul .other-right {
  float: right;
}

.other-login ul .other-right a {
  color: theme.$color-main;
  font-size: 15px;
}

.send-sms-btn {
  width: 187px;
  height: 35px;
  border: none;
  color: #ffffff;
  background-color: #607d8b;
  transition: background ease-out .2s;
}

.send-sms-btn:hover {
  background-color: #516a77;
}

.send-sms-btn:disabled {
  background-color: #ccc !important;
  color: #fff !important;
  cursor: not-allowed !important;
}
</style>
