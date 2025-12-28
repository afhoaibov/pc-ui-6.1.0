<template>
  <div id="points-mall" class="points-mall-wrap">
    <div class="gl-container w">
      <div v-if="selectorData" class="gl-select-condition">
        <dl v-if="selectorData.brand && selectorData.brand.length" class="brand logo-brand">
          <dt>品牌:</dt>
          <dd>
            <div class="brand-list">
              <transition-group
                class="show-logo"
                :class="[selectorData.brand && selectorData.brand.length > 16 && 'more-brand']"
                tag="ul"
                name="fade"
              >
                <li
                  class="brand-item"
                  v-for="(brand, brandIndex) in selectorData.brand"
                  :key="brandIndex + brand.value"
                  v-show="brandIndex < 16 || brand_ex_status === 'open'"
                >
                  <router-link :to="'/points-mall?' + selector_url('brand', brand.value)" :title="brand.name">
                    <span v-if="brand.url"><img :src="brand.url" :alt="brand.name"/>{{ brand.name }}</span>
                    <span v-else>{{ brand.name }}</span>
                  </router-link>
                </li>
              </transition-group>
              <a
                v-if="selectorData.brand && selectorData.brand.length > 16"
                href="javascript:"
                class="more-btn"
                @click="brand_ex_status = brand_ex_status === 'close' ? 'open' : 'close'"
              >
                {{ brand_ex_status === 'open' ? '收起' : '更多品牌' }}
                <i :class="['iconfont', brand_ex_status === 'open' ? 'ea-icon-arrow-up' : 'ea-icon-arrow-down']"></i>
              </a>
            </div>
          </dd>
        </dl>
        <dl v-if="selectorData.cat && selectorData.cat.length">
          <dt>分类:</dt>
          <dd>
            <div class="small-list">
              <router-link
                v-for="(cat, index) in selectorData.cat"
                :key="index"
                :to="'/points-mall?' + selector_url('category', cat.value)"
              >{{ cat.name }}</router-link>
            </div>
          </dd>
        </dl>
        <template v-if="selectorData && selectorData.prop && selectorData.prop.length">
          <transition-group name="fade">
            <dl
              v-for="(prop, index) in selectorData.prop"
              :key="prop.key + index"
              v-show="index < 3"
            >
              <dt>{{ prop.key }}:</dt>
              <dd>
                <div class="small-list">
                  <router-link
                    v-for="(prop_val, valIndex) in prop.value"
                    :key="prop_val.value + valIndex"
                    :to="'/goods?' + selector_url('prop', `${prop.key}_${prop_val.value}`)"
                  >{{ prop_val.value }}</router-link>
                </div>
              </dd>
            </dl>
          </transition-group>
        </template>
      </div>
    </div>
    <div class="points-goods">
      <div v-if="!tableData || !tableData.data || tableData.data.length === 0" class="no-goods w">
        暂无数据...
      </div>
      <div v-else class="w">
        <ul class="goods-list">
          <template v-for="(goods, index) in tableData.data">
            <li :key="index" class="goods-item">
              <div class="gl-item">
                <div class="gl-img">
                  <router-link :to="'/goods/' + goods.goods_id" target="_blank">
                    <img :src="goods.small" :alt="goods.name">
                  </router-link>
                </div>
                <div class="gl-price" v-if="goods.point_disable === 0">
                  <strong>
                    <en-price :price="goods.price" direction="row" size="15" />
                  </strong>
                </div>
                <div class="gl-price" v-else>
                  <strong v-if="goods.price && goods.price !== 0">
                    <en-price :price="goods.price" direction="row" size="15" /> + {{ goods.exchange_point }}积分
                  </strong>
                  <strong v-else>{{ goods.exchange_point }}积分</strong>
                </div>
                <div class="gl-name">
                  <router-link :to="'/goods/' + goods.goods_id" :title="goods.name" target="_blank">
                    <em v-html="goods.name">{{ goods.name }}</em>
                  </router-link>
                </div>
                <div class="gl-commit">
                  <strong>已有<a class="comment">{{ goods.comment_num }}</a>人评价</strong>
                  <span class="gl-grade">好评率：<i>{{ goods.grade }}%</i></span>
                </div>
                <div class="gl-buy-count">已销售：{{ goods.buy_count }}件</div>
                <i v-if="goods.self_operated === 1" class="self-icon">自营</i>
                <div class="gl-shop">
                  <span>
                    <router-link :to="'/shop/' + goods.seller_id" :title="goods.seller_name">
                      <span class="gl-shop-name">{{ goods.seller_name }}</span>
                      <i class="iconfont ea-icon-shop" title="进入店铺"></i>
                    </router-link>
                  </span>
                </div>
              </div>
            </li>
          </template>
        </ul>
        <el-pagination
          v-if="tableData"
          @current-change="handleCurrentPageChange"
          :current-page.sync="tableData.page_no"
          :page-size="tableData.page_size"
          layout="total, prev, pager, next"
          :total="tableData.data_total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as API_Goods from '@/api/goods'
