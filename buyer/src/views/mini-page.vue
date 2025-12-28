<template>
  <div v-if="pageData" class="w">
    <template v-for="(item, index) in pageData">
      <index-seckill v-if="item.name === 'seckill'" :key="index"/>
      <component v-else :key="index" :is="`${item.name}`" :form-data="item.data"/>
    </template>
  </div>
</template>

<script>
import * as API_Pages from '@/api/pages'
import Decors from '@/components/Decors'
import IndexSeckill from '@/views/-index/-seckill'

export default {
  name: 'mini-page',
  components: { ...Decors, IndexSeckill },
  data() {
    return {
      id: '',
      pageData: ''
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (val.name === 'mini-page') {
          this.id = val.query.id
          this.getIndexData()
        }
      },
      immediate: true
    }
  },

  methods: {
    async getIndexData() {
      const id = this.id
      if (!id) return
      let page = {}
      try {
        const res = await API_Pages.getPageDetail(id)
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

</style>
