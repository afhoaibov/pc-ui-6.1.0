<template>
  <div class="coupon-preview">
    <div class="coupon">
      <el-form
        :model="couponForm"
        ref="couponForm"
        label-width="120px"
        :status-icon="false"
        label-position="right">
        <el-form-item label="优惠券名称：">
          <span>{{ couponForm.title }}</span>
        </el-form-item>
        <el-form-item label="优惠券面额：">
          <span v-if="couponForm.coupon_price">{{ couponForm.coupon_price | unitPrice }}</span>
        </el-form-item>
        <el-form-item label="门槛金额：">
          <span v-if="couponForm.coupon_threshold_price">{{ couponForm.coupon_threshold_price | unitPrice }}</span>
        </el-form-item>
        <el-form-item label="店铺承担比例：">
          <span>{{ couponForm.shop_commission }}%</span>
        </el-form-item>
        <template v-if="couponForm.coupon_type !== 'NEWCOMER'">
          <el-form-item label="生效方式：" >
            <span v-if="couponForm.effective_type === 'AUTO_TAKE_EFFECT'">按有效期生效</span>
            <span v-if="couponForm.effective_type === 'EFFECTIVE_AFTER_RECEIVING'">领取即生效</span>
          </el-form-item>
          <el-form-item label="生效时间：">
            <span>{{ couponForm.effective_time_text }}</span>
          </el-form-item>
          <el-form-item label="发放数量：">
            <span>{{ couponForm.create_num }}</span>
          </el-form-item>
          <el-form-item label="限领数量：">
            <span v-if="couponForm.limit_num === 0">不限制（用户可重复可领）</span>
            <span v-else>每位用户最多可领取 {{ couponForm.limit_num }} 张优惠券</span>
          </el-form-item>
          <el-form-item label="已领数量：">
            <span>{{ couponForm.received_num }}</span>
          </el-form-item>
          <el-form-item label="已用数量：">
            <span>{{ couponForm.used_num }}</span>
          </el-form-item>
        </template>
        <el-form-item label="创建时间：">
          <span v-if="couponForm.create_time">{{ couponForm.create_time | unixToDate }}</span>
        </el-form-item>
        <el-form-item label="适用范围：">
          <span v-if="couponForm.use_scope === 'ALL'">全部商品</span>
          <span v-if="couponForm.use_scope === 'CATEGORY'">分类商品</span>
          <span v-if="couponForm.use_scope === 'SOME_GOODS'">部分商品</span>
        </el-form-item>
        <!--部分商品选择器-->
        <div v-if="this.couponForm.use_scope === 'SOME_GOODS'">
          <en-table-layout
            toolbar
            pagination
            style="width: 100%;"
            :tableData="tableData">
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
                  <span>{{scope.row.goods_name}}</span>
                  <!-- <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;" v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a> -->
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
        </div>
        <!--分类选择器-->
        <el-form-item v-if="this.couponForm.use_scope === 'CATEGORY'">
          <el-cascader
            v-model="customValue"
            :options="cascaderOptions"
            :props="customProps"/>
        </el-form-item>

        <el-form-item label="适用范围描述：">
          <span>{{ couponForm.scope_description }}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import * as API_Promotion from '@/api/promotion'
  import request from '@/utils/request'

  export default {
    name: 'CouponPreview',
    props: {
      couponId: {
        type: String
      }
    },
    data() {
      return {
        customProps: {
          multiple: true,
          value: 'category_id',
          label: 'name',
          children: 'children',
          disabled: 'disabled'
        },
        cascaderOptions: [],
        customValue: [],
        // 根据商品id，获取商品列表API
        multipleGoodsApi: 'admin/goods/skus/@ids/details',
        /** 商品表格信息*/
        tableData: [],
        /** 列表参数 */
        categoryApi: '/admin/goods/categories/@ids/children',
        /** 优惠券表单信息 */
        couponForm: {}
      }
    },
    watch: {
      couponId: {
        immediate: true,
        async handler(newVal) {
          if (newVal) {
            await this.GET_CategoryData()
            this.GET_CouponActivity()
          }
        }
      }
    },
    methods: {
      /** 查询单个优惠劵信息 */
      GET_CouponActivity() {
        API_Promotion.queryCoupons(this.couponId).then(response => {
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
  .coupon-preview {
    ::v-deep .el-input {
      max-width: 400px;
    }
    ::v-deep .el-textarea__inner {
      max-width: 500px;
    }
  }
  .coupon{
    margin: 10px;
    padding: 25px;
  }
  .goods-image{
    width:50px;
    height:50px;
  }
</style>
