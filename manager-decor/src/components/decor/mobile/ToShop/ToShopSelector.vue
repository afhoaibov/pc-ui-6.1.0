<template>
  <div v-if="$$IsAdmin">
    <en-shop-picker
      :show.sync="show_shop_picker"
      :buyer-domain="$$Domain['buyer_pc']"
      :request="$$Request"
      :limit="1"
      :before-close="checkShopInfo"
      @confirm="handleShopPickerConfirm"
    />
  </div>
</template>

<script>
export default {
  name: 'ToShopSelector',
  data() {
    return {
      show_shop_picker: false
    }
  },
  mounted() {
    if (this.$$FormData.shopInfo) return
    if (this.$$IsSeller) {
      this.$$FormData.shopInfo = this.$$Foundation.cloneDeep(this.$$ShopInfo)
    } else {
      this.$nextTick(() => {
        this.show_shop_picker = true
      })
    }
  },
  methods: {
    handleShopPickerConfirm(items) {
      this.$$FormData.shopInfo = this.$$Foundation.cloneDeep(items[0])
    },
    checkShopInfo() {
      if (this.$$FormData['shopInfo']) return
      // 如果没有店铺信息，就删掉当前模块
      this.$store.dispatch('removePreviewItemAction', this.$store.getters.activated)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
