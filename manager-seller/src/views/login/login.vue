<template>
  <div class="login-container">
    <div class="login-bg" id="login-bg">
      <img class="login-bg-img" src="../../assets/bg-1.png">
      <img class="login-bg-img2" src="../../assets/bg-2.png">
      <img class="login-bg-img3" src="../../assets/bg-3.png">
      <!-- <img class="login-bg-img4" src="../../assets/background4.png">
      <img class="login-bg-img5" src="../../assets/background5.png">
      <img class="login-bg-img6" src="../../assets/background6.png">
      <img class="login-bg-img7" src="../../assets/background7.png"> -->
    </div>
    <div class="login-form">
      <div class="lf-content">
        <h3 class="lf-title">商家中心</h3>
        <div class="lf-form" @keyup.enter="submitLoginForm">
          <el-form :model="loginForm" :rules="loginRules" ref="loginForm" size="large">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" clearable placeholder="请输入账号">
                <svg-icon slot="prefix" class="el-input__icon" icon-class="user"/>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" autocompete="off" clearable placeholder="请输入密码" maxlength="20">
                <svg-icon slot="prefix" class="el-input__icon" icon-class="password"/>
              </el-input>
            </el-form-item>
            <el-form-item prop="captcha" v-if="validateInFO.validator_type === 'ALIYUN'">
              <div id="pc-valid" class="nc-container"></div>
            </el-form-item>
            <el-form-item prop="captcha" class="img-code" v-else-if="validateInFO.validator_type === 'IMAGE'">
              <div class="yanzhengma">
                <el-input v-model="loginForm.captcha" placeholder="请输入验证码" :maxlength="4" clearable>
                </el-input>
                <img class="login-validcode-img" :src="validcodeImg" @click="changeValidcode">
              </div>
            </el-form-item>
            <div v-else></div>
            <el-form-item>
              <el-button :loading="loading" :disabled="!accountAfsSuccess" @click="submitLoginForm" class="login-btn">登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import uuidv1 from 'uuid/v1'
  import Storage from '@/utils/storage'
  import * as API_Common from '@/api/common'
  import AliyunAfs from '@/components/AliyunAfs'

  export default {
    name: 'login',
    data() {
      return {
        // 登录loading状态
        loading: false,
        // 登录表单 表单
        loginForm: {
          username: '',
          password: '',
          scene: 'LOGIN',
          captcha: ''
        },
        // 登陆表单 规则
        loginRules: {
          username: [this.MixinRequired('请输入用户名/邮箱/手机号')],
          password: [this.MixinRequired('请输入密码！')],
          captcha: [this.MixinRequired('请输入图片验证码！')]
        },
        // 轮播配置
        swiperOption: {
          loop: true,
          effect: 'fade',
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          },
          autoplay: {
            delay: 3000,
            stopOnLastSlide: false,
            disableOnInteraction: false
          },
          simulateTouch: false
        },
        // 图片验证码
        validcodeImg: '',
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
        accountAfsSuccess: false
      }
    },
    mounted() {
      const uuid = Storage.getItem('seller_uuid')
      if (uuid) {
        this.uuid = uuid
      } else {
        const _uuid = uuidv1()
        this.uuid = _uuid
        Storage.setItem('seller_uuid', _uuid, { expires: 30 })
      }
      this.changeValidcode()
      API_Common.getValidator().then(res => {
        this.validateInFO = res
        const { validator_type, aliyun_afs } = res
        if (validator_type === 'ALIYUN') {
          this.afs = new AliyunAfs('#pc-valid', aliyun_afs.scene, aliyun_afs.app_key, this.initCaptcha)
          this.afs.init()
        } else {
          this.accountAfsSuccess = true
        }
      })
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    methods: {
      // 阿里云滑动验证 通过后的回调函数
      initCaptcha(data) {
        this.afsParam.c_sessionid = data.csessionid
        this.afsParam.sig = data.sig
        this.afsParam.nc_token = data.nc_token
        this.accountAfsSuccess = true
      },
      /** 更换图片验证码 */
      changeValidcode() {
        this.validcodeImg = API_Common.getValidateCodeUrl('LOGIN', this.uuid)
      },
      /** 提交登录表单 */
      submitLoginForm() {
        if (!this.accountAfsSuccess) return
        Storage.removeItem('seller_shop')
        if (this.afs) {
          const params = this.MixinClone(this.loginForm)
          params.c_sessionid = this.afsParam.c_sessionid
          params.sig = this.afsParam.sig
          params.nc_token = this.afsParam.nc_token
          delete params.captcha
          delete params.scene
          this.loading = true
          this.$store.dispatch('loginAction', params).then(() => {
            this.loading = false
            const forward = this.$route.query.forward
            this.$router.push({ path: forward || '/' })
          }).catch(() => {
            this.loading = false
            this.afs.reload()
            this.accountAfsSuccess = false
          })
        } else {
          this.$refs['loginForm'].validate((valid) => {
            if (valid) {
              const params = this.MixinClone(this.loginForm)
              params.uuid = this.uuid
              this.loading = true
              this.$store.dispatch('loginAction', params).then(() => {
                this.loading = false
                const forward = this.$route.query.forward
                this.$router.push({ path: forward || '/' })
              }).catch(() => {
                this.loading = false
                this.changeValidcode()
              })
            } else {
              this.$message.error('表单填写有误，请核对！')
            }
          })
        }
      }
    }
  }
