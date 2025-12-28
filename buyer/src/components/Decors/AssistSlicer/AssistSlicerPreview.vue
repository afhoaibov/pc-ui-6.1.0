<template>
  <div
    v-if="$$FormData.slicer_type === 'line'"
    class="assist-slicer line"
    :style="{
      padding: `0 ${$$FormData.slicer_padding}px`,
      backgroundColor: $$FormData.background_color,
    }"
  >
    <div :style="{borderTop: `1px ${$$FormData.slicer_style} ${$$FormData.slicer_color}`}" class="assist-slicer__hr"/>
  </div>
  <div
    v-else
    class="assist-slicer"
    :style="{
      height: $$FormData.blank_height + 'px',
      backgroundColor: $$FormData.background_color,
    }"
  />
</template>

<script>
export default {
  name: 'AssistSlicerPreview'
}
</script>

<style lang="scss" scoped>
.assist-slicer {
  overflow: hidden;
  &__hr {
    width: 100%;
    margin: 10px 0;
    border: 0;
  }
}
</style>
