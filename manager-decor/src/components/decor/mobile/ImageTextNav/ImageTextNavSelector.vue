<template>
  <div class="image-text-nav-selector">
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__tip">最多添加 10 个导航，拖动选中的导航可对其排序</div>
      </div>
      <div class="body-setting">
        <image-link-editor
          v-model="$$FormData.navList"
          :show-image="$$FormData.nav_type === 'image-text'"
          :limit="10"
          :add-text="$$FormData.nav_type === 'image-text' ? '添加图文导航' : '添加文字导航'"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageTextNavSelector'
}
</script>

<style lang="scss" scoped>

</style>
