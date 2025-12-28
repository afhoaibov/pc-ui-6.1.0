<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    width="805px">
    <div slot="title" class="goods-picker-title">商品选择器</div>
    <div class="goods-picker-body">
      <div class="goods-picker-search">
        <div class="item-search">
          <span>搜索范围</span>
          <en-category-picker
            @changed="(category) => { params.category_path = category ? category.category_path : '' }"
            :api="_categoryApi"
            placeholder="商品分类"
            clearable
          />
          <en-shop-selector
            v-if="type === 'admin'"
            clearable
            @changed="(shop) => { params.seller_id = shop.shop_id || 0 }"
          />
          <el-input v-model="params.keyword" :placeholder="'请输入关键字，例如：商品名称' + (type === 'admin' ? '、店铺名称' : '')" clearable class="inline-input"/>
          <el-button @click="() => { GET_GoodsList(true) }">搜索</el-button>
        </div>
      </div>
      <div class="goods-picker-content">
        <div class="list">
          <div
            v-for="(goods, index) in goodsList"
            :key="sku ? goods.sku_id : goods.goods_id"
            :class="['goods-item', isSelected(goods) && 'selected']"
          >
            <span class="icon-selected"></span>
            <div class="goods-image">
              <img :src="goods.goods_image">
            </div>
            <div class="goods-other">
              <div class="goods-name">{{ goods.goods_name }}</div>
              <div class="goods-specs-name">{{ goods.properties_name }}</div>
              <div class="goods-price" v-if="goods.point_disable === 0">{{ goods.goods_price | unitPrice }}</div>
							<div class="goods-price" v-if="goods.point_disable === 1">
								<span v-if="goods.goods_price && goods.goods_price > 0">{{ goods.goods_price | unitPrice }} + {{ goods.exchange_point }}积分</span>
								<span v-else>{{ goods.exchange_point }}积分</span>
							</div>
            </div>
            <div class="goods-mask">
              <a :href="MixinBuyerDomain + '/goods/' + goods.goods_id" target="_blank" class="mask-view" title="查看详情"><i></i></a>
              <div class="mask-check" title="选择商品" @click="handleClickItem(goods, index)"><i></i></div>
            </div>
          </div>
          <el-button
            v-if="goodsList.length > 0"
            type="primary"
            size="small"
            :loading="loading"
            @click="handleLoadMore"
            class="load-more"
          >加载更多</el-button>
        </div>
        <div class="selected-list" :id="'goods-picker-selected-' + _uid">
          <div
            v-for="(goods, index) in selectedList"
            v-if="goods"
            :key="sku ? goods.sku_id : goods.goods_id"
            class="goods-item selected"
          >
            <span class="icon-selected"></span>
            <div class="goods-image">
              <img :src="goods.goods_image">
            </div>
            <div class="goods-other">
              <p class="goods-name">{{ goods.goods_name }}</p>
              <div class="goods-specs-name">{{ goods.properties_name }}</div>
              <div class="goods-price" v-if="!goods.point_disable && !goods.exchange_point">{{ goods.goods_price | unitPrice }}</div>
              <div class="goods-price" v-if="goods.point_disable === 1 || goods.exchange_point">
                <span v-if="goods.goods_price || goods.price">{{ (goods.goods_price || goods.price) | unitPrice }} + {{ goods.exchange_point }}积分</span>
                <span v-else>{{ goods.exchange_point }}积分</span>
              </div>
            </div>
            <div class="goods-mask">
              <a :href="MixinBuyerDomain + '/goods/' + goods.goods_id" target="_blank" class="mask-view" title="查看详情"><i></i></a>
              <div class="mask-check" title="取消选择商品" @click="handleRemoveItem(goods, index)"><i></i></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="goods-picker-footer">
      <div class="upload-status-num">
        最多可选个数：<span>{{ limit < 1 ? '无限制' : limit }}</span>
        已选个数：<span>{{ selectedNum }}</span>
        还可选个数：<span>{{ limit < 1 ? '无限制' : limit - selectedNum }}</span>
      </div>
      <span>
        <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>
  import mixin from './mixin'

  export default {
    name: 'EnGoodsPicker',
    mixins: [mixin]
  }
</script>

<style lang="scss" scoped>
@use './styles' as *;
</style>
<style type="text/scss" lang="scss">
  .params-ids-select-dropdown {
    display: none !important;
  }
</style>
