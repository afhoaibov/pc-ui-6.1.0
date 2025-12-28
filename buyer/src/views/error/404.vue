<template>
  <en-error :error="errorData" />
</template>

<script>
import Error from './-error'

export default {
  name: '404',
  layout: 'full',
  components: { EnError: Error },
  computed: {
    errorData() {
      return {
        statusCode: 404,
        message: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
