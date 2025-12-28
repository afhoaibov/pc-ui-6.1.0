<template>
  <div class="title-slicer-bar-icon">
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">分割图标</div>
      </div>
      <div class="body-setting">
        <div class="body-setting__tip">
          建议图片宽高比5:2，或使用默认图片
        </div>
        <image-selector v-model="$$FormData.slicer_icon" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleSlicerBarIcon'
}
</script>

<style lang="scss" scoped>

</style>
