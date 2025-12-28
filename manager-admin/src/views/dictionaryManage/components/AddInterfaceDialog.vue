<template>
  <el-dialog
    :title="titleText"
    :visible.sync="show"
    width="500px"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="closeEvent">
    <el-form :model="editForm" ref="editForm" size="small" label-width="120px">
      <el-form-item
        v-for="item in tableHeader"
        :key="item.code"
        :prop="item.code"
        :label="item.lang" >
        <el-input v-model="editForm[item.code]"/>
      </el-form-item>
      <el-form-item
        prop="i18n_key"
        label="国际化KEY" >
        <el-input v-model="editForm.i18n_key"/>
      </el-form-item>
      <el-form-item
        prop="client_type"
        label="客户端类型" >
        <el-select
          v-model="editForm.client_type"
          placeholder="请选择">
          <el-option
            v-for="item in ClientTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item
        prop="ui_type"
        label="UI类型" >
        <el-select
          v-model="editForm.ui_type"
          placeholder="请选择">
          <el-option
            v-for="item in UiTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeEvent">关 闭</el-button>
      <el-button type="primary" @click="submitEvent">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { cloneObj } from '@/utils/index'
  const ClientTypeOptions = [
    { label: '管理端', value: 'admin' },
    { label: '商家端', value: 'seller' },
    { label: '买家PC端', value: 'buyer' },
    { label: '买家手机端', value: 'mobile' },
    { label: '装修端', value: 'decor' },
    { label: '公共', value: 'common' },
    { label: '后端', value: 'java' }
  ]
  const UiTypeOptions = [
    { label: 'ui', value: 'ui' },
    { label: 'java', value: 'java' },
    { label: 'layer', value: 'layer' },
    { label: 'router', value: 'router' },
    { label: 'title', value: 'title' },
    { label: 'tabbar', value: 'tabbar' }
  ]
  export default {
    name: 'AddInterfaceDialog',
    props: {
      title: {
        type: String,
        default: ''
      },
      value: {
        type: Boolean
      },
      // 表单编辑项
      tableHeader: {
        type: Array
      },
      // 编辑数据
      defaultData: {
        type: Object
      }
    },
    data() {
      return {
        ClientTypeOptions,
        UiTypeOptions,
        editForm: {
          i18n_key: '',
          ui_type: '',
          client_type: ''
        },
        show: false
      }
    },
    watch: {
      value: {
        handler(val) {
          this.show = val
          if (!val) {
            Object.keys(this.editForm).map(key => {
              this.editForm[key] = ''
            })
          }
        },
        immediate: true
      },
      tableHeader: {
        handler(val) {
          if (val && val.length) {
            const editForm = cloneObj(this.editForm)
            val.forEach(item => {
              editForm[item.code] = ''
            })
            this.editForm = editForm
          }
        },
        immediate: true
      },
      /** 编辑默认数据写入 */
      defaultData: {
        handler(val) {
          Object.keys(this.editForm).map(key => {
            if (val[key]) {
              this.editForm[key] = val[key]
            } else {
              this.editForm[key] = ''
            }
          })
        }
      }
    },
    computed: {
      titleText() {
        return this.title || '编辑'
      }
    },
    methods: {
      closeEvent() {
        this.$emit('close')
      },
      submitEvent() {
        const { editForm, tableHeader } = this
        if (Object.keys(editForm).some(val => !editForm[val])) {
          this.$message.error('请完善字典内容')
          return
        }
        const list = []
        tableHeader.forEach(item => {
          if (editForm[item.code]) {
            list.push({
              lang_code: item.code,
              lang: editForm[item.code]
            })
          }
        })
        const params = {
          ui_type: editForm.ui_type,
          i18n_key: editForm.i18n_key,
          client_type: editForm.client_type,
          languages: list
        }

        this.$emit('submitEvent', params)
      }
    }
  }
</script>
