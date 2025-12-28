<template>
  <el-dropdown trigger="click" class='international' @command="handleSetLanguage">
    <div>
      <svg-icon class-name='international-icon' icon-class="language"/>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="item in locales"
        :key="item.id"
        :command="item.code"
        :disabled="locale === item.code"
      >{{ item.lang }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import Storage from '@/utils/storage'

export default {
  computed: {
    locale() {
      return this.$i18n.locale
    },
    locales() {
      return this.$store.getters.locales
    }
  },
  methods: {
    handleSetLanguage(code) {
      Storage.setItem('sellerLanguage', code)
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.international-icon {
  font-size: 20px;
  cursor: pointer;
  vertical-align: -5px;
}
</style>
