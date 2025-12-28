<template>
  <div class="container">
    <div class="table-tips-wrap">
      <div class="tips-box">
        <template v-if="uploadTemplateUrl">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          <span v-if="fileType === 'excel'">请根据excel模板 <a :href="`${MixinApi.seller}${this.uploadTemplateUrl}`">[点击此处下载模板]</a> 填写信息，导入的excel大小限制为2M</span>
          <span v-else>请根据模板<a :href="`${MixinApi.seller}${this.uploadTemplateUrl}`">[点击此处下载模板]</a>导入图片压缩包，导入的zip大小限制为10M</span>
        </template>
        <slot name="customizeTips"></slot>
      </div>
    </div>
    <div class="data-import-form">
      <el-form :model="importForm" :rules="importRules" ref="importForm" label-position="right" label-width="150px">
        <!--商品文件上传-->
        <el-form-item label="商品文件上传：" prop="file_name">
          <el-upload
            class="upload-demo"
            :disabled="uploadMsg.task_status === 'processing'"
            ref="upload"
            :accept="accept"
            :headers="MixinAccessToken"
            :action="uploadAction"
            :data="importForm"
            :multiple="false"
            :limit="1"
            :auto-upload="false"
            :on-change="handleChange"
            :on-success="handleSuccess"
            :on-error="handleError">
            <el-button
              slot="trigger"
              size="small"
              type="primary"
              :disabled="uploadMsg.task_status === 'processing'">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传{{fileType}}文件，大小限制为{{bigSize}}M</div>
          </el-upload>
          <div class="upload-status" v-if="uploadMsg.task_status === 'processing'">
            <i class="el-icon-loading" />
            {{uploadMsg.message}}
          </div>
          <div class="upload-status" v-if="uploadMsg.task_status === 'success'">
            <i class="el-icon-success" style="color: #67C23A;"  />
            {{uploadMsg.message || '导入成功'}}
          </div>
          <div class="upload-status" v-if="uploadMsg.task_status === 'error'">
            <p> <i class="el-icon-error" style="color: #F56C6C;" />上传失败，请修改以下错误项后重试</p>
            <el-card class="box-card" shadow="hover">
              <p v-for="item in errorList" :key="item">
                {{item}}
              </p>
              <div class="err-btn-box" v-if="errorList.length !== uploadMsg.error_list.length">
                <el-button @click="onErrorLoad">查看更多</el-button>
              </div>
            </el-card>
          </div>
        </el-form-item>
        <el-form-item style="text-align: left">
          <el-button
            v-if="disabledImportBtn"
            type="primary"
            @click="submitForm('importForm')">导入</el-button>

          <el-button
            v-show="!disabledImportBtn"
            type="primary"
            :disabled="!this.taskId"
            @click="getImportStatus">刷新状态</el-button>
          <el-button
            v-show="!disabledImportBtn"
            type="primary"
            :disabled="!this.taskId"
            @click="terminationImportsTask">终止导入</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import * as API_goods from '@/api/goods'
import Storage from '@/utils/storage'
import { throttle } from '@/utils/index'

