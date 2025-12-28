<template>
  <div class="sku-item-wrap">
    <div class="line-dashed" v-if="isGroupSku" />
    <div
      v-for="(skuInfo, index) in skuList" :key="skuInfo.sku_id"
      :class="[{ 'invalid': skuInfo.invalid === 1}, { 'checked-bg': skuInfo.checked }]">
      <div class="top-line" v-if="index || isGroupSku" />
      <el-row class="shop-goods-item-wrap">

        <!-- 商品信息 -->
        <el-col :span="10" class="info-box">
          <a href="javascript:" :class="['check', skuInfo.checked && 'checked']" @click="handleCheckSku(skuInfo)">
            <i class="iconfont ea-icon-check"></i>
          </a>
          <div class="name-box">
            <router-link :to="'/goods/' + skuInfo.goods_id">
              <div class="sku-img">
                <img :src="skuInfo.goods_image" >
                <div class="invalid-mask" v-if="skuInfo.invalid === 1">
                  {{skuInfo.error_message}}
                </div>
              </div>

            </router-link>
            <div class="sku-name-box">
              <router-link :to="'/goods/' + skuInfo.goods_id" class="sku-name">
                <span class="goods-tag" v-if="skuInfo.goods_type === 'VIRTUAL'">虚拟商品</span>
                {{ skuInfo.name }}
              </router-link>
              <span v-if="skuInfo.spec_list && skuInfo.spec_list.length > 0" class="sku-spec">
                {{ skuInfo | formatterSkuSpec }}
              </span>
              <p v-if="skuInfo.promotion_tags && skuInfo.promotion_tags.length">
                <span class="sku-act-tag" v-for="(tag, index) in skuInfo.promotion_tags" :key="index">
                  {{ tag }}
                </span>
              </p>
            </div>
          </div>
        </el-col>

        <!-- 单价 -->
        <el-col :span="3">
          <div class="sku-price">
            <div v-if="skuInfo.original_price || skuInfo.original_price == 0" class="original-price">
              <en-price :price="skuInfo.original_price" price-color="#666" line-through/>
            </div>
            <div class="purchase-price">
              <span v-if="skuInfo.purchase_price || skuInfo.purchase_price == 0">
                会员价：<en-price :price="skuInfo.purchase_price"/>
              </span>
              <span v-if="skuInfo.point && skuInfo.point > 0">+{{ skuInfo.point }}积分</span>
            </div>
          </div>
        </el-col>

        <!-- 数量 -->
        <el-col :span="3">
          <div class="sku-num">
            <div v-if="skuInfo.invalid === 1">x {{skuInfo.num}}</div>
            <div v-else class="num-action clearfix">
              <a :class="['oper', skuInfo.num < 2 && 'unable']" href="javascript:" @click="handleUpdateSkuNum(skuInfo, '-')">−</a>
              <input
                class="input"
                type="number"
                :value="skuInfo.num"
                :title="skuInfo.num"
                :max="skuInfo.enable_quantity"
                @focus="handleSkuNumFocus(skuInfo)"
                @change="handleSkuNumChanged($event, skuInfo)"
              >
              <a class="oper" href="javascript:" @click="handleUpdateSkuNum(skuInfo, '+')">+</a>
            </div>
          </div>
        </el-col>

        <!-- 重量 -->
        <el-col :span="4">
          <div class="sku-weight">
            {{ (skuInfo.num * skuInfo.goods_weight).toFixed(2) }}
          </div>
        </el-col>

        <!-- 小计 -->
        <el-col :span="3">
          <div class="sku-total">
            <span v-if="skuInfo.purchase_price || !skuInfo.point">
              <en-price :price="skuInfo.purchase_price * skuInfo.num"/>
            </span>
            <span v-if="skuInfo.point && skuInfo.point > 0">+{{ skuInfo.num * skuInfo.point }}积分</span>
          </div>
        </el-col>

        <!-- 删除Button -->
        <el-col :span="1">
          <div class="sku-action">
            <i class="iconfont ea-icon-delete" @click="handleDelete(skuInfo)"></i>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Row, Col } from 'element-ui'
import { RegExp } from '~/ui-utils'

Vue.use(Row).use(Col)

