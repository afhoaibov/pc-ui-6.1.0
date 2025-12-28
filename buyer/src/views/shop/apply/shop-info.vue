<template>
  <div id="shop-info" class="item-container">
    <div class="content">
      <el-form
        :model="shopInfoForm"
        :rules="shopInfoRules"
        ref="shopInfoForm"
        label-width="180px"
        size="small"
      >
        <h5 class="item-title">店铺信息</h5>
        <el-form-item label="店铺名称：" prop="shop_name">
          <el-input v-model.trim="shopInfoForm.shop_name" :maxlength="200" clearable></el-input>
        </el-form-item>
        <el-form-item label="店铺所在地：" prop="shop_region">
          <en-region-picker ref="regionPickerRef" :api="MixinRegionApi" :default="defaultRegion" @changed="handleRegionChanged('shop', $event)"/>
        </el-form-item>
        <el-form-item label="店铺详细地址：" prop="shop_add">
          <el-input v-model="shopInfoForm.shop_add" :maxlength="200"></el-input>
        </el-form-item>
        <el-form-item label="经营类目：" prop="goods_management_category">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChanged">全选
          </el-checkbox>
          <el-checkbox-group v-model="shopInfoForm.goods_management_category" @change="handleCheckedCategoriesChange">
            <el-checkbox v-for="cate in categories" :label="cate.id" :key="cate.id">{{ cate.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
      </el-form>
    </div>
    <div class="next-btns">
      <el-button size="small" @click="$router.back()">上一步</el-button>
      <el-button @click="handleNextStep" size="small">提交申请</el-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as API_Shop from '@/api/shop'
import * as API_Goods from '@/api/goods'
import mixin from './checkStatusMixin'
import { RadioGroup, Radio } from 'element-ui'
import { cloneObj } from '@/utils/index'

Vue.use(RadioGroup).use(Radio)

export default {
  name: 'shop-info',
  middleware: 'auth-user',
  mixins: [mixin],
  data() {
    const req_rule = (message, trigger) => ({ required: true, message, trigger: trigger || 'blur' })
    const len_rule = (min, max) => ({ min, max, message: `长度在 ${min} 到 ${max} 个字符`, trigger: 'change' })
    return {
      defaultRegion: null,
      /** 分类 */
      categories: [],
      isIndeterminate: false,
      checkAll: false,
      /** 基础信息 表单 */
      shopInfoForm: {
        region: '',
        country_code: '',
        country_name: '',
        shop_name: '',
        goods_management_category: [],
        shop_region: '',
        shop_add: '',
        shop_type: 'NORMAL',
        province: '',
        city: ''
      },
      /** 基础信息 表单规则 */
      shopInfoRules: {
        shop_name: [req_rule('请输入店铺名称！'), len_rule(1, 15)],
        shop_region: [req_rule('请选择店铺地址！')],
        shop_add: [req_rule('请输入店铺详细地址！')],
        region: this.MixinRequired('请选择省份地址！'),
        goods_management_category: [
          { type: 'array', required: true, message: '请至少选择一个经营类目', trigger: 'change' }
        ],
        shop_type: [req_rule('请选择店铺类型！')]
      }
    }
  },
  mounted() {
    Promise.all([
      API_Shop.getApplyShopInfo(),
      API_Goods.getCategory()
    ]).then(responses => {
      const shopInfo = responses[0]
      const categories = responses[1]
      if (!shopInfo || shopInfo.bank_account_name === null) {
        this.$router.replace({ name: 'shop-apply' })
        return false
      }
      // 设置店铺信息
      Object.keys(this.shopInfoForm).forEach(key => {
        this.shopInfoForm[key] = shopInfo[key]
      })
      this.shopInfoForm.country_code = shopInfo.shop_country_code || ''
      this.shopInfoForm.country_name = shopInfo.shop_country_name || ''
      this.shopInfoForm.province = shopInfo.shop_province || ''
      this.shopInfoForm.town = shopInfo.shop_town
      this.shopInfoForm.city = shopInfo.shop_city

      this.defaultRegion = this.MixinGetRegionDefaultData(shopInfo, 'shop_')
      this.shopInfoForm.goods_management_category = []
      if (shopInfo.goods_management_category) {
        const _categories = shopInfo.goods_management_category.split(',')
        this.shopInfoForm.goods_management_category = _categories
        if (_categories.length !== 0) {
          if (_categories.length < categories.length) {
            this.isIndeterminate = true
          } else if (_categories.length === categories.length) {
            this.checkAll = true
          }
        }
      }
      // 设置分类信息
      this.categories = categories.map(item => ({
        id: String(item.category_id),
        name: item.name
      }))
    })
  },
  methods: {
    /** 下一步 */
    handleNextStep() {
      this.$refs['shopInfoForm'].validate((valid) => {
        if (valid) {
          const { regionData } = this.$refs.regionPickerRef
          const params = cloneObj(this.shopInfoForm)

          params.shop_region = JSON.stringify(regionData)
          params.goods_management_category = params.goods_management_category.join(',')
          API_Shop.applyShopStep(4, params).then(() => {
            this.$router.push({ name: 'shop-apply-success' })
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    },
    handleRegionChanged(type, object) {
      const key = `${type}_region`
      this.$set(this.shopInfoForm, key, JSON.stringify(object))
      this.$refs.shopInfoForm.validateField(key)
    },
    /** 经营类目全选框发生改变 */
    handleCheckAllChanged(checked) {
      this.shopInfoForm.goods_management_category = checked ? this.categories.map(item => item.id) : []
      this.isIndeterminate = false
    },
    /** 选中的经营类目发生改变 */
    handleCheckedCategoriesChange(vaule) {
      const checkedCount = vaule.length
      const categoriesCount = this.categories.length
      this.checkAll = checkedCount === categoriesCount
      this.isIndeterminate = checkedCount > 0 && checkedCount < categoriesCount
    }
  }
}
</script>

<style lang="scss" scoped>
.item-container {
  ::v-deep .el-form {
    width: 100%
  }
  ::v-deep .el-form-item {
    width: 410px;
    margin-left: auto;
    margin-right: auto;
  }
  .item-title {
    font-size: 22px;
    padding-left: 20px;
    padding-bottom: 20px;
  }
  ::v-deep .el-date-editor {
    width: 230px;
  }
  ::v-deep .el-checkbox-group .el-checkbox:nth-child(2n + 1) {
    margin-left: 0;
  }
}
</style>