export default {
  name: 'ImportItem',
  props: {
    /** 上传限制文件类型 */
    accept: {
      type: String,
      default: '.xlsx,.xls'
    },
    /** 上传api */
    uploadAction: {
      type: String,
      default: ''
    },
    /** 文件最大限制 M */
    bigSize: {
      type: Number,
      default: 2
    },
    /** 上传文件类型 */
    fileType: {
      type: String,
      default: 'excel'
    },
    /** 当前导入类型  */
    importType: {
      type: String,
      default: ''
    },
    /** 导入模板 */
    uploadTemplateUrl: {
      type: String
    }
  },

  data() {
    const checkType = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error('文件不能为空'))
      } else if (this.fileType === 'excel' && value.substring(value.lastIndexOf('.') + 1) !== 'xls' && value.substring(value.lastIndexOf('.') + 1) !== 'xlsx') {
        callback(new Error('文件格式只能是excel'))
      } else if (this.fileType === 'zip' && value.substring(value.lastIndexOf('.') + 1) !== 'zip') {
        callback(new Error('文件格式只能是zip'))
      } else {
        callback()
      }
    }
    return {
      // api,
      /** 导入参数  */
      importForm: {
        // file_name做校验用，提交时不需要
        file_name: ''
      },
      // 1kb = 1024字节
      bits: 1024,
      importRules: {
        file_name: [
          { required: true, message: '请选择文件', trigger: 'blur' },
          { validator: checkType, trigger: 'blur' }
        ]
      },
      // socket 推送消息
      uploadMsg: {},
      // 错误消息分页展示
      errorListLength: 10,
      // 当前执行任务id
      taskId: '',
      statusTimer: 0
    }
  },
  computed: {
    /** 是否显示导入按钮 */
    disabledImportBtn() {
      const uploadMsg = this.uploadMsg
      return !Object.keys(uploadMsg).length || uploadMsg.task_status !== 'processing'
    },
    /** 错误信息提示 */
    errorList() {
      const error_list = this.uploadMsg.error_list
      const errorListLength = this.errorListLength
      if (error_list.length <= errorListLength) {
        return error_list
      } else {
        return error_list.slice(0, errorListLength)
      }
    }
  },
  mounted() {
    const importType = this.importType
    const taskId = Storage.getItem(`${importType}TaskId`)
    if (taskId) {
      this.taskId = taskId
      // 查询当前导入类型是否有正在执行任务
      this.getImportStatus()
    }
  },
  methods: {
    /** 终止导入任务 */
    terminationImportsTask() {
      API_goods.terminationImportsTask({ task_id: this.taskId }).then(res => {
        Storage.removeItem(`${this.importType}TaskId`)
        this.$refs.upload.clearFiles()
        this.uploadMsg = {}
        clearTimeout(this.statusTimer)
      })
    },
    /** 错误信息分页 */
    onErrorLoad() {
      this.errorListLength = this.errorListLength + 10
    },

    /** 导入模板下载 */
    // uploadTemplate() {
    //   this.$http({
    //     method: 'get',
    //     url: `${api.seller}${this.uploadTemplateUrl}`,
    //     headers: this.headers,
    //     responseType: 'blob' }).then((res) => {
    //     const templateNameConfig = {
    //       'skuImport': 'SKU',
    //       'spuImport': 'SPU',
    //       'parameterImport': '参数',
    //       'goodsImageImport': '图片',
    //       'goodsInfoImport': '详情'
    //     }
    //     const routeName = this.$route.name
    //     // 后缀获取
    //     const suffix = this.uploadTemplateUrl.split('.')[1]
    //     let url = window.URL.createObjectURL(res.data)
    //     let link = document.createElement('a')
    //     link.style.display = 'none'
    //     link.href = url
    //     link.setAttribute('id', 'downloadLink')

    //     link.setAttribute('download', `${templateNameConfig[routeName]}导入模板.${suffix}`)
    //     document.body.appendChild(link)
    //     link.click()

    //     // 删除添加的a链接
    //     let objLink = document.getElementById('downloadLink')
    //     document.body.removeChild(objLink)
    //   })
    // },

    /** 查询导入状态 */
    getImportStatus() {
      clearTimeout(this.statusTimer)
      API_goods.goodsImportsStatus({ task_id: this.taskId }).then(res => {
        const task_status = res.task_status
        this.uploadMsg = res
        if (task_status === 'error' || task_status === 'success') {
          Storage.removeItem(`${this.importType}TaskId`)
          this.$refs.upload.clearFiles()
          clearTimeout(this.statusTimer)
        } else {
          return Promise.reject()
        }
      }).catch(() => {
        this.statusTimer = setTimeout(this.getImportStatus, 2000)
      })
    },

    // 文件改变时
    handleChange(file) {
      if (file.status === 'ready') {
        this.uploadMsg = {}
      }
      this.importForm.file_name = file.name
      // 获取文件后缀
      const suffix = file.name.substring(file.name.lastIndexOf('.') + 1)
      // 计算大小，单位:kb
      const size = Math.ceil(file.size / this.bits)
      const bigSize = Math.ceil(this.bits * this.bigSize)
      if ((size > bigSize)) {
        this.$message.error('超出大小限制,excel大小限制为2M，zip大小限制为10M')
        // 文件超出限制移除
        this.$refs.upload.clearFiles()
        return false
      }
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // file_name做校验用，提交时不需要
          delete this.importForm.file_name
          this.$refs.upload.submit()
          setTimeout(this.getImportStatus, 1000)
        } else {
          this.$message.error('表单提交有误！')
          return false
        }
      })
    },

    handleError(err) {
      const detail = JSON.parse(err.message)
      this.$message.error(detail.message)
    },

    // 上传成功回调
    handleSuccess(e) {
      if (e.task_id) {
        Storage.setItem(`${this.importType}TaskId`, e.task_id)
        this.taskId = e.task_id
        this.uploadMsg = {
          task_status: 'processing',
          message: '准备开始导入...'
        }
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.statusTimer)
  }
}
</script>

<style type="text/scss" lang="scss"  scoped>
.container ::v-deep .el-upload-list__item-status-label {
  display: none !important;
}
.container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #e9eef3;
}
.data-import-form {
  background: #fff;
  border: 1px solid #FAFAFA;
  padding: 25px;
  ::v-deep {
    .el-upload-list {
      width: 20%;
    }
  }

}
.upload-status {
  color: #606266;
}
.box-card {
  font-size: 14px;
  color: #606266;
  max-height: 600px;
  width: 60%;
  overflow: scroll;
  .err-btn-box {
    display: flex;
    justify-content: center;
  }
}

</style>
