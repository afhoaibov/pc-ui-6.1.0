<template>
  <el-dialog :title="giftTitle" :visible.sync="giftShow" width="40%">
    <el-form :model="giftModelForm" ref="giftForm" label-position="right" :rules="rules" label-width="100px">
      <el-form-item label="赠品名称：" prop="gift_name">
        <el-input
          auto-complete="off"
          v-model="giftModelForm.gift_name"
          placeholder="不超过20个字"
          @change="giftModelForm.gift_name = giftModelForm.gift_name.trim()"
          maxlength="20"
          label-width="100"></el-input>
      </el-form-item>
      <el-form-item label="赠品价格：" prop="gift_price">
        <el-input placeholder="请输入赠品价格,长度最多为9个字符" maxlength="9" v-model="giftModelForm.gift_price">
          <template slot="prepend">{{MixinUnitOfCurrency}}</template>
        </el-input>
      </el-form-item>
      <el-form-item label="赠品库存：" prop="actual_store">
        <el-input placeholder="请输入赠品库存,长度最多为9个字符" maxlength="9" v-model="giftModelForm.actual_store"/>
      </el-form-item>
      <el-form-item label="赠品图片：" prop="enable_img">

        <upload-sortable
          class="avatar-uploader goods-images"
          :goodsGalleryList='goodsGalleryList'
          :max="1"
          @click.native="handleUploadPicture"
          @change="handlePictureChange">
        </upload-sortable>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancelGifts">取 消</el-button>
      <el-button type="primary" @click="handleReserveGifts">确 定</el-button>
    </div>
    <en-resource-picker
      :show.sync="showResourcePicker"
      :type="resourcePickerType"
      :upload-api="MixinUploadApi"
      :upload-headers="MixinAccessToken"
      :request="MixinRequest"
      :limit="1"
      @confirm="handleResourcePickerConfirm"
    />
  </el-dialog>
</template>

