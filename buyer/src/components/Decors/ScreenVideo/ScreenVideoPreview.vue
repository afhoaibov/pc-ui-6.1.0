<template>
  <div
    class="screen-video"
    :style="{
      backgroundColor: $$FormData.background_color,
      width: $$FormData.video_width === 0 ? 'auto' : `${$$FormData.video_width}%`,
      height: $$FormData.video_height === 0 ? 'auto' : `${$$FormData.video_height}px`
    }"
  >
    <video
      v-if="$$FormData.video_source"
      :src="$$FormData.video_source.src"
      :style="{ objectFit: $$FormData.object_fit }"
      autoplay="autoplay"
      muted="muted"
      loop="loop"
      class="screen-video__video"
    />
    <div v-else class="screen-video__video empty">
      请上传视频
    </div>
    <div v-if="$$FormData.show_more_btn" class="screen-video__btn">查看更多</div>
  </div>
</template>

<script>
export default {
  name: 'ScreenVideoPreview'
}
</script>

<style lang="scss" scoped>
.screen-video {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: auto;
  .screen-video__video {
    width: 100%;
    height: 100%;
    &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      color: #666666;;
      font-size: 18px;
    }
  }
  .screen-video__btn {
    position: absolute;
    left: 80px;
    top: 50%;
    margin-top: -19px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    padding: 0 28px;
    border-radius: 4px;
    font-weight: 600;
    color: #fff;
    font-size: 13px;
    background-color: #f02546;
    cursor: pointer;
  }
}
</style>
