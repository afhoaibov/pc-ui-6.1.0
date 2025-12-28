<template>
  <div class="navbar-wrap">
    <el-menu class="navbar" :class="[isFloor && 'tabs-box']" mode="horizontal">
      <div class="navbar-left">
        <!-- <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger> -->
        <!-- <breadcrumb class="breadcrumb-container"></breadcrumb> -->
        <tags-view></tags-view>
      </div>

      <div class="right-menu">
        <el-tooltip v-if="MixinIsIM && permission_chat" effect="dark" content="客服系统">
          <chat-entry class="right-menu-item" />
        </el-tooltip>
        <!-- <el-tooltip effect="dark" content="全屏" placement="bottom">
          <screenfull class="screenfull right-menu-item"></screenfull>
        </el-tooltip> -->

        <lang-select v-if="open_i18n" class="international right-menu-item"></lang-select>

        <!--<el-tooltip effect="dark" content="换肤" placement="bottom">-->
        <!--<theme-picker class="theme-switch right-menu-item"></theme-picker>-->
        <!--</el-tooltip>-->

        <el-dropdown class="avatar-container right-menu-item" trigger="click">
          <div class="avatar-wrapper">
            <!-- <img class="user-avatar" :src="user.face"> -->
            <div class="user-name">{{user.username[0]}}{{user.username[1]}}</div>
            <i class="el-icon-caret-bottom"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <router-link to="/">
              <el-dropdown-item>
                首页
              </el-dropdown-item>
            </router-link>
            <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}`" :target="isO2O ? '' : '_blank'">
              <el-dropdown-item>
                浏览网站
              </el-dropdown-item>
            </a>
            <span @click="changePassword">
            <el-dropdown-item>修改密码</el-dropdown-item>
          </span>
            <span @click="logout">
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </span>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-menu>
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="form" :rules="formRules" ref="form" label-width="100px">
        <el-form-item label="原密码" prop="old_passwprd">
          <el-input v-model="form.old_passwprd" placeholder="不修改则不填"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" autocompete="off" v-model="form.password" placeholder="不修改则不填"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="rep_password">
          <el-input type="password" autocompete="off" v-model="form.rep_password" placeholder="不修改则不填"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import Screenfull from '@/components/Screenfull'
  import LangSelect from '@/components/LangSelect'
  import ThemePicker from '@/components/ThemePicker'
  import ChatEntry from '@/components/ChatEntry'
  import TagsView from './TagsView'
  import { RegExp } from '~/ui-utils'
  import * as API_Auth from '@/api/auth'

  export default {
    components: {
      Breadcrumb,
      Hamburger,
      Screenfull,
      LangSelect,
      ThemePicker,
      ChatEntry,
      TagsView
    },
    data() {
      const user = this.MixinClone(this.$store.getters.user)
      return {
        dialogVisible: false,
        form: {
          old_passwprd: '',
          password: '',
          rep_password: ''
        },
        formRules: {
          old_passwprd: [{ required: false, message: '请输入原密码！', trigger: 'blur' }],
          password: [
            { required: false, message: '请输入新密码！', trigger: 'blur' },
            { validator: (rule, value, callback) => {
              if (value && !RegExp.password.test(value)) {
                callback(new Error('密码应为6-20位英文或数字！'))
              } else {
                callback()
              }
            } }
          ],
          rep_password: [
            { required: false, message: '请确认您的新密码！', trigger: 'blur' },
            { validator: (rule, value, callback) => {
              if (value && this.form.password !== value) {
                callback(new Error('两次输入不一致！'))
              } else {
                callback()
              }
            } }
          ]
        },
        isFloor: false,
        open_i18n: process.env.I18N
      }
    },
    computed: {
      ...mapGetters(['sidebar', 'user', 'permission_chat'])
    },
    watch: {
      form: {
        handler: function(newVal) {
          const { old_passwprd, password, rep_password } = newVal
          const required = !!(old_passwprd || password || rep_password)
          this.formRules.old_passwprd[0].required = required
          this.formRules.password[0].required = required
          this.formRules.rep_password[0].required = required
        },
        deep: true
      },
      dialogVisible: function(newVal) {
        if (!newVal) {
          this.fileList = []
        }
      },
      $route() {
        if (this.$route.path === '/page/pc-decoration/floor') {
          this.isFloor = true
        } else {
          this.isFloor = false
        }
      }
    },
    methods: {
      /** 提交修改密码表单 */
      submitForm() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            const params = this.MixinClone(this.form)
            if (!params.old_passwprd) {
              delete params.old_passwprd
              delete params.password
              delete params.rep_password
            }
            API_Auth.editUserInfo(params).then(() => {
              this.dialogVisible = false
              this.$store.dispatch('fedLogoutAction')
              location.reload()
            })
          } else {
            this.$message.error('表单填写有误，请核对！')
          }
        })
      },
      toggleSideBar() {
        this.$store.dispatch('toggleSideBar')
      },
      changePassword() {
        this.dialogVisible = true
      },
      logout() {
        this.$confirm('确定退出吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('logoutAction').then(() => {
            const route = this.$router.resolve('/login')
            location.replace(route.href)// 为了重新实例化vue-router对象 避免bug
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @use "../../../styles/variables" as vars;
  .el-dropdown-menu--small .el-dropdown-menu__item {
    min-width: 90px;
  }
  .navbar-wrap {
    // height: 60px;
    position: relative;
    width: calc(100% + 8px);
    left: -8px;
    background-color: vars.$nav_bg !important;
    z-index: 10;
  }
  .navbar {
    height: 60px;
    border-radius: 0 !important;
    border-bottom: 1px solid #e9edf0;

    &.tabs-box {
      min-width: 1260px;
    }
    .navbar-left {
      float: left;
      display: flex;
      height: 100%;
      align-items: center;
      width: 80%;
    }
    .hamburger-container {
      padding: 0 10px;
    }
    .breadcrumb-container {
      float: left;
      ::v-deep .el-breadcrumb__separator,
      ::v-deep .el-breadcrumb__item .el-breadcrumb__inner a {
        color: vars.$nav_text !important;
      }
      ::v-deep .el-breadcrumb__item .el-breadcrumb__inner .no-redirect {
        color: vars.$nav_text_active !important;
      }
    }
    .right-menu {
      display: flex;
      align-items: center;
      float: right;
      height: 100%;
      ::v-deep svg {
        fill: vars.$nav_text_active !important;
      }
      &:focus{
        outline: none;
      }
      .right-menu-item {
        display: inline-block;
        margin: 0 15px;
      }
      .avatar-container {
        height: 50px;
        margin-right: 30px;
        .avatar-wrapper {
          cursor: pointer;
          margin-top: 5px;
          position: relative;
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 100%;
          }
          .user-name {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #409EFF;
            font-size: 22px;
            line-height: 36px;
            text-align: center;
            color: #fff;
          }
          .el-icon-caret-bottom {
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
          ::v-deep .el-icon-caret-bottom {
            color: vars.$nav_text_active !important;
          }
        }
      }
    }
  }
</style>
