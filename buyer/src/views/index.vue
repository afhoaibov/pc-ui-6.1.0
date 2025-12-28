<template>
  <div class="container">
    <index-search-bar/>
    <!-- <index-card/> -->
    <div v-if="pageData" class="floor-container">
      <template v-for="(item, index) in pageData">
        <index-seckill v-if="item.name === 'seckill'" :key="index"/>
        <component v-else :key="index" :is="`${item.name}`" :form-data="item.data"/>
      </template>
    </div>
    <div v-else class="floor-container">
      <index-skeleton/>
    </div>
    <!-- 新人红包领券提示 -->
    <new-comer-coupon v-if="!user" />
  </div>
</template>

<script>
import * as API_Common from '@/api/common'
import IndexComponents from './-index'
import Decors from '@/components/Decors'
import * as API_Pages from '@/api/pages'
import NewComerCoupon from '@/components/NewComerCoupon'
import { mapGetters } from 'vuex'

export default {
  name: 'index',
  head() {
    return {
      title: `商城首页-${this.site.title}`
    }
  },
  components: {
    ...IndexComponents,
    ...Decors,
    NewComerCoupon
  },
  data() {
    return {
      pageData: ''
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  created() {
    this.getIndexData()
    /** 记录浏览量 */
    API_Common.recordPlatformViews(window.location.href)
  },
  methods: {
    async getIndexData() {
      let page = {}
      try {
        const res = await API_Pages.getIndexPage()
        if (res && res.page_data && Array.isArray(res.page_data)) {
          page = res
        } else {
          page.page_data = []
        }
      } catch (e) {
        page.page_data = []
      }
      this.pageData = page.page_data
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../assets/styles/color" as theme;
.container {
  background-color: #F9F9F9;
  padding-bottom: 20px;
}
.floor-container {
  width: 1210px;
  margin: 0 auto;
}
</style>
