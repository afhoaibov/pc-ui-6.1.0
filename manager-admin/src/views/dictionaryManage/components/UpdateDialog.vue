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
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeEvent">关 闭</el-button>
      <el-button type="primary" @click="submitEvent">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'UpdateDialog',
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
        editForm: {},
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
            const obj = {}
            val.forEach(item => {
              obj[item.code] = ''
            })
            this.editForm = cloneObj(obj)
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
        const editForm = this.editForm
        const list = []
        for (let key in editForm) {
          if (key !== 'group_sn') {
            list.push({
              lang_code: key,
              lang: editForm[key]
            })
          }
        }
        if (!list.length || list.some(val => !val.lang)) {
          this.$message.error('请完善字典内容')
          return
        }
        this.$emit('submitEvent', list)
      }
    }
  }
</script>
