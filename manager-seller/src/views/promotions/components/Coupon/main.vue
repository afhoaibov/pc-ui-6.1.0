<template>
  <el-dialog :title="couponTitle" :visible.sync="couponShow" :close-on-click-modal="false" width="40%">
    <el-form :model="couponForm" ref="couponForm" label-position="right" :rules="rules"  label-width="120px">
      <el-form-item label="优惠券名称：" prop="title">
        <el-input
          auto-complete="off"
          v-model="couponForm.title"
          @change="couponForm.title = couponForm.title.trim()"
          placeholder="长度最多10个字符"
          maxLength="10"
          label-width="100"></el-input>
      </el-form-item>
      <el-form-item label="优惠券面额：" prop="coupon_price">
        <el-input placeholder="长度最多8个字符" maxLength="8" v-model="couponForm.coupon_price">
          <template slot="prepend">{{MixinUnitOfCurrency}}</template>
        </el-input>
      </el-form-item>
      <el-form-item label="门槛金额：" prop="coupon_threshold_price">
        <el-input placeholder="用户消费需达到此金额才可使用优惠券" maxlength="8" v-model="couponForm.coupon_threshold_price">
          <template slot="prepend">{{MixinUnitOfCurrency}}</template>
        </el-input>
      </el-form-item>
      <el-form-item label="领取方式" prop="type">
        <el-radio-group v-model="couponForm.type" @change="changeReceiveCoupon">
          <el-radio label="FREE_GET" v-if="showFreeType">免费领取</el-radio>
          <el-radio label="ACTIVITY_GIVE">活动赠送</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生效方式" prop="effective_type">
        <el-radio-group v-model="couponForm.effective_type" @change="changeEffectiveType">
          <el-radio label="AUTO_TAKE_EFFECT" v-if="showAutoTakeEffect">按有效期生效</el-radio>
          <el-radio label="EFFECTIVE_AFTER_RECEIVING">领取即生效</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生效时间：" style="text-align: left" prop="coupon_time_limit" v-if="timeType === 0">
        <el-date-picker
          v-model="couponForm.coupon_time_limit"
          type="datetimerange"
          value-format="timestamp"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
          :editable="false"
          @input="handleTimeChange"
          :default-time="[MixinDefaultTime, MixinDefaultTime]"
          :picker-options="{disabledDate(time) { return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime()   > Date.now()  + (8.64E7 * 29) + 300000 }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="有效天数：" prop="effective_days" v-if="timeType === 1">
        <el-input v-model="couponForm.effective_days" placeholder="请输入8位数以下的正整数" maxlength="8" label-width="100"></el-input>
      </el-form-item>
      <el-form-item label="发放数量：" prop="create_num">
        <el-input v-model="couponForm.create_num" placeholder="请输入8位数以下的正整数" maxlength="8" label-width="100"></el-input>
      </el-form-item>
      <el-form-item label="限领数量：" prop="limit_num">
        <el-input v-model="couponForm.limit_num" placeholder="请输入8位数以下的正整数" maxlength="8"  label-width="100"></el-input>
        <p style="margin: auto;font-size: 10px;color: #e97070;">提示：如果填写0，代表不限制用户领取优惠券数量</p>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancelCoupon">取 消</el-button>
      <el-button type="primary" @click="handleReserveCoupon">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import * as API_coupon from '@/api/coupon'
  import { RegExp } from '~/ui-utils'
  import { cloneObj } from '@/utils'

  export default {
    name: 'Coupon',
    data() {
      const checkCouponPrice = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入优惠券面额'))
        } else if (!RegExp.money.test(value)) {
          callback(new Error('请输入正确的面额'))
        } else if (value <= 0) {
          callback(new Error('优惠券面额不能为0'))
        } else {
          callback()
        }
      }
      const checkCouponThresholdPrice = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入消费门槛金额'))
        } else if (!RegExp.money.test(value)) {
          callback(new Error('请输入正确的金额'))
        } else if (value <= 0) {
          callback(new Error('消费门槛金额不能为0'))
        } else {
          callback()
        }
      }
      const checkEffectiveDaysNum = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入有效天数'))
        } else if (!RegExp.integer.test(value)) {
          callback(new Error('请输入正整数'))
        } else if (parseInt(value) === 0) {
          callback(new Error('有效天数不能为0'))
        } else if (parseInt(value) > 1000) {
          callback(new Error('有效天数不能超过1000'))
        } else {
          callback()
        }
      }
      const checkCreateNum = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入发放数量'))
        } else if (!RegExp.integer.test(value)) {
          callback(new Error('请输入正整数'))
        } else if (parseInt(value) < parseInt(this.couponForm.limit_num)) {
          callback(new Error('每人限领数量不得大于发放数量'))
        } else {
          callback()
        }
      }
      const checkLimitNum = (rule, value, callback) => {
        if (!value && parseInt(value) !== 0) {
          callback(new Error('请输入每人限领数量'))
        } else if (!RegExp.integer.test(value) && parseInt(value) !== 0) {
          callback(new Error('请输入正整数'))
        } else if (parseInt(value) > parseInt(this.couponForm.create_num)) {
          callback(new Error('每人限领数量不得大于发放数量'))
        } else {
          callback()
        }
      }

      return {
        /** 是否显示优惠券弹框 */
        couponShow: false,
        /** 显示哪种有效时间 */
        timeType: 0,
        /** 是否显示按有效期生效 */
        showAutoTakeEffect: true,
        /** 优惠券表单*/
        couponForm: {
          title: '',
          coupon_price: '',
          coupon_threshold_price: '',
          coupon_time_limit: [],
          create_num: '',
          limit_num: '',
          type: 'FREE_GET',
          effective_type: 'AUTO_TAKE_EFFECT',
          effective_days: ''
        },

        /** 表单校验规则 */
        rules: {
          /** 优惠券名称 */
          title: [
            { required: true, message: '请输入优惠券名称', trigger: 'blur' }
          ],

          /** 优惠券面额 */
          coupon_price: [
            { required: true, message: '请输入优惠券面额', trigger: 'blur' },
            { validator: checkCouponPrice, trigger: 'blur' }
          ],

          /** 门槛金额 */
          coupon_threshold_price: [
            { required: true, message: '请输入门槛金额', trigger: 'blur' },
            { validator: checkCouponThresholdPrice, trigger: 'blur' }
          ],

          /** 生效时间 */
          coupon_time_limit: [
            { required: true, message: '请输入生效时间', trigger: 'blur' },
            { type: 'array', trigger: 'blur' }
          ],

          /** 有效天数 */
          effective_days: [
            { required: true, message: '请输入有效天数', trigger: 'blur' },
            { validator: checkEffectiveDaysNum, trigger: 'blur' }
          ],

          /** 发放数量 */
          create_num: [
            { required: true, message: '请输入优惠券发放数量', trigger: 'blur' },
            { validator: checkCreateNum, trigger: 'blur' }
          ],

          /** 每人限领 */
          limit_num: [
            { required: true, message: '请输入限领数量', trigger: 'blur' },
            { validator: checkLimitNum, trigger: 'blur' }
          ],

          /** 领取方式 */
          type: [{ required: true, message: '请选择领取方式', trigger: 'blur' }],

          /** 生效方式 */
          effective_type: [{ required: true, message: '请选择生效方式', trigger: 'blur' }]
        }
      }
    },
    computed: {
      couponTitle() {
        return this.currentcouponId ? '编辑优惠券' : '新增优惠券'
      }
    },
    props: {
      /** 是否显示优惠券弹框 */
      couponModelShow: {
        type: Boolean,
        default: false
      },

      /** 当前优惠券Id */
      currentcouponId: {
        type: String,
        default: ''
      },
      /** 是否显示免费领取类型 */
      showFreeType: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      couponModelShow() {
        this.couponShow = this.couponModelShow
        this.couponForm = {
          /** 优惠券名称*/
          title: '',

          /** 优惠券面额*/
          coupon_price: '',

          /** 使用限制*/
          coupon_threshold_price: '',

          /** 使用时限 */
          coupon_time_limit: [],

          /** 发放数量（个） */
          create_num: '',

          /** 每人限领 */
          limit_num: '',

          /** 领取方式 */
          type: 'FREE_GET',

          /** 生效方式 */
          effective_type: 'AUTO_TAKE_EFFECT',

          /** 有效天数 */
          effective_days: ''
        }
        /** 显示哪种有效时间 */
        this.timeType = 0
        /** 是否显示按有效期生效 */
        this.showAutoTakeEffect = true
        if (this.showFreeType === false) {
          // 仅限活动赠送
          this.couponForm.type = 'ACTIVITY_GIVE'
          this.changeReceiveCoupon('ACTIVITY_GIVE')
        }
        console.log(this.couponForm)
      },
      couponShow() {
        !this.couponShow && this.$emit('saveCoupon', false)
      },
      currentcouponId: {
        immediate: true,
        handler(val) {
          if (val) {
            this.GET_couponDetails()
          }
        }
      }
    },
    methods: {
      handleTimeChange(dateTime) {
        this.couponForm.coupon_time_limit = dateTime
        this.$forceUpdate()
      },
      /** 领取方式切换事件 */
      changeReceiveCoupon(val) {
        if (val === 'ACTIVITY_GIVE') {
          this.timeType = 1
          this.showAutoTakeEffect = false
          this.couponForm.effective_type = 'EFFECTIVE_AFTER_RECEIVING'
        } else {
          this.timeType = 0
          this.showAutoTakeEffect = true
          this.couponForm.effective_type = 'AUTO_TAKE_EFFECT'
        }
      },
      /** 生效方式切换事件 */
      changeEffectiveType(val) {
        if (val === 'EFFECTIVE_AFTER_RECEIVING') {
          this.timeType = 1
        } else {
          this.timeType = 0
        }
      },
      /** 查询一个优惠券详情 */
      GET_couponDetails() {
        API_coupon.getCouponDetails(this.currentcouponId).then(response => {
          this.couponForm = cloneObj(response)
          if (response.type === 'ACTIVITY_GIVE') {
            this.timeType = 1
            this.showAutoTakeEffect = false
          } else {
            this.timeType = 0
            this.showAutoTakeEffect = true
          }
          if (response.effective_type === 'EFFECTIVE_AFTER_RECEIVING') {
            this.timeType = 1
          } else {
            this.timeType = 0
            this.couponForm.coupon_time_limit = [parseInt(response.start_time) * 1000, parseInt(response.end_time) * 1000]
          }
        })
      },

      /** 取消 */
      handleCancelCoupon() {
        this.$emit('saveCoupon', false)
      },

      /** 保存优惠券*/
      handleReserveCoupon() {
        this.$refs['couponForm'].validate((valid) => {
          if (valid) {
            const couponForm = cloneObj(this.couponForm)
            const _params = {
              ...couponForm
            }
            if (couponForm.coupon_time_limit && couponForm.coupon_time_limit[1] < new Date().getTime()) {
              this.$message.error('优惠券有效期结束时间必须大于当前时间!')
              return
            }
            if (couponForm.effective_type === 'AUTO_TAKE_EFFECT' && couponForm.coupon_time_limit) {
              _params.start_time = couponForm.coupon_time_limit[0] / 1000
              _params.end_time = couponForm.coupon_time_limit[1] / 1000
            }
            delete _params.coupon_time_limit
            this.$confirm('优惠券被用户领取后不可再次编辑，是否确认？', '提示', { type: 'warning' }).then(() => {
              if (this.currentcouponId) {
                API_coupon.modifyCoupons(this.currentcouponId, _params).then(() => {
                  this.couponShow = false
                  this.$message.success('保存成功！')
                  this.$emit('saveCoupon', true)
                })
              } else {
                API_coupon.addCoupons(_params).then(() => {
                  this.couponShow = false
                  this.$message.success('保存成功！')
                  this.$emit('saveCoupon', true)
                })
              }
            }).catch(() => {})
          } else {
            this.$message.error('表单存在错误，请修改')
          }
        })
      }
    }
  }
</script>

<style lang="scss" type="scss" scoped>
  .el-date-editor {
    width: 100%;
  }
</style>
