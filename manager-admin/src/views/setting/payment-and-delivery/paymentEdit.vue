<template>
  <div class="payment-edit-wrap">
    <ul class="wechat-tips " v-if="pluginItem.plugin_id === 'wechatPayPlugin'">
      <li>1. 完成微信商户平台注册后，在产品中心开通对应的产品，并将参数配置在下方</li>
      <li>2. ① JSAPI支付应用于微信内置浏览器和微信小程序；② APP支付应用于移动端APP；③ H5支付应用于除微信内置浏览器之外的浏览器；④ Native支付应用于PC浏览器</li>
      <li>3. PC端和H5端共用同一套参数</li>
    </ul>
    <el-form label-position="top">
      <el-form-item
        v-for="client in configList"
        :key="client.name"
        :label="client.label"
        :prop="client.name">

        <el-input v-if="client.type != 'file'"
          :type="client.type"
          :autosize="{ minRows: 1, maxRows: 10}"
          v-model="client.value"></el-input>

        <el-upload
          v-else
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

      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer" v-if="configList.length">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="submitPaymentForm()">确 定</el-button>
    </div>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="downLoadFile"/>
  </div>
</template>

<script>
import * as API_Payment from '@/api/payment'
import { api as API } from '~/ui-domain'
import Storage from '@/utils/storage'

export default {
  name: 'paymentEdit',
  data() {
    return {
      fileList: [],
      configList: [],
      headers: {
        Authorization: Storage.getItem('admin_access_token')
      },
      // 当前编辑表单数据
      pluginItem: {}
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
      },
      immediate: true
    }
  },

  methods: {
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

    /** 获取二次鉴权设置 */
    getAuthSetting(id) {
      this.downloadId = id
      this.$refs['authRef'].open()
    },
    /** 取消操作 */
    handleCancel() {
      this.$store.dispatch('delCurrentViews', {
        view: this.$route,
        $router: this.$router
      })
    },
    /** 配置文件下载 */
    downLoadFile() {
      const id = this.downloadId
      this.$http({
        method: 'get',
        url: `${API.admin}/admin/uploaders/download/${id}`,
        headers: this.headers,
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
    /** 文件上传成功 */
    uploadSuccess(name, res) {
      this.configList.map(item => {
        if (item.name === name) {
          item.value = res.id
        }
      })
    },
    /** 文件移除之后 */
    delFile(name) {
      this.configList.map(item => {
        if (item.name === name) {
          item.value = ''
        }
      })
    },

    /** 提交修改支付方式表单 */
    submitPaymentForm() {
      const { configList } = this
      const id = this.pluginItem.id
      if (configList.some(v => !v.value)) {
        this.$message.error('请完善表单内容')
        return
      }

      API_Payment.editThirdPlatform(id, configList).then(response => {
        this.$message.success('保存成功！')
        // this.handleCancel()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.payment-edit-wrap {
  background: #fff;
  padding: 30px 20px;
  .dialog-footer {
    margin-top: 40px;
  }
}
.wechat-tips{
  margin: 10px 0;
  background: #fff5eb;
  border: 1px solid #ffc999;
  font-size: 14px;
  padding: 14px 10px;
  li {
    line-height: 26px;
    List-style-type: none;
  }
}
</style>
