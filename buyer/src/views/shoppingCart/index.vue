<template>
  <div id="shoppingCart" class="shopping-cart-wrap">
    <div class="cart-header">
      <div class="w">
        <div class="logo">
          <en-logo />
        </div>
        <en-cart-step :step="1"/>
      </div>
    </div>

    <div class="shopping-cart-content" id="shoppingCartContent">
      <div class="w">
        <!-- 店铺商品 -->
        <shop-goods-item />

        <!-- 底部结算Bar -->
        <div :class="['cart-check-bar', checkBarFixedBottom && 'fixed-bottom']" id="check-bar">
          <div class="check-bar w">
            <div class="check-bar-left">
              <span class="select-all" @click="handleCheckAll">
                <a href="javascript:" :class="['check', 'check-all', allChecked && 'checked']">
                    <i class="iconfont ea-icon-check"></i>
                  </a>
                  <span>全选 共（<b>{{ allCount }}</b>）件</span>
              </span>
              <em>|</em>
              <a href="javascript:" class="check-tool-a" @click="handleBatchDelete">批量删除</a>
              <em>|</em>
              <a href="javascript:" class="check-tool-a" @click="handleCleanCart">清空购物车</a>
            </div>

            <div class="check-bar-right">
              <div>
                <div class="right-top">
                  <div class="text-item">
                    已选商品<b style="color: #ff5e5e; margin: 0 2px">{{ checkedData.checkedCount }}</b>件
                    <i
                      :class="[showBottomGoods ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
                      @click.stop="changeShowBottomGoods"
                      style="font-size: 14px; color: #666; cursor: pointer;"></i>
                  </div>
                  <em>|</em>
                  <div class="text-item price-box">
                    合计(不含运费)：
                    <b class="price">
                      <i><template v-if="!cartTotal.paid_point || cartTotal.total_price"><en-price :price="cartTotal.total_price || 0" size="20"/>{{cartTotal.paid_point ? '+' : ''}}</template>{{ cartTotal.paid_point && cartTotal.paid_point > 0 ? (cartTotal.paid_point+'积分')  : '' }}</i>
                    </b>
                    <!-- 促销优惠明细 -->
                    <el-popover
                      placement="top-start"
                      width="200"
                      trigger="hover"
                      v-if="cartTotal.discount_detail_list && cartTotal.discount_detail_list.length"
                      class="discount-box">
                      <div>
                        <p v-for="(discount, index) in cartTotal.discount_detail_list" :key="index">
                          {{discount.promotion_type_name}}：<en-price :price="discount.discount_price" is-neg/>
                        </p>
                      </div>
                      <i slot="reference" class="el-icon-s-opportunity discount-icon"></i>
                    </el-popover>
                  </div>
                </div>
                <div class="discount-price" v-if="cartTotal.discount_price">
                  促销：<en-price :price="cartTotal.discount_price" is-neg/>
                </div>
              </div>

              <a
                href="javascript:"
                :class="['check-btn', !checkedData.checkedCount || disabledSettleButton && 'disabled']"
                @click="handleCheckout">{{disabledSettleButton ? '不支持合并结算' : '去结算'}}
              </a>
            </div>

            <!-- 已选商品显示 -->
            <div class="selected-goods-content" v-if="showBottomGoods">
              <div class="title">已选商品 <span class="count">{{checkedData.checkedCount}}</span> 件</div>
              <div class="inner">
                <i class="el-icon-arrow-left arrow-icon" @click.stop="onScrollLeft" />
                <div class="goods-inner" ref="selectedGoodsInner">
                  <div class="goods-content-list">
                    <img
                      :src="sku.goods_image"
                      alt=""
                      class="goods-img"
                      v-for="sku in checkedData.checkedList"
                      :key="sku.sku_id"
                      >
                  </div>
                </div>
                <i class="el-icon-arrow-right arrow-icon" @click.stop="onScrollRight" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Popover, Tooltip, Row, Col } from 'element-ui'
import ShopGoodsItem from './components/ShopGoodsItem'

Vue.use(Popover).use(Tooltip).use(Row).use(Col)

