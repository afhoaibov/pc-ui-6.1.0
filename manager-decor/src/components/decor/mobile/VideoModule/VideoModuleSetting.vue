<template>
  <div class="video-module-setting">
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">视频</div>
        <div class="header-setting__value">
          <el-radio-group v-model="video_url_type">
            <el-radio :label="1">选择视频</el-radio>
            <el-radio :label="2">粘贴视频地址</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div v-show="video_url_type === 1" class="body-setting">
        <div class="body-setting__tip">
          建议视频宽高比16:9<br/>
          <p style="color: red;">特别提示：由于UniApp视频组件在非H5端由原生绘制，所以层级会非常高，会覆盖一些其它组件，请谨慎使用！</p>
          <p style="color: red;">或者选择不开启【在非H5端显示】</p>
        </div>
        <video-selector v-model="$$FormData.video" />
      </div>
      <div v-show="video_url_type === 2" class="body-setting">
        <div class="body-setting__tip">小程序 v2.15 及以上版本支持仅支持.mp4格式的视频源地址</div>
        <el-input v-model="$$FormData.video.src" placeholder="此处粘贴视频播放地址" />
      </div>
    </div>
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">封面图</div>
        <div class="header-setting__value">
          <el-radio-group v-model="$$FormData.cover_type">
            <el-radio label="original" :disabled="video_url_type === 2">原视频封面</el-radio>
            <el-radio label="custom">自定义封面</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div v-show="$$FormData.cover_type === 'custom'" class="body-setting">
        <div class="body-setting__tip">建议图片宽高比16:9</div>
        <image-selector v-model="$$FormData.video_cover" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoModuleSetting',
  data() {
    return {
      video_url_type: 1
    }
  },
  watch: {
    video_url_type(newVal) {
      if (newVal === 1) return
      this.$$FormData.cover_type = 'custom'
    }
  }
}
</script>

<style lang="scss" scoped>
.video-module-setting {}
</style>
