<template>
  <div v-if="showComponent" class="buy-btn-box">
    <el-input v-model="$$FormData.goods_buy_btn_text" placeholder="输入购买按钮文字" :maxlength="4" />
  </div>
</template>

<script>
export default {
  name: 'GoodsSettingCustomBuyBtn',
  watch: {
    /**
     * 订阅goods_buy_btn_style
     * 新值是3、7，设置购买按钮文字默认为"马上抢"
     * 新值是4、8，设置购买按钮文字默认为"购买"
     * 默认为空值
     * @param newVal
     */
    '$$FormData.goods_buy_btn_style'(newVal) {
      let goods_buy_btn_text = ''
      switch (newVal) {
        case 3:
        case 7:
          goods_buy_btn_text = '马上抢'; break;
        case 4:
        case 8:
          goods_buy_btn_text = '购买'; break;
        default:
          goods_buy_btn_text = ''
      }
      this.$$FormData.goods_buy_btn_text = goods_buy_btn_text
    }
  },
  computed: {
    showComponent() {
      return [3, 4, 7, 8].includes(this.$$FormData.goods_buy_btn_style);
    }
  }
}
</script>

<style lang="scss" scoped>
.buy-btn-box {
  margin-top: 12px;
}
</style>
