<template>
  <div id="auth-info" class="item-container">
    <div class="content">
      <el-form
        :model="authInfoForm"
        :rules="authInfoRules"
        ref="authInfoForm"
        label-width="180px"
        size="small"
      >
        <h5 class="item-title">营业执照信息</h5>
        <el-form-item label="法定代表人姓名：" prop="legal_name">
          <el-input v-model="authInfoForm.legal_name" :maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="法定代表人身份证：" prop="legal_id">
          <el-input v-model="authInfoForm.legal_id" :maxlength="18" clearable></el-input>
        </el-form-item>
        <el-form-item label="法人身份证电子版：" prop="legal_img">
          <el-upload
            class="upload-demo"
            accept=".jpg,.jpeg,.png"
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            :on-remove="() => { authInfoForm.legal_img = ''; legal_img_file = [] }"
            :on-success="(res) => { authInfoForm.legal_img = res.url, legal_img_file = [{name: '法人身份证', url: res.url }] }"
            :file-list="legal_img_file"
            :limit="1"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="统一社会信用代码：" prop="license_num">
          <el-input v-model="authInfoForm.license_num" :maxlength="30" clearable></el-input>
        </el-form-item>
        <el-form-item label="营业执照所在地：" prop="license_region">
          <en-region-picker ref="regionPickerRef" :api="MixinRegionApi" :default="defaultRegion" @changed="handleRegionChanged('license', $event)"/>
        </el-form-item>
        <el-form-item label="营业执照详细地址：" prop="license_add">
          <el-input v-model="authInfoForm.license_add" :maxlength="100" clearable></el-input>
        </el-form-item>
        <el-form-item label="成立日期：" prop="establish_date">
          <el-date-picker
            v-model="authInfoForm.establish_date"
            type="date"
            :editable="false"
            value-format="timestamp"
            placeholder="选择成立日期"
            :picker-options="{ disabledDate(time) { return time.getTime() > Date.now() } }">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="营业执照有效期：" prop="licence_start" class="licence-range">
          <el-date-picker
            v-model="authInfoForm.licence_start"
            type="date"
            :editable="false"
            value-format="timestamp"
            placeholder="开始日期">
          </el-date-picker>
        </el-form-item>
        <div style="width: 400px;margin: 0 auto;">
          <span style="margin-left: 180px;">至</span>
        </div>
        <el-form-item label="" prop="licence_end" class="licence-range">
          <el-date-picker
            v-model="authInfoForm.licence_end"
            type="date"
            :editable="false"
            value-format="timestamp"
            placeholder="结束日期，长期有效可不填">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="法定经营范围：" prop="scope">
          <el-input v-model="authInfoForm.scope" type="textarea" rows="5" clearable></el-input>
        </el-form-item>
        <el-form-item label="营业执照电子版：" prop="licence_img">
          <el-upload
            accept=".jpg,.jpeg,.png"
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            :on-remove="() => { authInfoForm.licence_img = ''; licence_img_file = [] }"
            :on-success="(res) => { authInfoForm.licence_img = res.url, licence_img_file = [{name: '营业执照', url: res.url }] }"
            :limit="1"
            :file-list="licence_img_file"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件</div>
          </el-upload>
        </el-form-item>
        <h5 class="item-title">一般纳税人证明</h5>
        <el-form-item label="一般纳税人证明：" prop="taxes_img">
          <el-upload
            accept=".jpg,.jpeg,.png"
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            :on-success="(res) => { authInfoForm.taxes_img = res.url, taxes_img_file = [{name: '一般纳税人证明', url: res.url }] }"
            :on-remove="() => { authInfoForm.taxes_img = ''; taxes_img_file = [] }"
            :limit="1"
            :file-list="taxes_img_file"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div class="next-btns">
      <el-button size="small" @click="$router.back()">上一步</el-button>
      <el-button size="small" @click="handleNextStep">下一步</el-button>
    </div>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import mixin from './checkStatusMixin'
import { RegExp } from '~/ui-utils'
import { cloneObj } from '@/utils/index'

