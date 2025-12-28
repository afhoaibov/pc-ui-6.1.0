<template>
  <div class="container">
    <receipt-base-info :receiptId="id" />
  </div>
</template>

<script>
  import ReceiptBaseInfo from './components/ReceiptBaseInfo'

  export default {
    name: 'receiptDetail',
    components: {
      ReceiptBaseInfo
    },
    data() {
      return {
        id: this.$route.params.id
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'receiptDetail') return
          this.id = this.$route.params.id
        }
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container {
    padding: 0;
  }
</style>
