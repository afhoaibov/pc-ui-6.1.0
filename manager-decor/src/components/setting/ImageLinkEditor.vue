<template>
  <div class="item-setting">
    <div class="header-setting">
      <div class="header-setting__label">{{ config.label }}</div>
      <div class="header-setting__value">
      </div>
    </div>
    <div class="body-setting">
      <image-link-editor
        v-model="$$FormData[config.__key]"
        :limit="config.limit || 10"
        :add-text="config.addText || '添加项目'"
      />
    </div>
  </div>
</template>

<script>

export default {
  name: 'ImageLinkEditor'
}
</script>

<style scoped lang="scss">

</style>
