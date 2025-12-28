<template>
  <div id="addressForm" style="display: none">
    <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="100px" style="width: 100%">
      <el-form-item label="收货人姓名" prop="name">
        <el-input placeholder="请输入收货人姓名" v-model="addressForm.name" size="small"></el-input>
      </el-form-item>

      <el-form-item label="所在地区" prop="region" class="form-item-region">
        <en-region-picker
          ref="regionPickerRef"
          :api="MixinRegionApi"
          :default="regions"
          @changed="handleRegionChanged"
          @handleCountryChanged="handleCountryChanged"
        />
      </el-form-item>

      <el-form-item label="详细地址" prop="addr">
        <el-input placeholder="请输入详细地址" v-model="addressForm.addr" size="small"></el-input>
      </el-form-item>

      <el-form-item label="联系方式" prop="mobile" class="mobile-item">
        <area-select
          v-model="addressForm.mobile"
          ref="AreaSelect"
          :areaCode="areaCode"
          :showType="1"
        />
      </el-form-item>

      <el-form-item label="地址别名" prop="ship_address_name">
        <el-input v-model="addressForm.ship_address_name" size="small" maxlength="20"
          placeholder="公司、家里、学校或其它"></el-input>
      </el-form-item>

      <el-form-item label="设置为默认">
        <el-checkbox v-model="addressForm.def_addr" :true-label="1" :false-label="0">默认</el-checkbox>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import AreaSelect from './AreaSelect/index'
import { Foundation } from '~/ui-utils'

export default {
  name: 'AddressFormDialog',
  components: { AreaSelect },
  props: {
    addressForm: {
      type: Object,
      default: {}
    },
    regions: {
      type: [Array, Object]
    }
  },
  watch: {
    addressForm: {
      immediate: true,
      handler(newVal) {
        this.areaCode = newVal ? newVal.mobile_area_code : ''
      }
    }
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      // 添加、编辑地址 表单规则
      addressRules: {
        name: [
          this.MixinRequired('请输入收货人姓名！'),
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        mobile: [
          this.MixinRequired('请输入联系方式！'),
          {
            validator: (rule, value, callback) => {
              if (this.$refs.AreaSelect) {
                const { mobile_regex, formatValid } = this.$refs.AreaSelect
                if (value && mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                  callback(new Error('手机号码格式不正确！'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }
          }
        ],
        region: [this.MixinRequired('请选择所在地区！', 'change')],
        addr: [
          this.MixinRequired('请输入详细地址！'),
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },
      areaCode: ''
    }
  },
  methods: {
    handleCountryChanged(e) {
      if (e.tel) {
        this.areaCode = e.tel
      }
    },
    handleRegionChanged(data) {
      this.$emit('region-change', data)
    }
  }
}
</script>

<style lang="scss" scoped>
#addressForm ::v-deep .app-address-body {
  left: 0 !important;
}
#addressForm {
  padding: 10px 20px;
  .form-item-region {
    display: flex;
    align-items: center;
    height: 100%;
    ::v-deep .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  .mobile-item {
    ::v-deep .el-input-group__prepend {
      background-color: #fff;
      .el-select {
        width: 75px;
        .el-input__inner {
          padding: 0;
          width: 75px;
        }
      }
    }
    ::v-deep .el-input__inner {
      height: 32px !important;
    }
    ::v-deep .el-input__icon {
      line-height: 30px;
    }
  }
}
</style>
