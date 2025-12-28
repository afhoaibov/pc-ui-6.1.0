<template>
  <div>
    <el-form :model="orderForm" ref="orderForm" label-width="160px" style="width: 700px">
      <el-form-item label="自动取消订单时间">
        <el-input-number size="small" v-model="orderForm.cancel_order_day" :min="0" :max="365"></el-input-number>
        天&nbsp;
        <el-input-number size="small" v-model="orderForm.cancel_order_hour" :min="0" :max="23"></el-input-number>
        小时&nbsp;
        <el-input-number size="small" v-model="orderForm.cancel_order_minutes" :min="0" :max="60"></el-input-number>
        分钟&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天0小时0分钟，用户在今天12:00下单，<br/>那么在不付款的情况下，此订单会在明天的12:00自动取消<br/>(注意订单取消时间总数不能小于30分钟)</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="自动确认收货时间">
        <el-input-number size="small" v-model="orderForm.rog_order_day" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00发货，<br/>那么在用户不手动确认收货的情况下，<br/>此订单会在明天的12:00自动确认收货</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="自动完成订单时间">
        <el-input-number size="small" v-model="orderForm.complete_order_day" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00确认收货，<br/>那么此订单会在明天的12:00自动完成</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="订单售后自动失效时间">
        <el-input-number size="small" v-model="orderForm.service_expired_day" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00自动完成，<br/>那么在用户不申请售后的情况下，<br/>此订单会在明天的12:00后不能申请售后</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="订单投诉自动失效时间">
        <el-input-number size="small" v-model="orderForm.complain_expired_day" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00确认完成，<br/>那么在用户不申请订单投诉的情况下，<br/>此订单会在明天的12:00后不能进行投诉申请</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="订单自动好评时间">
        <el-input-number size="small" v-model="orderForm.comment_order_day" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00确认收货，<br/>那么在用户不手动对订单商品进行评价的情况下，<br/>此订单会在明天的12:00后自动好评</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="订单自动确认收款时间">
        <el-input-number size="small" v-model="orderForm.complete_order_pay" :min="1" :max="99"></el-input-number>
        天&nbsp;
        <el-tooltip effect="light" placement="right">
          <div slot="content">例如设置为1天，订单在今天12:00确认收货，<br/>那么在商家不手动对订单进行确认收款的情况下，<br/>此订单会在明天的12:00后自动确认收款<br/>（此设置只针对货到付款的订单）</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="$refs['authRef'].open()">保存设置</el-button>
      </el-form-item>
    </el-form>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="submitEditOrderSetting"/>
  </div>
</template>

<script>
  import * as API_Order from '@/api/order'

  export default {
    name: 'SystemSettingsOrder',
    data() {
      return {
        /** 订单设置 */
        orderForm: {
          cancel_order_day: 1,
          cancel_order_hour: 0,
          cancel_order_minutes: 0,
          rog_order_day: 10,
          comment_order_day: 15,
          service_expired_day: 30,
          complain_expired_day: 30,
          complete_order_day: 7,
          complete_order_pay: 3
        }
      }
    },
    mounted() {
      /** 获取订单设置数据 */
      API_Order.getOrderSettings().then(response => {
        Object.keys(this.orderForm).forEach(key => {
          this.orderForm[key] = response[key]
        })
      })
    },
    methods: {
      /** 提交订单设置表单 */
      submitEditOrderSetting() {
        const orderForm = this.orderForm
        if (!orderForm.cancel_order_day && !orderForm.cancel_order_hour && orderForm.cancel_order_minutes < 30) {
          this.$message.error('订单自动取消时间不可小于30分钟！')
          return
        }
        API_Order.editOrderSettings(orderForm).then(() => {
          this.$message.success('修改成功！')
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
</style>
