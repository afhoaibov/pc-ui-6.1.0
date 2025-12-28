<template>
  <div id="my-profile">
    <div class="member-nav">
      <ul class="member-nav-list">
        <li class="active">
          <router-link to="/member/my-profile" style="color:#f42424;">个人信息</router-link>
        </li>
      </ul>
    </div>
    <div class="profile-container">
      <div class="avatar-box">
        <el-upload
          :action="MixinUploadApi"
          :headers="MixinAccessToken"
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFaceChange"
          :on-success="(res) => { profileForm.face = res.url }"
        >
          <img v-if="profileForm.face" :src="profileForm.face" class="avatar">
          <img v-else src="../../assets/images/icon-noface.jpg" title="求真相" class="avatar">
          <div class="eidt-mask">
            <i class="el-icon-edit-outline"></i>
            <p>修改头像</p>
          </div>
        </el-upload>
        <p>建议上传jpg、jpeg、png格式的1:1正方形图片</p>
        <p>头像修改在保存后生效</p>
      </div>
      <el-form :model="profileForm" ref="profileForm" :rules="addressRules" label-width="100px" style="width:350px">
        <el-form-item label="用户名" prop="uname">
          <span>{{ profileForm.uname }}</span>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio v-model="profileForm.sex" :label="1">男</el-radio>
          <el-radio v-model="profileForm.sex" :label="0">女</el-radio>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="profileForm.birthday"
            type="date"
            placeholder="请选择生日"
            :editable="false"
            :picker-options="{disabledDate(time) { return (time.getTime() > Date.now() || time.getTime() < -2208988800000) }}"
            size="small"
            clearable
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="所在地区" prop="profile_region" required>
          <en-region-picker ref="regionPickerRef" :api="MixinRegionApi" :default="defaultRegion" @changed="handleRegionChanged('profile', $event)"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="profileForm.address" placeholder="最多50个字符" maxlength="50" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button @click="submitProfile">保存资料</el-button>
        </el-form-item>
      </el-form>
      <span class="clr"></span>
    </div>
    <el-dialog
      title="修改头像"
      :visible.sync="dialogFaceVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="432px"
      class="edit-face-dialog"
    >
      <vueCropper
        ref="cropper"
        :img="cropperImg"
        :fixed="true"
        :autoCrop="true"
        :autoCropWidth="200"
        :autoCropHeight="200"
        :centerBox="true"
        :info="false"
        outputType="png"
      ></vueCropper>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFaceVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="handleCropperCrop">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import VueCropper from 'vue-cropper'
import request from '@/utils/request'
import { DatePicker, Upload, Dialog } from 'element-ui'
import { cloneObj } from '@/utils'

Vue.use(VueCropper)
Vue.use(DatePicker).use(Upload).use(Dialog)

export default {
  name: 'my-profile',
  head() {
    return {
      title: `个人信息-${this.site.title}`
    }
  },
  data() {
    const user = this.$store.state.user.user
    return {
      /** 地区 */
      regions: {},
      /** 个人资料 表单 */
      profileForm: user ? JSON.parse(JSON.stringify(user)) : {},
      // 修改头像dialog
      dialogFaceVisible: false,
      // 裁剪图片地址
      cropperImg: '',
      addressRules: {
        profile_region: [this.MixinRequired('请选择所在地区！', 'change')]
      },
    }
  },
  watch: {
    user(newVal, oldVal) {
      this.profileForm = newVal ? JSON.parse(JSON.stringify(newVal)) : {}
    }
  },
  computed: {
    /** 默认地址 */
    defaultRegion() {
      const { user } = this.$store.state.user
      if (!user) return null
      return this.MixinGetRegionDefaultData(user)
    },
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    /** 头像文件发生改变 */
    handleFaceChange(file) {
      const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/jpg' || file.raw.type === 'image/png'
      if (!isImage) {
        this.$message.error('上传头像图片只能是 JPG、JPEG或PNG格式!')
        return
      }
      this.dialogFaceVisible = true
      // 下边的图片预览代码轻易不要动，谢谢
      const _this = this
      let reader = new FileReader()
      // 转base64
      reader.onload = function(e) {
        _this.cropperImg = e.target.result // 将图片路径赋值给src
      }
      reader.readAsDataURL(file.raw)
    },
    /** 裁剪头像 */
    handleCropperCrop() {
      this.$refs.cropper.getCropData(async data => {
        const formData = new FormData()
        formData.append('file', this.MixinBase64toBlob(data))
        this.handleUploadFace(formData)
      })
    },
    /** 上传文件 */
    handleUploadFace(formData) {
      request({
        url: this.MixinUploadApi,
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...this.MixinAccessToken
        }
      }).then(response => {
        this.profileForm.face = response.url
        this.dialogFaceVisible = false
        this.$message.success('上传成功，保存后生效！')
      })
    },
    /** 保存资料提交表单 */
    submitProfile() {
      this.$refs['profileForm'].validate((valid) => {
        if (valid) {
          const params = cloneObj(this.profileForm)
          params.region = JSON.stringify(this.$refs.regionPickerRef.regionData)
          params.birthday /= 1000
          this.saveUserInfo(params).then(() => {
            this.$message.success('修改成功！')
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    handleRegionChanged(type, object) {
      const key = `${type}_region`
      this.$set(this.profileForm, key, JSON.stringify(object))
      this.$refs.profileForm.validateField(key)
    },
    ...mapActions({
      saveUserInfo: 'user/saveUserInfoAction'
    })
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding-top: 15px;
  .avatar-box {
    float: left;
    position: relative;
    margin-left: 20px;
    margin-right: 50px;
    p {
      text-align: center
    }
    .eidt-mask {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 20;
      background-color: rgba(0, 0, 0, .3);
      opacity: 0;
      transition: opacity .2s ease-in;
      color: #f5f7fa;
      i {
        font-size: 24px
      }
      p {
        font-size: 14px
      }
    }
    &:hover {
      .eidt-mask {
        opacity: 1
      }
    }
    .avatar-uploader {
      display: flex;
      justify-content: center;
      ::v-deep .el-upload {
        border: 1px dashed #d9d9d9;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        border-radius: 100%;
        :hover {
          border-color: #409EFF
        }
      }
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 135px;
      height: 135px;
      line-height: 135px;
      text-align: center;
    }
    .avatar {
      width: 135px;
      height: 135px;
      display: block;
    }
  }
  ::v-deep .el-form {
    float: left
  }
  ::v-deep .el-date-editor.el-input {
    width: 100%
  }
}
// TODO
::v-deep .edit-face-dialog {
  .el-dialog__header {
    padding: 10px 10px 0 10px;
  }
  .el-dialog__body {
    padding: 10px;
    height: 350px;
  }
  .el-dialog__footer {
    padding: 10px;
  }
}
</style>
