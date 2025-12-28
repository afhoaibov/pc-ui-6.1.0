<template>
  <div class="trust-login-wrap">
    <div class="trust-item" v-for="item in connects" :key="item.id">
      <div class="trust-title">
        <p>{{item.platform_name}}</p>
      </div>
      <div class="btn-box" v-if="item.platform === 'WECHAT'">
        <p style="font-size: 12px;color: #666666">请将存储方案中的域名配置到微信公众平台downloadFile合法域名中</p>
      </div>
      <div class="btn-box" v-if="item.platform === 'ALIPAY'">
        <p style="font-size: 14px;color: #666666">支付宝信任登录参数与收款方式配置参数一致，无需单独配置</p>
      </div>
      <div class="btn-box" v-else>
        <el-switch
          v-model="item.disable"
          :active-value="1"
          :inactive-value="0"
          @change="(status) => changeSwitch(status, item)"  />
        <el-button type="primary" plain @click="editPayment(item)">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as API_Payment from '@/api/payment'

export default {
  name: 'trustLogin',
  data() {
    return {
      /** 信任登录参数 */
      connects: []
    }
  },
  computed: {
    titleImg() {
      return (item) => {
        const url = require(`@/assets/images/${item.plugin_id}.png`)
        return url
      }
    }
  },
  mounted() {
    this.getConnect()
  },
  methods: {
    getConnect() {
      API_Payment.getThirdPlatformList({
        type: 'CONNECT'
      }).then(response => {
        this.connects = response
      })
    },

    /** 切换状态 */
    changeSwitch(disable, item) {
      API_Payment.changeThirdStatus(item.id, {
        disable
      }).then(res => {
        const msg = disable ? '开启成功' : '关闭成功'
        this.$message.success(msg)
      })
    },

    /** 编辑子应用 */
    editPayment(item) {
      const plugin_id = item.plugin_id === 'alipayAbstractConnectLoginPlugin' ? 'alipayDirectPlugin' : item.plugin_id
      this.$router.push({ name: 'thirdPlatformAppSettings', query: { plugin_id }})
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.save-btn {
  margin-top: 10px;
}
.trust-login-wrap {
  background: #fff;
  padding: 20px;
  display: flex;
  .trust-item {
    width: 300px;
    padding: 10px;
    border: 1px solid #efefef;
    margin: 0 10px 10px 0;
    .trust-title {
      border: 1px solid #efefef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      height: 140px;
      .tit-img {
        height: 40px;
        margin-right: 10px;
      }
    }
    .btn-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
    }
  }
}
</style>
