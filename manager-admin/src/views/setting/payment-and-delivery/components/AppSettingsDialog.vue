<template>
  <div>
    <el-dialog
      :title="appItem.app_name"
      :visible.sync="dialogPaymentVisible"
      width="40%"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeDialog">
      <div class="wechat-tips" v-if="appItem.platform_id == 2">
        填写公众号参数，以便H5商城在微信内调用微信支付、微信提现、授权登录、微信分享等能力；
      </div>
      <el-form
        label-width="140px"
        label-position="left">
        <el-form-item
          v-for="(client, index) in configList"
          :key="client.name"
          :label="client.label"
          :prop="client.name">
          <desensitization-input
            v-if="client.name === 'app_secret' &&  client.type == 'textarea'"
            v-model="client.value"
            @change="(e) => changeInput(e, index)" />
          <el-upload
            v-if="client.type == 'file'"
            :action="MixinUploadStreamApi"
            :headers="MixinAccessToken"
            list-type="picture"
            :on-success="(res)=>{uploadSuccess(client.name,res)}"
            :on-remove="()=>{delFile(client.name)}"
            :file-list="fileList"
            :multiple="false"
            :limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div v-if="client.value" slot="tip" class="el-upload__tip">
              <span style="color: red;margin-right: 10px">文件已上传，再次上传会覆盖</span>
              <el-button size="small" type="text" @click="getAuthSetting(client.value)">点击下载</el-button>
            </div>
          </el-upload>
          <el-input
            v-else
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4}"
            v-model="client.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
     <el-button @click="closeDialog">取 消</el-button>
     <el-button type="primary" @click="submitForm()">确 定</el-button>
   </span>
    </el-dialog>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="downLoadFile"/>
  </div>
</template>

<script>
  import * as API_Payment from '@/api/payment'
  import { api as API } from '~/ui-domain'
  import Storage from '@/utils/storage'

  export default {
    name: 'AppSettingsDialog',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      appItem: {
        type: Object,
        default: {}
      }
    },

    data() {
      return {
        fileList: [],
        /** 表单配置项 */
        configList: [],
        /** dialog */
        dialogPaymentVisible: this.value
      }
    },

    watch: {
      $route: {
        handler(val) {
          if (val.name === 'paymentEdit') {
            const id = val.query.id
            this.configList = []
            if (id) {
              this.getThirdPlatform(id)
            }
          }
        }
      },
      value(val) {
        this.dialogPaymentVisible = val
      },
      appItem: {
        handler(val) {
          if (val) {
            const configList = val.config_json ? JSON.parse(val.config_json) : []
            if (configList.length) {
              this.configList = configList
            }
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      changeInput(e, index) {
        this.$set(this.configList[index], 'value', e)
      },
      /** 配置文件下载 */
      downLoadFile() {
        const id = this.downloadId
        console.warn(id)
        this.$http({
          method: 'get',
          url: `${API.admin}/admin/uploaders/download/${id}`,
          headers: this.MixinAccessToken,
          responseType: 'blob'
        }).then((res) => {
          let filename = ''
          // 获取文件名称
          const temp = res.headers['content-disposition']
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          const matches = filenameRegex.exec(temp)
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '')
            console.log(filename)
          }
          let url = window.URL.createObjectURL(res.data)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', filename)
          document.body.appendChild(link)
          link.click()
          // 删除添加的a链接
          let objLink = document.getElementById('downloadLink')
          document.body.removeChild(objLink)
        })
      },
      /** 关闭弹窗 */
      closeDialog() {
        this.$emit('closeDialog')
      },
      /** 文件上传成功 */
      uploadSuccess(name, res) {
        this.configList.map(item => {
          if (item.name === name) {
            item.value = res.id
          }
        })
      },
      /** 获取二次鉴权设置 */
      getAuthSetting(id) {
        this.downloadId = id
        this.$refs['authRef'].open()
      },
      /** 文件移除之后 */
      delFile(name) {
        this.configList.map(item => {
          if (item.name === name) {
            item.value = ''
          }
        })
      },
      /** 获取收款方式详情 */
      getThirdPlatform(id) {
        API_Payment.getThirdPlatform(id).then(res => {
          const configList = res.config_json ? JSON.parse(res.config_json) : []
          this.pluginItem = res
          if (configList.length) {
            this.configList = configList
          }
        })
      },
      /** 提交修改支付方式表单 */
      submitForm(formName) {
        const { configList } = this
        const id = this.appItem.id
        if (configList.some(v => !v.value)) {
          this.$message.error('请完善表单内容')
          return
        }
        API_Payment.editThirdAppPlatform(id, configList).then(response => {
          this.dialogPaymentVisible = false
          this.$message.success('保存成功！')
          this.$emit('submitSuccess')
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .wechat-tips{
    margin: 10px 0;
    background: #ecf5ff;
    border: 1px solid #c6e2ff;
    font-size: 14px;
    padding: 30px 10px;
  }
</style>
