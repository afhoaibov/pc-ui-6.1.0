<template>
  <div id="shop-goods-list" class="container">
    <shop-header v-if="shop" :shop="shop"/>
    <div class="sort-nav">
      <div class="inner w">
        <div class="left">
          <div class="inner-sort">
            <template v-for="sort in sorts">
              <div class="item" :key="sort.title" :class="[sort.active && 'active', sort.type === 'asc' ? 'up' : 'down']" @click="handleSortChanged(sort)">
                {{ sort.title }}<i class="iconfont ea-icon-arrow-down2"></i>
              </div>
            </template>
          </div>
          <div class="inner-price">
            {{MixinUnitOfCurrency}}
            <el-input-number size="mini" :controls="false" v-model="params.min_price"/>
            -
            <el-input-number size="mini" :controls="false" v-model="params.max_price"/>
            <el-button size="mini" class="price-btn" @click="handlePriceConfirm">确认</el-button>
          </div>
        </div>
        <div class="inner-search">
          <el-input style="width: 75%;" placeholder="在当前结果中搜索" size="mini" clearable v-model="params.keyword" @keyup.enter.native="handleSearch('shop')">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch('shop')"></el-button>
          </el-input>
          <el-button size="mini" type="danger" class="search-btn" @click="handleSearch('all')">搜全站</el-button>
        </div>
      </div>
    </div>
    <div class="goods-container">
      <div class="inner w">
        <div v-if="goods && !goods.data.length" style="text-align: center;line-height: 100px">暂无商品</div>
        <ul v-else class="goods-list">
          <li v-for="goods in goods.data" :key="goods.goods_id" class="goods-item">
            <div class="goods-image">
              <router-link :to="'/goods/' + goods.goods_id">
                <img :src="goods.thumbnail" :alt="goods.name" :title="goods.name">
              </router-link>
            </div>
            <div class="goods-name">
              <router-link :to="'/goods/' + goods.goods_id" v-html="goods.name">{{ goods.name }}</router-link>
            </div>
            <div class="goods-price">
              <div v-if="goods.point_disable === 0">
                <span class="price">
                  <!-- <i>{{ goods.price | unitPrice }}</i> -->
                  <en-price :price="goods.price || 0" :sizeRatio="0.8" size="12" direction="row" />
                </span>
              </div>
              <div v-else>
                <span class="price" v-if="goods.price && goods.price !== 0">
                  <!-- <i>{{ goods.price | unitPrice }}</i> -->
                  <en-price :price="goods.price || 0" :sizeRatio="0.8" size="12" direction="row" /> + {{ goods.exchange_point }}积分
                </span>
                <span class="price" v-else>{{ goods.exchange_point }}积分</span>
              </div>
              <span>已销售：{{ goods.buy_count }}件</span>
            </div>
            <div class="goods-grade">好评率：<span>{{ goods.grade }}%</span></div>
          </li>
          <span class="clr"></span>
        </ul>
        <div v-if="goods" class="goods-pagination">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page.sync="params.page_no"
            :page-size="params.page_size"
            layout="total, prev, pager, next"
            :total="goods.data_total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as API_Shop from '@/api/shop'
import * as API_Goods from '@/api/goods'
import ShopHeader from './-shop/-shop-header'
import { Pagination, Input, InputNumber } from 'element-ui'

Vue.use(Pagination).use(Input).use(InputNumber)

