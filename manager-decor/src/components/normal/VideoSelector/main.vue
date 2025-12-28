<template>
  <div class="video-selector video-selector__upload">
    <el-upload
      ref="videoUpload"
      list-type="picture-card"
      :action="$$UploadApi"
      :http-request="$$UploadHttpRequest"
      :on-success="handleUploadSuccess"
      :file-list="fileList"
      :accept="$$UploadAccept('video')"
      :limit="1"
    >
      <i class="el-icon-plus"></i>
      <p class="video-selector__tip">添加视频</p>
      <div slot="file" slot-scope="{file}" class="video-selector__upload-slot">
        <video class="el-upload-list__item-thumbnail" :src="file.url" preload="metadata"/>
        <label class="el-upload-list__item-status-label">
          <i :class="{'el-icon-upload-success': true,'el-icon-check': true}"></i>
        </label>
        <el-progress
          v-if="file.status === 'uploading'"
          type="circle"
          :stroke-width="6"
          :percentage="parseInt(file.percentage, 10)">
        </el-progress>
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-delete" @click="handleUploadRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'VideoSelector',
  props: {
    value: {
      type: [Object, String],
      required: true
    }
  },
  model: { event: 'update', prop: 'value' },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.video = newVal
        this.fileList = (newVal && newVal.src)
          ? [{ name: '图片', url: newVal.src }]
          : []
      }
    }
  },
  data() {
    return {
      video: '',
      show_resource_picker: false,
      fileList: []
    }
  },
  methods: {
    /**
     * 添加视频
     * @returns {Promise<void>}
     */
    async handleAddVideo() {
      this.show_resource_picker = true
    },
    /**
     * 删除视频
     */
    handleDeleteVideo() {
      this.video = ''
      this.$emit('update', this.video)
    },
    /**
     * 素材选择器确认
     * @param items
     */
    handleResourcePickerConfirm(items) {
      if (!items.length) return
      this.video = { src: items[0]['resource_url'] }
      this.$emit('update', this.video)
    },
    /**
     * 视频上传成功
     * @param res
     */
    handleUploadSuccess(res) {
      this.video = { src: res.url }
      this.$emit('update', this.video)
    },
    /**
     * 视频被移除
     * @param file
     */
    handleUploadRemove(file) {
      this.$refs['videoUpload']['handleRemove'](file)
      this.video = ''
      this.$emit('update', this.video)
    }
  }
}
</script>

<style lang="scss" scoped>
@use "./styles" as *;
</style>
