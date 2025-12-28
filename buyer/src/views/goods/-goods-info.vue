<template>
  <div id="goods-info" class="goods-info">
    <goods-info-skeleton v-if="!pageLoading" />
    <template v-else>
      <div class="pro-name bottom-border" :title="goodsInfo.goods_name">
        <h1>
          <span v-if="goods_type === 'VIRTUAL'" class="goods-tag"> 虚拟商品</span>
          {{ goodsInfo.goods_name }}
        </h1>
      </div>
      <div class="pro-details">
        <div v-if="seckill && showSeckill" class="seckill-container">
          <goods-prom-bar
            title="限时抢购"
            :end-time="seckill.distance_end_time"
            @count-end="handleCountEnd"
          >
            <i class="iconfont ea-icon-time seckill" slot="icon"></i>
          </goods-prom-bar>
          <div class="pro-list">
            <div class="pro-title" style="min-width: 65px">限时抢购价</div>
            <div class="pro-content price">
              <strong>
                <en-price :price="seckill.price" direction="row" size="22" />
              </strong>
              <span class="goods-org-price">
                <en-price
                  :price="seckill.origin_price"
                  line-through
                  direction="row"
                  size="14"
                  price-color="#808185"
                />
              </span>
            </div>
          </div>
        </div>
        <div class="price-box">

          <div v-if="!hideOriginPrice" class="pro-list">
            <div class="pro-title">价格</div>
            <!--如果有大于1个的sku，则显示价格区间-->
            <div v-if="priceRange" class="pro-content price">
              <strong>
                <en-price :price="priceRange[0]" direction="row" size="14"/>
              </strong>
              <template v-if="priceRange[1]">
                 ~ <strong>
                  <en-price :price="priceRange[1]" direction="row" size="14"/>
                </strong>
              </template>
            </div>

            <div v-else class="pro-content price">
              <template v-if="snapshot">
                <!--  交易快照 -->
                <template v-if="!goodsInfo.point || orderPrice">
                  <strong><en-price :price="orderPrice" direction="row" size="22"/></strong>
                </template>
                <strong v-if="goodsInfo.point && orderPrice"> + {{ goodsInfo.point }}积分</strong>
                <div class="pro-content price" v-if="goodsInfo.point && !orderPrice">
                  <strong>{{ goodsInfo.point }}积分</strong>
                </div>
              </template>

              <template v-else>
                <div v-if="goodsInfo.point_disable === 0">
                  <strong><en-price :price="selectedSku.price" direction="row" size="22"/></strong>
                </div>
                <div v-if="goodsInfo.point_disable === 1">
                  <strong v-if="selectedSku.price && selectedSku.price > 0">
                    <en-price :price="selectedSku.price" direction="row" size="22"/> + {{ selectedSku.exchange_point }}积分
                  </strong>
                  <strong v-else>{{ selectedSku.exchange_point }}积分</strong>
                </div>
              </template>

            </div>
          </div>
          <!-- 促销活动 -->
          <goods-promotions :promotions="promotions"  />
        </div>
        <goods-coupons
          :goods="goodsInfo"
          :selectedSku="selectedSku"
          :is-snapshot="snapshot" />

        <!-- 虚拟商品有效期 -->
        <div class="promotions-container" v-if="goods_type === 'VIRTUAL'">
          <div class="pro-list">
            <div class="pro-title">有效期</div>
            <div class="pro-content prom">
              购买后 {{goods.expired_date}} 天
            </div>
          </div>
        </div>

        <!--  配送地区选择 -->
        <goods-ship
          v-if="goods_type !== 'VIRTUAL'"
          :goods-id="goods.goods_id"
          @in-stock-change="handleInStockChange"/>
      </div>
      <div v-if="specList && specList.length" :class="['pro-spec', unselectedSku && 'error']">
        <div v-for="(spec, specIndex) in specList" :key="spec.spec_group_sn" class="pro-list">
          <div class="pro-title pro-title1">{{ spec.spec_group_name }}</div>
          <div class="pro-content">
            <button
              v-if="snapshot"
              :class="['spec-val-btn', 'selected', spec.spec_value_image && 'spec-image']"
              type="button"
            >
              <img v-if="spec.spec_value_image" :src="spec.spec_value_image">
              <span class="spec-text">{{ spec.spec_value_name }}</span>
              <i class="iconfont ea-icon-right-bottom-checked"></i>
            </button>
            <template v-else>
              <button
                v-for="spec_val in spec.value_list"
                :key="spec_val.spec_value_sn"
                :class="{ selected: spec_val.selected, 'spec-image': spec_val.spec_value_image }"
                @click="handleClickSpec(spec, specIndex, spec_val)"
                class="spec-val-btn"
                type="button"
              >
                <img v-if="spec_val.spec_value_image" :src="spec_val.spec_value_image">
                <span class="spec-text">{{ spec_val.spec_value_name }}</span>
                <i class="iconfont ea-icon-right-bottom-checked"></i>
              </button>
            </template>
          </div>
        </div>
        <div v-if="unselectedSku" class="pro-list error-msg">
          <div class="pro-title"></div>
          <div class="pro-content">请选择商品规格！</div>
        </div>
      </div>

      <div v-if="goods.is_auth === 0 || goods.is_auth === 2" class="no-auth">
        此商品正在审核中，先看看其它商品吧。
      </div>
      <div v-else-if="snapshot" class="snapshot-box">
        当前页面内容为订单快照，展示的是创建时的商品信息，当发生交易争议时，此页面作为判断依据。
        <router-link :to="'/goods/' + goods.goods_id">点此查看最新商品详情</router-link>
      </div>
      <template v-else>
        <div class="pro-list buy-num">
          <div class="pro-title">购买数量</div>
          <div class="pro-content">
            <div v-if="!noSkuForSelectSpecs" class="count-num">
              <a href="javascript:" @click="handleBuyNumChanged('-')" class="oper-num down" :class="[buyNum < 2 && 'not-oper']"></a>
              <span class="num">
                <input type="number" v-model.number="buyNum" v-input.int>
              </span>
              <a href="javascript:" @click="handleBuyNumChanged('+')" class="oper-num up"></a>
            </div>
            <span v-if="noSkuForSelectSpecs" style="color: red">
              当前所选规格没有对应商品
            </span>
            <span v-else style="margin-left: 15px">仅剩 {{ selectedSku.enable_quantity }} 件，抓紧时间购买哦！</span>
          </div>
        </div>

        <div class="buy-btns">
          <button
            type="button"
            class="buy-btn buy"
            :class="{disabled: buyNowBtnDisabled}"
            @click="handleBuyNow"
          >立即购买</button>
          <button
            type="button"
            class="buy-btn add"
            :class="{disabled: addCartBtnDisabled}"
            @click="handleAddToCart"
          ><i class="iconfont ea-icon-cart"></i>加入购物车</button>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
