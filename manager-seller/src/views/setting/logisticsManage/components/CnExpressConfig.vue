<template>
  <div class="cainiao-wrap">
    <el-form
      :model="cainiaoForm"
      status-icon
      :rules="cainiaoRules"
      ref="cainiaoForm"
      label-width="160px"
      class="demo-ruleForm">
      <el-form-item label="电子面单Token:" prop="token" id="token">
        <el-input v-model="cainiaoForm.token" :maxlength="200" @change="()=> { cainiaoForm.token = cainiaoForm.token.trim() }"></el-input>
      </el-form-item>
      <el-form-item label="打印组件IP:" prop="ip" id="ip">
        <el-input v-model="cainiaoForm.ip" :maxlength="200" @change="()=> { cainiaoForm.ip = cainiaoForm.ip.trim() }"></el-input>
      </el-form-item>
      <el-form-item label="打印组件端口:" prop="port" id="port">
        <el-input v-model="cainiaoForm.port" :maxlength="200" @change="()=> { cainiaoForm.port = cainiaoForm.port.trim() }"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveWaybillToken()">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>

import * as API_logistics from '@/api/expressCompany'

export default {
  name: 'CnExpressConfig',
  data() {
    return {
      cainiaoForm: {
        /** 菜鸟电子面单商家Token */
        token: '',
        ip: '',
        port: ''
      },
      cainiaoRules: {
        token: [
          { required: true, message: '请输入电子面单Token', trigger: 'blur' },
          { max: 200, message: '电子面单Token最多100个字符', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入打印组件IP地址', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '打印组件端口', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCainiaoWaybillToken()
  },
  methods: {
    /** 保存电子面单配置 */
    saveWaybillToken() {
      this.$refs['cainiaoForm'].validate((valid) => {
        if (valid) {
          const cainiaoForm = this.cainiaoForm
          API_logistics.setCainiaoWaybillToken(cainiaoForm).then(() => {
            this.$message.success('保存电子面单Token成功')
          })
        }
      })
    },
    /** 获取菜鸟面单配置 */
    getCainiaoWaybillToken() {
      API_logistics.getCainiaoWaybillToken().then(res => {
        this.cainiaoForm = {
          token: res.token,
          ip: res.ip,
          port: res.port
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
.cainiao-wrap {
  background: #fff;
  padding: 20px;
}

</style>