import { Pagination } from 'element-ui'

Vue.use(Pagination)

export default {
  name: 'points-mall',
  head() {
    return {
      title: `积分商城-${this.site.title}`
    }
  },
  data() {
    return {
      categories: '',
      params: {
        page_no: 1,
        page_size: 50,
        point_disable: 1
      },
      tableData: [],
      selectorData: {}
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (Object.keys(val.query)) {
          this.params = {
            page_no: 1,
            page_size: 50,
            point_disable: 1,
            ...val.query
          }
        }
        this.GET_PointsGoods()
      },
      immediate: true
    }
  },
  methods: {
    /** 计算url，多筛选叠加 */
    selector_url(type, value) {
      const { brand, category, prop } = this.$route.query
      let url = `${type}=${value}`
      if (type === 'category' && brand) url += `&brand=${brand}`
      if (type === 'brand' && category) url += `&category=${category}`
      if (type === 'prop') {
        if (brand) url += `&brand=${brand}`
        if (category) url += `&category=${category}`
        return url
      }
      if (prop) url += `&prop=${prop}`
      return url
    },
    /** 当前分页发生改变 */
    handleCurrentPageChange(page_no) {
      this.params.page_no = page_no
      this.GET_PointsGoods()
    },
    /** 获取积分商品 */
    GET_PointsGoods() {
      const params = JSON.parse(JSON.stringify(this.params))
      if (params.category === 0) delete params.category
      API_Goods.getGoodsList(params).then(response => {
        this.tableData = response.goods_data
        if (!Object.keys(this.selectorData).length) {
          this.selectorData = response.selector_data
        }
        this.MixinScrollToTop()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../assets/styles/color" as theme;
.points-mall-wrap {
  background: rgb(237, 237, 237);
  padding-top: 20px;
}
.gl-select-condition {
  box-shadow: rgb(204, 204, 204) 0 2px 5px;
  background-color: #fff;
  width: 1210px;
  dl {
    border-bottom: 1px dashed #ededed;
    min-height: 46px;
    clear: both;
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
  }
  dt {
    width: 100px;
    padding-left: 30px;
    line-height: 45px;
    color: #666;
    float: left;
  }
  dd {
    padding-left: 10px;
    width: 1070px;
    min-height: 46px;
    background: #fff;
    float: left;
  }
  .small-list {
    overflow: hidden;
    a {
      display: inline-block;
      margin: 12px 0 0;
      height: 22px;
      padding: 0 22px 0 10px;
      white-space: nowrap;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #666;
      &:hover {
        color: theme.$color-main
      }
    }
  }
  .brand-list {
    margin: 17px 0;
    padding-top: 1px;
    overflow: hidden;
    .more-brand {
      max-width: 1000px;
    }
    .more-btn {
      position: absolute;
      top: 17px;
      right: 20px;
    }
  }
  .show-logo {
    li {
      float: left;
      _display: inline;
      width: 130px;
      height: 85px;
      padding: 0;
      border: 1px solid #DDD;
      margin: -1px -1px 0 0;
      background: #FFF;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
      &:hover {
        position: relative;
        z-index: 5;
        border-color: theme.$color-main;
        box-shadow: 2px 2px 3px rgba(0, 0, 0, .12);
      }
      a {
        display: block;
        height: 85px;
        width: 130px;
        padding: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        zoom: 1;
        color: #005aa0;
        line-height: 48px;
        box-sizing: border-box;
        &:hover {
          text-decoration: none;
          color: theme.$color-main;
          border-color: theme.$color-main;
          img {
            display: none;
          }
        }
      }
      img {
        display: block;
        width: 120px;
        height: 75px;
        vertical-align: top;
      }
    }
    .brand-item {
      width: 120px;
      height: 60px;
      border-radius: 8px;
      margin: 0 10px 10px 0;
      position: relative;
      a {
        width: 100%;
        height: 60px;
        line-height: 60px;
        padding: 0 5px;
      }
      img {
        display: block;
        width: 120px;
        height: 60px;
        vertical-align: top;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}
.points-goods {
  margin-top: 10px;
  margin-bottom: 50px;
  ::v-deep .el-pagination {
    padding: 10px 0 30px 0;
    text-align: right;
    margin-right: 10px;
  }
}
.no-goods {
  text-align: center;
  line-height: 100px;
  font-size: 18px;
  font-weight: 700;
}
.goods-list {
  padding: 20px 10px;
  background: #fff;
  overflow: hidden;
  li {
    width: 234px;
    height: 400px;
    float: left;
    position: relative;
    z-index: 1;
    margin-top: 10px;
    box-shadow: 0 0 0 0 #e4e7ed;
    transition: box-shadow .2s ease;
  }
  li:hover {
    border-color: #e9e9e9;
    box-shadow: 0 0 5px 2px #e4e7ed;
    z-index: 2;
  }
  .gl-item {
    padding: 12px 6px;
    width: 220px;
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    background: #fff;
    border: 1px solid #fff;
    transition: border-color .1s ease;
    .self-icon {
      height: 16px;
      line-height: 16px;
      padding: 1px 4px;
      margin-right: 3px;
      overflow: hidden;
      text-align: center;
      font-style: normal;
      font-size: 12px;
      font-family: "Helvetica Neue", "Hiragino Sans GB", SimSun, serif;
      background: theme.$color-main;
      color: #FFF;
      cursor: default;
      border-radius: 2px;
    }
    .gl-img {
      margin-bottom: 5px;
      img {
        display: block;
        width: 220px;
        height: 220px;
        background-color: #fafafa;
        &:hover {
          transform: scale(1.1);
          border-radius: 4px;
          transition: all .3s;
        }
      }
    }
  }
  .gl-price {
    position: relative;
    line-height: 22px;
    // height: 22px;
    overflow: hidden;
    width: 100%;
    strong {
      float: left;
      margin-right: 10px;
      color: theme.$color-main;
      font-size: 15px;
      font-weight: 400;
      font-family: Verdana, serif;
      em {
        font-size: 16px
      }
    }
  }

  .gl-name {
    height: 40px;
    margin-bottom: 8px;
    overflow: hidden;
    a {
      color: #666;
      &:hover {
        color: theme.$color-main
      }
    }
    em {
      display: block;
      height: 40px;
      line-height: 20px;
      overflow: hidden;
      transition: height .08s ease;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .gl-attribute {
      display: block;
      width: 228px;
      height: 19px;
      margin-top: 1px;
      margin-right: -8px;
      overflow: hidden;
      .attr {
        float: left;
        height: 19px;
        line-height: 19px;
        padding: 0 4px;
        margin-right: 7px;
        background: #f4f4f4;
        b {
          font-weight: 400;
          color: #999;
        }
      }
    }
  }
  .gl-commit {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 18px;
    margin-top: -3px;
    overflow: hidden;
    strong {
      color: #a7a7a7;
      font-weight: 400;
      a {
        color: #646fb0;
        font-family: verdana, serif;
        font-weight: 700;
      }
    }
    .gl-grade i {
      color: theme.$color-main
    }
    .gl-shop {
      line-height: 18px;
      height: 18px;
      overflow: hidden;
      margin: 4px 0;
      // margin-top: -3px;
      // margin-bottom: 9px;
      a {
        color: #999
      }
      a:hover {
        color: theme.$color-main
      }
      i {
        margin-left: 5px;
        vertical-align: 5px;
      }
    }
  }
  .gl-buy-count {
    color: #a7a7a7;
    margin: 5px 0;
  }
  .gl-original-price {
    color: #909399;
    text-decoration: line-through;
  }
}
</style>
