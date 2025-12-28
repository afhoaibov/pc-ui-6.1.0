<template>
  <div class="video-module">
    <video
      v-if="videoPoster"
      key="poster"
      controls="controls"
      :src="$$FormData.video ? $$FormData.video.src : 'placeholder'"
      class="video-module__player"
      :poster="videoPoster.src"
    />
    <video
      v-else
      key="no-poster"
      controls="controls"
      :src="$$FormData.video ? $$FormData.video.src : 'placeholder'"
      class="video-module__player"
    />
  </div>
</template>

<script>
export default {
  name: 'VideoModulePreview',
  computed: {
    // 视频封面
    videoPoster() {
      const { cover_type, video_cover } = this.$$FormData
      if (cover_type === 'original') {
        return ''
      } else {
        return video_cover
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.video-module {
  width: 100%;
  height: 420rpx;
  &__player {
    width: 100%;
    height: 100%;
  }
}
</style>
