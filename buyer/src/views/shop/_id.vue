<template>
  <div v-if="shop">
    <shop-header :shop="shop"/>
    <div class="decors w">
      <component
        v-for="(item, index) in decors"
        :key="index"
        :is="`${item.name}`"
        :form-data="item.data"
      />
    </div>
    <shop-footer :shop="shop"/>
  </div>
</template>

<script>
import * as API_Common from '@/api/common'
import * as API_Shop from '@/api/shop'
import * as API_Pages from '@/api/pages'
import ShopHeader from './-shop/-shop-header'
import ShopFooter from './-shop/-shop-footer'
import Decors from '@/components/Decors'

export default {
  name: 'shopDetail',
  components: { ShopHeader, ShopFooter, ...Decors },
  data() {
    return {
      shop: '',
      shop_id: this.$route.params.id
    }
  },
  head() {
    const { shop } = this
    if (!shop) return { title: `店铺首页-${this.site.title}` }
    let head = { title: `${this.shop.shop_name}-${this.site.title}` }
    if (this.pageData) {
      head.meta = [{ hid: 'description', name: 'description', content: this.pageData.remark }]
    }
    return head
  },
  computed: {
    decors() {
      const { pageData } = this
      console.log('pageData.page_data=', pageData.page_data)
      if (pageData && pageData.page_data && Array.isArray(pageData.page_data)) return pageData.page_data
      return []
    }
  },
  mounted() {
    this.GET_ShopData()
    /** 记录浏览量 */
    API_Common.recordViews(window.location.href)
  },
  methods: {
    async GET_ShopData() {
      const values = await Promise.all([
        API_Shop.getShopBaseInfo(this.shop_id),
        API_Pages.getShopIndexPage(this.shop_id)
      ])
      this.shop = values[0]
      this.pageData = values[1]
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
