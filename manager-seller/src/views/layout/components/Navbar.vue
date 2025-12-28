<template>
  <el-menu class="navbar" mode="horizontal">
    <div class="navbar-left">
      <!-- <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger> -->
      <!-- <breadcrumb class="breadcrumb-container"></breadcrumb> -->
      <tags-view></tags-view>
    </div>

    <div class="right-menu">
      <el-tooltip v-if="MixinIsIM && permission_chat && !MixinIsSupplier()" effect="dark" content="客服系统">
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
          <!-- <img class="user-avatar" v-if="user.face" :src="user.face"> -->
          <!-- <img class="user-avatar" v-else src="../../../assets/icon-noface.jpg"> -->
          <div class="user-name">{{user.username[0]}}{{user.username[1]}}</div>
          <!-- <span class="user-name">{{user.username}}</span> -->
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <span @click="logout">
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </span>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-menu>
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
    return {
      open_i18n: process.env.I18N
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'user',
      'permission_chat'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    logout() {
      this.$confirm('确定退出吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logoutAction').then(() => {
          window.location.reload()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
  @use "../../../styles/variables" as vars;
  .el-dropdown-menu--small .el-dropdown-menu__item {
    width: 90px;
  }
  .navbar {
    width: 100%;
    height: 60px;
    border-radius: 0 !important;
    background-color: vars.$nav_bg !important;
    border-color: vars.$nav_bg !important;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    &::before {
      display: none !important;
    }
    &::after {
      display: none !important;
    }
    .navbar-left {
      float: left;
      display: flex;
      height: 60px;
      align-items: center;
      width: 80%;
    }
    .hamburger-container {
      padding: 0 10px;
    }
    .breadcrumb-container{
      float: left;
      ::v-deep {
        .el-breadcrumb__separator,
        .el-breadcrumb__item .el-breadcrumb__inner a {
          color: vars.$nav_text !important;
        }
        .el-breadcrumb__item .el-breadcrumb__inner .no-redirect {
          color: vars.$nav_text_active !important;
        }
      }
    }
    .right-menu {
      display: flex;
      align-items: center;
      float: right;
      height: 60px;
      ::v-deep svg {
        fill: vars.$nav_text_active !important;
      }
      &:focus{
        outline: none;
      }
      .right-menu-item {
        display: inline-block;
        margin-left: 15px;
        // margin: 0 15px;
      }
      .avatar-container {
        height: 60px;
        .avatar-wrapper {
          height: 100%;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          color: #fff;
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 100%;
          }
          .user-name {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #FF715F;
            font-size: 20px;
            line-height: 40px;
            text-align: center;
            color: #fff;
          }
          ::v-deep .el-icon-caret-bottom {
            color: vars.$nav_text_active !important;
          }
        }
      }
    }
  }
</style>
