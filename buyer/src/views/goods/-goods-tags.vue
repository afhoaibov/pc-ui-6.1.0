<template>
  <div id="goods-tags" class="goods-tags">
    <div id="shop-card" class="shop-card">
      <div class="shop-title">
        <router-link :to="'/shop/' + shopId">{{ shopBaseInfo && shopBaseInfo.shop_name }}</router-link>
        <i class="iconfont el-icon-service" @click="MixinOpenIm(shopBaseInfo, { goods_id: goodsId })"></i>
      </div>
      <div class="shop-rate">
        <div class="title">店铺评分</div>
        <div class="rate-item">
          <h5>描述</h5>
          <el-rate
            v-if="shopBaseInfo"
            class="rate-icon"
            v-model="shopBaseInfo.shop_description_credit"
            disabled
          ></el-rate>
          <span class="rate-text">{{ shopBaseInfo && shopBaseInfo.shop_description_credit }}分</span>
        </div>
        <div class="rate-item">
          <h5>服务</h5>
          <el-rate
            v-if="shopBaseInfo"
            class="rate-icon"
            v-model="shopBaseInfo.shop_service_credit"
            disabled
          ></el-rate>
          <span class="rate-text">{{ shopBaseInfo && shopBaseInfo.shop_service_credit }}分</span>
        </div>
        <div class="rate-item">
          <h5>发货</h5>
          <el-rate
            v-if="shopBaseInfo"
            class="rate-icon"
            v-model="shopBaseInfo.shop_delivery_credit"
            disabled
          ></el-rate>
          <span class="rate-text">{{ shopBaseInfo && shopBaseInfo.shop_delivery_credit }}分</span>
        </div>
      </div>
      <div class="shop-btns">
        <span class="shop-btn">
          <i class="el-icon-s-shop iconfont" />
          <router-link :to="'/shop/' + shopId">进店逛逛</router-link>
        </span>
        <a href="javascript:;"
           @click="collectionShop"
           class="shop-btn">
          <i :class="['el-icon-star-on', 'iconfont', { 'collected': collected }]" />
          {{ collected ? '已收藏' : '收藏店铺' }}
        </a>
      </div>
    </div>
    <div v-for="tag in tagGoods" :key="tag.key" class="item-tag">
      <h5 class="title-tag">{{ tag.title }}</h5>
      <ul class="goods-list">
        <template v-for="(goods, index) in tag.data">
          <li v-if="index < 5" :key="index" class="goods-item">
            <router-link :to="'/goods/' + goods.goods_id">
              <img :src="goods.thumbnail" :alt="goods.goods_name" class="goods-image">
              <div class="goods-info">
                <div class="goods-name" v-html="goods.goods_name">{{ goods.goods_name }}</div>
                <div class="goods-price" v-if="!goods.exchange_point">
                  <en-price :price="goods.price" direction="row" :sizeRatio="0.9" size="12" />
                </div>
                <div class="goods-price" v-else>
                  <span v-if="goods.price && goods.price !== 0">
                    <en-price :price="goods.price" direction="row" :sizeRatio="0.9" size="12" />
                    + {{ goods.exchange_point }}积分
                  </span>
                  <span v-else>{{ goods.exchange_point }}积分</span>
                </div>
              </div>
            </router-link>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
/**
 * 标签商品模块
 * 例如热销商品、新品上架等等
 */
import * as API_Goods from '@/api/goods'
import { mapGetters } from 'vuex'
import * as API_Members from '@/api/members'
import Storage from '@/utils/storage'
import { Rate } from 'element-ui'
import Vue from 'vue'

Vue.use(Rate)

export default {
  name: 'goods-tags',
  props: ['shopId', 'goodsId', 'shopBaseInfo'],
  data() {
    return {
      tagGoods: [
        { title: '热卖排行', key: 'hot', data: null },
        { title: '新品推荐', key: 'new', data: null },
        { title: '推荐商品', key: 'recommend', data: null }
      ],
      hotGoods: null,
      newGoods: null,
      recGoods: null,
      // 是否已收藏此店铺
      collected: false
    }
  },
  mounted() {
    this.tagGoods.forEach(item => {
      API_Goods.getTagGoods(this.shopId, item.key, 10).then(response => {
        item.data = response
      })
    })
    // 如果用户已登录，获取是否已收藏此店铺
    Storage.getItem('refresh_token') &&
      API_Members.getShopIsCollect(this.shopId).then(response => {
        this.collected = response.message
      })
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    /** 收藏店铺 */
    collectionShop() {
      if (!this.user) {
        this.$message.error('请先登录！')
        return false
      }
      if (this.collected) {
        API_Members.deleteShopCollection(this.shopId).then(() => {
          this.$message('取消店铺收藏！')
          this.collected = false
        })
      } else {
        API_Members.collectionShop(this.shopId).then(() => {
          this.$message.success('收藏店铺成功！')
          this.collected = true
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/styles/color" as theme;

.goods-tags ::v-deep .el-rate__icon {
  font-size: 14px !important;
  margin-right: 0px !important;
}

.shop-card {
  position: relative;
  width: 100%;
  // width: 210px;
  margin-bottom: 10px;
  box-shadow: 0 0 10px 0 #cccccc;

  .shop-title {
    line-height: 40px;
    background-color: #f5f5f5;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      font-size: 20px;
      margin-left: 10px;
      cursor: pointer;
      color: #409EFF;
    }
  }

  .shop-rate {
    padding: 0 10px;
    margin: 10px 0;
    color: #666;

    .title {
      font-size: 14px;
    }

    .rate-item {
      font-size: 14px;
      margin-top: 10px;
      display: flex;
      align-items: center;

      .rate-text {
        font-size: 12px;
      }

      .rate-icon {
        margin: 0 4px;
      }
    }

    h5 {
      color: #777;
      height: 16px;
      line-height: 16px;
    }

    span {
      color: color.adjust($color: theme.$color-main, $lightness: -10%);
      height: 16px;
      line-height: 16px;
      font-weight: normal;
    }
  }

  .shop-btns {
    border-bottom: 1px solid #e6e6e6;
    font-size: 0;
    margin-top: 20px;
    padding-bottom: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 15px;

    .shop-btn {
      width: calc((100% - 20px) / 2);
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      color: #666;
      display: inline-block;
      font-size: 12px;
      min-height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        font-size: 18px;
        margin-right: 4px;
      }

      .el-icon-s-shop {
        color: theme.$color-main;
      }

      .el-icon-star-on {
        color: #999;
      }

      .collected {
        color: theme.$color-main;
      }
    }
  }
}

.goods-tags {
  width: 220px;
  min-height: 100px;
}

.title-tag {
  width: 100%;
  height: 36px;
  line-height: 36px;
  text-align: center;
  color: #fff;
  background-color: #333333;
}

.goods-list {
  margin-bottom: 10px
}

.goods-item {
  position: relative;
  margin: 0 auto;
  border-top: 1px solid #f1f1f1;
  padding: 10px 0;

  a {
    display: flex;
  }
}

.goods-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 12px;
  margin-bottom: 5px;
}

.goods-image {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  margin-right: 10px;
}
</style>
