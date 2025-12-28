<template>
  <div>
    <div class="member-nav">
      <ul class="member-nav-list">
        <li>
          <router-link to="/member/distribution/distribution-manage" style="color:#f42424;">完善信息</router-link>
        </li>
      </ul>
    </div>
    <div class="add-form-content">
      <el-form :model="memberForm" :rules="memberFormRules" ref="memberForm" label-width="100px" style="width:350px">
        <el-form-item label="姓名：" prop="name">
          <el-input v-model="memberForm.name" placeholder="姓名为2-20个字符" minLength="2" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机：" prop="phone" class="mobile-item">
          <Area-select
            :showType="1"
            ref="AreaSelect"
            v-model="memberForm.phone" />
        </el-form-item>
        <el-form-item>
          <el-button class="submit-btn" size="small" @click="submit">确认提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import { AreaSelect } from '@/components'
import * as API_distribution from '@/api/distribution'
import { Foundation } from '~/ui-utils'

export default {
  name: 'AddDistributionUser',
  components: { AreaSelect },
  data() {
    return {
      memberForm: {
        phone: ''
      },
      memberFormRules: {
        name: this.MixinRequired('请输入姓名！'),
        phone: [
          this.MixinRequired('请输入手机号！'),
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
  },
  methods: {
    submit() {
      const memberForm = this.memberForm
      memberForm.phone = this.$refs.AreaSelect.mobileValue
      this.$refs['memberForm'].validate((valid) => {
        if (valid) {
          API_distribution.distributionRegister(memberForm).then(res => {
            this.$emit('addDistributionSuccess')
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
.mobile-item {
  ::v-deep .el-input-group__prepend {
    background-color: #fff;
  }
  ::v-deep .el-select {
    width: 70px;

    .el-input__inner {
      width: 70px;
      padding: 0;
    }
  }
}

</style>
