<template>
  <el-dialog
    title="数据导入"
    :visible.sync="importDialogVisible"
    width="500px"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="close"
  >
    <el-form
      :model="importForm"
      ref="importForm"
      size="small"
      :rules="importRules"
      label-width="120px"
    >
      <el-form-item prop="file_name" label="选择导入文件：" >
        <el-upload
          class="upload-demo"
          ref="upload"
          accept=".xlsx,.xls"
          :headers="MixinAccessToken"
          :action="uploadAction"
          :data="importForm"
          :multiple="false"
          :limit="1"
          :auto-upload="false"
          :on-change="handleChange"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-remove="handleRemove"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <div class="status-box">
      <div v-if="taskRes.task_status === 'processing'" class="upload-status">
        <i class="el-icon-loading" />
        {{ taskRes.message}}
      </div>
      <div v-if="taskRes.task_status === 'success'" class="upload-status">
        <i class="el-icon-success" style="color: #67C23A;"  />
        {{ taskRes.message || '导入成功' }}
      </div>
      <div v-if="taskRes.task_status === 'error'" class="upload-status">
        <p v-if="!taskRes.error_list || !taskRes.error_list.length">
          <i class="el-icon-error" style="color: #F56C6C;" />导入失败
        </p>
        <template v-else>
          <p><i class="el-icon-error" style="color: #F56C6C;" />导入失败，请修改以下错误项后重试</p>
          <div class="error-list">
            <p v-for="item in taskRes.error_list" :key="item">
              {{ item }}
            </p>
          </div>
        </template>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
      <el-button
        v-if="taskRes && taskRes.task_status === 'processing'"
        type="danger"
        @click="handleStop"
      >终 止</el-button>
      <el-button
        v-else
        type="primary"
        :disabled="!fileList.length"
        @click="importSubmitEvent"
      >导 入</el-button>
    </span>
  </el-dialog>
</template>
<script>
  import Storage from '@/utils/storage'
  import * as API_Task from '@/api/task'

  export default {
    name: 'ImportDialog',
    props: {
      value: {
        type: Boolean
      },
      // 导入api
      uploadAction: {
        type: String,
        default: ''
      },
      importType: {
        type: String
      }
    },
    data() {
      return {
        /** 导入弹窗显隐 */
        importDialogVisible: false,
        /** 导入表单 */
        importForm: {
          file_name: ''
        },
        importRules: {
          file_name: [
            { required: true, message: '请选择文件', trigger: 'blur' },
            { validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error('文件不能为空'))
              } else if (value.substring(value.lastIndexOf('.') + 1) !== 'xls' && value.substring(value.lastIndexOf('.') + 1) !== 'xlsx') {
                callback(new Error('文件格式只能是excel'))
              } else {
                callback()
              }
            }, trigger: 'blur' }
          ]
        },
        taskRes: '',
        taskId: '',
        statusTimer: 0,
        fileList: []
      }
    },
    watch: {
      value: {
        immediate: true,
        handler(newVal) {
          this.taskId = Storage.getItem(`${this.importType}TaskId`) || ''
          this.importDialogVisible = newVal
          if (newVal && this.taskId) {
            this.getImportStatus()
          }
        }
      }
    },
    methods: {
      close() {
        clearTimeout(this.statusTimer)
        this.taskId = ''
        this.taskRes = ''
        this.importForm.file_name = ''
        this.importDialogVisible = false
        this.$emit('close')
      },
      /** 导入错误 */
      handleError(err) {
        this.$refs.upload.clearFiles()
        const detail = JSON.parse(err.message)
        this.$message.error(detail.message)
      },
      /** 导入成功回调 */
      handleSuccess(res) {
        this.$refs.upload.clearFiles()
        this.taskId = res.task_id
        this.taskRes = { task_status: 'processing', message: '准备开始导入...' }
        Storage.setItem(`${this.importType}TaskId`, res.task_id)
        setTimeout(() => {
          this.getImportStatus()
        }, 1000)
      },

      /** 文件选择change */
      handleChange(file, fileList) {
        this.importForm.file_name = file.name
        const bits = 1024
        // 计算大小，单位:kb
        const size = Math.ceil(file.size / bits)
        const bigSize = Math.ceil(bits * 2)
        if (size > bigSize) {
          this.$message.error('超出大小限制,excel大小限制为2M')
          // 文件超出限制移除
          this.$refs.upload.clearFiles()
          return false
        }
        this.fileList = fileList
      },
      handleRemove(file, fileList) {
        this.fileList = fileList
      },
      /** 导入提交 */
      importSubmitEvent() {
        this.$refs.importForm.validate((valid) => {
          if (!valid) return this.$message.error('请选择文件！')
          this.$refs.upload.submit()
        })
      },
      handleStop() {
        API_Task.terminationImportsTask({ task_id: this.taskId }).then(res => {
          Storage.removeItem(`${this.importType}TaskId`)
          this.taskRes = {}
          clearTimeout(this.statusTimer)
        })
      },
      /** 查询导入状态 */
      getImportStatus() {
        clearTimeout(this.statusTimer)
        API_Task.goodsImportsStatus({ task_id: this.taskId }).then(res => {
          const task_status = res.task_status
          this.taskRes = res
          if (task_status === 'error' || task_status === 'success') {
            Storage.removeItem(`${this.importType}TaskId`)
            clearTimeout(this.statusTimer)
            if (task_status === 'success') {
              this.$emit('success')
              this.importDialogVisible = false
            }
          } else {
            return Promise.reject()
          }
        }).catch(() => {
          this.statusTimer = setTimeout(this.getImportStatus, 2000)
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
.upload-status {
  color: #606266;
}
.error-list {
  max-height: 200px;
  overflow: auto;
  border: 1px solid #EBEEF5;
  padding: 10px;
  border-radius: 5px;
}
</style>