export default {
  name: 'auth-info',
  middleware: 'auth-user',
  mixins: [mixin],
  data() {
    const len_rule = (min, max) => ({ min, max, message: `'长度在 ${min} 到 ${max} 个字符` })
    return {
      open_i18n: process.env.I18N,
      defaultRegion: null,
      /** 基础信息 表单 */
      authInfoForm: {
        legal_name: '',
        legal_id: '',
        legal_img: '',
        license_num: '',
        establish_date: '',
        licence_start: '',
        licence_end: '',
        scope: '',
        licence_img: '',
        code_img: '',
        taxes_img: '',
        province: '',
        city: '',
        license_add: '',
        region: ''
      },
      /** 基础信息 之法人身份证 */
      legal_img_file: [],
      /** 基础信息 之营业执照 */
      licence_img_file: [],
      /** 基础信息 组织机构代码证 */
      code_img_file: [],
      /** 基础信息 一般纳税人证明 */
      taxes_img_file: [],
      /** 基础信息 表单规则 */
      authInfoRules: {
        legal_name: [this.MixinRequired('请输入法定代表人姓名！'), len_rule(1, 20)],
        legal_id: [
          this.MixinRequired('请输入法定代表人身份证号！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.IDCard.test(value)) {
                callback(new Error('身份证号格式不正确'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        legal_img: [this.MixinRequired('请上传法人身份证电子版！')],
        license_num: [this.MixinRequired('请输入统一社会信用代码！')],
        license_add: [this.MixinRequired('请填写营业执照详细地址！')],
        establish_date: [this.MixinRequired('请选择成立日期！')],
        license_region: [this.MixinRequired('请选择所在地区！')],
        licence_start: [
          this.MixinRequired('请选择开始日期！'),
          {
            validator: (rule, value, callback) => {
              if (this.authInfoForm.licence_end && value >= this.authInfoForm.licence_end) {
                callback(new Error('开始时间不能晚于结束时间！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        licence_end: [
          {
            validator: (rule, value, callback) => {
              if (value && this.authInfoForm.licence_start && value <= this.authInfoForm.licence_start) {
                callback(new Error('结束时间不能早于开始时间！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        scope: [this.MixinRequired('请输入法定经营范围！')],
        licence_img: [this.MixinRequired('请上传营业执照电子版！')]
      }
    }
  },
  mounted() {
    API_Shop.getApplyShopInfo().then(response => {
      if (!response || response.company_name === null) {
        this.$router.replace({ name: 'shop-apply' })
        return false
      }
      const { establish_date, licence_start, licence_end } = response
      establish_date && (response.establish_date *= 1000)
      licence_start && (response.licence_start *= 1000)
      response.licence_end = licence_end == null ? '' : response.licence_end *= 1000
      const authInfoForm = {}
      Object.keys(this.authInfoForm).forEach(key => {
        authInfoForm[key] = response[key]
      })
      authInfoForm.country_code = response.license_country_code
      authInfoForm.country_name = response.license_country_name
      authInfoForm.province = response.license_province
      authInfoForm.city = response.license_city

      this.authInfoForm = authInfoForm
      this.legal_img_file = this.authInfoForm.legal_img ? [{ name: 'legal_img', url: this.authInfoForm.legal_img }] : []
      this.licence_img_file = this.authInfoForm.licence_img ? [{
        name: 'licence_img',
        url: this.authInfoForm.licence_img
      }] : []
      this.taxes_img_file = this.authInfoForm.taxes_img ? [{ name: 'taxes_img', url: this.authInfoForm.taxes_img }] : []
      this.defaultRegion = this.MixinGetRegionDefaultData(response, 'license_')
    })
  },
  methods: {
    /** 下一步 */
    handleNextStep() {
      this.$refs['authInfoForm'].validate((valid) => {
        if (valid) {
          const params = cloneObj(this.authInfoForm)

          params.license_region = JSON.stringify(this.$refs.regionPickerRef.regionData)
          params.establish_date /= 1000
          params.licence_start /= 1000
          params.licence_end /= 1000
          API_Shop.applyShopStep(2, params).then(() => {
            this.$router.push({ name: 'shop-apply-financial-qualification' })
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    },
    handleRegionChanged(type, object) {
      const key = `${type}_region`
      this.$set(this.authInfoForm, key, JSON.stringify(object))
      this.$refs.authInfoForm.validateField(key)
    }
  }
}
</script>

<style lang="scss" scoped>
.item-container {
  ::v-deep .el-form {
    width: 100%
  }
  ::v-deep .el-form-item {
    width: 410px;
    margin-left: auto;
    margin-right: auto;
  }
  .item-title {
    font-size: 22px;
    padding-left: 20px;
    padding-bottom: 20px;
  }
  ::v-deep .el-date-editor {
    width: 230px;
  }
}
</style>