<script>
  import * as API_Gift from '@/api/gift'
  import { RegExp } from '~/ui-utils'
  import { UploadSortable } from '@/components'

  export default {
    name: 'AddGift',
    components: {
      [UploadSortable.name]: UploadSortable
    },
    props: {
      /** 当前赠品id */
      currentGiftId: {
        type: [String, Number],
        default: () => {
          return ''
        }
      },

      /** 赠品弹框显示*/
      giftModelShow: {
        type: Boolean,
        default: false
      }
    },
    data() {
      const checkGiftPrice = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入赠品价格'))
        }
        setTimeout(() => {
          if (!RegExp.money.test(value)) {
            callback(new Error('请输入正确的价格'))
          } else {
            callback()
          }
        }, 500)
      }
      const checkEnableStore = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入库存'))
        }
        setTimeout(() => {
          if (!RegExp.integer.test(value)) {
            callback(new Error('请输入正整数'))
          } else {
            callback()
          }
        }, 500)
      }
      return {
        giftShow: false,

        /** 赠品编辑表单*/
        giftModelForm: {

          /** 赠品名称 */
          gift_name: '',

          /** 赠品图片 */
          gift_img: '',

          /** 赠品价格 */
          gift_price: '',

          /** 实际库存 */
          actual_store: ''
        },

        /** 存储上传的图片*/
        // fileList: [],

        /** 校验规则 */
        rules: {
          gift_name: [
            { required: true, message: '请输入赠品名称', trigger: 'blur' }
          ],
          gift_price: [
            { required: true, message: '请输入赠品价格', trigger: 'blur' },
            { validator: checkGiftPrice, trigger: 'blur' }
          ],
          actual_store: [
            { required: true, message: '请输入赠品库存', trigger: 'blur' },
            { validator: checkEnableStore, trigger: 'blur' }
          ],
          enable_img: [
            { required: true,
              validator: (rule, value, callback) => {
                if (!this.giftModelForm.gift_img) {
                  callback(new Error('请上传赠品图片！'))
                } else {
                  callback()
                }
              }, trigger: 'blur' }
          ]
        },
        // 临时存储商品相册信息
        goodsGalleryList: [],
        // 资源选择弹窗显隐
        showResourcePicker: false,
        // 资源选择类型
        resourcePickerType: 'image'
      }
    },
    computed: {
      giftTitle() {
        return this.currentGiftId ? '编辑赠品' : '新增赠品'
      }
    },
    watch: {
      giftShow() {
        !this.giftShow && this.$emit('saveGift', false)
      },
      giftModelShow() {
        this.giftShow = this.giftModelShow
      },
      currentGiftId() {
        if (this.currentGiftId) {
          this.GET_giftDetails()
        } else {
          this.giftModelForm = {
            /** 赠品名称 */
            gift_name: '',

            /** 赠品图片 */
            gift_img: '',

            /** 赠品价格 */
            gift_price: 0,

            /** 实际库存 */
            actual_store: 0
          }
          this.goodsGalleryList = []
        }
      }
    },
    mounted() {
      this.currentGiftId && this.GET_giftDetails()
    },
    methods: {
      /** 素材选择器确认选择 */
      handleResourcePickerConfirm(items) {
        const resources = items.map(item => ({
          name: item.resource_name,
          url: item.resource_url,
          original: item.resource_url,
          img_id: -1
        }))
        if (!this.$route.params.goodsid && !this.giftModelForm.gift_img) {
          this.giftModelForm.gift_img = []
        }
        this.handlePictureChange(resources)
      },

      /** 商品图片发生改变 */
      handlePictureChange(fileList) {
        this.goodsGalleryList = fileList
        if (fileList.length) {
          this.giftModelForm.gift_img = fileList[0].url
        } else {
          this.giftModelForm.gift_img = ''
        }
        this.$refs['giftForm'].validateField('enable_img')
      },

      /** 显示上传我的图片弹框*/
      handleUploadPicture(event) {
        if (event.target.tagName !== 'INPUT') return
        event.cancelBubble = true
        event.stopPropagation()
        event.preventDefault()
        this.resourcePickerType = 'image'
        this.showResourcePicker = true
      },

      /** 查询一个赠品详情 */
      GET_giftDetails() {
        this.$nextTick(() => {
          API_Gift.getGiftDetails(this.currentGiftId, {}).then((response) => {
            this.giftModelForm = { ...response }
            this.goodsGalleryList = [{ url: this.giftModelForm.gift_img }]
          })
        })
      },

      /** 取消 */
      handleCancelGifts() {
        this.$emit('saveGift', false)
      },

      /** 保存赠品*/
      handleReserveGifts() {
        this.$refs['giftForm'].validate((valid) => {
          if (valid) {
            if (this.currentGiftId) {
              // 更新
              API_Gift.saveGifts(this.currentGiftId, this.giftModelForm).then(() => {
                this.giftShow = false
                this.$message.success('保存成功！')
                this.$emit('saveGift', true)
              })
            } else {
              // 新增
              API_Gift.addGifts(this.giftModelForm).then(() => {
                this.giftShow = false
                this.$message.success('保存成功！')
                this.giftModelForm = {
                  /** 赠品名称 */
                  gift_name: '',
                  /** 赠品图片 */
                  gift_img: '',
                  /** 赠品价格 */
                  gift_price: '',
                  /** 实际库存 */
                  actual_store: ''
                }
                this.goodsGalleryList = []
                this.$emit('saveGift', true)
              })
            }
            setTimeout(() => { this.$refs['giftForm'].resetFields() })
          } else {
            this.$message.error('表单存在错误，请修改')
          }
        })
      }

      /** 上传成功之后 */
      // uploadSuccess(response) {
      //   this.giftModelForm.gift_img = response.url
      //   this.fileList.shift()
      //   this.fileList.push(response)
      //   this.$refs['giftForm'].validateField('enable_img')
      // },

      // /** 图片移除之后 */
      // delGiftImg() {
      //   this.fileList = []
      //   this.giftModelForm.gift_img = ''
      // }
    }
  }
</script>

<style lang="scss" type="scss" scoped>
  .upload-demo {
    text-align: left;
  }
</style>
