<template>
  <div class="add-new-user-coupon">
    <div class="coupon">
      <el-form
        :model="couponForm"
        :rules="couponRules"
        ref="couponForm"
        label-width="120px"
        :status-icon="false"
        label-position="right">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="couponForm.title" :maxlength="10" placeholder="长度最多10个字符" clearable/>
        </el-form-item>
        <el-form-item label="优惠券面额" prop="coupon_price">
          <el-input v-model="couponForm.coupon_price" :maxlength="8" placeholder="长度最多8个字符" clearable>
            <template slot="prepend">{{MixinUnitOfCurrency}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="门槛金额" prop="coupon_threshold_price">
          <el-input v-model="couponForm.coupon_threshold_price" :maxlength="8" placeholder="长度最多8个字符" clearable>
            <template slot="prepend">{{MixinUnitOfCurrency}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="店铺承担比例" prop="shop_commission">
          <el-input v-model="couponForm.shop_commission" placeholder="请输入0-100之间的整数" :maxlength="3" clearable>
            <template slot="append">%</template>
          </el-input>
          <p style="margin: auto;font-size: 10px;">提示：如果填写0，代表平台承担全部优惠金额</p>
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
            placeholder="请输入适用范围描述"
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
            callback(new Error('请输入面额'))
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
            callback(new Error('请输入消费限额'))
          } else if (!RegExp.money.test(value)) {
            callback(new Error('请输入正确的消费限额'))
          } else if (value <= 0) {
            callback(new Error('消费限额不能为0'))
          } else {
            callback()
          }
        }
        const checkShopCommission = (rule, value, callback) => {
          if (!value && parseInt(value) !== 0) {
            callback(new Error('请输入店铺承担比例'))
          } else if (!RegExp.integer.test(value) && Number(value) !== 0) {
            callback(new Error('请输入0-100之间的正整数'))
          } else if (parseInt(value) > 100) {
            callback(new Error('店铺承担比例超过上限值'))
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
          // 获取商品列表API
          /** 商品默认数据 */
          defaultGoodsData: [],
          dialogGoodsShow: false,
          /** 商品skuIds */
          goodsIds: [],
          /** 商品表格信息*/
          tableData: [],
          /** 商品选择器最大长度*/
          maxsize: 0,
          /** 列表参数 */
          categoryApi: '/admin/goods/categories/@ids/children',
          isCategory: false,
          params: {
            coupon_id: ''
          },
          /** 添加，编辑优惠劵  表单*/
          couponForm: {
            title: '',
            coupon_price: '',
            coupon_threshold_price: '',
            shop_commission: '',
            use_scope: 'ALL',
            coupon_type: 'NEWCOMER'
          },
          /** 添加，编辑优惠劵  表单规则*/
          couponRules: {
            /** 优惠券名称 */
            title: [
              { required: true, message: '请输入活动名称', trigger: 'blur' }
            ],

            /** 优惠券面额 */
            coupon_price: [
              { required: true, message: '请输入面额', trigger: 'blur' },
              { validator: checkCouponPrice, trigger: 'blur' }
            ],

            /** 消费限额 */
            coupon_threshold_price: [
              { required: true, message: '请输入消费限额', trigger: 'blur' },
              { validator: checkCouponThresholdPrice, trigger: 'blur' }
            ],

            /** 店铺承担比例 */
            shop_commission: [
              { required: true, validator: checkShopCommission, trigger: 'blur' }
            ],

            /** 适用范围 */
            use_scope: [{ required: true, message: '请输入适用范围', trigger: 'blur' }]
          }
        }
      },
      watch: {
        couponId: {
          handler(val) {
            if (val) {
              this.params.coupon_id = val
              this.GET_CouponActivity()
            } else {
              this.couponForm = {
                title: '',
                coupon_price: '',
                coupon_threshold_price: '',
                shop_commission: '',
                use_scope: 'ALL',
                coupon_type: 'NEWCOMER'
              }
            }
          },
          immediate: true
        }
      },
      async mounted() {
        await this.GET_CategoryData()
      },
      methods: {
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
              this.defaultGoodsData = prevCascader
              response.scope_id && this.GET_GoodsByGoodsIdGroup(response.scope_id)
            } else if (response.use_scope === 'CATEGORY') {
              next(this.cascaderOptions, [])
              this.customValue = prevCascader.filter((cate) => Array.isArray(cate))
            }

            this.couponForm = {
              ...response
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

            if (valid) {
              const { coupon_id } = params
              const { customValue } = this
              let cateList = []
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
  .add-new-user-coupon {
    ::v-deep .el-input {
      max-width: 400px;
    }
    ::v-deep .el-textarea__inner {
      max-width: 500px;
    }
  }
  .coupon{
    background-color: #fff;
    margin: 10px;
  }
  .goods-image{
    width:50px;
    height:50px;
  }
</style>
