<template>
  <notice-bar
    :mode="$$FormData.closeable ? 'closeable' : ''"
    left-icon="volume"
    :text="$$FormData.content || default_notice"
    :background="$$FormData.background_color"
    :color="$$FormData.content_color"
  />
</template>

<script>
import NoticeBar from 'vant/lib/notice-bar'
import 'vant/lib/notice-bar/style'

export default {
  name: 'NoticeBarPreview',
  components: { NoticeBar },
  data() {
    return {
      default_notice: '请填写内容，如果过长，将会在手机上滚动显示'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
