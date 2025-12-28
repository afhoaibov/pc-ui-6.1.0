/**
 * Created by Andste on 2018/6/13.
 * 地址相关mixin
 * 个人中心和结算页复用
 */

import * as API_Address from '@/api/address'
import * as API_Trade from '@/api/trade'
import { cloneObj, formatIn18Mobile } from '@/utils/index'

export default {
  data() {
    return {
      open_i18n: process.env.I18N,
      // 地址列表
      addressList: [],
      // 添加、编辑地址 表单
      addressForm: {
        mobile_area_code: '86'
      },
      // 编辑地址时，暂存操作的地址
      defaultRegion: null
    }
  },
  computed: {
    $AreaSelect() {
      return this.$refs.AddressFormDialog.$refs.AreaSelect
    },
    $regionPickerRef() {
      return this.$refs.AddressFormDialog.$refs.regionPickerRef
    }
  },
  mounted() {
    this.GET_AddressList()
  },
  methods: {
    areaFormatter(row) {
      return this.MixinFormatRegions(row)
    },
    /** 添加地址 */
    handleAddAddress(_refs) {
      this.addressForm = {
        province: '',
        mobile_area_code: '86',
        def_addr: 0
      }
      this.defaultRegion = []
      this.openLayer({
        title: '添加地址',
        yes: index => {
          this.submitAddressForm('add', index)
        }
      })
      this.$nextTick(() => {
        if (_refs) {
          _refs.clearValidate()
        }
      })
    },
    /** 编辑地址 */
    handleEaitAddress(row, num) {
      const addressForm = cloneObj(row)
      const { mobileValue } = formatIn18Mobile(row.mobile)
      addressForm.mobile = mobileValue
      this.addressForm = addressForm
      this.defaultRegion = this.MixinGetRegionDefaultData(row)
      this.openLayer({
        yes: index => {
          this.submitAddressForm('edit', index, num)
        }
      })
    },
    /** 删除地址 */
    handleDeleteAddress(row) {
      this.$confirm('确定要删除这个地址吗？', () => {
        API_Address.deleteAddress(row.addr_id).then(() => {
          this.$message.success('删除成功！')
          this.GET_AddressList()
        })
      })
    },
    /** 设置默认地址 */
    handleSetDefaultAddress(item) {
      API_Address.setDefaultAddress(item.addr_id).then(() => {
        this.$message.success('设置成功！')
        this.GET_AddressList()
      })
    },
    /** 提交地址表单 */
    submitAddressForm(type, index, num) {
      this.$refs.AddressFormDialog.$refs['addressForm'].validate((valid) => {
        if (valid) {
          const { regionData } = this.$regionPickerRef
          const addressForm = cloneObj(this.addressForm)
          const { addr_id } = addressForm
          const type = 'ONLINE'
          if (this.open_i18n) {
            addressForm.mobile_area_code = (this.$AreaSelect && this.$AreaSelect.areaValue_n) || addressForm.mobile_area_code
            addressForm.mobile = `${addressForm.mobile_area_code},${addressForm.mobile}`
          }
          addressForm.region = JSON.stringify(regionData)

          if (!addr_id) {
            /** 默认支付类型为在线支付 */
            API_Trade.setPaymentType(type).then(() => {
              API_Address.addAddress(addressForm).then(() => {
                this.$message.success('保存成功！')
                this.$layer.close(index)
                this.$emit('change', addressForm, type)
                this.GET_AddressList()
              })
            })
          } else {
            API_Address.editAddress(addr_id, addressForm).then(response => {
              this.$message.success('保存成功！')
              this.$layer.close(index)
              this.$emit('change', response)
              this.GET_AddressList()
            })
            if (num === 1) {
              API_Trade.setAddressId(addr_id).then(() => {
                this.$emit('change', addressForm, true)
              })
            }
          }
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 打开layer弹窗 */
    openLayer(params) {
      this.$layer.open({
        type: 1,
        title: '编辑地址',
        zIndex: 200,
        area: ['650px', '600px'],
        scrollbar: false,
        // eslint-disable-next-line no-undef
        content: $('#addressForm'),
        btn: ['确认', '取消'],
        ...params
      })
    },
    /** 获取地址列表 */
    GET_AddressList() {
      API_Address.getAddressList().then(response => {
        this.addressList = response
      })
    },
    handleRegionChange(data) {
      this.$set(this.addressForm, 'region', JSON.stringify(data))
      this.$refs.AddressFormDialog.$refs['addressForm'].validateField('region')
    }
  }
}
