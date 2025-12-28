<template>
  <div class="shop-info-wrap" v-loading="loading" ref="shopInfoWrap">
    <div class="float-tab-content">
      <p
        :class="[{'active-tab' : floatTabIndex === index}, 'btn-item']"
        v-for="(item, index) of floatTab"
        :key="index"
        @click="changePosition(item, index)">{{item.name}}</p>
    </div>
    <el-row :gutter="0">
      <div class="d-header" ref="baseInfo">基本信息</div>
      <el-col :span="12" class="item">
        <p class="item-label">公司名称: </p>
        <span class="item-value">{{shopDetail.company_name}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">公司地址： </p>
        <span class="item-value">{{shopDetail.company_address}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">公司电话： </p>
        <span class="item-value">{{shopDetail.company_phone}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">员工总数：</p>
        <span class="item-value">{{shopDetail.employee_num}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">注册资金：</p>
        <span class="item-value">{{shopDetail.reg_money}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">联系姓名：</p>
        <span class="item-value">{{shopDetail.link_name}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">联系电话：</p>
        <span class="item-value">{{shopDetail.link_phone | formatMobile}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">电子邮箱：</p>
        <span class="item-value">{{shopDetail.company_email}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">自营店铺：</p>
        <span class="item-value">{{shopDetail.self_operated ? '是' : '否'}}</span>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="businessLicense">营业执照信息</div>
      <el-col :span="24" class="item">
        <p class="item-label">法人姓名: </p>
        <span class="item-value">{{shopDetail.legal_name}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">法人身份证号： </p>
        <span class="item-value">{{shopDetail.legal_id}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">统一社会信用代码：</p>
        <span class="item-value">{{shopDetail.license_num}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">成立日期：</p>
        <span class="item-value" v-if="shopDetail.establish_date">{{shopDetail.establish_date | unixToDate('yyyy-MM-dd')}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">营业执照有效期：</p>
        <span class="item-value">
          {{shopDetail.licence_start | unixToDate('yyyy-MM-dd')}}
          <span v-if="Number(shopDetail.licence_end)">至 {{shopDetail.licence_end | unixToDate('yyyy-MM-dd')}}</span>
          <span v-else> - 永久</span>
        </span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">营业执照所在地：</p>
        <span class="item-value">{{ MixinFormatRegions(shopDetail, 'license_') }}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">营业执照详细地址：</p>
        <span class="item-value">{{shopDetail.license_add}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">法经营范围：</p>
        <span class="item-value">{{shopDetail.scope}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">法人身份证：</p>
        <img class="item-img" :src="shopDetail.legal_img" alt="" v-if="shopDetail.legal_img">
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">营业执照：</p>
        <img class="item-img" :src="shopDetail.licence_img" alt="" v-if="shopDetail.licence_img">
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="depositBank">开户银行许可证</div>
      <el-col :span="24" class="item">
        <p class="item-label">银行开户名: </p>
        <span class="item-value">{{shopDetail.bank_account_name}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">公司银行账号： </p>
        <span class="item-value">{{shopDetail.bank_number}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">开户银行支行名称：</p>
        <span class="item-value">{{shopDetail.bank_name}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">开户行所在地：</p>
        <span class="item-value">{{ MixinFormatRegions(shopDetail, 'bank_')}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">开户行许可证：</p>
        <img class="item-img" :src="shopDetail.bank_img" alt="" v-if="shopDetail.bank_img">
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="shopInfo">店铺信息</div>
      <el-col :span="24" class="item">
        <p class="item-label">店铺名称: </p>
        <span class="item-value">{{shopDetail.shop_name}}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">佣金比例： </p>
        <span class="item-value" v-if="shopDetail.shop_commission">{{shopDetail.shop_commission}} %</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">店铺所在地：</p>
        <span class="item-value">{{ MixinFormatRegions(shopDetail, 'shop_') }}</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">店铺详细地址：</p>
        <span class="item-value">{{shopDetail.shop_add}}</span>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="businessCategory">经营类目</div>
      <el-col :span="24" style="padding: 20px;" class="business">
        <el-checkbox-group disabled  v-model="shopDetail.goods_management_category">
          <el-checkbox v-for="cat in category" :label="cat.id" :key="cat.id">{{ cat.name }}</el-checkbox>
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row :gutter="0">
      <div class="d-header" ref="financial">财务信息</div>
      <el-col :span="24" class="item">
        <p class="item-label">结算日：</p>
        <span class="item-value">已添加{{settlementDate.length}}个结算日，最多可添加5个结算日</span>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">每月：</p>
        <el-tag
          class="tag-item"
          :key="tag"
          v-for="(tag, index) in settlementDate"
          :disable-transitions="false"
          @close="handleCloseTag(index)">
          {{tag}}
        </el-tag>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">订单结算状态：</p>
        <el-checkbox-group v-model="checkList" >
          <el-checkbox
            disabled
            v-for="child in settlementStatus"
            :key="child.value"
            :label="child.value"
            >{{child.label}}</el-checkbox>
        </el-checkbox-group>
      </el-col>
      <el-col :span="24" class="item">
        <p class="item-label">店铺保证金：</p>
        <span class="item-value">{{shopDetail.remaining_margin}}</span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import * as API_Shop from '@/api/shop'
  import * as API_Category from '@/api/category'

  const settlementStatus = [
    { label: '已付款', value: 'PAID_OFF' },
    { label: '已完成', value: 'COMPLETE' },
    { label: '售后失效', value: 'EXPIRED' }
  ]
  export default {
    name: 'ShopDetailPreview',
    props: {
      shopId: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        settlementStatus,
        // 店铺数据
        shopDetail: {},
        // 类目数据
        category: [],
        loading: true,
        floatTab: [
          { name: '基本信息', type: 'baseInfo' },
          { name: '营业执照信息', type: 'businessLicense' },
          { name: '开户银行许可证', type: 'depositBank' },
          { name: '店铺信息', type: 'shopInfo' },
          { name: '经营类目', type: 'businessCategory' },
          { name: '财务信息', type: 'financial' }
        ],
        floatTabIndex: 0,
        // 已选结算日期
        settlementDate: [],
        // 结算订单状态选择
        checkList: []
      }
    },
    watch: {
      shopId: {
        handler(val) {
          this.loading = true
          if (val) {
            this.getShopDetail(val)
          }
        },
        immediate: true
      }

    },
    methods: {
      /** 切换滑动距离 */
      changePosition(item, index) {
        if (index === this.floatTabIndex) return
        this.floatTabIndex = index
        this.$refs.shopInfoWrap.scroll({ top: item.top, behavior: 'smooth' })
      },
      /** 处理锚点跳转按钮 */
      handleFloatTab() {
        this.$refs.shopInfoWrap.scrollTop = 0
        this.$nextTick(() => {
          this.floatTab.map(item => {
            if (Array.isArray(this.$refs[`${item.type}`])) {
              const top = this.$refs[`${item.type}`][0].getBoundingClientRect().top - 60
              item.top = top > 0 ? top : 0
            } else {
              const top = this.$refs[`${item.type}`].getBoundingClientRect().top - 60
              item.top = top > 0 ? top : 0
            }
          })
        })
      },
      /** 获取经营类目 */
      getCategoryChildren() {
        API_Category.getCategoryChildren().then(res => {
          this.category = res.map(item => ({
            id: String(item.category_id),
            name: item.name
          }))
          this.handleFloatTab()
        })
      },
      getShopDetail(shop_id) {
        API_Shop.getShopDetail(shop_id).then(response => {
          this.shopDetail = response
          if (response.goods_management_category) {
            response.goods_management_category = response.goods_management_category.split(',')
            this.getCategoryChildren()
          } else {
            this.handleFloatTab()
          }
          if (response.settlement_day) {
            this.settlementDate = response.settlement_day.split(',')
          }
          if (response.settlement_status) {
            this.checkList = [response.settlement_status]
          }
          this.loading = false
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .shop-info-wrap {
    height: 100%;
    padding-bottom: 30px;
    position: relative;
    overflow: auto;
    .float-tab-content {
      position: fixed;
      background: #fff;
      width: 100px;
      right: 45%;
      top: 0;
      border-radius: 0 0 0 4px;
      padding: 20px 10px;
      font-size: 14px;
      color: #7d8089;
      box-shadow: -2px 0 4px 0 rgba(0,0,0, .1);
      .active-tab {
        color: #000;
      }
      .btn-item{
        margin: 0;
        padding: 10px 0;
        margin-bottom: 10px;
        text-align: center;
        cursor: pointer;
      }
    }
    .d-header {
      padding: 10px 0 10px 20px;
      font-size: 14px;
      color: #333;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e1e8ed;
      margin-bottom: 20px;
      &h2 {
        font-size: 14px;
        font-weight: 400;
      }
    }
    .business {
      .el-checkbox {
        margin-bottom: 20px;
      }
    }
    height: 100%;
    .el-tabs {
      height: 100%;
    }
    .item {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      p {
        margin: 0;
      }
      .item-img {
        width: 180px;
        height: 180px;
      }

      .item-label {
        font-size: 15px;
        color: #333;
        margin-right: 20px;
      }
      .tag-item {
        margin-right: 10px;
      }
      .item-value {
        overflow: hidden;
        white-space: normal;
        word-break: break-all;
        font-size: 15px;
        color: #666;
      }

    }
  }
</style>
