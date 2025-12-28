<template>
  <div class="container">
    <el-form>
      <el-form-item label="虚拟商品兑换密码：" required>
        <input
          class="input-item"
          v-for="(item, index) of password"
          :key="index"
          v-model="password[index]"
          maxlength="1"
          minlength="1"
          :ref="`refInput${index}`"
          @input="onInput(index)"
          @keyup.delete="onDelete(index)" />
      </el-form-item>
      <el-button
        type="primary"
        style="margin-left: 140px;"
        @click="submit">保存修改</el-button>
    </el-form>
    <div class="tips-box">
      <span>注：</span>
      <div>
        <p>1.支付密码只能为6位</p>
        <p>2.密码可设置为纯数字、纯字母、数字和字母组合</p>
      </div>
    </div>
  </div>
</template>

<script>
  import * as API_Shop from '@/api/shop'
  import md5 from 'js-md5'

  export default {
    name: 'passwordSettings',
    data() {
      return {
        password: Array(6).fill('')
      }
    },
    mounted() {},
    methods: {
      /**
       * 检查字符串是否是（纯数字、纯字母、数字字母组合）
       * @param {string} str - 要检查的字符串
       * @returns {boolean} - 如果通过返回 true，否则返回 false
       */
      isRestricted(str) {
        // 空字符串直接返回 false
        if (!str) return false
        // 检查纯数字
        const isAllDigits = /^\d+$/.test(str)
        // 检查纯字母
        const isAllLetters = /^[a-zA-Z]+$/.test(str)
        // 检查数字字母组合（同时包含数字和字母，且不包含其他字符）
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(str) && 
                              /[a-zA-Z]/.test(str) && 
                              /\d/.test(str)
        return isAllDigits || isAllLetters || isAlphanumeric
      },
      onInput(index) {
        // index < 5 ，如果是第6格，不触发光标移动至下一个输入框。
        if (this.password[index] && index < 5) {
          this.$refs['refInput' + (index + 1)][0].focus()
        }
      },
      onDelete(index) {
        // 如果是第1格，不触发光标移动至上一个输入框
        if (index > 0) {
          this.$refs['refInput' + (index - 1)][0].focus()
        }
      },
      /** 提交修改 */
      submit() {
        if (this.password.some(v => !v)) {
          this.$message.warning('请输入6位数密码')
          return
        }
        if (!this.isRestricted(this.password.join(''))) {
          this.$message.warning('请输入纯数字、纯字母、数字字母组合')
          return
        }
        const redeem_password = md5(this.password.join(''))
        API_Shop.setRedeemPassword({ redeem_password }).then(res => {
          this.$message.success('设置成功')
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container{
    height:100%;
    padding:20px 0 20px 20px;
    background: #fff;
    border:1px solid #ccc;
    .input-item {
      text-align: center;
      width: 30px;
      height: 30px;
      margin-right: 10px;
      font-size: 14px;
      color: #333333;
      text-align: center;
      outline: none;
      border: solid 1px #DCDFE6;
    }
    .tips-box {
      margin-top: 20px;
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      color: #666;
      p {
        margin: 0;
      }
    }
  }
</style>