</script>

<style lang="scss" type="text/scss" scoped >
  .login-container ::v-deep .nc-container .nc_scale span{
    height: 34px;
  }

  .login-bg {
    // height: 100%;
    // width: 100%;
    .login-bg-img {
      height: 70%;
      // width: 100%;
      position: absolute;
      right: 0;
      top: 10%;
    }
    .login-bg-img2 {
      // height: 35%;
	    transform: rotate(-100deg);
      position: absolute;
      bottom: -500px;
      right: -500px;
      // z-index: 1001;
    }
    .login-bg-img3 {
	    transform: rotate(-140deg);
      position: absolute;
      top: -500px;
      left: -500px;
      z-index: 101;
    }
    // .login-bg-img4 {
    //   height: 100%;
    //   width: 58.6%;
    //   position: absolute;
    //   bottom: 0;
    //   right: 0;
    //   z-index: 1;
    // }
    // .login-bg-img5 {
    //   width: 73%;
    //   position: absolute;
    //   top: 11.5%;
    //   right: 13%;
    //   z-index: 1001;
    // }
    // .login-bg-img6 {
    //   height: 56.8%;
    //   position: absolute;
    //   top: 23.2%;
    //   right: 15.7%;
    //   z-index: 10001;
    // }
    // .login-bg-img7 {
    //   width: 2.5%;
    //   position: absolute;
    //   top: 11.5%;
    //   left: 20%;
    //   z-index: 100001;
    // }
  }

  .login-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #fff;
    position: relative;
  }

  .login-form {
    position: absolute;
    width: 620px;
    left: 29%;
    top: 53%;
    margin-top: -240px;
    margin-left: -230px;
    z-index: 1000;
    .lf-content {
      filter: progid:DXImageTransform.Microsoft.gradient(enabled='true',startColorstr='#E5FFFFFF', endColorstr='#E5FFFFFF');
    }
    .lf-title {
      display: block;
      text-align: center;
      font-size: 40px;
      font-weight: 500;
      letter-spacing: 8px;
      color: #4E5F82;
    }
    .lf-title-sb {
      display: block;
      height: 30px;
      text-align: center;
      font-size: 13px;
      font-weight: normal;
      line-height: 30px;
      color: #999;
    }
    .lf-form {
      padding: 0 140px 30px;
      overflow: hidden;

      .svg-icon {
        width: 1.5em;
        height: 1.5em;
        margin-top: 10px;
        margin-left: 10px;
      }
      ::v-deep .el-input__inner {
        line-height: 45px;
        height: 45px;
        font-size: 15px;
        padding-left: 45px;
      }
      ::v-deep .img-code {
        .el-input-group__append {
          padding: 0;
          margin: 0;
          img {
            display: block;
            height: 38px;
            cursor: pointer;
          }
        }
      }
      .login-btn {
        width: calc(100%);
        background: #FF9E3A;
        border-radius: 6px;
        border: 1px solid #FF9E3A;
        color: #A75A0C;
        line-height: 20px;
        font-size: 20px;
      }
    }
    .yanzhengma {
      display: flex;
      ::v-deep .el-input__inner {
        padding-left: 15px;
      }
    }
    .login-validcode-img {
      width: 90px;
      height: 45px;
      display: block;
      cursor: pointer;
      border-radius: 6px;
      margin-left: 10px;
      background: #CBECFF;
    }
  }
</style>