export default {
  name: 'SkuItem',
  props: {
    // 商品sku数据列表
    skuList: {
      type: Array
    },
    // 是否为促销展示商品
    isGroupSku: {
      type: Boolean
    }
  },
  data() {
    return {
      /** 当前操作的输入框的值【变化之前】 */
      current_input_value: 1
    }
  },

  computed: {

  },
  watch: {

  },
  methods: {
    ...mapActions({
      // 更新货品数量
      updateSkuNum: 'cart/updateSkuNumAction',
      // 选择、取消选择货品
      checkSkuItem: 'cart/checkSkuItemAction',
      // 删除货品
      deleteSkuItem: 'cart/deleteSkuItemAction'
    }),

    /** 勾选、取消勾选商品 */
    handleCheckSku(sku) {
      if (sku.invalid === 1) return
      this.checkSkuItem({ sku_id: sku.sku_id, checked: sku.checked ? 0 : 1 })
    },

    /** 更新商品数量 */
    handleUpdateSkuNum(sku, symbol) {
      if (symbol === '-' && sku.num < 2) return
      let _num = symbol === '+' ? sku.num + 1 : sku.num - 1
      this.updateSkuNum({ sku_id: sku.sku_id, num: _num })
    },

    /** 删除 */
    handleDelete(sku) {
      this.$confirm('确定要删除这个商品吗？', () => {
        this.deleteSkuItem(sku.sku_id).then(response => {
          this.$message.success('删除成功！')
        })
      })
    },

    /** 输入框被焦点【记录当前值】 */
    handleSkuNumFocus(sku) {
      this.current_input_value = sku.num
    },

    /** 输入框值发生改变 */
    async handleSkuNumChanged(event, sku) {
      const _value = event.target.value
      if (!RegExp.integer.test(_value)) {
        this.$message.error('您的输入不合法！')
        event.target.value = this.current_input_value
        return
      }
      if (Number(_value) === sku.num) return
      try {
        await this.updateSkuNum({ sku_id: sku.sku_id, num: Number(_value) })
        this.current_input_value = sku.num
      } catch (e) {
        event.target.value = this.current_input_value
      }
    }
  }

}
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/color" as theme;
.sku-item-wrap {
  position: relative;

  .line-dashed {
    position:absolute;
    left: 10px;
    top: -4px;
    border-right: 1px dashed #ccc;
    margin: 4px 0 0 5px;
    height: calc(100% - 50px);
    width: 1px;
  }

}
.invalid {
  filter: grayscale(1);
  background: rgba(245,245,245, .4);
  padding-top: 10px;
}

.checked-bg {
  background: #fff4e8;
}
.shop-goods-item-wrap {
  padding: 10px 0;
  transition: background-color 0.2s ease-in-out;
  .top-line {
    margin: 0 0 20px 40px;
    border-top: 1px solid #f0f0f0;
  }

  .info-box {
    display: flex;
    align-items: center;
    padding-left: 10px;

    .name-box {
      display: flex;
    }
  }

  .sku-img {
    width: 75px;
    height: 75px;
    margin-right: 20px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
    .invalid-mask {
      background: rgba(0,0,0,.3);
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      color: #fff;
      font-weight: 600;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .sku-name-box {
    .sku-act-tag {
      border: 1px solid #f9d2d3;
      display: inline-block;
      padding: 0 5px;
      line-height: 15px;
      margin-right: 5px;
      color: theme.$color-main;
      margin-top: 5px;
    }
    .goods-tag {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 4px;
      box-sizing: border-box;
      background: theme.$color-main;
      color: #fff;
      border-radius: 4px;
    }
  }
  .sku-name {
    color: #333333;
    font-size: 12px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    &:hover { color: theme.$color-main }
  }
  .sku-spec {
    color: #ff9800;
    margin-top: 5px;
  }
  .sku-price {
    text-align: center;
    font-size: 12px;
  }
  .original-price {
    text-decoration:line-through
  }
  .sku-num {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .num-action {
    background: #fff;
    padding: 3px 0;
    overflow: hidden;
    border: 1px solid #dfdfdf;
    border-radius: 2px;
    .oper {
      float: left;
      width: 20px;
      text-align: center;
      color: #333333;
      font-family: "Tahoma";
      font-size: 14px;
      overflow: hidden;
      user-select: none;
      &.unable {
        color: #dfdfdf;
        cursor: default;
      }
    }
    .input {
      float: left;
      width: 38px;
      height: 18px;
      border: none;
      border-left: 1px solid #dfdfdf;
      border-right: 1px solid #dfdfdf;
      text-align: center;
      line-height: 18px;
      outline: none;
    }
  }
  .sku-weight {
    text-align: center;
    font-size: 12px;
  }
  .sku-total {
    text-align: center;
    font-size: 12px;
    color: theme.$color-main;
  }
  .sku-action {
    text-align: center;
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  .original-price {
    color: gray;
    text-decoration: line-through;
    margin-right: 5px; /* 可选：增加间距 */
  }

  .purchase-price {
    color: red;
  }
}

</style>
