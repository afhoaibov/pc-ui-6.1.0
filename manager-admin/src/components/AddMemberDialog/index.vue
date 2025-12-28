<template>
   <el-dialog
      title="添加会员"
      :visible.sync="show"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="onClose"
   >
      <el-form
        :model="addMemberForm"
        :rules="addMemberRules"
        ref="addMemberForm"
        label-width="100px">
        <!--用户名-->
        <el-form-item label="用户名" prop="uname">
          <el-input
            placeholder="请输入用户名"
            v-model="addMemberForm.uname"
            :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="性别" class="form-item-sex" prop="sex">
          <el-radio v-model="addMemberForm.sex" :label="1">男</el-radio>
          <el-radio v-model="addMemberForm.sex" :label="0">女</el-radio>
        </el-form-item>
        <!--密码-->
        <el-form-item label="设置密码" prop="password">
          <el-input
            placeholder="请输入密码"
            :type="pwdType"
            v-model="addMemberForm.password"
            :maxlength="20"></el-input>
          <span class="show-pwd" @click="pwdType = pwdType === 'password' ? 'text' : 'password'">
            <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            placeholder="请输入确认密码"
            :type="pwdType"
            v-model="addMemberForm.confirmPassword"
            :maxlength="20"></el-input>
          <span class="show-pwd" @click="pwdType = pwdType === 'password' ? 'text' : 'password'">
            <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>

        <!--手机号码-->
        <en-area-select
          :showType="1"
          ref="AreaSelect"
          v-model="addMemberForm.mobile" />

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button type="primary" @click="submitAddMemberForm">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
import { RegExp } from '~/ui-utils'
import * as API_Member from '@/api/member'

export default {
  name: 'AddMemberDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      pwdType: 'password',
      /** 添加会员 表单数据 */
      addMemberForm: {},
      /** 添加会员 表单规则 */
      addMemberRules: {
        uname: [
          this.MixinRequired('请输入用户名！'),
          { min: 4, max: 20, message: '长度在 4 到 20 个字符' },
          {
            validator: (rule, value, callback) => {
              if (!/[^\d]+/.test(value)) {
                callback(new Error('账户名不能为纯数字！'))
              } else {
                callback()
              }
            }
          }
        ],
        sex: this.MixinRequired('请选择性别！'),
        password: [
          this.MixinRequired('请输入密码！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.password.test(value)) {
                callback(new Error('密码格式有误！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          this.MixinRequired('请输入确认密码！'),
          {
            validator: (rule, value, callback) => {
              const { password } = this.addMemberForm
              if (password !== value) {
                callback(new Error('两次输入不一致！'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  watch: {
    value(val) {
      this.show = val
    }
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    },
    submitAddMemberForm() {
      this.$refs.addMemberForm.validate((valid, items) => {
        if (valid) {
          const params = this.MixinClone(this.addMemberForm)
          params.mobile = this.$refs.AreaSelect.mobileValue

          API_Member.addMember(params).then((res) => {
            this.$message.success('添加成功！')
            this.$emit('addMemberEvent', res)
            this.addMemberForm.mobile = ''
            this.addMemberForm = {}
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.show-pwd {
  position: absolute;
  top: 0;
  right: 10px;
  cursor: pointer;
}
</style>
