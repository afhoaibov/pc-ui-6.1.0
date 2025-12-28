<template>
  <div id="index-card" class="index-card">
    <div class="card-inner">
      <div class="card-user">
        <div class="inner-card-user">
          <div class="card-user-avatar">
            <router-link to="/member" v-if="user.face && user.face !== 'null'">
              <en-face :url="user.face"/>
            </router-link>
            <router-link to="/member" v-else>
              <img src="../../assets/images/icon-noface.jpg">
            </router-link>
          </div>
          <div v-if="user" class="card-user-show logined">
            <p>Hi,<router-link to="/member"> {{ user.nickname || user.uname }}</router-link></p>
            <p class="btns">
              <router-link to="/member" class="to-member">进入个人中心</router-link>
            </p>
          </div>
          <div v-else class="card-user-show">
            <p>Hi,<router-link to="/">&ensp;欢迎来到{{ site.site_name }} ！</router-link></p>
            <p class="btns">
              <router-link :to="'/login' + MixinForward" class="please-login">请登录</router-link>
              <router-link :to="'/register' + MixinForward" class="to-register">去注册</router-link>
            </p>
          </div>
        </div>
      </div>
      <div class="card-news">
        <div class="card-news-tab">
          <a href="#" @mouseenter="card_news_tab_x = 0">商城公告</a>
          <a href="#" @mouseenter="card_news_tab_x = 70">商城促销</a>
          <div class="card-news-tab-active" :style="{transform: 'translateX('+ card_news_tab_x +'px)'}"></div>
          <!--<a href="#" class="card-news-more">更多</a>-->
        </div>
        <div class="card-news-content">
          <div class="card-news-con-item" v-show="card_news_tab_x === 0">
            <ul style="overflow: hidden">
              <template v-for="(notice, index) in mall_notices">
                <li v-if="index < 4" :key="index" class="news-item">
                  <a href="javascript:" @click="handleShowNotice(notice)">{{ notice.article_name }}</a>
                </li>
              </template>
            </ul>
          </div>
          <div class="card-news-con-item" v-show="card_news_tab_x === 70">
            <ul>
              <li
                v-for="(prom, index) in mall_promotions"
                :key="index"
                class="news-item"
              >
                <a href="javascript:" @click="handleShowNotice(prom)">{{ prom.article_name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card-service">
        <router-link to="/member/my-points" class="service-item">
          <i class="iconfont ea-icon-point"></i>
          <span>我的积分</span>
        </router-link>
        <router-link to="/member/my-comments" class="service-item">
          <i class="iconfont ea-icon-score"></i>
          <span>我的评价</span>
        </router-link>
        <router-link to="/member/my-order" class="service-item">
          <i class="iconfont ea-icon-order"></i>
          <span>我的订单</span>
        </router-link>
        <router-link to="/member/goods-collection" class="service-item">
          <i class="iconfont ea-icon-star"></i>
          <span>我的收藏</span>
        </router-link>
        <router-link to="/member/account-safe" class="service-item">
          <i class="iconfont ea-icon-security"></i>
          <span>账号安全</span>
        </router-link>
        <a v-if="user.have_shop" :href="MixinDomain.seller" class="service-item">
          <i class="iconfont ea-icon-shop"></i>
          <span>我的店铺</span>
        </a>
        <router-link v-else to="/shop/apply" class="service-item">
          <i class="iconfont ea-icon-shop"></i>
          <span>商家入驻</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as API_Article from '@/api/article'
import EnFace from '@/components/Face'

export default {
  name: 'index-card',
  components: { EnFace },
  data() {
    return {
      card_news_tab_x: 0,
      mall_notices: [],
      mall_promotions: []
    }
  },
  computed: {
    ...mapGetters({ user: 'user/user', site: 'site' })
  },
  mounted() {
    API_Article.getArticlesByCategory('NOTICE').then(response => {
      this.mall_notices = response
    })
    API_Article.getArticlesByCategory('PROMOTION').then(response => {
      this.mall_promotions = response
    })
  },
  methods: {
    /** 显示商城公告 */
    handleShowNotice(notice) {
      this.$layer.open({
        type: 1,
        skin: 'layer-skin-common',
        title: notice.article_name,
        area: ['500px', '350px'],
        scrollbar: false,
        shadeClose: true,
        btn: ['确定'],
        btnAlign: 'c',
        content: `<div style="padding: 15px">${notice.content}</div>`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
.index-card {
  position: relative;
  width: 1210px;
  margin: 0 auto;
  height: 0;
}
.card-inner {
  position: absolute;
  top: 25px;
  right: 0;
  width: 190px;
  min-height: 450px;
  background-color: #fff;
  z-index: 2;
  .card-user {
    height: 140px;
    text-align: center;
    background-color: #fff;
    .inner-card-user {
      position: relative;
      padding-top: 62px;
      height: 78px;
    }
    .card-user-avatar {
      position: absolute;
      left: 50%;
      top: -10px;
      margin-left: -34px;
      width: 65px;
      height: 65px;
      a {
        display: block;
        width: 55px;
        height: 55px;
        border: 5px solid #e3e1df;
        -moz-border-radius: 50%;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 3px 6px 25px #c3c3c3;
        background: #fff;
      }
      img {
        display: block;
        width: 55px;
        height: 55px;
      }
    }
    .card-user-show {
      padding: 0 10px;
      a {
        color: #666;
        &:hover {
          color: theme.$color-main;
        }
      }
      .btns {
        display: flex;
        justify-content: space-around;
        margin-top: 10px;
        a {
          display: block;
          float: left;
          line-height: 22px;
          width: 68px;
          height: 22px;
          border: 1px solid #333;
          text-align: center;
        }
        .please-login {
          border-color: theme.$color-main;
          color: theme.$color-main;
        }
      }
      &.logined .to-member {
        width: 60%;
        color: theme.$color-main;
        border-color: theme.$color-main;
        transition: all .2s ease;
        &:hover {
          background-color: theme.$color-main;
          color: #fff;
          border-color: theme.$color-main;
        }
      }
    }
  }
  .card-news {
    overflow: hidden;
    height: 130px;
    background: #fff;
    .card-news-tab {
      padding: 8px 0 0;
      position: relative;
      line-height: 13px;
      font-size: 0;
      a {
        font-size: 12px;
        color: #333;
        padding: 0 10px;
        border-right: 1px solid #dfe0e1;
        &:last-child {
          border-right: none;
        }
      }
    }
    .card-news-tab-active {
      position: absolute;
      bottom: -1px;
      left: 0;
      margin-left: 11px;
      width: 45px;
      height: 2px;
      background: theme.$color-main;
      transform: translateX(0);
      transition: transform .3s ease;
    }
    .card-news-content {
      position: relative;
      padding-top: 8px;
      margin: 0 15px;
      height: 88px;
    }
    .card-news-con-item {
      height: 100%;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .news-item {
      line-height: 22px;
      max-width: 160px;
      _width: 160px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      color: #999;
      a {
        color: #666;
        &:hover {
          color: theme.$color-main;
        }
      }
    }
    .card-news-more {
      position: absolute;
      right: 5px;
      top: 8px;
      font-size: 12px;
      &:hover {
        color: theme.$color-main;
      }
    }
  }
  .card-service {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    overflow: hidden;
    position: relative;
    min-height: 160px;
    transition: all .2s ease;
    padding: 10px;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      display: block;
      width: 160px;
      left: 15px;
      height: 1px;
      background: #ebeaea;
      z-index: 1;
    }
    .service-item {
      display: block;
      color: #666;
      width: 33.3333%;
      flex-shrink: 0;
      text-align: center;
      &:hover { color: theme.$color-main }
      .iconfont {
        display: block;
        font-size: 30px;
        line-height: 30px;
        margin: 5px auto;
        text-align: center;
      }
    }
  }
}
</style>
