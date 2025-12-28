<template>
  <div
    class="title-slicer-bar"
    :style="{
      backgroundColor: $$FormData.background_color,
      height: $$FormData.height + 'px'
    }"
  >
    <div class="title-slicer-bar__inner" :style="{'--icon-img': `url(${$$FormData.slicer_icon.src})`}">
      <h3 class="title-slicer-bar__text" :style="{color: $$FormData.title_font_color}">{{ $$FormData.title }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleSlicerBarPreview'
}
</script>

<style lang="scss" scoped>
.title-slicer-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  &__inner {
  }
  &__text {
    position: relative;
    display: inline-block;
    font-size: 28px;
    font-weight: 700;
    padding: 0 50px;
    &::before,
    &::after {
      position: absolute;
      top: 50%;
      margin-top: -10px;
      content: '';
      width: 25px;
      height: 20px;
      background-repeat: no-repeat;
      background-size: 50px 20px;
      background-image: var(--icon-img);
    }
    &::before {
      left: 0;
      background-position: 0 0;
    }
    &::after {
      right: 0;
      background-position: -25px 0;
    }
  }
}
</style>
