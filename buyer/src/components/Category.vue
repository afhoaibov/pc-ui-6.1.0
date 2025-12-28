<template>
  <div id="category">
    <div class="category-title" @click="cateChange('/goods')">
      <svg t="1639372805141" class="icon-fenlei" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6625" width="20" height="20"><path d="M906.19904 116.38784H115.92704c-34.31424 0-62.14656 27.83744-62.14656 62.17216v0.29696c0 34.33984 27.83232 62.17216 62.14656 62.17216h790.272c34.30912 0 62.15168-27.83744 62.15168-62.17216v-0.29696c0-34.33472-27.84256-62.17216-62.15168-62.17216z m-0.31744 331.05408H116.2496c-34.5088 0-62.46912 27.98592-62.46912 62.47424v0.49152c0 34.48832 27.9552 62.46912 62.46912 62.46912H905.8816c34.5088 0 62.46912-27.9808 62.46912-62.46912v-0.49152c0-34.48832-27.96032-62.47424-62.46912-62.47424z m0.31744 331.84768H115.92704c-34.31424 0-62.14656 27.84256-62.14656 62.17728v0.29696c0 34.33984 27.83232 62.17728 62.14656 62.17728h790.272c34.30912 0 62.15168-27.83744 62.15168-62.17728v-0.29696c0-34.33472-27.84256-62.17728-62.15168-62.17728z" p-id="6626"></path></svg>
      全部商品分类
    </div>
    <!-- <router-link to="/goods" class="category-title">
      <svg t="1639372805141" class="icon-fenlei" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6625" width="20" height="20"><path d="M906.19904 116.38784H115.92704c-34.31424 0-62.14656 27.83744-62.14656 62.17216v0.29696c0 34.33984 27.83232 62.17216 62.14656 62.17216h790.272c34.30912 0 62.15168-27.83744 62.15168-62.17216v-0.29696c0-34.33472-27.84256-62.17216-62.15168-62.17216z m-0.31744 331.05408H116.2496c-34.5088 0-62.46912 27.98592-62.46912 62.47424v0.49152c0 34.48832 27.9552 62.46912 62.46912 62.46912H905.8816c34.5088 0 62.46912-27.9808 62.46912-62.46912v-0.49152c0-34.48832-27.96032-62.47424-62.46912-62.47424z m0.31744 331.84768H115.92704c-34.31424 0-62.14656 27.84256-62.14656 62.17728v0.29696c0 34.33984 27.83232 62.17728 62.14656 62.17728h790.272c34.30912 0 62.15168-27.83744 62.15168-62.17728v-0.29696c0-34.33472-27.84256-62.17728-62.15168-62.17728z" p-id="6626"></path></svg>
      全部商品分类
    </router-link> -->
    <div class="category-layer">
      <template v-for="item in categories">
        <div :key="item.category_id" class="category-item">
          <div class="item-content">
            <i class="item-icon"></i>
            <div class="item-title">
              <strong>
                <span class="category-span" @click="cateChange('/goods?category=' + item.category_id)">{{ item.name }}</span>

                <!-- <router-link :to="'/goods?category=' + item.category_id">{{ item.name }}</router-link> -->
              </strong>
              <div style="display: flex">
                <template v-for="(_item, _index) in item.children">
                  <span v-if="_index < 2" :key="_item.catrgory_id" class="category-span-child" @click="cateChange('/goods?category=' + _item.category_id)">{{ _item.name }}</span>

                  <!-- <router-link v-if="_index < 2" :key="_item.catrgory_id" :to="'/goods?category=' + _item.category_id">
                    {{ _item.name }}
                  </router-link> -->
                </template>
              </div>
            </div>
          </div>
          <div class="item-layer">
            <div class="item-layer-con">
              <div class="item-layer-left">
                <div class="item-layer-detail">
                <span>
                  <dl v-for="_item in item.children" :key="_item.category_id">
                    <dt>
                      <span @click="cateChange('/goods?category=' + _item.category_id)">{{ _item.name }}</span>
                      <!-- <router-link :to="'/goods?category=' + _item.category_id">{{ _item.name }}</router-link> -->
                    </dt>
                    <dd v-if="_item.children && _item.children.length === 0">
                      <a href="javascript:;">暂无子分类</a>
                    </dd>
                    <dd v-else>
                      <span
                        v-for="__item in _item.children"
                        :key="__item.category_id"
                        @click="cateChange('/goods?category=' + __item.category_id)">{{ __item.name }}</span>
                      <!-- <router-link v-for="__item in _item.children" :key="__item.category_id" :to="'/goods?category=' + __item.category_id">
                        {{ __item.name }}
                      </router-link> -->
                    </dd>
                  </dl>
                </span>
                  <div class="item-layer-brands">
                  </div>
                  <div class="item-layer-promotions"></div>
                </div>
              </div>
              <div class="item-layer-right" v-lazy-container="{ selector: 'img' }">
                <template v-for="(brand, index) in item.brand_list">
                  <div v-if="index < 20" :key="index" class="brand-item">
                    <img
                      @click="cateChange('/goods?brand=' + brand.brand_id)"
                      :data-src="brand.logo" :alt="brand.name">
                    <!-- <router-link :to="'/goods?brand=' + brand.brand_id">
                      <img :data-src="brand.logo" :alt="brand.name">
                    </router-link> -->
                  </div>
                </template>
              </div>
            </div>
          </div>
          <span class="clr"></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'EnCategory',
  props: ['init-unfold'],
  computed: {
    /** 如果为首页，总是展开 */
    always_unfold() {
      if (this.initUnfold === false) return false
      return this.$route.path === '/'
    },
    categories() {
      return this.$store.getters.categories
    },
    itemHeight() {
      let height = 70
      const { categories } = this
      if (!categories || categories.length <= 7) {
        height = 70
      } else {
        height = 500 / categories.length
      }
      return height + 'px'
    }
  },
  methods: {
    ...mapActions({
      setSearchKeywords: 'setSearchKeywords'
    }),
    /** 切换分类 */
    cateChange(path) {
      // 清空检索关键字
      this.setSearchKeywords('')
      this.$router.push({ path: path })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
@use "../assets/styles/color" as theme;
#category {
  width: 240px;
  height: 40px;
  // background-color: theme.$color-main;
  flex-shrink: 0;
  z-index: 20;
  .icon-fenlei{
    line-height: 40px;
    margin-right: 10px;
    fill: #333;
  }
  &:hover {
    background-color: theme.$color-main;
    .icon-fenlei{
      fill: #fff;
    }
    .category-title{
      color: #fff;
      cursor: pointer;
    }
    .category-layer {
      display: block;
    }
  }
  .category-span {
    cursor: pointer;
    display: inline-block;
    color: #fff;
    font-size: 14px;
    margin-right: 5px;
    &:hover {
      color: theme.$color-main;
    }
  }
  .category-span-child {
    cursor: pointer;
    // display: block;
    color: #bfbfbf;
    font-size: 13px;
    margin-right: 5px;
    &:hover {
      color: theme.$color-main;
    }
  }
  .category-title {
    display: block;
    font-size: 18px;
    font-weight: 500;
    color: #333;
    text-align: center;
    line-height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    // &:hover{
    //   color: #fff;
    // }
  }
  .category-layer {
    display: none;
    position: relative;
    z-index: 30;
    background-color: rgba(0, 0, 0, .6);
    padding-top: 3px;
    &.unfold {
      display: block;
    }
  }
  .category-item {
    cursor: pointer;
    height: 70px;
    a:hover {
      color: theme.$color-main;
    }
    &:hover {
      .item-content {
        background-color: rgba(0, 0, 0, 1);
      }
      .item-layer {
        display: block;
      }
    }
  }
  .item-content {
    display: flex;
    align-items: center;
    height: 100%;
    float: left;
    width: 240px;
    .item-icon {
      display: inline-block;
      float: left;
      width: 25px;
      height: 25px;
    }
    .item-title {
      // margin-left: 25px;
      a {
        display: inline-block;
        color: #fff;
        font-size: 14px;
        margin-right: 5px;
        &:hover {
          color: theme.$color-main;
        }
      }
      span {
        display: block;
        a {
          color: #bfbfbf;
          font-size: 13px;
        }
      }
    }
  }
  .item-layer {
    display: none;
    position: absolute;
    top: 3px;
    left: 240px;
    width: 1210px - 240px;
    height: auto;
    cursor: auto;
    border: 1px solid #fff;
    background-color: #fff;
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, .1);
    transition: top .25s ease;
    overflow: hidden;
    .item-layer-con {
      display: block;
    }
    .item-layer-left {
      float: left;
      width: 650px;
      height: 460px;
      padding: 20px;
      overflow-y: scroll;
    }
    .item-layer-channel {
      overflow: hidden;
      height: 24px;
      width: 100%;
      a {
        float: left;
        margin-right: 10px;
        padding: 0 10px 0 12px;
        height: 24px;
        line-height: 24px;
        color: #fff;
        background-color: #5f4f4f;
      }
    }
    .item-layer-detail {
      /*margin-top: 20px;*/
      width: 100%;
      dl {
        padding-left: 80px;
        position: relative;
        &:last-child dd {
          border-bottom: 0;
        }
      }
      dt {
        overflow: hidden;
        position: absolute;
        color: #555;
        left: 0;
        top: 13px;
        width: 70px;
        text-align: right;
        font-weight: 700;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      dd {
        padding: 8px 0;
        overflow: hidden;
        border-bottom: 1px dashed #d2d2d2;
        span {
          cursor: pointer;
          float: left;
          margin: 8px 0;
          padding: 0 10px;
          height: 12px;
          border-left: 1px solid #e0e0e0;
          line-height: 12px;
          white-space: nowrap;
        }
      }
      span {
        color: #666
      }
      span:hover {
        color: theme.$color-main
      }
    }
    .item-layer-right {
      float: right;
      width: 260px;
      max-height: 500px;
      overflow: auto;
      .brand-item {
        overflow: hidden;
        display: inline-block;
        width: 120px;
        height: 75px;
        border: 1px solid #f9f9f9;
        text-align: center;
        margin: -1px 5px 0 0;
        a {
          display: table-cell;
          vertical-align: middle;
          width: 120px;
          height: 75px;
          img {
            width: 120px;
            height: 75px;
          }
        }
      }
    }
  }
}
</style>