/**
 * 商品信息模块
 * 包括商品名称、商品价格、购买数量、加入购物车
 * 包括优惠券
 * 包括促销信息
 * 包括限时抢购
 * 包括团购活动
 */
import Vue from 'vue'
import { RegExp } from '~/ui-utils'
import * as API_Goods from '@/api/goods'
import * as API_Trade from '@/api/trade'
import * as API_Promotions from '@/api/promotions'
import Storage from '@/utils/storage'
import GoodsCoupons from './-goods-coupons'
import GoodsPromotions from './-goods-promotions'
import GoodsGroupbuySeckill from './-goods-groupbuy-seckill'
import GoodsExchange from './-goods-exchange'
import GoodsPromBar from './-goods-prom-bar'
import GoodsShip from './-goods-ship'
import GoodsInfoSkeleton from './-info-skeleton'
import { cloneObj } from '@/utils'
import { Popover } from 'element-ui'

Vue.use(Popover)
Vue.component('goods-prom-bar', GoodsPromBar)
export default {
  name: 'goods-info',
  props: ['goods', 'orderPrice', 'snapshot'],
  components: {
    GoodsCoupons,
    GoodsPromotions,
    GoodsGroupbuySeckill,
    GoodsExchange,
    GoodsShip,
    GoodsInfoSkeleton
  },
  data() {
    return {
      goodsInfo: null,
      // 购买数量
      buyNum: 1,
      // skuMap
      skuMap: new Map(),
      // 规格列表
      specList: [],
      // 被选中规格
      selectedSpec: [],
      // 被选中sku
      selectedSku: '',
      // 没有选中sku，初始化为false
      unselectedSku: false,
      // sku的规格值组合列表
      skuSpecValIds: [],
      // 有规格的商品价格区间
      priceRange: '',
      // 配送地区是否为有货状态
      in_store: true,
      // 促销信息
      promotions: '',
      // 总库存
      enable_quantity: 0,
      // 活动id
      activity_id: '',
      // 活动类型
      promotion_type: '',
      // 限时抢购信息
      seckill: '',
      // 是否显示限时抢购信息
      showSeckill: false,
      // 商品类型
      goods_type: 'NORMAL',
      // 页面展示数据是否处理完成
      pageLoading: false,
      // 当前选择的规格没有对应的sku
      noSkuForSelectSpecs: false,

    }
  },
  watch: {
    goods: {
      handler(newVal) {
        if (newVal.goods_type) {
          this.goods_type = newVal.goods_type
        }
        this.goodsInfo = cloneObj(newVal)
        this.handlerSku()
      },
      immediate: true
    },
    selectedSku(newVal) {
      if (this.$route.query.sku_id && this.$route.query.sku_id !== String(newVal.sku_id)) {
        this.$router.replace({ path: `/goods/${newVal.goods_id}`, query: { sku_id: newVal.sku_id } })
      }
    }
  },
  computed: {
    buyNowBtnDisabled() {
      if (!this.in_store) return true
      return this.noSkuForSelectSpecs
    },
    addCartBtnDisabled() {
      if (!this.in_store) return true
      return this.noSkuForSelectSpecs
    },
    // 是否隐藏原价格
    hideOriginPrice() {
      if (this.showSeckill) return true
    },
  },
  methods: {
    /** 处理商品sku */
    async handlerSku() {
      if (this.snapshot) {
        this.specList = this.goods['spec_list']
        this.pageLoading = true
        return
      }

      const { goods_id } = this.goods
      const skus = await API_Goods.getGoodsSkus(goods_id)
      const specList = []
      const priceList = []
      skus.sort((a, b) => a.sku_sort - b.sku_sort).forEach(sku => {
        const { spec_list, price } = sku
        priceList.push(price)

        const spec_value_sns = []
        if (!Array.isArray(spec_list) || !spec_list.length) {
          this.skuMap.set('no_spec', sku)
          return
        }
        this.skuSpecValIds.push(spec_list.map(item => item.spec_value_sn).sort().join(','))
        spec_list.forEach(spec => {
          const sp = specList.find(item => item.spec_group_sn === spec.spec_group_sn)
          const _spec = {
            spec_group_sn: spec.spec_group_sn,
            spec_group_name: spec.spec_group_name
          }
          const _value = {
            spec_value_name: spec.spec_value_name,
            spec_value_sn: spec.spec_value_sn
          }
          if (sku.sku_image) {
            _value.spec_value_image = sku.sku_image
          }
          spec_value_sns.push(spec.spec_value_sn)
          if (!sp) {
            specList.push({ ..._spec, value_list: [_value] })
            return
          }
          const sv = sp.value_list.find(item => item.spec_value_sn === spec.spec_value_sn)

          if (!sv) {
            sp.value_list.push(_value)
          }
          // else if (specList[_specIndex]['value_list'].findIndex(_value => _value['spec_value_sn'] === _spec['spec_value_sn']) === -1) {
          //   specList[_specIndex]['value_list'].push({ ..._value })
          // }
        })
        this.skuMap.set(spec_value_sns.join('-'), sku)
      })
      this.rawSkus = JSON.parse(JSON.stringify(skus))
      // 如果价格区间大于1个
      if (priceList.length > 1) {
        const min = Math.min(...priceList)
        const max = Math.max(...priceList)
        if (min === max) {
          this.priceRange = [max]
        } else {
          this.priceRange = [min, max]
        }
      }
      this.specList = specList
      // 如果没有规格，把商品第一个sku给已选择sku
      if (!specList.length) {
        this.selectedSku = this.skuMap.get('no_spec')
        const goodsInfo = cloneObj(this.goodsInfo)
        this.goodsInfo = {
          ...this.selectedSku,
          ...goodsInfo
        }
      }
      // 如果有sku信息，初始化已选规格
      if (this.$route.query.sku_id) {
        this.initSpec()
      } else if (this.specList) {
        // 默认选中第一个sku
        const _selectedSpecVals = []
        this.specList.forEach((spec, specIndex) => {
          if (!Array.isArray(spec.value_list)) return
          spec.value_list.forEach((val, specValIndex) => {
            if (specValIndex !== 0) return
            val.selected = true
            this.selectedSpec[specIndex] = val.spec_value_sn
            _selectedSpecVals.push(val.spec_value_sn)
          })
        })
        this.handleSelectedSku()
      }
      this.computedHasSkuForSelectedSpecs()
      const promotions = await API_Promotions.getGoodsPromotions(this.selectedSku.sku_id)
      this.promotions = (promotions || []).filter(item => item.promotion_type !== 'PINTUAN')
      // 如果是限时抢购促销活动，则不显示原价格
      if (!Array.isArray(this.promotions)) {
        this.pageLoading = true
        return
      }

      this.handlePromotions()
      const seckillList = this.promotions.filter(key => key.promotion_type === 'SECKILL')
      if (!seckillList.length) {
        this.pageLoading = true
        return
      }
      const _prom = seckillList.filter(key => key.sku_id === this.selectedSku.sku_id)
      // 如果都没有，返回false
      if (!_prom || !_prom[0]) {
        this.showSeckill = false
        this.pageLoading = true
        return
      }
      this.showSeckill = Number(_prom[0].distance_end_time) >= 0
      this.seckill = _prom[0]
      this.pageLoading = true
    },
    /** 促销数据处理 */
    handlePromotions() {
      const promotions = cloneObj(this.promotions)
      // dom加载完成后判断
      setTimeout(() => {
        promotions.map((item, index) => {
          const dom = document.getElementById(`promotionText${index}`)
          if (dom && dom.scrollWidth > dom.clientWidth) {
            item.showMore = true
            item.unfold = false
          } else {
            item.showMore = false
          }
        })
        this.promotions = promotions
      }, 100)
    },
    /** 初始化规格 */
    initSpec() {
      let { sku_id } = this.$route.query
      let selectedSpecs = ''
      if (sku_id) {
        this.skuMap.forEach((value, key) => {
          if (String(value.sku_id) === sku_id) {
            selectedSpecs = key.split('-')
          }
        })
      }
      const _selectedSpecVals = []
      this.specList.forEach((spec, specIndex) => {
        if (!Array.isArray(spec.value_list)) return
        spec.value_list.forEach((val, specValIndex) => {
          if (selectedSpecs) {
            const spec_value_sn = val.spec_value_sn
            if (selectedSpecs.indexOf(String(spec_value_sn)) !== -1) {
              val.selected = true
              this.selectedSpec[specIndex] = val.spec_value_sn
              _selectedSpecVals.push(val.spec_value_sn)
            }
          } else if (specValIndex === 0) {
            val.selected = true
            this.selectedSpec[specIndex] = val.spec_value_sn
            _selectedSpecVals.push(val.spec_value_sn)
          }
        })
      })
      this.handleSelectedSku()
    },
    /** 选择规格 */
    handleClickSpec(spec, specIndex, spec_val) {
      if (spec_val.spec_value_image) {
        this.$emit('spec-img-change', spec_val.spec_value_image)
      }
      if (spec_val.selected) return
      spec.value_list.forEach(item => {
        item.selected = item.spec_value_sn === spec_val.spec_value_sn
      })
      this.$set(this.specList, specIndex, spec)

      this.selectedSpec[specIndex] = spec_val.spec_value_sn
      const noSku = this.computedHasSkuForSelectedSpecs()
      if (!noSku) {
        this.handleSelectedSku(true)
      }
    },
    /** 购买数量增加减少 */
    handleBuyNumChanged(symbol, key) {
      if (symbol === '+') {
        const { enable_quantity } = this.selectedSku
        if (enable_quantity === 0) {
          this.$message.error('该规格暂时缺货！')
        } else if (this.buyNum >= enable_quantity) {
          this.$message.error('超过最大库存！')
        } else {
          this.buyNum += 1
        }
      } else {
        if (this.buyNum < 2) {
          this.$message.error('不能再少啦！')
        } else {
          this.buyNum -= 1
        }
      }
    },
    /** 根据已选规格选出对应的sku */
    handleSelectedSku(flag) {
      let sku
      if (this.selectedSpec.length) {
        const spec_vals = []
        this.selectedSpec.forEach(item => spec_vals.push(item))
        sku = this.skuMap.get(spec_vals.join('-'))
      } else {
        sku = this.skuMap.get('no_spec')
      }
      if (!sku) return
      this.selectedSku = sku

      this.unselectedSku = false
      this.priceRange = ''
      const goodsInfo = cloneObj(this.goodsInfo)
      this.goodsInfo = { ...sku, ...goodsInfo }
      this.buyNum = sku.enable_quantity === 0 ? 0 : 1
      if (this.selectedSku.sku_image) {
        this.$emit('spec-img-change', this.selectedSku.sku_image)
      }
      if (!flag) return
      API_Promotions.getGoodsPromotions(this.selectedSku.sku_id).then(response => {
        this.promotions = (response || []).filter(item => item.promotion_type !== 'PINTUAN')
        this.handlePromotions()

        // 如果是限时抢购促销活动，则不显示原价格
        if (!this.promotions) return
        if (this.promotions.some(key => key.promotion_type === 'SECKILL')) {
          const _prom = this.promotions.filter(
            key => key.sku_id === this.selectedSku.sku_id && key.promotion_type === 'SECKILL'
          )
          if (_prom && _prom[0]) {
            if (_prom[0].distance_end_time < 0) {
              this.showSeckill = false
            } else {
              this.showSeckill = true
            }
            this.seckill = _prom[0]
          }
          // 如果都没有，返回false
          if (!_prom || !_prom[0]) {
            this.showSeckill = false
          }
        } else {
          this.showSeckill = false
        }
      })
    },
    /** 立即购买 */
    handleBuyNow() {
      if (this.buyNowBtnDisabled) return
      if (!this.in_store || !this.isLogin()) return

      this.getActivityId()
      const { buyNum, activity_id, promotion_type } = this
      if (!this.handleCheckNum()) return
      const { sku_id } = this.selectedSku
      API_Trade.buyNow(sku_id, buyNum, activity_id, promotion_type).then(response => {
        this.$store.dispatch('cart/getCartDataAction')
        this.$router.push({ path: '/checkout', query: { way: 'BUY_NOW' } })
      })
    },

    /** 加入购物车 */
    handleAddToCart() {
      if (this.addCartBtnDisabled) return
      if (!this.in_store || !this.isLogin()) return
      this.getActivityId()
      const { buyNum, activity_id, promotion_type } = this

      if (!this.handleCheckNum()) return
      const { sku_id } = this.selectedSku
      API_Trade.addToCart(sku_id, buyNum, activity_id, promotion_type).then(response => {
        this.$store.dispatch('cart/getCartDataAction')
        this.$confirm('加入购物车成功！要去看看吗？', () => {
          this.$router.push({ path: '/cart' })
        })
      })
    },
    /** 是否已登录 */
    isLogin() {
      if (!this.selectedSku) {
        this.$message.error('请选择商品规格！')
        this.unselectedSku = true
        return false
      }
      if (!Storage.getItem('refresh_token')) {
        this.$confirm('您还未登录，要现在去登录吗？', () => {
          this.$router.push({ path: `/login?forward=${this.$route.path}?sku_id=${this.selectedSku.sku_id}` })
        })
        return false
      } else {
        return true
      }
    },
    /** 检查是否有积分兑换、团购、限时抢购活动 */
    getActivityId() {
      const { promotions } = this
      if (!promotions || !promotions.length) return ''
      // 把团购跟限时抢购 排序放在数组前边 先循环
      promotions.map((item, index) => {
        if (item.promotion_type === 'GROUPBUY' || item.promotion_type === 'SECKILL') {
          promotions.unshift(promotions.splice(index, 1)[0])
        }
      })
      let pro
      for (let i = 0; i < promotions.length; i++) {
        let item = promotions[i]
        if (item.promotion_type === 'SECKILL' || item.promotion_type === 'GROUPBUY' || item.promotion_type === 'EXCHANGE' || item.promotion_type === 'MINUS' || item.promotion_type === 'HALF_PRICE') {
          // 积分兑换没有sku_id 所以直接判断   并且 如果单品立减与第二件半价 是全商品参与也没有sku_id
          if (item.promotion_type === 'EXCHANGE' || item.goods_id === '-1') {
            pro = item
            break
          }
          if (this.selectedSku.sku_id === item.sku_id) {
            pro = item
            break
          }
        }
      }
      if (!pro) return ''
      this.activity_id = pro.activity_id
      this.promotion_type = pro.promotion_type
    },
    /** 检查购买数量有效性 */
    handleCheckNum() {
      let { buyNum } = this
      if (!RegExp.integer.test(buyNum) || buyNum < 1) {
        this.$message.error('商品库存已不足，不能购买！')
        return false
      }
      return true
    },
    /** 配送地区是否有货发生改变 */
    handleInStockChange(in_store) {
      this.in_store = in_store
    },
    handleCountEnd() {
      this.showSeckill = false
      this.$alert('活动已结束，商品已恢复原价。', function() {
        location.reload()
      })
    },
    /** 判断当前所选SKU是否存在 */
    computedHasSkuForSelectedSpecs() {
      const selectedSpec = cloneObj(this.selectedSpec)
      const ids = selectedSpec.sort().join(',')
      const noSku = !this.skuSpecValIds.includes(ids)
      if (!this.skuSpecValIds.length) return false
      this.noSkuForSelectSpecs = noSku
      return noSku
    }
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/styles/color" as theme;
.spec-text {
  word-break: break-word;
}
.pro-name, .pro-details {
  background: url(../../assets/images/icons-goods.png) repeat-x 0 bottom;
  padding-bottom: 15px;
  min-width: 567px;
}
.goods-info {
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  .pro-name {
    h1 {
      font: normal 16px/24px "microsoft yahei";
      color: #333;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      padding-left: 10px;
      word-break: break-all;
      width: 520px;
    }
    .goods-tag {
      padding: 1px 4px;
      color: #f42424;
      border: 1px solid #f42424;
      border-radius: 4px;
      font-size: 10px;
      min-width: 50px;
      margin-right: 10px;
    }
  }
  .pro-details {
    color: #666666;
    height: auto;
  }
  .buy-num {
    padding-top: 5px;
    .pro-content {
      display: flex;
    }
  }
  .buy-btns {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    .share-btn {
      background: #5fce9d;
      display: block;
      width: 160px;
      height: 45px;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      margin-right: 20px;
      &:hover {
        filter: brightness(1.1);
      }
    }
    .buy-btn {
      display: block;
      width: 160px;
      height: 45px;
      border: 2px solid theme.$color-main;
      background-color: theme.$color-main;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      margin-right: 20px;
      &.disabled {
        background-color: #ccc;
        border-color: #ccc;
        color: #ffffff;
        cursor: not-allowed;
      }
    }
    .buy:not(.disabled):hover {
      background-color: color.adjust($color: theme.$color-main, $lightness: -10%);
    }
    .add {
      color: theme.$color-main;
      background-color: #fff;
      .ea-icon-cart {
        font-size: 20px;
        margin-right: 10px;
      }
      &:not(.disabled):hover {
        color: color.adjust($color: theme.$color-main, $lightness: -10%);
        border-color: color.adjust($color: theme.$color-main, $lightness: -10%);
      }
    }
  }
}
.count-num {
  display: flex;
  align-items: center;
}
.num {
  border-top: 1px solid #ededed;
  border-bottom: 1px solid #ededed;
  height: 19px;
  padding-top: 1px;
  background: #fff;
  display: block;
  input {
    border: 0 none;
    display: block;
    width: 34px;
    height: 18px;
    line-height: 18px;
    text-align: center;
  }
}
.oper-num {
  display: block;
  align-items: center;
  background: url(../../assets/images/icons-goods.png) no-repeat;
  width: 21px;
  height: 22px;
  &.down {
    background-position: right -69px;
  }
  &.up {
    background-position: right -47px;
  }
  &:hover {
    background-position-x: -178px
  }
  &.not-oper {
    cursor: not-allowed;
  }
}
.goods-info {
  ::v-deep .pro-list {
    display: flex;
    margin-bottom: 5px;
    padding-left: 10px;
  }
  ::v-deep .pro-title {
    min-width: 60px;
    padding-right: 17px;
    height: 33px;
    line-height: 33px;
    white-space: nowrap;
  }
  ::v-deep .pro-title1 {
    height: auto;
    line-height: 25px;
    white-space: nowrap;
  }
  ::v-deep .pro-content {
    min-height: 33px;
    line-height: 33px;
    display: flex;
    flex-wrap: wrap;
    &.price {
      span {
        font-size: 16px;
      }
      strong {
        font-size: 22px;
      }
    }
  }
}
.pro-spec {
  position: relative;
  margin-top: 10px;
  &.error {
    &:before {
      position: absolute;
      content: '';
      width: 104%;
      height: 104%;
      border: 2px solid red;
      margin-left: -2%;
      margin-top: -2%;
    }
    .error-msg {
      color: red;
    }
  }
}
.spec-val-btn {
  position: relative;
  border: 2px solid #e2e1e3;
  color: black;
  padding: 10px 15px;
  margin: 0 5px 5px 0;
  cursor: pointer;
  background-color: #fff;
  &.selected {
    border-color: theme.$color-main;
    .ea-icon-right-bottom-checked {
      display: block;
    }
  }
  &.spec-image {
    display: flex;
    align-items: center;
    float: left;
    padding: 2px 5px;
    margin-bottom: 5px;
    background-color: #F7F7F7;
    img {
      width: 30px;
      height: 30px;
      vertical-align: middle;
    }
    .spec-text {
      line-height: normal;
      display: inline-block;
      margin-left: 5px;
      color: #666
    }
  }
  .ea-icon-right-bottom-checked {
    display: none;
    position: absolute;
    right: -1px;
    bottom: -2px;
    color: theme.$color-main;
    font-size: 18px;
  }
  &.disabled {
    cursor: not-allowed;
    background-color: #f2f2f2;
  }
}
.price-box {
  background-color: #f3f3f3;
}
.no-auth {
  width: 100%;
  line-height: 20px;
  background-color: #FFF7D1;
  margin: 10px auto;
  text-align: left;
  border: solid 1px #E5DEBC;
  color: #666;
  padding: 10px;
  box-sizing: border-box;
}
.snapshot-box {
  margin-top: 10px;
  padding: 10px;
  background-color: #eaeaea;
  a {
    color: theme.$color-href;
    &:hover {
      color: theme.$color-main;
    }
  }
}


.pro-content {
  em.hl_red_bg {
    padding: 2px 3px;
    color: theme.$color-main;
    border: 1px solid theme.$color-main;
    margin-right: 4px;
  }
}

.seckill-container {
  position: relative;
  margin-bottom: 40px;
  .goods-org-price {
    font-size: 14px;
    color: #82848a;
    text-decoration: line-through;
    margin-left: 10px;
  }
  .iconfont {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 5px;
    vertical-align: -1px;
    color: #fff;
  &.seckill {
     font-size: 20px;
   }
  }
  .pro-list {
    position: absolute;
    z-index: 3;
    top: 32px;
    left: 0;
    right: 0;
    background-color: #f3f3f3;
  }
}
.pro-list.batch {
    .pro-title {
      display: flex;
      align-items: center;
      height: 100%;
      white-space: nowrap;
    }
    .pro-content {
      display: flex;
      justify-content: space-between;
      .item-batch {
        width: 140px;
      }
      .price {
        font-size: 14px;
        font-weight: bold;
        .unit {
          font-size: 12px;
        }
      }
    }
  }
  .pro-content.batch {
    .batch-table {
      width: 100%;
      .name {
        color: #333333;
        font-weight: bold;
      }
			.price {
				padding: 0;
			}
      td {
        height: 44px;
        border-bottom: 1px dotted #e5e5e5;
        &.amount {
          width: 85px;
          input {
            width: 40px;
          }
        }
      }
    }
  }
  .total-bar-batch {
    position: relative;
    display: flex;
    width: 100%;
    height: 47px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e5e5e5;
    margin-bottom: 5px;
    font-size: 15px;
    .batch-num-total {
      display: flex;
      align-items: center;
      position: relative;
      text-align: right;
      padding-left: 50px;
      padding-right: 10px;
      &::after {
        content: ' ';
        position: absolute;
        right: 0;
        width: 2px;
        background-color: #cccccc;
        height: 15px;
      }
    }
    .batch-price-total {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      padding-left: 10px;
      box-sizing: border-box;
      width: 200px;
      border-right: 1px solid #e5e5e5;
    }
    &>span {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
    }
    .batch-selected-table {
      position: absolute;
      width: 100%;
      height: 200px;
      background-color: #00a0e9;
    }
  }
</style>
<style type="text/scss" lang="scss">
.batch-inventory-popper {
  td {
    height: 44px;
    border-bottom: 1px dotted #e5e5e5;
    padding: 0;
  }
  .spec-td {
    width: 150px;
  }
  .num-td {
    width: 100px;
  }
  .price-td {
    width: 125px;
  }
  .del-td {
    width: 50px;
  }
  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100px;
  }
}
</style>
