<template>
  <div class="add-coupon">
    <div class="coupon">
      <el-form
        :model="couponForm"
        :rules="couponRules"
        ref="couponForm"
        label-width="120px"
        :status-icon="false"
        label-position="right">
        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="couponForm.title" :maxlength="10" placeholder="长度最多10个字符" clearable/>
        </el-form-item>
        <el-form-item label="优惠券面额" prop="coupon_price">
          <el-input
            v-model="couponForm.coupon_price"
            :maxlength="8"
            placeholder="请填写优惠券面额"
            clearable
            v-input.money
          >
            <template slot="prepend">{{MixinUnitOfCurrency}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="门槛金额" prop="coupon_threshold_price">
          <el-input
            v-model="couponForm.coupon_threshold_price"
            :maxlength="8"
            placeholder="请填写门槛金额"
            clearable
            v-input.money
          >
            <template slot="prepend">{{MixinUnitOfCurrency}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="店铺承担比例" prop="shop_commission">
          <el-input
            v-model="couponForm.shop_commission"
            placeholder="请填写0-100之间的整数"
            :maxlength="3"
            clearable
            v-input.int.zero
          >
            <template slot="append">%</template>
          </el-input>
          <p style="margin: auto;font-size: 10px;">提示：如果填写0，代表平台承担全部优惠金额</p>
        </el-form-item>
        <el-form-item label="生效方式" prop="effective_type">
          <el-radio-group v-model="couponForm.effective_type" @change="changeEffectiveType">
            <el-radio label="AUTO_TAKE_EFFECT">按有效期生效</el-radio>
            <el-radio label="EFFECTIVE_AFTER_RECEIVING">领取即生效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生效时间：" style="text-align: left" prop="time_range" v-if="timeType === 0">
          <el-date-picker
            v-model="couponForm.time_range"
            type="datetimerange"
            value-format="timestamp"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placement="bottom-start"
            clearable
            :default-time="[MixinDefaultTime, MixinDefaultTime]"
            :picker-options="{disabledDate(time) { return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime() > Date.now() + (8.64E7 * 29) + 300000 }}">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效天数：" prop="effective_days" v-if="timeType === 1">
          <el-input
            v-model="couponForm.effective_days"
            placeholder="请填写有效天数"
            :maxlength="8"
            label-width="100"
            v-input.int
          ></el-input>
        </el-form-item>
        <el-form-item label="发放数量" prop="create_num">
          <el-input
            v-model="couponForm.create_num"
            :maxlength="8"
            placeholder="请填写发放数量"
            clearable
            v-input.int
          />
        </el-form-item>
        <el-form-item label="限领数量" prop="limit_num">
          <el-input
            v-model="couponForm.limit_num"
            :maxlength="8"
            placeholder="请填写限领数量"
            clearable
            v-input.int.zero
          />
          <p style="margin: auto;font-size: 10px;">提示：如果填写0，代表不限制用户领取优惠券数量</p>
        </el-form-item>
        <el-form-item label="适用范围" prop="use_scope">
          <el-radio-group v-model="couponForm.use_scope">
            <el-radio label="ALL">全品</el-radio>
            <el-radio label="CATEGORY">分类</el-radio>
            <el-radio label="SOME_GOODS">部分商品</el-radio>
          </el-radio-group>
        </el-form-item>
       <!--部分商品选择器-->
        <el-form-item v-if="this.couponForm.use_scope === 'SOME_GOODS'">
          <en-table-layout
            toolbar
            pagination
            :tableData="tableData">
            <div slot="toolbar" class="inner-toolbar">
              <div class="toolbar-btns">
                <el-button type="primary" @click="selectgoodslist" >选择商品</el-button>
              </div>
            </div>
            <template slot="table-columns">
              <el-table-column label="商品列表" width="180">
                <template slot-scope="scope">
                  <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'">
                    <img :src="scope.row.thumbnail" class="goods-image"/>
                  </a>
                </template>
              </el-table-column>
              <el-table-column label="商品名称">
                <template slot-scope="scope">
                  <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;">{{ scope.row.goods_name }}</a>
                </template>
              </el-table-column>
              <!-- 商品规格 -->
              <el-table-column label="规格SKU">
                <template slot-scope="scope">
                  <div class="sku-list">
                    <span v-if="scope.row.specs">{{ scope.row.specs }}</span>
                    <span v-else>{{ scope.row.properties_name }}</span>
                  </div>
                </template>
              </el-table-column>
              <!-- 商品售价 -->
              <el-table-column label="售价">
                <template slot-scope="scope">
                  <span>{{ scope.row.price | unitPrice }}</span>
                </template>
              </el-table-column>
            </template>
          </en-table-layout>
        </el-form-item>
        <!--分类选择器-->
        <el-form-item v-if="this.couponForm.use_scope === 'CATEGORY'">
            <el-cascader
            v-model="customValue"
            :options="cascaderOptions"
            :props="customProps"/>
        </el-form-item>
        <el-form-item>
        </el-form-item>
        <el-form-item label="适用范围描述" prop="scope_description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请填写适用范围描述"
            v-model="couponForm.scope_description"
            :maxlength="50"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveCoupon('couponForm')">保 存</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--商品选择器-->
    <en-goods-picker
      sku
      :show="dialogGoodsShow"
      :defaultData="goodsIds"
      @confirm="handleGoodsPickerConfirm"
      @close="dialogGoodsShow = false"/>
  </div>
</template>

<script>
    import { RegExp, Foundation } from '~/ui-utils'
    import * as API_Promotion from '@/api/promotion'
    import { cloneObj } from '@/utils/index'
    import request from '@/utils/request'

    export default {
      name: 'coupon',
      props: {
        couponId: {
          type: String,
          default: ''
        }
      },
      data() {
        const checkCouponPrice = (rule, value, callback) => {
          if (!value) {
            callback(new Error('请填写面额'))
          } else if (!RegExp.money.test(value)) {
            callback(new Error('请填写正确的面额'))
          } else if (value <= 0) {
            callback(new Error('优惠券面额不能为0'))
          } else {
            callback()
          }
        }
        const checkCouponThresholdPrice = (rule, value, callback) => {
          if (!value) {
            callback(new Error('请填写消费限额'))
          } else if (!RegExp.money.test(value)) {
            callback(new Error('请填写正确的消费限额'))
          } else if (value <= 0) {
            callback(new Error('消费限额不能为0'))
          } else {
            callback()
          }
        }
        const checkCreateNum = (rule, value, callback) => {
          if (!value) {
            callback(new Error('请填写发放量'))
          } else if (!RegExp.integer.test(value)) {
            callback(new Error('请填写正整数'))
          } else if (parseInt(value) < parseInt(this.couponForm.limit_num)) {
            callback(new Error('每人限领数量不得大于发行量'))
          } else {
            callback()
          }
        }
        const checkLimitNum = (rule, value, callback) => {
          if (!value && parseInt(value) !== 0) {
            callback(new Error('请填写每人限领数量'))
          } else if (!RegExp.integer.test(value) && parseInt(value) !== 0) {
            callback(new Error('请填写正整数'))
          } else if (parseInt(value) > parseInt(this.couponForm.create_num)) {
            callback(new Error('每人限领数量不得大于发行量'))
          } else {
            callback()
          }
        }
        const checkShopCommission = (rule, value, callback) => {
          if (!value && parseInt(value) !== 0) {
            callback(new Error('请填写店铺承担比例'))
          } else if (!RegExp.integer.test(value) && Number(value) !== 0) {
            callback(new Error('请填写0-100之间的正整数'))
          } else if (parseInt(value) > 100) {
            callback(new Error('店铺承担比例超过上限值'))
          } else {
            callback()
          }
        }
        const checkEffectiveDaysNum = (rule, value, callback) => {
          if (!value) {
            callback(new Error('请填写有效天数'))
          } else if (!RegExp.integer.test(value)) {
            callback(new Error('请填写正整数'))
          } else if (parseInt(value) === 0) {
            callback(new Error('有效天数不能为0'))
          } else if (parseInt(value) > 1000) {
            callback(new Error('有效天数不能超过1000'))
          } else {
            callback()
          }
        }
        return {
          customProps: {
            multiple: true,
            value: 'category_id',
            label: 'name',
            children: 'children',
            disabled: 'disabled'
          },
          cascaderOptions: [],
          // 已选分类组
          customValue: [],
          /** 商品默认数据 */
          defaultGoodsData: [],
          dialogGoodsShow: false,
          /** 商品skuIds */
          goodsIds: [],
          /** 商品表格信息*/
          tableData: [],
          /** 商品选择器最大长度*/
          maxsize: 0,
          // 根据商品id，获取商品列表API
          multipleGoodsApi: 'admin/goods/skus/@ids/details',
          /** 列表参数 */
          categoryApi: '/admin/goods/categories/@ids/children',
          isCategory: false,
          params: {
            coupon_id: ''
          },
          /** 显示哪种有效时间 */
          timeType: 0,
          /** 添加，编辑优惠劵  表单*/
          couponForm: {
            title: '',
            coupon_price: '',
            coupon_threshold_price: '',
            shop_commission: '',
            time_range: [],
            create_num: '',
            limit_num: '',
            type: 'FREE_GET',
            effective_type: 'AUTO_TAKE_EFFECT',
            effective_days: '',
            use_scope: 'ALL',
            coupon_type: 'NORMAL'
          },
          /** 添加，编辑优惠劵  表单规则*/
          couponRules: {
            /** 优惠券名称 */
            title: [
              { required: true, message: '请填写活动名称', trigger: 'blur' }
            ],

            /** 优惠券面额 */
            coupon_price: [
              { required: true, message: '请填写面额', trigger: 'blur' },
              { validator: checkCouponPrice, trigger: 'blur' }
            ],

            /** 消费限额 */
            coupon_threshold_price: [
              { required: true, message: '请填写消费限额', trigger: 'blur' },
              { validator: checkCouponThresholdPrice, trigger: 'blur' }
            ],

            /** 发放量 */
            create_num: [
              { required: true, message: '请填写发放量', trigger: 'blur' },
              { validator: checkCreateNum, trigger: 'blur' }
            ],

            /** 每人限领 */
            limit_num: [
              { required: true, message: '请填写限领数量', trigger: 'blur' },
              { validator: checkLimitNum, trigger: 'blur' }
            ],

            /** 优惠券有效期 */
            time_range: [{ required: true, message: '请选择优惠券有效期', trigger: 'blur' }],

            /** 店铺承担比例 */
            shop_commission: [
              { required: true, validator: checkShopCommission, trigger: 'blur' }
            ],

            /** 适用范围 */
            use_scope: [{ required: true, message: '请填写适用范围', trigger: 'blur' }],

            /** 生效方式 */
            effective_type: [{ required: true, message: '请选择生效方式', trigger: 'blur' }],

            /** 有效天数 */
            effective_days: [
              { required: true, message: '请填写有效天数', trigger: 'blur' },
              { validator: checkEffectiveDaysNum, trigger: 'blur' }
            ]
          }
        }
      },
      watch: {
        couponId: {
          async handler(val) {
            if (val) {
              this.params.coupon_id = val
              await this.GET_CategoryData()
              this.GET_CouponActivity()
            } else {
              this.GET_CategoryData()
              this.couponForm = {
                title: '',
                coupon_price: '',
                coupon_threshold_price: '',
                shop_commission: '',
                time_range: [],
                create_num: '',
                limit_num: '',
                type: 'FREE_GET',
                effective_type: 'AUTO_TAKE_EFFECT',
                effective_days: '',
                use_scope: 'ALL',
                coupon_type: 'NORMAL'
              }
            }
          },
          immediate: true
        }
      },
      methods: {
        /** 生效方式切换事件 */
        changeEffectiveType(val) {
          if (val === 'EFFECTIVE_AFTER_RECEIVING') {
            this.timeType = 1
          } else {
            this.timeType = 0
          }
        },
        /** 查询单个优惠劵信息 */
        GET_CouponActivity() {
          API_Promotion.queryCoupons(this.params.coupon_id).then(response => {
            let prevCascader = []
            if (response.scope_id && typeof response.scope_id === 'string') {
              prevCascader = response.scope_id.split(',').filter(item => !!item).map(item => +item)
            }
            function next(params, prev) {
              for (let i = 0; i < params.length; i++) {
                const item = params[i]
                if (item.children) {
                  next(item.children, [...prev, item])
                } else {
                  if (prevCascader.includes(+item.category_id)) {
                    prevCascader = prevCascader.map(key => {
                      if (+key === +item.category_id) {
                        let result = prev.map(item => item.category_id)
                        return [...result, item.category_id]
                      } else {
                        return key
                      }
                    })
                  } else {
                    i === params.length - 1 && (prev = [])
                  }
                }
              }
            }

            if (response.use_scope === 'SOME_GOODS') {
              this.goodsIds = response.scope_id.split(',')
              this.defaultGoodsData = prevCascader
              response.scope_id && this.GET_GoodsByGoodsIdGroup(response.scope_id)
            } else if (response.use_scope === 'CATEGORY') {
              next(this.cascaderOptions, [])
              this.customValue = prevCascader.filter((cate) => Array.isArray(cate))
            }

            this.couponForm = {
              ...response
            }
            if (response.effective_type === 'EFFECTIVE_AFTER_RECEIVING') {
              this.timeType = 1
            } else {
              this.timeType = 0
              this.couponForm.time_range = [parseInt(response.start_time) * 1000, parseInt(response.end_time) * 1000]
            }
          })
        },
        /**  显示商品选择器*/
        selectgoodslist() {
          this.dialogGoodsShow = true
        },
        /** 保存商品选择器选择的商品 */
        handleGoodsPickerConfirm(val) {
          this.tableData = cloneObj(val)
          this.defaultGoodsData = this.goodsIds = this.tableData.map(key => key.sku_id)
        },
        /** 提交优惠劵表单 */
        handleSaveCoupon(couponForm) {
          this.$refs[couponForm].validate((valid) => {
            const params = this.MixinClone(this.couponForm)
            const _time_range = params.time_range
            if (_time_range && _time_range[1] < new Date().getTime()) {
              this.$message.error('优惠券有效期结束时间必须大于当前时间!')
              return
            }
            if (valid) {
              const { coupon_id } = params
              const { customValue } = this
              console.log(customValue)
              let cateList = []
              delete params.time_range
              switch (params.use_scope) {
                case 'ALL':
                  params.scope_id = 0
                  break
                case 'CATEGORY':
                  customValue.map(item => cateList.push(...item))
                  cateList = Array.from(new Set(cateList))
                  params.scope_id = cateList.join(',')
                  break
                case 'SOME_GOODS':
                  params.scope_id = this.goodsIds
                  break
              }
              if (params.effective_type === 'EFFECTIVE_AFTER_RECEIVING') {
                params.start_time = ''
                params.end_time = ''
              } else {
                params.effective_days = ''
                params.start_time = _time_range[0] / 1000
                params.end_time = _time_range[1] / 1000
              }
              if (coupon_id) {
                API_Promotion.editCoupons(coupon_id, params).then(response => {
                  this.dialogCouponVisible = false
                  this.$message.success('修改成功！')
                  this.$store.dispatch('delCurrentViews', {
                    view: this.$route,
                    $router: this.$router
                  })
                  this.$router.push('/promotions/coupon-list')
                })
              } else {
                API_Promotion.addCoupons(params).then(response => {
                  this.$message.success('添加成功！')
                  this.$store.dispatch('delCurrentViews', {
                    view: this.$route,
                    $router: this.$router
                  })
                  this.$router.push({ name: 'couponList' })
                })
              }
            } else {
              this.$message.error('表单填写有误，请检查！')
              return false
            }
          })
        },
        /* 获取 目录树结构 */
        async GET_CategoryData(id = 0) {
          return await request({
            url: this.categoryApi.replace('@ids', id),
            method: 'get',
            loading: false
          }).then(response => {
            function next(params) {
              for (let i = 0; i < params.length; i++) {
                const item = params[i]
                if (item.children) {
                  if (Array.isArray(item.children) && item.children.length) {
                    next(item.children)
                  } else {
                    item.children = null
                  }
                } else {
                  item.children = null
                }
              }
            }
            next(response)
            this.cascaderOptions = response
          })
        },
        /** 根据商品编号获取商品信息 */
        GET_GoodsByGoodsIdGroup(ids) {
          ids = typeof ids === 'string'
            ? ids.replace(/，/g, ',')
            : ids.join(',')
          ids = ids.split(',').filter(item => !!item).join(',')
          return new Promise((resolve, reject) => {
            request({
              url: this.multipleGoodsApi.replace('@ids', ids),
              method: 'get',
              loading: false
            }).then(response => {
              const data = response.map(item => {
                item.goods_image = item.thumbnail
                item.goods_price = item.price
                return item
              })
              this.tableData = data
            }).catch(reject)
          })
        }
      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
  .add-coupon {
    ::v-deep .el-input {
      max-width: 400px;
    }
    ::v-deep .el-textarea__inner {
      max-width: 500px;
    }
  }
  .coupon{
    background-color: #fff;
    // border: 1px solid #9a9a9a;
    margin: 10px;
    // padding: 25px;
  }
  .goods-image{
    width:50px;
    height:50px;
  }
</style>
