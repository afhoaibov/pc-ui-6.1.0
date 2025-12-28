<template>
  <div class="more-style">
    <el-input v-if="showMoreTextInput" v-model="$$FormData.more_text" placeholder="输入更多文字" />
    <link-selector v-model="$$FormData.more_link" />
  </div>
</template>

<script>
export default {
  name: 'TitleTextMoreStyle',
  computed: {
    showMoreTextInput() {
      return [1, 2].includes(this.$$FormData.more_style)
    }
  }
}
</script>

<style lang="scss" scoped>
.more-style {
  margin-top: 12px;
  .el-input:first-child {
    margin-bottom: 12px;
  }
}
</style>
