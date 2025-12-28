<template>
  <div>
    <el-dialog
      title="扣除保证金"
      :visible.sync="show"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="onClose">
      <el-form :model="formData" :rules="formRules" ref="formData"  label-width="120px" >
        <el-form-item label="当前剩余保证金" >
          <el-input
            :value="remainingMargin"
            size="small"
            disabled
          >
          </el-input>
        </el-form-item>
        <el-form-item label="扣除金额" prop="actual_pay_amount">
          <el-input
            v-model="formData.actual_pay_amount"
            size="small"
            placeholder="请输入扣除金额"
            oninput="value = value.replace(/[^\d.]/g, '').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="扣除金额原因" prop="remark">
          <el-input
            v-model="formData.remark"
            size="small"
            placeholder="请输入扣除原因"
            type="textarea"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="凭证">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            list-type="picture-card"
            multiple
            :fileList="fileList"
            :on-success="uploadSuccess"
            :on-remove="delImg"
            :file-list="fileList"
            :limit="5"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <span>凭证限制5张图片内</span>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'

export default {
  name: 'DeductMargin',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    remainingMargin: {
      type: [Number, String],
      default: 0
    },
    shopId: {
      type: String
    }
  },
  data() {
    return {
      show: false,
      fileList: [],
      formData: {
        voucher: [],
        type: 0 // 类型 0：扣减 1：增加
      },
      formRules: {
        actual_pay_amount: this.MixinRequired('请填写扣除金额！'),
        remark: this.MixinRequired('请填写扣除原因！')
      }
    }
  },
  watch: {
    value(val) {
      this.show = val
      this.formData = {
        voucher: [],
        type: 0 // 类型 0：扣减 1：增加
      }
      this.fileList = []
    }
  },
  mounted() {
  },
  methods: {
    submitForm() {
      const { formData, fileList } = this
      this.$refs.formData.validate((valid) => {
        if (valid) {
          let errorMsg = ''
          console.log(Number(formData.actual_pay_amount))
          if (!Number(formData.actual_pay_amount)) {
            errorMsg = '请输入正确的扣除金额！'
          }
          if (formData.actual_pay_amount > this.remainingMargin) {
            errorMsg = '剩余保证金不足！'
          }
          if (errorMsg) {
            this.$message.error(errorMsg)
            return
          }
          formData.shop_id = this.shopId
          if (fileList.length) {
            formData.voucher = fileList.map(item => {
              return item.response.url
            }).join(',')
          }
          API_Shop.updateShopRemainingMargin(formData).then(res => {
            this.$message.success('扣除成功！')
            this.$emit('onSuccess', res)
            this.fileList = []
            this.formData.actual_pay_amount = ''
            this.formData.remark = ''
          })
        }
      })
    },
    /** 关闭弹窗 */
    onClose() {
      this.$emit('onClose')
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

<style type="text/scss" lang="scss" scoped>


</style>
