<template>
  <div v-if="goods" id="goods">
    <div v-if="!goods.goods_off" class="goods-auth w">
      <div class="img-box">
        <img src="../../assets/images/background-goods-off.jpg" alt="商品已下架">
        <div>
          <p class="title">该商品已下架</p>
          <p class="tips">其它商品也同样精彩哦！</p>
        </div>
      </div>
      <div class="goods-auth-btns">
        <router-link to="/">去首页</router-link>
        <a href="javascript:" @click="handleCloseWindow">关闭窗口</a>
      </div>
    </div>
    <template v-else>
      <bread-nav
        :goods="goods"
        :canView="canView"
        :shopBaseInfo="shopBaseInfo" />
      <div class="content">
        <div class="inner-content">
          <!--商品相册-->
          <goods-zoom
            ref="goodsZoom"
            :images="goods.gallery_list"
            :goods-video="goods.goods_video"/>
          <!--商品信息【包括规格、优惠券、促销等】-->
          <goods-info  :goods="goods" @spec-img-change="handleShowSpecImg"/>
        </div>
      </div>
      <div class="details">
        <div class="inner w">
          <!--店铺标签商品推荐-->
          <goods-tags
            :shop-id="goods.seller_id"
            :goods-id="goods.goods_id"
            :shopBaseInfo="shopBaseInfo"/>
          <div class="detail-container">
            <div class="detail-tabs">
              <div
                v-for="tab in tabs"
                :key="tab.title"
                :class="['item-tab', tab.active && 'active']"
                @click="handleClickTabItem(tab)"
              >{{ tab.title }}</div>
            </div>
            <div class="detail-content">
              <div
                v-show="curTab === '商品详情'"
                class="intro-detail"
                v-html="goods.intro"
                v-lazy-container="{ selector: 'img' }"
              ></div>
              <!--商品参数-->
              <goods-params v-show="curTab === '规格参数'" :goods-params="goods.param_list"/>
              <!--商品评论-->
              <goods-comments v-show="curTab === '商品评论'" :goods-id="goods.goods_id" :grade="goods.grade"/>
              <!--商品咨询-->
              <goods-consulting v-show="curTab === '商品咨询'" :goods-id="goods.goods_id"/>
              <!--销售记录-->
              <sales-record v-show="curTab === '销售记录'" :goods-id="goods.goods_id"/>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import * as API_Common from '@/api/common'
import * as API_Goods from '@/api/goods'
import * as API_Shop from '@/api/shop'
import * as GoodsComponents from './components'
import Storage from '@/utils/storage'
import { Pagination } from 'element-ui'
import Viewer from 'v-viewer'
import QrcodeVue from 'qrcode.vue'
import VueClipboard from 'vue-clipboard2'
import 'viewerjs/dist/viewer.css'
import { bindRelation } from '@/utils/checkDistribution'

Vue.use(Pagination).use(Viewer).use(VueClipboard)

