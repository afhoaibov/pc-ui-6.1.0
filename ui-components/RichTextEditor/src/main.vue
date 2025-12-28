<template>
  <div style="border: 1px solid #ccc;">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="html"
      :defaultConfig="editorConfig"
      :mode="mode"
      :style="editorStyles"
      @onCreated="onCreated"
      @onChange="onChange"
    />
  </div>
</template>

<script>
import { i18nChangeLanguage } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Foundation } from '~/ui-utils'

export default {
  name: 'EnRichTextEditor',
  props: {
    value: String,
    // 编辑器内容高度
    height: {
      type: [Number, String],
      required: false,
      default: 300
    },
    // 最大长度
    maxlength: {
      type: [Number, String],
      required: false,
      default: null
    },
    // 最大文件大小
    maxFileSize: {
      type: [Number, String],
      required: false,
      default: 2 * 1024 * 1024
    },
    // 上传接口地址
    uploadApi: {
      type: String,
      required: true
    },
    // 上传请求头
    uploadHeaders: {
      type: Object,
      required: true
    },
    // 上传超时时间
    uploadTimeout: {
      type: Number,
      required: false,
      default: 60 * 1000
    }
  },
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      html: '',
      mode: 'default'
    }
  },
  computed: {
    toolbarConfig() {
      return {}
    },
    editorConfig() {
      const makeUploadConfig = (type) => {
        return {
          fieldName: 'file',
          server: this.uploadApi,
          maxFileSize: this.maxFileSize,
          maxNumberOfFiles: 1,
          allowedFileTypes: [`${type}/*`],
          headers: { ...this.uploadHeaders },
          timeout: this.uploadTimeout,
          onError: (file) => {
            if (file.size > this.maxFileSize) {
              this.$message.error(`文件大小不能超过 ${Foundation.prettierBytes(this.maxFileSize)}`)
            }
          },
          customInsert(res, insertFn) {
            if (type === 'image') {
              insertFn(res.url, res.name, res.url)
            }
            if (type === 'video') {
              insertFn(res.url)
            }
          }
        }
      }
      const config = {
        placeholder: '请输入内容...',
        MENU_CONF: {
          uploadImage: makeUploadConfig('image'),
          uploadVideo: makeUploadConfig('video')
        }
      }
      if (this.maxlength) {
        config.maxLength = Number(this.maxlength)
      }
      return config
    },
    editorStyles() {
      let styles = {}
      if (this.height) {
        styles.height = Number(this.height) + 'px'
        styles.overflow = 'auto'
      }
      return styles
    }
  },
  mounted() {
    if (this.$i18n.locale === 'zh-CN') {
      i18nChangeLanguage('zh-CN')
    } else {
      i18nChangeLanguage('en')
    }
  },
  methods: {
    onCreated(editor) {
      // 一定要用 Object.seal() ，否则会报错
      this.editor = Object.seal(editor)
    },
    onChange() {
      const value = this.editor.isEmpty() ? '' : this.editor.getHtml()
      this.$emit('input', value)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal === this.html) return
        this.html = newVal
      }
    }
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy()
  }
}
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
