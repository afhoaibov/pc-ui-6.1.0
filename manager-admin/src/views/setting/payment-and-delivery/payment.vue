<template>
  <div class="payment-wrap">
    <div class="payment-item" v-for="item in tableData" :key="item.id">
      <div class="payment-title">
        <img :src="item.image" class="tit-img" v-if="item.image" />
        <img :src="require(`@/assets/images/${item.plugin_id}.png`)" v-else class="tit-img" />
        <p>{{item.platform_name}}</p>
      </div>
      <div class="btn-box">
        <el-switch
          v-model="item.disable"
          :active-value="1"
          :inactive-value="0"
          @change="(status) => changeSwitch(status, item)"  />
        <div>
          <el-button v-if="item.plugin_id === 'wechatPayPlugin' || item.plugin_id === 'alipayDirectPlugin'" type="warning" plain @click="editWechatPayment(item)">子应用编辑</el-button>
          <el-button type="primary" plain @click="editPayment(item)">编辑</el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import * as API_Payment from '@/api/payment'

  export default {
    components: {
    },
    name: 'payment',
    data() {
      return {
        /** 列表参数 */
        params: {
        },
        /** 列表数据 */
        tableData: ''
      }
    },
    mounted() {
      this.GET_PaymentList()
    },
    methods: {
      /** 切换状态 */
      changeSwitch(disable, item) {
        API_Payment.changeThirdStatus(item.id, { disable }).then(res => {
          const msg = disable ? '开启成功' : '关闭成功'
          this.$message.success(msg)
          this.GET_AppList()
        })
      },

      /** 微信支付子应用编辑 */
      editWechatPayment(item) {
        this.$router.push({ name: 'thirdPlatformAppSettings', query: { plugin_id: item.plugin_id }})
      },
      /** 编辑支付方式配置 */
      editPayment(item) {
        if (!JSON.parse(item.config_json).length) {
          this.$message.error('该收款方式无配置可修改！')
          return
        }
        this.$router.push({
          name: 'paymentEdit',
          query: { id: item.id }
        })
      },

      /** 获取支付方式列表 */
      GET_PaymentList() {
        this.loading = true
        API_Payment.getThirdPlatformList({
          type: 'PAY'
        }).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .payment-wrap {
    background: #fff;
    padding: 20px;
    display: flex;
    .payment-item {
      width: 300px;
      padding: 10px;
      border: 1px solid #efefef;
      margin: 0 10px 10px 0;
      .payment-title {
        border: 1px solid #efefef;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
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
        .retrace-type-active {
          color: #67C23A !important;
        }
        .retrace-type {
          font-size: 13px;
          color: #333;
        }
      }
    }
  }
</style>
