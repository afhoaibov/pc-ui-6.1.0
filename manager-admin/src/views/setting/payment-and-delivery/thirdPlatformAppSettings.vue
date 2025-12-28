<template>
  <div class="payment-wrap">
    <div
      class="payment-item"
      v-for="item in tableData"
      :key="item.id">
      <div
        :class="[`${item.client_type}`, 'payment-title']" >
        <p>{{item.app_name}}</p>
      </div>
      <div class="btn-box">
        <!-- <span :class="['retrace-type', item.disable === 1 ? 'retrace-type-active' : '']">{{item.disable === 1 ? '已启用' : '未启用'}}</span> -->
        <el-switch
          v-model="item.disable"
          :active-value="1"
          :inactive-value="0"
          @change="(status) => changeSwitch(status, item)"  />
        <el-button type="primary" plain @click="editPayment(item)">设置</el-button>
      </div>
    </div>
    <!-- 设置弹窗 -->
    <app-settings-dialog
      v-if="dialogPayment.show"
      v-model="dialogPayment.show"
      :appItem="dialogPayment.appItem"
      @closeDialog="dialogPayment.show = false"
      @submitSuccess="GET_AppList"  />
  </div>
</template>

<script>
  import * as API_Payment from '@/api/payment'
  import AppSettingsDialog from './components/AppSettingsDialog'

  export default {
    components: {
      AppSettingsDialog
    },
    name: 'thirdPlatformAppSettings',
    data() {
      return {
        dialogPayment: {
          show: false,
          appItem: {}
        },
        params: {
          plugin_id: this.$route.query.plugin_id
        },
        tableData: []
      }
    },
    mounted() {
      this.GET_AppList()
    },
    methods: {
      /** 切换状态 */
      changeSwitch(disable, item) {
        API_Payment.changeThirdAppStatus(item.id, { disable }).then(res => {
          const msg = disable ? '开启成功' : '关闭成功'
          this.$message.success(msg)
          this.GET_AppList()
        })
      },
      /** 编辑支付方式配置 */
      editPayment(item) {
        this.dialogPayment = {
          show: true,
          appItem: item
        }
      },
      /** 获取支付方式列表 */
      GET_AppList() {
        this.loading = true
        API_Payment.getAppList(this.params).then(response => {
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
    .APP {
      background: #F56C6C !important;
    }
    .MINI {
      background: #409EFF !important;
    }
    .payment-item {
      width: 260px;
      margin: 0 24px 10px 0;
      border-radius: 5px;
      border: 1px solid #efefef;
      .payment-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        height: 70px;
        font-weight: 500;
        color: #fff;
        background: #67C23A;
        border-radius: 5px 5px 0 0;
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
        padding: 0 10px 10px;
        .retrace-type-active {
          color: #67C23A !important;
        }
        .retrace-type {
          font-size: 12px;
          color: #333;
        }
      }
    }
  }
</style>
