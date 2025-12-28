<template>
  <div id="basic-info" class="item-container">
    <h2 class="title">基本信息</h2>
    <div class="content">
      <el-form :model="basicInfoForm" :rules="basicInfoRules" ref="basicInfoForm" label-width="120px" style="width: 400px"
        size="small" class="basic-info-form">
        <el-form-item label="公司名称：" prop="company_name">
          <el-input v-model="basicInfoForm.company_name" clearable :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="公司地址：" prop="company_address">
          <el-input v-model="basicInfoForm.company_address" clearable :maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="公司电话：" prop="company_phone">
          <el-input v-model="basicInfoForm.company_phone" clearable :maxlength="13"></el-input>
        </el-form-item>
        <el-form-item label="公司邮箱：" prop="company_email">
          <el-input v-model="basicInfoForm.company_email" clearable :maxlength="80"></el-input>
        </el-form-item>
        <el-form-item label="员工总数：" prop="employee_num">
          <el-input v-model="basicInfoForm.employee_num" :maxlength="10" clearable>
            <el-button slot="append">人</el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="注册资金：" prop="reg_money">
          <el-input v-model="basicInfoForm.reg_money" :maxlength="10" clearable>
            <el-button slot="append">万</el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="联系人姓名：" prop="link_name">
          <el-input v-model="basicInfoForm.link_name" :maxlength="20" clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="联系人电话：" prop="link_phone" class="mobile-item">
          <Area-select
          ref="AreaSelect"
          :showType="1"
          v-model="basicInfoForm.link_phone" />
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
import { RegExp, Foundation } from '~/ui-utils'
import { AreaSelect } from '@/components'
import { cloneObj } from '@/utils/index'

export default {
  name: 'basic-info',
  middleware: 'auth-user',
  mixins: [mixin],
  components: {
    AreaSelect
  },
  data() {
    const req_rule = (message) => ({ required: true, message, trigger: 'blur' })
    return {
      /** 基础信息 表单 */
      basicInfoForm: {
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: '',
        employee_num: '',
        reg_money: '',
        link_name: '',
        link_phone: ''
      },
      /** 基础信息 表单规则 */
      basicInfoRules: {
        company_name: [req_rule('请输入公司名称')],
        company_address: [req_rule('请输入公司地址')],
        company_phone: [
          req_rule('请输入公司电话'),
          {
            validator: (rule, value, callback) => {
              callback()
              // if (!RegExp.positiveInteger.test(value)) {
              //   callback(new Error('电话格式不正确！'))
              // } else {
              //   callback()
              // }
            },
            trigger: 'blur'
          }
        ],
        company_email: [
          req_rule('请输入公司邮箱'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.email.test(value)) {
                callback(new Error('邮箱格式不正确！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        employee_num: [
          req_rule('请输入员工人数'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.integer.test(value)) {
                callback(new Error('员工人数应为正整数，且不为零！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        reg_money: [
          req_rule('请输入注册金额'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.integer.test(value)) {
                callback(new Error('注册资金应为正整数，且不为零！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        link_name: [req_rule('请输入联系人姓名')],
        link_phone: [
          this.MixinRequired('请填写联系电话！'),
          {
            validator: (rule, value, callback) => {
              const { mobile_regex, formatValid } = this.$refs.AreaSelect
              if (value && mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                callback(new Error('手机号码格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  mounted() {
    API_Shop.getApplyShopInfo().then(response => {
      Object.keys(this.basicInfoForm).forEach(key => {
        this.basicInfoForm[key] = response[key]
      })
    })
  },
  methods: {
    /** 下一步 */
    handleNextStep() {
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          const basicInfoForm = cloneObj(this.basicInfoForm)
          const { areaValue_n } = this.$refs.AreaSelect

          basicInfoForm.reg_monety = basicInfoForm.reg_money
          if (areaValue_n && basicInfoForm.link_phone.indexOf(',') === -1) {
            basicInfoForm.link_phone = `${areaValue_n},${basicInfoForm.link_phone}`
          }

          API_Shop.applyShopStep(1, basicInfoForm).then(response => {
            this.$router.push({ name: 'shop-apply-auth-info' })
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-info-form {
  padding-bottom: 35px;
}
// TODO
.mobile-item ::v-deep .el-input-group__prepend {
  background-color: #fff;
  .el-select {
    width: 70px;
    .el-input__inner {
      padding: 0;
      width: 70px;
    }
  }
}
</style>
