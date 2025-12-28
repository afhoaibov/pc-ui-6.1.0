<template>
  <div id="search" class="search-wrap">
    <div class="search-form">
      <ul class="links">
        <li class="dorpdown" >
          <div ref="dorpDown" class="dt hs-icon" style="display: flex; align-items: center;">
            {{searchGoods ? '商品' : '店铺'}}<i class="iconfont el-icon-caret-bottom"></i>
          </div>
          <div class="dd dorp-down-layer">
            <dl>
              <dd @click="searchGoods = !searchGoods">
                {{searchGoods ? '店铺' : '商品'}}
              </dd>
            </dl>
          </div>
        </li>
      </ul>
      <input
        ref="searchInput"
        v-model="keyword"
        maxlength="200"
        @input="handleKeywordChnaged"
        @focus="show_autocomplete = true"
        @blur="handleSearchInputBlur"
        @keyup.enter="searchEvent"
        class="search-input"
      />

      <el-button
        type="button"
        class="search-btn goods"
        icon="el-icon-search"
        @click="searchEvent"></el-button>
    </div>
    <ul v-if="!hideKeywords" class="search-hot-keywords">
      <li v-for="item in $store.getters.hotKeywords" :key="item.id">
        <router-link :to="'/goods?keyword=' + encodeURIComponent(item.hot_name)">{{ item.hot_name }}</router-link>
      </li>
    </ul>
    <div
      class="search-autocomplete"
      :style="{'margin-left': `${dorpDownWidth}px`} "
      v-show="show_autocomplete && autoCompleteData.length > 0">
      <ul>
        <li v-for="(item, index) in autoCompleteData" :key="index" @click="handleSearchGoods(item.words)">
          <div class="left-span">
            <span>{{ item.words }}</span>
          </div>
          <!-- <div class="autocomplete-span">约{{ item.goods_num }}个商品</div> -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as API_Goods from '@/api/goods'
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Dropdown, DropdownMenu, DropdownItem } from 'element-ui'
Vue.use(Dropdown).use(DropdownMenu).use(DropdownItem)

