<template>
  <div class="sign-wrap">
    <div class="table-tips-wrap">
      <div class="tips-box">
        <h4>审核规则</h4>
        <ul>
          <li>模板编码：短信模板编码需先在程序中设置好才可使用</li>
          <li>审核时长：一般2小时内完成，近期平均完成审核时长约1小时，如遇升级核验、审核任务较多时、非工作时间，审核时间可能延长，请耐心等待。</li>
          <li>审核工作时间：周一至周日9:00-21:00（法定节假日顺延）</li>
        </ul>
      </div>
    </div>
    <div class="form-content">
      <div class="form-box">
        <el-form
          class="sign-form"
          ref="tmpForm"
          :model="tmpForm"
          label-width="100px"
          label-position="left"
          :rules="tmpFormRules">
          <el-form-item label="模板名称：" prop="template_name">
            <el-input
              size="medium"
              v-model="tmpForm.template_name"
              clearable
              maxlength="30"
              placeholder="请输入名称，不能超过30个字符"></el-input>
          </el-form-item>
          <el-form-item label="模板内容：" maxlength="100" prop="template_content">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3}"
              :maxlength="100"
              v-model="tmpForm.template_content"
              clearable></el-input>
          </el-form-item>
          <el-form-item label="场景说明：" maxlength="100" prop="remark">
            <div>
              <p slot="tip" class="el-upload__tip">
                <i class="el-icon-warning" style="color: #E6A23C"></i>
                变量限制：仅支持1个验证码作为变量；4-6位汉数字、数字+字母组合或仅字母2种类型。
                <br />
                变量格式：${code};例如：您的验证码为${code}，该验证码5分钟内有效，请勿泄露于他人。
              </p>
              <el-input
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 10}"
                placeholder="模板使用场景、事例等说明，登录验证码场景可提供登录链接、测试账号"
                :maxlength="100"
                v-model="tmpForm.remark"
                clearable></el-input>
            </div>
          </el-form-item>
        </el-form>
        <div class="iphone-bg-box">
          <div class="bubble-box">【{{tmpForm.sign_name || '签名'}}】{{tmpForm.template_content}}</div>
          <p class="bubble-tips">计费说明：当前{{contentLength}}字，预计发送条数为1条（实际发送时，签名、变量长度会影响总字数）</p>
        </div>
      </div>

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
        tmpFormRules: {
          template_name: [
            this.MixinRequired('请填写模板名称！'),
            { max: 30, message: '长度在 30 个字符内', trigger: 'blur' }
          ],
          template_content: this.MixinRequired('请填写模板内容！'),
          remark: this.MixinRequired('请填写场景说明！')
        },
        tmpForm: {
          template_content: '您的验证码为${code}'
        },
        // 当前新增模板类型
        templateType: '',
        // 短信网关应用id
        pluginId: '',
        // 当前编辑id
        activeId: '',
        // 是否为编辑
        isEdit: false
      }
    },
    computed: {
      contentLength() {
        let length = 0
        if (this.tmpForm.sign_name) {
          length += this.tmpForm.sign_name.length
        }
        if (this.tmpForm.template_content) {
          length += this.tmpForm.template_content.length
        }
        return length
      }
    },
    watch: {
      $route: {
        handler(val) {
          if ((val.name === 'addMessageTemplate' || val.name === 'addTemplateAudit') && val.params.pluginId) {
            this.pluginId = val.params.pluginId
            this.templateType = val.params.templateType
            if (val.params.id) {
              this.activeId = val.params.id
              this.isEdit = val.name === 'addTemplateAudit'
              this.getTmpInfo()
            }
          }
        },
        immediate: true
      }
    },
    methods: {
      /** 获取模板详情 */
      getTmpInfo() {
        API_Message.getTemplateInfo(this.activeId).then(res => {
          this.tmpForm = {
            remark: res.remark,
            template_name: res.template_name,
            template_content: res.template_content
          }
        })
      },

      submitEvent() {
        this.$refs.tmpForm.validate((valid) => {
          if (valid) {
            const { tmpForm, templateType, isEdit } = this
            const typeCommon = {
              PROMOTE: 2, // 营销类
              NOTIFICATION: 1, // 通知
              CODE: 0, // 验证码
              IN18N: 3 // 国际消息
            }
            tmpForm.template_type = typeCommon[templateType]

            API_Message[isEdit ? 'addSmsTemplateAudit' : 'addSmsTemplate'](this.pluginId, tmpForm, this.activeId).then(res => {
              this.$message.success('新增成功！')
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
  ::v-deep .el-input__inner {
    width: 400px;
  }
  ::v-deep .el-textarea__inner {
    width: 400px;
  }
  .form-content {
    background: #fff;
    padding: 40px 20px;
    width: 100%;
    .form-box {
      width: 80%;
      display: flex;
      justify-content: space-between;
      .iphone-bg-box {
        width: 240px;
        height: 500px;
        padding: 100px 30px;
        position: relative;
        background-image: url('../../../assets/images/iphone-bg.png');
        background-size: 240px auto;
        background-position: 0 center;
        background-repeat: no-repeat;
        .bubble-tips {
          color: #666;
          font-size: 12px;
        }
        .bubble-box {
          background: #efefef;
          position: relative;
          border: 2px solid #efefef;
          border-radius: 5px;
          min-height: 60px;
          display: flex;
          align-items: center;
          text-align: center;
          color: #333;
          font-size: 14px;
        }

        .bubble-box::before {
          content: " ";
          position: absolute;
          right: 100%;
          top: 50%;
          margin: -5px 0 0;
          border: 10px solid transparent;
          border-right-color: #efefef;
        }

        .bubble-box::after {
          content: " ";
          position: absolute;
          right: 100%;
          top: 50%;
          margin-top: -2px;
          border: 7px solid transparent;
          border-right-color: #efefef;
        }
      }
    }
    .btn-box {
      width: 50%;
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
