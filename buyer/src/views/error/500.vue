<template>
  <en-error :error="errorData" />
</template>

<script>
import Error from './-error'

export default {
  name: '500',
  layout: 'full',
  components: { EnError: Error },
  computed: {
    errorData() {
      const { statusCode, message } = this.$route.params
      return {
        statusCode: statusCode || 500,
        message: message || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