export default {
  name: 'cart',
  layout: 'full',
  middleware: 'auth-user',
  head() {
    return {
      title: `购物车-${this.site.title}`
    }
  },
  components: {
    ShopGoodsItem
  },
  data() {
    return {
      /** 已选商品显隐 */
      showBottomGoods: false,
      /** 结算栏相对顶部高度 */
      checkBarTop: 0,
      /** 是否固定到底部 */
      checkBarFixedBottom: false,
      /** 已选商品元素宽度 */
      bottomOffsetWidth: 0
    }
  },
  computed: {
    ...mapGetters({
      skuList: 'cart/skuList',
      shopList: 'cart/shopList',
      allCount: 'cart/allCount',
      checkedData: 'cart/checkedData',
      cartTotal: 'cart/cartTotal'
    }),
    /** 是否全部选中 */
    allChecked() {
      return !!this.checkedData.checkedCount && this.checkedData.checkedCount === this.allCount
    },
    /** 是否可结算 虚拟商品与普通商品部支持混合结算 */
    disabledSettleButton() {
      let haveVirtual = false
      let haveNormal = false
      this.shopList.forEach(cart => {
        let list = cart.sku_list
        // 促销商品合并检查
        cart.group_list.forEach(item => {
          list = list.concat(item.sku_list)
        })
        if (!haveNormal) {
          haveNormal = list.some(goods => goods.checked && goods.goods_type === 'NORMAL')
        }
        if (!haveVirtual) {
          haveVirtual = list.some(goods => goods.checked && goods.goods_type === 'VIRTUAL')
        }
      })
      return haveVirtual && haveNormal
    }

  },
  watch: {
    /** 当数据变化时，重新计算结算栏相对顶部距离。并且计算是应该固定在顶部，还是固定到底部，或者是位置不变 */
    skuList() {
      // 计算当前结算栏相对顶部距离【计算结算栏以上的高度】
      this.$nextTick(() => {
        // 31: 顶部快捷导航高度 -|- 100: logo区域高度 -|- 20 + 20: 内容margin-top + 内容padding-bottom
        this.checkBarTop = 31 + (this.$cartContent.height() + 20 + 20) + 100
        this.countCheckBarFixed()
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      /** 获内容区域jQuery对象 */
      // eslint-disable-next-line no-undef
      this.$cartContent = $('#shoppingCartContent')
      /** 添加滚动事件监听 */
      window.addEventListener('scroll', this.countCheckBarFixed)
      /** 添加点击事件 */
      window.addEventListener('click', this.handleCloseAct)
      /** 获取购物车数据 */
      this.getCartData()
    })
  },
  methods: {
    ...mapActions({
      // 获取购物车数据
      getCartData: 'cart/getCartDataAction',
      // 全选、取消全选
      checkAll: 'cart/checkAllAction',
      // 清空购物车
      cleanCart: 'cart/cleanCartAction',
      // 删除货品
      deleteSkuItem: 'cart/deleteSkuItemAction'
    }),
    destroyed() {
      /** 当组件销毁时，移除事件监听 */
      window.removeEventListener('scroll', this.countCheckBarFixed)
      window.removeEventListener('click', this.handleCloseAct)
    },

    /** 关闭底部弹框 */
    handleCloseAct() {
      this.showBottomGoods = false
    },

    /** 已选商品向左滑动偏移 */
    onScrollLeft() {
      const { bottomOffsetWidth } = this
      const scrollLeft = this.$refs.selectedGoodsInner.scrollLeft
      if (scrollLeft >= bottomOffsetWidth) {
        const total = Number(scrollLeft - bottomOffsetWidth)
        let step = (scrollLeft - total) / 70
        if (step < 0) step = -step
        this.moveSlow(scrollLeft, total, step, 'left')
      } else {
        this.$refs.selectedGoodsInner.scrollLeft = 0
      }
    },

    /** 滚动过渡 */
    moveSlow(distance, total, step, type) {
      if (type === 'right') {
        // 每隔1毫秒移动一小段距离，直到移动至目标至为止，反之亦然
        if (distance < total) {
          distance += step
          this.$refs.selectedGoodsInner.scrollLeft = distance
          setTimeout(() => {
            this.moveSlow(distance, total, step, type)
          }, 1)
        } else {
          this.$refs.selectedGoodsInner.scrollLeft = total
        }
      } else {
        if (distance > total) {
          distance -= step
          this.$refs.selectedGoodsInner.scrollLeft = distance
          setTimeout(() => {
            this.moveSlow(distance, total, step, type)
          }, 1)
        } else {
          this.$refs.selectedGoodsInner.scrollLeft = total
        }
      }
    },

    /** 已选商品向右滑动偏移 */
    onScrollRight() {
      const { bottomOffsetWidth } = this
      const scrollLeft = this.$refs.selectedGoodsInner.scrollLeft
      const total = Number(bottomOffsetWidth + scrollLeft)
      let step = (scrollLeft - total) / 70
      if (step < 0) step = -step
      this.moveSlow(scrollLeft, total, step, 'right')
    },

    /** 已选商品显示切换 */
    changeShowBottomGoods() {
      this.showBottomGoods = !this.showBottomGoods
      if (this.showBottomGoods) {
        this.$nextTick(() => {
          this.bottomOffsetWidth = this.$refs.selectedGoodsInner.offsetWidth
        })
      }
    },

    /** 全选、取消全选 */
    handleCheckAll() {
      this.checkAll(this.allChecked ? 0 : 1)
    },

    /** 批量删除 */
    handleBatchDelete() {
      if (!this.checkedData.checkedCount) return false
      this.$confirm('确定要删除这些商品吗？', () => {
        const _sku_list = [
          ...this.skuList.filter(item => item.checked).map(item => item.sku_id)
        ]
        this.shopList.forEach(item => {
          item.group_list.forEach(item => {
            _sku_list.push(...item.sku_list.filter(item => item.checked).map(item => item.sku_id))
          })
        })
        if (!_sku_list.length) return
        this.deleteSkuItem(_sku_list).then(response => {
          this.$message.success('删除成功！')
        })
      })
    },

    /** 清空购物车 */
    handleCleanCart() {
      if (!this.skuList.length) return
      this.$confirm('确定要清空购物车吗？', () => {
        this.cleanCart().then(() => this.$message.success('购物车已清空！'))
      })
    },

    /** 去结算 */
    handleCheckout() {
      if (!this.checkedData.checkedCount || this.disabledSettleButton) return false
      this.$router.push({ path: '/checkout', query: { way: 'CART' } })
    },

    /** 监听页面滚动，实现结算栏浮起、固定 */
    countCheckBarFixed() {
      // 获取滚动条当前位置
      const bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop
      // 是否固定到底部
      this.checkBarFixedBottom = bodyScrollTop < (this.checkBarTop - window.innerHeight + 60)
    }

  }

}
</script>

<style lang="scss" scoped>
 @use "./index" as *;
</style>
