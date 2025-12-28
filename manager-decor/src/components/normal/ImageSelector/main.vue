<template>
  <div class="image-selector image-selector__upload">
    <el-upload
      list-type="picture-card"
      :action="$$UploadApi"
      :http-request="$$UploadHttpRequest"
      :on-success="handleUploadSuccess"
      :on-remove="handleUploadRemove"
      :file-list="fileList"
      :accept="$$UploadAccept('image')"
      :limit="1"
    >
      <i class="el-icon-plus"></i>
      <p class="image-selector__tip">添加图片</p>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'ImageSelector',
  props: {
    value: {
      type: [Object, String],
      required: true
    }
  },
  data() {
    return {
      image: '',
      show_resource_picker: false,
      fileList: []
    }
  },
  model: { event: 'update', prop: 'value' },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.image = newVal
        this.fileList = (newVal && newVal.src)
          ? [{ name: '图片', url: newVal.src }]
          : []
      }
    }
  },
  methods: {
    /**
     * 上传图片
     */
    handleUploadImage() {
      this.show_resource_picker = true
    },
    /**
     * 素材选择器确认选择
     * @param items
     */
    handleResourcePickerConfirm(items) {
      if (items) {
        this.image = { src: items[0]['resource_url'] }
      } else {
        this.image = ''
      }
      this.$emit('update', this.image)
    },
    /**
     * 图片上传成功
     * @param res
     */
    handleUploadSuccess(res) {
      this.image = { src: res.url }
      this.$emit('update', this.image)
    },
    /**
     * 移除图片
     */
    handleUploadRemove() {
      this.image = ''
      this.$emit('update', this.image)
    }
  }
}
</script>

<style lang="scss" scoped>
@use "./styles" as *;
</style>
