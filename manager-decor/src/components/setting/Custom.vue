<template>
  <div class="form-item__custom">
    <component :is="config.component_name" :key="$$ActivatedPreview.__key" :preview="$$ActivatedPreview" />
  </div>
</template>

<script>
export default {
  name: 'Custom'
}
</script>

<style lang="scss" scoped>

</style>
