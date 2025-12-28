<template>
  <div class="system-settings-site">
    <el-form :model="siteForm" :rules="siteRules" ref="siteForm" label-width="130px" v-loading="loading" style="width: 500px">
      <el-form-item label="网站名称" prop="site_name">
        <el-input v-model="siteForm.site_name"></el-input>
      </el-form-item>
      <el-form-item label="网站标题" prop="title">
        <el-input v-model="siteForm.title"></el-input>
      </el-form-item>
      <el-form-item label="网站描述" prop="descript">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入网站描述"
          v-model="siteForm.descript"
          :maxlength="200"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="站点是否开启" prop="siteon">
        <el-radio v-model="siteForm.siteon" :label="1">开启</el-radio>
        <el-radio v-model="siteForm.siteon" :label="0">关闭</el-radio>
      </el-form-item>
      <el-form-item v-if="siteForm.siteon === 0" label="关闭原因" prop="close_reson">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入关闭原因"
          v-model="siteForm.close_reson"
          :maxlength="100"
        >
        </el-input>
      </el-form-item>

      <el-form-item label="网站LOGO" prop="logo">
        <el-upload
          class="site-logo"
          :action="MixinUploadApi"
          :headers="MixinAccessToken"
          :show-file-list="false"
          :on-success="(res) => { siteForm.logo = res.url }"
          :on-error="handleUploadError"
          :multiple="false">
          <img v-if="siteForm.logo" :src="siteForm.logo" class="site-logo-img">
          <i v-else class="el-icon-plus logo-uploader-icon"></i>
          <div class="el-upload__tip" slot="tip">只能上传jpg/jpeg/png文件，推荐尺寸为240*60</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="平台端icon" prop="admin_icon">
        <el-upload
          class="site-logo"
          :action="MixinUploadApi"
          :headers="MixinAccessToken"
          :show-file-list="false"
          :on-success="(res) => { siteForm.admin_icon = res.url }"
          :on-error="handleUploadError"
          :multiple="false">
          <img v-if="siteForm.admin_icon" :src="siteForm.admin_icon" class="site-logo-img">
          <i v-else class="el-icon-plus logo-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="商家端icon" prop="seller_icon">
        <el-upload
          class="site-logo"
          :action="MixinUploadApi"
          :headers="MixinAccessToken"
          :show-file-list="false"
          :on-success="(res) => { siteForm.seller_icon = res.url }"
          :on-error="handleUploadError"
          :multiple="false">
          <img v-if="siteForm.seller_icon" :src="siteForm.seller_icon" class="site-logo-img">
          <i v-else class="el-icon-plus logo-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="会员端icon" prop="buyer_icon">
        <el-upload
          class="site-logo"
          :action="MixinUploadApi"
          :headers="MixinAccessToken"
          :show-file-list="false"
          :on-success="(res) => { siteForm.buyer_icon = res.url }"
          :on-error="handleUploadError"
          :multiple="false">
          <img v-if="siteForm.buyer_icon" :src="siteForm.buyer_icon" class="site-logo-img">
          <i v-else class="el-icon-plus logo-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="备案号" prop="record">
        <el-input v-model="siteForm.record"></el-input>
      </el-form-item>
      <el-form-item label="友情链接" prop="link">
        <el-input v-model="siteForm.link"></el-input>
      </el-form-item>
      <el-form-item label="测试模式" prop="test_mode">
        <el-radio v-model="siteForm.test_mode" :label="1">开启</el-radio>
        <el-radio v-model="siteForm.test_mode" :label="0">关闭</el-radio>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="$refs['authRef'].open()">保存设置</el-button>
      </el-form-item>
    </el-form>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="submitForm"/>
  </div>
</template>

<script>
import * as API_SystemSetting from '@/api/systemSetting'

export default {
  name: 'SystemSettingsSite',
  props: ['message_auth', 'password_auth'],
  data() {
    return {
      loading: true,
      /** 站点设置 */
      siteForm: {},
      siteRules: {
        site_name: [this.MixinRequired('网站名称不能为空！')],
        title: [this.MixinRequired('网站标题不能为空！')],
        close_reson: [{ required: false, message: '请填写关闭原因！', trigger: 'blur' }],
        descript: [this.MixinRequired('网站描述不能为空！')],
        logo: [this.MixinRequired('请上传网站LOGO！')],
        admin_icon: [this.MixinRequired('请上传平台端icon！')],
        seller_icon: [this.MixinRequired('请上传商家端icon！')],
        buyer_icon: [this.MixinRequired('请上传会员端icon！')],
        siteon: [{ required: true, message: '请选择站点状态！', trigger: 'change' }],
        test_mode: [{ required: true, message: '请选择站点模式！', trigger: 'change' }]
      }
    }
  },
  async created() {
    API_SystemSetting.getSiteSetting().then(response => {
      this.loading = false
      this.siteForm = response
    }).catch(() => { this.loading = false })
  },
  watch: {
    'siteForm.siteon': function(newVal) {
      this.siteRules.close_reson[0].required = newVal === 0
    }
  },
  methods: {
    /** 上传图片失败 */
    handleUploadError(res) {
      const _res = JSON.parse(res.message)
      return this.$message.error(_res.message)
    },

    submitForm() {
      this.$refs['siteForm'].validate((valid) => {
        if (valid) {
          const params = this.MixinClone(this.siteForm)
          API_SystemSetting.editSiteSetting(params).then(() => {
            this.$message.success('修改成功！')
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.container {
  background-color: #fff;
  padding: 10px;
  position: relative;
}
.site-tag {
  margin: 0 3px;
}
.site-new-tag-input {
  width: 100px;
}
.system-settings-site ::v-deep .site-logo .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  &:hover {
    border-color: #409EFF;
  }
}
.logo-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.site-logo-img {
  width: 120px;
  height: 120px;
  display: block;
}

.image-pane .el-input-group {
  width: 200px;
}
.point-pane .el-input-group {
  width: 200px;
}
</style>
