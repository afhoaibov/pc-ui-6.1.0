<template>
  <div>
    <div class="member-nav">
      <ul class="member-nav-list">
        <li>
          <router-link to="/member/distribution/applyFor-withdraw" style="color:#f42424;">申请提现</router-link>
        </li>
      </ul>
    </div>
    <div class="add-form-content">
      <el-form :model="applyForm" :rules="applyFormRules" ref="applyForm" label-width="120px" style="width:350px">
        <el-form-item label="可提现金额：">
          <p>{{distributionInfo.total_income}}</p>
        </el-form-item>
        <el-form-item label="提现方式：" prop="way">
          <p>
            支付宝
            <el-tooltip placement="right">
              <div slot="content">PC端只支持支付宝提现</div>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </p>
        </el-form-item>
        <el-form-item label="提现金额：" prop="price">
          <el-input v-model="applyForm.price" placeholder="请输入提现金额" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="账户信息：" required>
          <el-radio-group v-model="chooseAccount" @change="changeChooseAccount">
            <el-radio :label="0">手动填写</el-radio>
            <el-radio :label="1" :disabled="accountExisting">选择已有</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="chooseAccount === 0">
          <el-form-item label="真实姓名：" prop="real_name">
            <el-input v-model="applyForm.real_name" placeholder="姓名为2-20个字符" minLength="2" maxlength="20" size="small" clearable></el-input>
          </el-form-item>
          <el-form-item label="支付宝账号：" prop="account_info">
            <el-input v-model="applyForm.account_info" placeholder="姓名为2-20个字符" minLength="2" maxlength="20" size="small" clearable></el-input>
          </el-form-item>
        </template>
        <template v-if="chooseAccount === 1">
          <el-form-item label="支付宝账号：" prop="account_id">
            <el-select @change="changeAccount" size="small" v-model="applyForm.account_id" placeholder="请选择支付宝账号">
              <el-option
                v-for="item in userAlipayAccount"
                :key="item.id"
                :label="item.account + '[' + item.real_name + ']'"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button class="submit-btn" size="mini" @click="saveApplyWithdraw">确认提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import * as API_distribution from '@/api/distribution'
import {
  Tooltip,
  RadioGroup,
  Radio
} from 'element-ui'
import { RegExp } from '~/ui-utils'

Vue.use(Tooltip).use(RadioGroup).use(Radio)

export default {
  name: 'applyForWithdraw',
  head() {
    return {
      title: `提现申请-${this.site.title}`
    }
  },
  data() {
    const checkPrice = (rule, value, callback) => {
      if (!RegExp.money.test(value)) {
        callback(new Error('请输入正确的提现金额！'))
      } else if (value < 1 || value > 500) {
        callback(new Error('提现金额范围：1 ~ 500'))
      } else {
        callback()
      }
    }
    return {
      // 分销商信息
      distributionInfo: {},
      applyForm: {
        way: 'ALIPAY',
        client_type: 'PC'
      },
      applyFormRules: {
        price: [
          { required: true, validator: checkPrice, trigger: 'blur'}
        ],
        real_name: this.MixinRequired('请输入真实姓名！'),
        account_info: this.MixinRequired('请输入支付宝账号！'),
        account_id: this.MixinRequired('请选择支付宝账号！')
      },
      chooseAccount: 0,
      accountExisting: true,
      // 用户已有的支付宝账号信息
      userAlipayAccount: []
    }
  },
  mounted() {
    this.getDistributionUserInfo()
    this.getWithdrawAlipayAccount()
  },
  watch: {
    'chooseAccount': function(newVal) {
      this.applyFormRules.account_id.required = newVal === 1
      this.applyFormRules.real_name.required = newVal === 0
      this.applyFormRules.account_info.required = newVal === 0
    }
  },
  methods: {
    /** 账号填写方式切换 */
    changeChooseAccount(value) {
      this.applyFormRules.account_id.required = value === 1
      this.applyFormRules.real_name.required = value === 0
      this.applyFormRules.account_info.required = value === 0
    },
    /** 选择已有支付宝账号 */
    changeAccount(value) {
      const account = this.userAlipayAccount.filter(item => item.id === value)[0]
      this.applyForm.real_name = account.real_name
      this.applyForm.account_info = account.account
    },
    /** 获取分销商数据 */
    getDistributionUserInfo() {
      API_distribution.getDistributionUserInfo().then(res => {
        if (res) {
          this.distributionInfo = res
        }
      })
    },
    /** 获取当前用户已有的支付宝账户信息 */
    getWithdrawAlipayAccount() {
      API_distribution.getWithdrawAlipayAccount().then(res => {
        if (res.length !== 0) {
          this.accountExisting = false
        }
        this.userAlipayAccount = res
      })
    },
    saveApplyWithdraw() {
      const applyForm = this.applyForm
      this.$refs['applyForm'].validate((valid) => {
        if (valid) {
          API_distribution.applyWithDraw(applyForm).then(res => {
            this.$message.success('提现成功！')
            this.$router.replace({ path: '/member/distribution/commission-withdrawal', query: {} })
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.add-form-content {
  padding-top: 30px;
  .submit-btn {
    background: #f42424;
    color: #fff;
    border: none;
  }
}

</style>