export default {
  name: 'shop-goods-list',
  components: { ShopHeader },
  data() {
    return {
      sorts: [
        { title: '默认', name: 'def', type: 'asc', active: true },
        { title: '销量', name: 'buynum', type: 'asc', active: false },
        { title: '价格', name: 'price', type: 'asc', active: false },
        { title: '好评率', name: 'grade', type: 'asc', active: false }
      ],
      shop: '',
      goods: '',
      params: {
        page_no: 1,
        page_size: 16,
        ...this.$route.query
      }
    }
  },
  watch: {
    '$route.query': function(val) {
      if (val) {
        this.params = {
          page_no: 1,
          page_size: 16,
          ...val
        }
        this.GET_GoodsList()
      }
    }
  },
  mounted() {
    this.getShopData()
    this.GET_GoodsList()
  },
  methods: {
    /** 当前页数发生改变 */
    handleCurrentChange(page) {
      this.params.page_no = page
      this.GET_GoodsList()
    },
    /** 排序发生改变 */
    handleSortChanged(sort) {
      if (sort.active) {
        sort.type = sort.type === 'asc' ? 'desc' : 'asc'
      }
      this.$set(this, 'sorts', this.sorts.map(item => {
        item.active = item.name === sort.name
        return item
      }))
      this.params.sort = `${sort.name}_${sort.type}`
      this.GET_GoodsList()
    },
    /** 价格区间确认 */
    handlePriceConfirm() {
      const { min_price, max_price } = this.params
      if (min_price > max_price) {
        this.$message.error('价格区间格式有误！')
        return false
      }
      this.GET_GoodsList()
    },
    /** 商品搜索【店内、全站】 */
    handleSearch(type) {
      if (type === 'all') {
        this.$router.push({ path: '/goods', query: { keyword: this.params.keyword } })
      } else {
        this.params.page_no = 1
        this.GET_GoodsList()
      }
    },
    /** 获取店铺商品列表 */
    GET_GoodsList() {
      const params = JSON.parse(JSON.stringify(this.params))
      if (params.shop_id) {
        params.seller_id = params.shop_id
        delete params.shop_id
      }
      if (params.min_price || params.max_price) {
        params.price = [params.min_price, params.max_price].join('_')
        delete params.min_price
        delete params.max_price
      }
      API_Goods.getGoodsList(params).then(response => {
        this.goods = response.goods_data
        this.MixinScrollToTop()
      })
    },
    /** 获取店铺数据 */
    async getShopData() {
      const { shop_id } = this.$route.query
      this.shop = await API_Shop.getShopBaseInfo(shop_id)
    }
  }
}
</script>

<style lang="scss" scoped>
@use "sass:math";
@use "../../assets/styles/color" as theme;
img {
  width: 100%;
  height: 100%
}
.container {
  background-color: #F7F7F7;
}
.sort-nav {
  width: 100%;
  .inner {
    border-bottom: 1px solid #D8D8D8
  }
  .left {
    display: flex;
    align-items: center;
    height: 100%
  }
  .inner, .inner-sort {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    background-color: #F9FCFA;
  }
  .inner-sort .item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: 25px;
    border-right: 1px solid #ccc;
    font-size: 12px;
    cursor: pointer;
    &.active {
      color: theme.$color-main
    }
    &.down .iconfont {
      transform: rotate(0) scale(.8)
    }
    &:last-child {
      border-right: 0
    }
    .iconfont {
      font-size: 12px;
      margin: 0 5px;
      color: theme.$color-main;
      transform: rotate(180deg) scale(.8);
    }
  }
  .inner-price {
    margin-left: 35px;
    min-width: 300px;
    ::v-deep .el-input-number {
      width: 80px;
    }
    .price-btn {
      margin-left: 5px
    }
  }
  .inner-search {
    display: flex;
    margin-right: 10px;
    .search-btn {
      margin-left: 10px
    }
  }
}
.goods-container {
  .inner {
    background-color: #fff;
  }
}
.goods-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 50px;
}
$s_sep: 30px;
$g_width: math.div(1210px - $s_sep * 5, 4);
.goods-list {
  padding: 10px $s_sep
}
.goods-item {
  float: left;
  width: $g_width;
  min-height: 300px;
  margin-right: $s_sep;
  margin-bottom: 20px;
  &:nth-child(4n) {
    margin-right: 0
  }
}
.goods-image {
  width: $g_width;
  height: $g_width;
}
.goods-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 36px;
}
.goods-price {
  display: flex;
  justify-content: space-between;
  strong {
    font-size: 16px
  }
}
.goods-grade {
  span {
    color: theme.$color-main
  }
}
</style>
