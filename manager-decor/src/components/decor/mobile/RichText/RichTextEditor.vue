<template>
  <div class="rich-text-editor">
    <!-- <u-editor v-model="$$FormData.content" /> -->
    <!-- 工具栏 -->
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
    />
    <!-- 编辑器 -->
    <Editor
      :defaultConfig="editorConfig"
      v-model="$$FormData.content"
      @onCreated="onCreated"
    />
  </div>
</template>

<script>
import { i18nChangeLanguage } from '@wangeditor/editor'
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"

export default {
  name: 'RichTextEditor',
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      html: "<p>hello&nbsp;world</p>",
      toolbarConfig: {
        // toolbarKeys: [ /* 显示哪些菜单，如何排序、分组 */ ],
        // excludeKeys: [ /* 隐藏哪些菜单 */ ],
      },
      editorConfig: {
        placeholder: '请输入内容...',
        // autoFocus: false,
        // 所有的菜单配置，都要在 MENU_CONF 属性下
        MENU_CONF: {
          uploadImage: {
            // 自定义上传图片
            customUpload: (file, insertFn) => {
              this.$$UploadHttpRequest({file}).then(res => {
                insertFn(res.url)
              })
            }
          },
          uploadVideo: {
            // 自定义上传视频
            customUpload: (file, insertFn) => {
              this.$$UploadHttpRequest({file}).then(res => {
                insertFn(res.url)
              })
            }
          }
        },
      }
    }
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
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
      this.editor = Object.seal(editor); // 【注意】一定要用 Object.seal() 否则会报错
    }
  }
}
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="scss" scoped>
.rich-text-editor {
  width: 344px;
  margin: 0 auto;
}
</style>
