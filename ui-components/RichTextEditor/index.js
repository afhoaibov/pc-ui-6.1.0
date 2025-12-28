/**
 * 富文本编辑器组件
 */
import Vue from 'vue'
import Editor from './src/main'

Editor.install = function() {
  Vue.component(Editor.name, Editor)
}

export default Editor
