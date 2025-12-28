<template>
  <div id="shortcut">
    <div class="w">
      <div :class="['login-status', user ? 'logined' : '']">
        <span>[<router-link to="/">首页</router-link>]</span>
        <ul class="links" v-if="user">
          <li class="dorpdown">
            <div class="dt hs-icon" style="display: flex; align-items: center">
              [<router-link to="/member">我的账户</router-link><i class="iconfont ea-icon-arrow-down"></i>]
            </div>
            <div class="dd dorpdown-layer">
              <dl>
                <dd>
                  <router-link to="/member">会员中心</router-link>
                </dd>
                <dd>
                  <router-link to="/member/my-order">我的订单</router-link>
                </dd>
                <dd>
                  <router-link to="/member/goods-collection">我的收藏</router-link>
                </dd>
              </dl>
            </div>
          </li>
        </ul>
        <template v-if="user">
          <span>[<a href="javascript:" @click="handleLogout">退出</a>]</span>
        </template>
        <span v-else>[<router-link :to="'/login' + MixinForward">登录</router-link>][<router-link :to="'/register' + MixinForward">注册</router-link>]</span>
      </div>
      <ul class="links">
        <li>
          <div class="dt">
            <a v-if="user.have_shop" :href="MixinDomain.seller" target="_blank">我的店铺</a>
            <router-link v-else to="/shop/apply/">商家入驻</router-link>
          </div>
        </li>
        <li class="spacer"></li>
        <li class="dorpdown">
          <div class="dt hs-icon">
            <router-link to="#">站点导航</router-link>
            <i class="iconfont ea-icon-arrow-down"></i>
          </div>
          <div class="dd dorpdown-layer">
            <dl>
              <dd><router-link to="/">商城首页</router-link></dd>
              <dd>
                <a v-if="user.have_shop" :href="MixinDomain.seller" target="_blank">我的店铺</a>
                <router-link v-else to="/shop/apply/">商家入驻</router-link>
              </dd>
              <dd>
                <router-link to="/member">个人中心</router-link>
              </dd>
            </dl>
          </div>
        </li>
        <li class="spacer"></li>
        <li class="dorpdown">
          <div class="dt">
            <router-link to="/help">帮助中心</router-link>
          </div>
        </li>
        <li class="spacer"></li>
        <li class="dorpdown">
          <div v-if="im" class="dt hs-icon">
            <router-link to="">
              服务消息[{{ messageTotal > 99 ? '99+' : messageTotal }}]
            </router-link>
            <i class="iconfont ea-icon-arrow-down"></i>
          </div>
          <div v-else class="dt">
            <router-link to="/member/message-index">
              站内消息[{{ unreadMessageNum > 99 ? '99+' : unreadMessageNum }}]
            </router-link>
          </div>
          <div v-if="im" class="dd dorpdown-layer">
            <dl>
              <dd>
                <router-link to="/chat" target="_blank">
                  客服消息({{serviceMessageNum > 99 ? '99+' : serviceMessageNum}})
                </router-link>
              </dd>
              <dd>
                <router-link to="/member/message-index">
                  站内消息({{ unreadMessageNum > 99 ? '99+' : unreadMessageNum }})
                </router-link>
              </dd>
            </dl>
          </div>
        </li>
        <template v-if="open_i18n">
          <li class="spacer"></li>
          <li v-if="locale" class="dorpdown">
            <div class="dt hs-icon">
              <a href="#">{{ locale.lang }}</a>
              <i class="iconfont ea-icon-arrow-down"></i>
            </div>
            <div class="dd dorpdown-layer">
              <dl>
                <dd v-for="item in locales" :key="item.id">
                  <a href="#" @click.prevent.stop="switchLocale(item.code)">{{ item.lang }}</a>
                </dd>
              </dl>
            </div>
          </li>
          <li class="spacer"></li>
          <li v-if="Array.isArray(currencies)" class="dorpdown">
            <div class="dt hs-icon">
              <a href="#">
                {{ `${current_currency.currency_code}-${current_currency.symbol}-${current_currency.currency_name}` }}
              </a>
              <i class="iconfont ea-icon-arrow-down"></i>
            </div>
            <div class="dd dorpdown-layer">
              <dl>
                <dd v-for="item in currencies" :key="item.id">
                  <a href="#" @click.prevent.stop="switchCurrency(item)">
                    {{ `${item.currency_code}-${item.symbol}-${item.currency_name}` }}
                  </a>
                </dd>
              </dl>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import Storage from '@/utils/storage'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EnShortcut',
  head() {
    return {
      meta: [
        { hid: 'keywords', name: 'keywords', content: this.site.keywords },
        { hid: 'description', name: 'description', content: this.site.descript }
      ]
    }
  },
  data() {
    return {
      message_total: 0,
      message_timer: null,
      im: process.env.IM,
      open_i18n: process.env.I18N
    }
  },
  computed: {
    ...mapGetters(['user', 'site', 'unreadMessageNum', 'locale', 'serviceMessageNum', 'currencies', 'current_currency']),
    locales() {
      return this.$store.getters.locales.filter(item => item.code !== this.locale.code)
    },

    messageTotal() {
      const total = Number(this.unreadMessageNum) + Number(this.serviceMessageNum)
      return total
    }
  },
  mounted() {
    // 如果是首页，并且有uuid，那么替换掉cookie中的uuid，并且移除url中的uuid
    const { name, query } = this.$route
    if (name === 'index' && query.uuid) {
      Storage.setItem('uuid', query.uuid)
      Storage.removeItem('uuid_connect')
      this.$router.replace('/')
      return
    }
    // 如果有刷新Token，重新获取用户信息【第一次访问和用户刷新页面，会触发】
    if (Storage.getItem('refresh_token')) {
      this.getUserData()
    } else {
      this.$store.dispatch('user/removeUserAction')
    }
    this.GET_UnreadMessage()
    if (this.MixinI18n) {
      this.getCurrency()
    }
  },
  methods: {
    ...mapActions({
      logout: 'user/logoutAction',
      getUserData: 'user/getUserDataAction',
      cleanCartStore: 'cart/cleanCartStoreAction',
      getUnreadMessageNum: 'getUnreadMessageNumAction',
      getServiceMessageNum: 'getServiceMessageNum',
      getCurrency: 'getCurrency',
      setCurrentCurrency: 'setCurrentCurrency'
    }),
    /** 账户登出 */
    handleLogout() {
      this.logout().then(() => {
        this.cleanCartStore()
        document.location.reload()
      })
    },
    /** 获取未读消息 */
    async GET_UnreadMessage() {
      if (!Storage.getItem('refresh_token')) return
      try {
        clearTimeout(this.message_timer)
        await this.getUnreadMessageNum()
        await this.getServiceMessageNum()
      } finally {
        // 消息轮询，5分钟查一次
        this.message_timer = setTimeout(this.GET_UnreadMessage, 1000 * 60 * 5)
      }
    },
    /**
     * 切换语言
     * @param locale
     */
    switchLocale(locale) {
      Storage.setItem('buyerLanguage', locale)
      window.location.reload()
    },
    switchCurrency(currency) {
      this.setCurrentCurrency(currency)
      // window.location.reload()
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
@use "../assets/styles/color" as theme;
.login-type {
  margin-left: 10px;
  position: relative;
  .hs-icon {
    display: flex;
    align-items: center;
  }
  &:hover {
    .type-list {
      display: block;
    }
    .iconfont {
      transform: rotate(180deg);
    }
  }
  .iconfont {
    color: theme.$color-main;
  }
  .type-name {
    color: theme.$color-main;
    cursor: pointer;
    margin-left: 5px;
  }
  .type-list {
    position: absolute;
    top: 30px;
    left: 30px;
    width: 80px;
    display: none;
    background-color: #FFFFFF;
    padding: 10px;
    z-index: 999;
    border: 1px solid #e7e7e7;
    cursor: pointer;
    .type-list-item:hover {
      color: theme.$color-main;
    }
  }
}
#shortcut {
  border-bottom: 1px solid #ddd;
  background-color: #e3e4e5;
  .w {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    line-height: 30px;
  }
  .login-status {
    display: flex;
    align-items: center;
    a {
      color: #666
    }
  }
  .logined a {
    color: #333
  }
  a:hover {
    color: theme.$color-main
  }
}
.links {
  z-index: 100;
  a {
    color: #999;
    display: block;
  }
  li {
    position: relative;
    float: left;
    &.spacer {
      overflow: hidden;
      margin: 11px 5px 0;
      width: 1px;
      height: 10px;
      background-color: #ccc;
    }
    &.dorpdown:hover {
      .dorpdown-layer {
        display: block;
      }
      .dt {
        z-index: 3;
      }
      .iconfont {
        transform: rotate(180deg);
      }
    }
    .dt {
      padding-left: 7px;
      padding-right: 7px;
      &.hs-icon {
        height: 28px;
        line-height: 28px;
        overflow: hidden;
        position: relative;
        z-index: 1;
        float: left;
        padding-right: 20px;
      }
      .iconfont {
        position: absolute;
        right: 5px;
        top: 10px;
        width: 12px;
        height: 12px;
        line-height: 12px;
        font-size: 12px;
        transition: all .3s ease-out;
      }
    }
    .dorpdown-layer {
      background-color: #FFF;
      display: none;
      width: auto;
      border: solid 1px #F0F0F0;
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      padding-top: 30px;
      dd {
        cursor: pointer;
        &:hover {
          background-color: #f5f6f5;
        }
      }
      a {
        line-height: 24px;
        padding-left: 7px;
      }
    }
  }
}
</style>
