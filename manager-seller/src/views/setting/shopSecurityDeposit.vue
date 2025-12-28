<template>
  <div class="bg-settings">
    <el-form
      label-width="140px"
      class="demo-ruleForm">
      <el-form-item label="已缴纳保证金：" prop="">
        <span>{{shopData.paid_margin}}</span>
      </el-form-item>
      <el-form-item label="剩余保证金：" prop="">
        <span>{{shopData.remaining_margin}}</span>
      </el-form-item>
      <el-form-item label="缴费状态：" prop="">
        <span>{{shopData.paid_margin ? '已' : '未'}}缴费</span>
        <el-button style="margin-left: 20px;" type="primary" size="mini" @click="showDialog = true">缴费</el-button>
        <el-button style="margin-left: 20px;" type="primary" size="mini" @click="showRecordDialog = true">保证金流水</el-button>
      </el-form-item>
    </el-form>

    <el-dialog
      title="缴纳保证金"
      :visible.sync="showDialog"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="showDialog = false">
      <el-form :model="formData" :rules="formRules" ref="formData"  label-width="120px" >
        <el-form-item label="当前剩余保证金" >
          <el-input
            :value="shopData.remaining_margin"
            size="small"
            disabled
          >
          </el-input>
        </el-form-item>
        <el-form-item label="缴费金额" prop="actual_pay_amount">
          <el-input
            v-model="formData.actual_pay_amount"
            size="small"
            placeholder="请输入缴费金额"
            oninput="value = value.replace(/[^\d.]/g, '').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="凭证">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            list-type="picture-card"
            multiple
            :file-list="fileList"
            :on-success="uploadSuccess"
            :on-remove="delImg"
            :on-error="handleError"
            :on-exceed="handleExceed"
            accept="image/jpeg,image/jpg,image/png"
            :limit="5"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <span>凭证限制5张图片内</span>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 保证金流水 -->
    <margin-record
      v-model="showRecordDialog"
     @onClose="showRecordDialog = false"  />
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import MarginRecord from './components/MarginRecord'
import Storage from '@/utils/storage'

export default {
  name: 'shopSecurityDeposit',
  components: {
    MarginRecord
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      shopData: {},
      fileList: [],
      showDialog: false,
      formData: {
        voucher: [],
        type: 1 // 类型 0：扣减 1：增加
      },
      formRules: {
        actual_pay_amount: [
          { required: true, message: '请输入缴费金额', trigger: 'blur' },
          { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入合法金额，最多两位小数', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const num = Number(value)
              if (num > 1000000) {
                callback(new Error('缴费金额不能超过1000000'))
              } else if (num < 0) {
                callback(new Error('缴费金额不能小于0'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      showRecordDialog: false
    }
  },
  mounted() {
    this.getShopData()
  },
  methods: {
    /** 获取店铺数据 */
    getShopData() {
      API_Shop.getShopData().then(res => {
        this.shopData = res
      })
    },
    submitForm() {
      const { formData, fileList } = this
      this.$refs.formData.validate((valid) => {
        if (valid) {
          let shopInfo = Storage.getItem('seller_shop')
          shopInfo = shopInfo ? JSON.parse(shopInfo) : {}

          formData.shop_id = this.shopData.shop_id
          if (fileList.length) {
            formData.voucher = fileList.map(item => {
              return item.response.url
            }).join(',')
          }
          formData.shop_name = shopInfo.shop_name
          API_Shop.updateShopRemainingMargin(formData).then(res => {
            this.$message.success('缴费凭据提交成功，等待平台审核')
            this.formData.voucher = []
            this.fileList = []
            this.formData.actual_pay_amount = ''
            this.showDialog = false
            this.getShopData()
          })
        }
      })
    },
    /** 图片/视频上传失败时的钩子 */
    handleError() {
      this.$message.error('上传失败!')
    },
    /** 上传数量超出限制 */
    handleExceed() {
      this.$message.error('最大上传5张图片！')
    },
    /** 图片上传成功 */
    uploadSuccess(res, file, fileList) {
      this.fileList = fileList
    },
    /** 图片移除之后 */
    delImg(file, fileList) {
      this.fileList = fileList
    }
  }
}
</script>

<style lang="scss" type="text/scss" scoped>
.bg-settings {
  background: #fff;
  border: 1px solid #FAFAFA;
  margin: 15px;
  padding: 10px;
}

</style>
