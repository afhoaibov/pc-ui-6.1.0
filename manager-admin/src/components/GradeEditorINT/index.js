/**
 * Created by Andste on 2018/5/13.
 * 层级选择器，提供基础功能
 */

import Vue from 'vue'
import GradeEditorINT from './src/main'

GradeEditorINT.install = function() {
  Vue.component(GradeEditorINT.name, GradeEditorINT)
}

export default GradeEditorINT