export default {
  name: 'goods-detail',
  head() {
    const { goods, site } = this
    if (!goods) return {}
    return {
      title: `${goods.goods_name || goods.page_title || '商品详情'}-${site.title}`,
      meta: [
        { hid: 'keywords', name: 'keywords', content: goods.meta_keywords },
        { hid: 'description', name: 'description', content: `${goods.meta_description}-${site.title}` },
        { 'http-equiv': 'mobile-agent', content: `format=xhtml; url=/goods/${goods.goods_id}` },
        { 'http-equiv': 'mobile-agent', content: `format=html5; url=/goods/${goods.goods_id}` }
      ]
    }
  },
  components: {
    ...GoodsComponents,
    QrcodeVue
  },
  data() {
    return {
      goods: '',
      /** 规格图片 */
      specImage: '',
      tabs: ['商品详情', '规格参数', '商品评论', '商品咨询', '销售记录'].map((item, index) => ({ title: item, active: index === 0 })),
      curTab: '商品详情',
      // 商品是否可查看
      canView: true,
      // 店铺基本信息
      shopBaseInfo: {}
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(val) {
        if (val.name === 'goodsDetail') {
          this.init()
        }
      }
    }
  },
  methods: {
    async init() {
      await this.getGoodsDetail()
      // 如果商品可以查看
      if (this.canView) {
        // 记录浏览量统计【用于统计】
        API_Common.recordViews(window.location.href)
        // 如果页面是被分享的
        if (this.$route.query.su) {
          Storage.setItem('buyer_su', this.$route.query.su)
          if (Storage.getItem('refresh_token')) {
            bindRelation()
          }
        }
      }
      this.getShopBaseInfo()
    },
    getShopBaseInfo() {
      if (!this.goods.seller_id) return
      API_Shop.getShopBaseInfo(this.goods.seller_id).then(response => {
        this.shopBaseInfo = response
      })
    },
    handleShowSpecImg(url) {
      this.$refs['goodsZoom'].changeZoom(url)
    },

    /** 商品详情tab点击事件 */
    handleClickTabItem(tab) {
      this.curTab = tab.title
      this.tabs.map(item => {
        item.active = tab === item
        return item
      })
    },
    /** 关闭当前窗口 */
    handleCloseWindow() {
      window.close()
    },
    /** 获取商品详情 */
    async getGoodsDetail() {
      const { id } = this.$route.params
      let goods = {}
      try {
        goods = await API_Goods.getGoods(id)
        if (goods.intro) {
          goods.intro = goods.intro.replace(/img src=/g, 'img data-src=').replace(/width="auto"/g, 'width="100%"')
        }
        this.goods = goods
        this.canView = goods.is_auth !== 0 && goods.goods_off === 1
      } catch (e) {
        this.$router.push({
          name: '500',
          params: { statusCode: 500, message: '商品已不存在' + e }
        })
      }
    }
  },
  destroyed() {
    // 当组件销毁时，移除百度分享创建的标签
    const removeIds = ['BdShareScript', 'bdshare_weixin_qrcode_dialog_bg', 'bdshare_weixin_qrcode_dialog']
    const removeClass = ['bdshare_dialog_box', 'bdshare_dialog_bg', 'bdshare_popup_box']
    removeIds.forEach(id => {
      // eslint-disable-next-line no-undef
      const ele = $('#' + id)
      ele.length && ele.remove()
    })
    removeClass.forEach(cl => {
      // eslint-disable-next-line no-undef
      const ele = $('.' + cl)
      ele.length && ele.remove()
    })
    window._bd_share_main = undefined
  }
}
</script>

<style lang="scss" scoped>
@use "sass:math";
@use "sass:color";
@use "../../assets/styles/color" as theme;
.content {
  width: 1210px;
  min-height: 470px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 2px 5px #ccc;
  padding: 40px 40px 0 40px;
  box-sizing: border-box;
  .inner-content {
    display: flex;
    justify-content: space-between;
  }
}
.details {
  margin: 50px 0;
  .inner {
    display: flex;
    justify-content: space-between;
  }
  $dc_width: 1210px - 200px - 30px;
  .detail-container {
    width: $dc_width;
    min-height: 100px;
  }
  .detail-tabs {
    display: flex;
    width: 100%;
    height: 36px;
    .item-tab {
      width: math.div($dc_width - 4px, 5);
      height: 36px;
      background-color: #333;
      border-right: 1px solid #fff;
      line-height: 36px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      transition: all .2s ease;
      &:hover, &.active {
        background-color: theme.$color-main
      }
      &:nth-child(5) {
        border-right: 0
      }
    }
  }
  .detail-content {
    padding-top: 10px;
    overflow: hidden;
  }
  .intro-detail {
    width: 80%;
    margin: 0 auto;
    /*text-align: center;*/
    ::v-deep img[lazy=loading] {
      display: block;
      width: 100%;
      height: 450px;
    }
    ::v-deep img {
      max-width: 100%;
      height: auto !important;
    }
    ::v-deep ul {
      padding: initial !important;
    }
    ::v-deep ol {
      padding-inline-start: 16px !important;
    }
    ::v-deep ol li {
      list-style: decimal;
    }
    ::v-deep ul li {
      list-style: inside;
    }
  }
}
#goods ::v-deep .el-pagination {
  margin-top: 20px;
  text-align: right;
}
.goods-auth {
  text-align: center;
  padding: 50px 0;
  .img-box {
    display: flex;
    justify-content: center;
    align-items: center;
    .title {
      color: #666;
      font-size: 26px;
      line-height: 2;
      margin-bottom: 10px;
      text-align: left;
    }
    .tips {
      color: theme.$color-main;
      font-size: 22px;
      line-height: 1;
    }
  }
  .goods-auth-btns {
    margin-top: 20px;
  }
  a {
    display: inline-block;
    min-width: 100px;
    height: 20px;
    background-color: theme.$color-main;
    color: #fff;
    padding: 10px 20px;
    margin-right: 20px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    transition: background-color ease .2s;
    &:hover {
      background-color: color.adjust($color: theme.$color-main, $lightness: 15%);
    }
  }
}
</style>
