<template>
  <div>
    <div class="shop-header">
      <div class="w">
        <div class="shop-name">{{ shop.shop_name }}</div>
        <div class="shop-more">
          <div class="item" :class="[is_collection && 'active']" @click="collectionShop">
            <i class="iconfont ea-icon-star"></i>
            <p>{{ is_collection ? '已收藏' : '收藏' }}</p>
          </div>
          <a href='javascript:;' @click="MixinOpenIm(shop)" class="item">
            <i class="iconfont ea-icon-service"></i>
            <p>客服</p>
          </a>
          <router-link :to="'./goods-list?shop_id=' + shop.shop_id" class="item">
            <i class="iconfont ea-icon-more"></i>
            <p>更多</p>
          </router-link>
        </div>
      </div>
    </div>
    <div class="shop-nav">
      <div class="w">
        <div class="item category">
          <router-link :to="'/shop/goods-list?shop_id=' + shop_id">
            <h1>全部分组</h1>
          </router-link>
          <div class="category-box">
            <div class="inner-category-box">
              <div v-for="cate in categories" :key="cate['shop_cat_id']" class="category-item">
                <router-link :to="'/shop/goods-list?shop_id=' + shop_id + '&shop_cat_id=' + cate['shop_cat_id']">
                  {{ cate['shop_cat_name'] }}
                </router-link>
                <div class="category-item-box">
                  <template v-for="cc in cate['children']">
                    <div
                      v-if="cate['children'] && cate['children'].length"
                      :key="cc['shop_cat_id']"
                      class="category-item-cc"
                    >
                      <router-link :to="'/shop/goods-list?shop_id=' + shop_id + '&shop_cat_id=' + cc['shop_cat_id']">
                        {{ cc['shop_cat_name'] }}
                      </router-link>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <router-link :to="'/shop/' + shop_id" class="item">店铺首页</router-link>
        <span>|</span>
        <router-link :to="'/shop/' + shop_id + '#shop-intro'" class="item">店铺简介</router-link>
        <span>|</span>
        <router-link :to="'/shop/' + shop_id + '#shop-info'" class="item">店铺评价</router-link>
        <template v-for="nav in navs">
          <span :key="'span-' + nav.id">|</span>
          <a v-if="nav['nav_url'].indexOf('http') === 0" :href="nav['nav_url']" class="item" :key="nav.id" :target="nav.target ? '_blank' : '_self'">
            {{ nav.name }}
          </a>
          <router-link v-else :to="nav['nav_url']" class="item" :key="nav.id" :target="nav.target ? '_blank' : '_self'">
            {{ nav.name }}
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import * as API_Members from '@/api/members'
import { mapGetters } from 'vuex'

export default {
  name: 'shop-header',
  props: ['shop'],
  data() {
    return {
      // 店铺分类【分组】
      categories: [],
      // 店铺导航
      navs: [],
      // 是否已收藏
      is_collection: false
    }
  },
  computed: {
    ...mapGetters(['user']),
    shop_id() {
      return this.shop.shop_id
    }
  },
  mounted() {
    this.goToAnchor()
    /** 获取店铺分类【分组】 */
    API_Shop.getShopCategorys(this.shop_id).then(response => {
      let categories = response.filter(item => item.disable === 1)
      categories = categories.map(item => {
        item.children = item.children.filter(_item => _item.disable === 1)
        return item
      })
      this.categories = categories
    })
    /** 获取店铺导航 */
    API_Shop.getShopNav(this.shop_id).then(response => {
      this.navs = response
    })
    // 如果已登录，获取是否已收藏店铺
    if (this.user) this.getShopIsCollect()
  },
  watch: {
    $route: 'goToAnchor'
  },
  methods: {
    /** 去描点处 */
    goToAnchor() {
      const { hash } = location
      if (hash === '#shop-intro' || hash === '#shop-info') {
        // eslint-disable-next-line no-undef
        $('html,body').animate({ scrollTop: $(hash).offset().top }, 300)
      }
    },
    /** 收藏店铺 */
    collectionShop() {
      if (!this.user) {
        return this.$message.error('请先登录！')
      }
      if (this.is_collection) {
        API_Members.deleteShopCollection(this.shop_id).finally(this.getShopIsCollect)
      } else {
        API_Members.collectionShop(this.shop_id).finally(this.getShopIsCollect)
      }
    },
    /** 获取店铺是否被收藏 */
    getShopIsCollect() {
      API_Members.getShopIsCollect(this.shop_id).then(response => {
        this.is_collection = response.message
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/color" as theme;
.w {
  width: 1300px;
}
img {
  width: 100%;
  height: 100%;
}
.shop-header {
  width: 100%;
  height: 120px;
  background: url('../../../assets/images/background-brown-paper.jpg') repeat-x left top;
  .w {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .shop-name {
    padding: 0 0 0 320px;
    height: 120px;
    line-height: 125px;
    font-size: 30px;
    color: #fff;
    background: url('../../../assets/images/icon-welcome.png') no-repeat left center;
  }
  .shop-more {
    display: flex;
    margin-top: 28px;
    .item {
      text-align: center;
      cursor: pointer;
      margin-left: 30px;
      color: #333;
      &.active {
        color: theme.$color-main;
        i {
          color: theme.$color-main
        }
      }
      i {
        background-color: #fff;
        font-size: 26px;
        border-radius: 100%;
        color: #666;
        padding: 3px;
      }
      p {
        margin-top: 3px
      }
    }
  }
}
.shop-nav {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  background-color: #818181;
  color: #fff;
  h1 {
    font-size: 14px;
    color: #fff;
  }
  span {
    color: #dddbdb
  }
  .item {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    padding: 0 15px;
    color: #dddbdb
  }
  .item.category {
    position: relative;
    display: inline-block;
    cursor: pointer;
    &:hover {
      .category-box {
        display: block;
      }
    }
  }
  .category-box {
    display: none;
    position: absolute;
    z-index: 99;
    padding-top: 6px;
    left: 15px;
  }
  .inner-category-box {
    width: 152px;
    background-color: rgba(255, 255, 255, .8);
    box-sizing: border-box;
    .category-item {
      position: relative;
      line-height: 30px;
      height: 30px;
      border-bottom: 1px dashed #333;
      cursor: pointer;
      padding: 0 10px;
      &:last-child {
        border-bottom: none
      }
      &:hover {
        background-color: #f2f2f2;
        .category-item-box {
          display: block;
        }
      }
      a {
        display: block;
        color: #333
      }
    }
    .category-item-box {
      display: none;
      position: absolute;
      top: 0;
      left: 100%;
      width: 130px;
      background-color: rgba(96, 96, 96, .8);
      .category-item-cc {
        border-bottom: 1px dashed #fff;
        padding: 0 10px;
        &:last-child {
          border-bottom: none
        }
        &:hover {
          background-color: rgba(96, 96, 96, 1);
        }
        a {
          display: block;
          color: #fff;
        }
      }
    }
  }
}
</style>