export default {
  name: 'EnSearch',
  props: ['hide-keywords'],
  data() {
    const { keyword } = this.$route.query
    return {
      open_i18n: process.env.I18N,
      keyword: keyword || this.getSearchKeywords,
      autoCompleteStr: '',
      autoCompleteData: [],
      show_autocomplete: false,
      searchGoods: true, // 是否搜索商品，默认搜索商品
      dorpDownWidth: 50 // 搜索提示偏移宽度
    }
  },
  computed: {
    ...mapGetters(['getSearchKeywords'])
  },

  mounted() {
    this.handleQueryKeywordChange()
    this.dorpDownWidth = this.$refs['dorpDown'].clientWidth
  },
  watch: {
    $route: 'handleQueryKeywordChange'
  },
  methods: {
    ...mapActions({
      setSearchKeywords: 'setSearchKeywords'
    }),
    /** 关键字发生改变 */
    handleKeywordChnaged(event) {
      let _str = event.target.value || ''
      _str = _str.replace('\'', '')
      // this.keyword = _str
      this.GET_AutoCompleteWords(_str)
    },
    /** 搜索框失去焦点 */
    handleSearchInputBlur() {
      setTimeout(() => {
        this.show_autocomplete = false
      }, 200)
    },
    /** 搜索触发 */
    searchEvent(keyword) {
      if (this.searchGoods) {
        this.handleSearchGoods(keyword)
      } else {
        this.handleSearchShop()
      }
    },

    /** 搜索商品 */
    handleSearchGoods(keyword) {
      keyword = typeof (keyword) === 'string' ? keyword : this.keyword
      const route = this.$route
      this.keyword = keyword
      this.setSearchKeywords(keyword)
      this.show_autocomplete = false
      this.$refs['searchInput'].blur()
      if (route.name === 'points-mall') {
        this.$router.push({ path: '/points-mall', query: { keyword } })
      } else {
        this.$router.push({ path: '/goods', query: { keyword } })
      }
    },
    /** 搜索店铺 */
    handleSearchShop() {
      this.$router.push({ path: '/shop', query: { keyword: this.keyword } })
    },
    /** URL中keyword发生改变 */
    handleQueryKeywordChange() {
      const keyword = this.$route.query.keyword || this.getSearchKeywords

      const path = window.location.href
      // 只有在明确在店铺页面时才搜索店铺，其他情况默认搜索商品
      if (path.indexOf('/shop') !== -1 && this.$route.name === 'shop') {
        this.searchGoods = false
      } else {
        this.searchGoods = true
        this.setSearchKeywords(keyword)
      }
      if (keyword) {
        this.keyword = keyword
        this.GET_AutoCompleteWords(keyword)
      } else {
        this.keyword = ''
      }
    },
    /** 获取自动补全数据 */
    GET_AutoCompleteWords(keyword) {
      let _str = keyword || this.keyword
      if (_str === this.autoCompleteStr) return
      this.autoCompleteStr = _str
      _str = _str.trim()
      API_Goods.getKeywordNum(_str).then(response => {
        this.autoCompleteData = response
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
@use "sass:color";
@use "../assets/styles/color" as theme;
#search {
  position: relative;
  .links {
    min-width: 50px;
    border-radius: 4px 0 0 4px;
    display: flex;
    align-items: center;
    background: theme.$color-main;
    color: #fff;
    li {
      position: relative;
      float: left;
      cursor: pointer;
      min-width: 50px;
      &.spacer {
        overflow: hidden;
        margin: 11px 5px 0;
        width: 1px;
        height: 10px;
        background-color: #ccc;
      }
      .dorpdown {
        display: flex;
        align-items: center;
        padding-top: 4px;
      }
      &.dorpdown:hover {
        .dorp-down-layer {
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
          height: 34px;
          line-height: 34px;
          position: relative;
          z-index: 1;
          float: left;
        }
        .iconfont {
          width: 12px;
          height: 12px;
          line-height: 12px;
          font-size: 12px;
          transition: all .3s ease-out;
        }
      }
      .dorp-down-layer {
        display: none;
        background: #fff;
        margin-top: 30px;
        background-color: #FFF;
        width: 100%;
        border: solid 1px #F0F0F0;
        color: #666;
        box-sizing: border-box;

        dd {
          text-align: center;
          cursor: pointer;
          padding: 10px;
          color: #666;
          &:hover {
            background-color: #f5f6f5;
          }
        }
      }
    }
  }
  .search-wrap {
    position: relative;
  }

  .search-form {
    display: flex;
    position: relative;
    z-index: 99;
  }
  .search-input {
    box-sizing: content-box;
    width: 378px;
    height: 14px;
    padding: 8px;
    border: 2px solid theme.$color-main;
    outline: 0;
    font-size: 12px;
    float: left;
    color: #999;
  }
  .search-btn {
    min-width: 50px;
    height: 34px;
    line-height: 34px;
    padding: 0;
    background-color: theme.$color-main;
    font-size: 18px;
    cursor: pointer;
    float: left;
    outline: 0;
    transition: all ease-out .3s;
    color: #fff;
    font-weight: bold;
    border: 0;
    &:hover {
      opacity: .8;
    }
    &.goods {
      margin-right: 8px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    &.shop {
      background-color: color.adjust($color: theme.$color-main, $lightness: -15%);
    }
  }
  .search-hot-keywords {
    position: absolute;
    top: 40px;
    width: 100%;
    height: 28px;
    z-index: 88;
    li {
      float: left;
      height: 28px;
      line-height: 28px;
      margin-right: 10px;
      a {
        display: block;
        color: #999;
        &:hover {
          color: theme.$color-main;
        }
      }
    }
  }
  .search-autocomplete {
    width: 395px;
    background: white;
    border: 1px solid theme.$color-main;
    position: absolute;
    z-index: 99999;
    border-top: none;
    top: 34px;
    left: 0;
    li {
      height: 28px;
      line-height: 28px;
      clear: both;
      padding: 0 5px;
      cursor: pointer;
      &:hover {
        background-color: #f5f5f5;
      }
    }
    .left-span {
      max-width: 260px;
      height: 28px;
      overflow: hidden;
      float: left;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .autocomplete-span {
      float: right;
      color: #d2d2d2;
    }
  }
}
</style>
