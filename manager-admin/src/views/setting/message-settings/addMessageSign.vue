<template>
  <div class="sign-wrap">
    <div class="table-tips-wrap">
      <div class="tips-box">
        <h4>审核规则</h4>
        <ul>
          <li>审核时长：一般2小时内完成，近期平均完成审核时长约1小时，如遇升级核验、审核任务较多时、非工作时间，审核时间可能延长，请耐心等待。</li>
          <li>审核工作时间：周一至周日9:00-21:00（法定节假日顺延）</li>
        </ul>
      </div>
    </div>
    <div class="form-content">
      <el-form
        class="sign-form"
        ref="signForm"
        :model="signForm"
        label-width="100px"
        label-position="left"
        :rules="signFormRules">
        <el-form-item label="签名：" prop="sign_name">
          <el-input
            size="medium"
            v-model="signForm.sign_name"
            clearable
            placeholder="长度限2-20个字符，建议为用户真实应用名/网站名/公司名"></el-input>
        </el-form-item>
        <el-form-item label="签名来源：" prop="sign_source">
          <div>
            <el-select clearable placeholder="请选择" v-model="signForm.sign_source">
              <el-option
                v-for="item of sourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <p slot="tip" class="el-upload__tip">
              <i class="el-icon-warning" style="color: #E6A23C"></i>
              签名来源选择工信部备案网站的全称或简称时，请在说明中添加网站域名，加快审核速度；如果选择APP应用的全称或简称或公众号或小程序的全称或简称，则网站、APP、小程序或公众号必须已上线；
            </p>
          </div>
        </el-form-item>
        <el-form-item label="证明文件：" prop="sign_file_url">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            :multiple="false"
            :file-list="fileList"
            :on-success="uploadSuccess"
            :on-change="uploadChange"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <p slot="tip" class="el-upload__tip">
              <i class="el-icon-warning" style="color: #E6A23C"></i>
              请上传签名归属方的企事业单位的企业营业执照、组织机构代码证、税务登记证三证合一等证件；
              若多个资料可拼接成一个文件，支持png、jpg、doc、docx、pdf格式
            </p>
          </el-upload>
        </el-form-item>
        <el-form-item label="场景说明：" maxlength="100" prop="remark">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 10}"
            placeholder="请描述您的业务使用场景，不超过100字符，如：验证码、双十一大促营销"
            :maxlength="100"
            v-model="signForm.remark"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div class="btn-box">
        <el-button
          type="primary"
          size="medium"
          @click="submitEvent"
          >保存</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  import * as API_Message from '@/api/message'

  export default {
    data() {
      return {
        // 校验规则
        signFormRules: {
          sign_name: [
            this.MixinRequired('请输入签名！'),
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
          ],
          sign_file_url: this.MixinRequired('请上传证明文件！'),
          sign_source: { required: true, message: '请选择签名来源！', trigger: 'change' },
          remark: [
            this.MixinRequired('请输入场景说明！'),
            { max: 100, message: '内容长度不得超过100个字符', trigger: 'blur' }
          ]
        },
        signForm: {},
        // 来源选项
        sourceOptions: [
          { label: '企事业单位的全称或简称', value: 0 },
          { label: '工信部备案网站的全称或简称', value: 1 },
          { label: 'App应用的全称或简称', value: 2 },
          { label: '公众号或小程序的全称或简称', value: 3 },
          { label: '电商平台店铺名的全称或简称', value: 4 },
          { label: '商标名的全称或简称', value: 5 }
        ],
        // 短信网关应用id
        pluginId: '',
        // 当前编辑签名id
        activeId: '',
        // 是否为编辑
        isEdit: false,
        fileList: []
      }
    },
    watch: {
      $route: {
        handler(val) {
          if ((val.name === 'addMessageSign' || val.name === 'editMessageSign') && val.params.pluginId) {
            this.pluginId = val.params.pluginId
            if (val.params.id) {
              this.activeId = val.params.id
              this.isEdit = val.name === 'editMessageSign'
              this.getSmsSignInfo()
            }
          }
        },
        immediate: true
      }
    },
    methods: {
      uploadSuccess(res) {
        this.signForm.sign_file_url = res.url
      },

      uploadChange(file, fileList) {
        // 上传覆盖，仅保留一条上传数据
        if (fileList.length > 1) {
          fileList.splice(0, 1)
        }
      },
      /** 获取签名详情 */
      getSmsSignInfo() {
        API_Message.getSmsSignInfo(this.pluginId, this.activeId).then(res => {
          this.signForm = {
            sign_name: res.sign_name,
            sign_file_url: res.sign_file_url,
            sign_source: res.sign_source,
            remark: res.remark
          }
          const fileName = res.sign_file_url.split('/')
          this.fileList = [{ name: fileName[fileName.length - 1], url: res.sign_file_url }]
        })
      },
      /** 新增编辑提交 */
      submitEvent() {
        this.$refs.signForm.validate((valid) => {
          if (valid) {
            const { activeId, signForm, pluginId, isEdit } = this
            signForm.sign_id = activeId
            API_Message[isEdit ? 'editSmsSign' : 'addSmsSign'](pluginId, signForm).then(res => {
              this.$message.success(isEdit ? '修改成功！' : '新增成功！')
              this.$store.dispatch('delVisitedViews', this.$route)
              this.$router.push({ name: 'textMessage' })
            })
          }
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
.sign-wrap {
  .form-content {
    background: #fff;
    padding: 40px 20px;
    width: 100%;
    .btn-box {
      width: 60%;
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }
  }
  .sign-form {
    width: 60%;
  }
}
</style>
