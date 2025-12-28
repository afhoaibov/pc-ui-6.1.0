<template>
  <div class="link-selector">
    <a v-if="fullPath" href="javascript:void(0)" :title="fullPath.pathText" class="link-selector__link">
      <el-tag :closable="!disabled" @close="clearLink">
        <div class="link-selector__tag-content">{{ fullPath.pathText }}</div>
      </el-tag>
    </a>
    <el-cascader
      v-else
      v-model="link_types"
      :options="options"
      :props="props"
      :show-all-levels="false"
      :disabled="disabled"
      placeholder="请选择跳转链接"
      size="mini"
      @change="handleCascaderChange"
    />
    <en-shop-picker
      :show.sync="show_shop_picker"
      :buyer-domain="$$Domain['buyer_pc']"
      :request="$$Request"
      :limit="1"
      @confirm="handleShopPickerConfirm"
    />
    <en-goods-picker
			:lang="currentLang.code"
      :show.sync="show_goods_picker"
      :type="$$DecorType"
      :limit="1"
      @confirm="handleGoodsPickerConfirm"
      @close="show_goods_picker = false"
    />
    <en-page-picker
      :show.sync="show_page_picker"
      :request="$$Request"
      :domain="$$Domain"
      :limit="1"
      type="decor"
      @confirm="handlePagePickerConfirm"
    />
  </div>
</template>

<script>
import * as Rules from '@/utils/rules'
import * as API_Shop from '@/api/shop'
import * as API_Pages from '@/api/pages'
import { clientType } from '@/utils/decor-types'
import { mapGetters } from 'vuex'

export default {
  name: 'LinkSelector',
  props: {
    value: {
      type: [Object, String],
      required: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      link: '',
      link_types: '',
      options: [
        {
          label: '微页面',
          value: '微页面',
          children: [
            { label: '微页面', value: 'mini-page' },
            { label: '店铺主页', value: 'shop-home' },
            { label: '个人中心', value: 'user-center' }
          ]
        },
        {
          label: '商品',
          value: '商品',
          children: [
            { label: '全部商品', value: 'goods' },
            { label: '部分商品', value: 'part-goods' },
            { label: '购物车', value: 'cart' },
            { label: '分类', value: 'category' }
          ]
        },
        {
          label: '营销工具',
          value: '营销工具',
          children: [
            { label: '优惠券', value: 'coupons' },
            { label: '限时抢购', value: 'seckill' },
            { label: '拼团活动', value: 'assemble', disabled: clientType === 'pc' }, // 仅移动端页面
            { label: '积分商城', value: 'points-mall' }
          ]
        },
        {
          label: '其他',
          value: '其他',
          children: [
            { label: '自定义链接', value: 'custom' },
            { label: '小程序路径', value: 'mini-program', disabled: clientType === 'pc' }
          ]
        },
      ],
      props: { expandTrigger: 'hover' },
      shopInfo: '',
      show_shop_picker: false,
      show_goods_picker: false,
      show_page_picker: false,
      miniPageItem: '',
      shopItem: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: 'defaultValueChange'
    }
  },
  model: { event: 'update', prop: 'value' },
  mounted() {
    this.shopItem = this.$$ShopInfo
  },
  computed: {
		...mapGetters(['currentLang']),
    fullPath() {
      if (!this.link || !this.link_types) return
      const option = this.options.filter(item => item.value === this.link_types[0])[0]
      const subOption = option.children.filter(item => item.value === this.link_types[1])[0]
      let path = [option, subOption]
      let pathText = `${option.label} | ${subOption.label}`
      if (subOption.value === 'mini-page') {
        pathText = `微页面 | ${this.miniPageItem['page_name'] || ''}`
      }
      if (subOption.value === 'shop-home' && this.shopItem) {
        pathText = `店铺首页 | ${this.shopItem['shop_name']}`
      }
      if (subOption.value === 'custom') {
        pathText = `外链 | ${this.link.value}`
      }
      if (subOption.value === 'mini-program') {
        pathText = `小程序路径 | ${this.link.value}`
      }
      return { path, pathText }
    }
  },
  methods: {
    /**
     * 选择器值发生改变
     * @param item
     */
    async handleCascaderChange(item) {
      const link_type = item[item.length -1]
      let link = { type: link_type, value: '' }
      switch (link_type) {
        case 'custom':
          link.value = await this.inputCustomLink(); break
        case 'mini-program':
          link.value = await this.inputMiniProgramLink(); break
        case 'mini-page':
          this.show_page_picker = true
          link.value = undefined
          break
        case 'shop-home':
          link.value = await this.getShopLink(); break
        case 'goods':
          link.value = await this.getShopLinkId(); break
        case 'user-center':
          link.value = `member`; break
        case 'part-goods':
          this.show_goods_picker = true
          link.value = undefined
          break
        default:
          link.value = `${link_type}`
      }
      if (link.value === undefined) return this.clearLink()
      this.link = link
      this.$emit('update', this.link)
    },
    /**
     * 清空值
     */
    clearLink() {
      this.$nextTick(() => {
        this.link = ''
        this.link_types = ''
      })
      this.$emit('update', '')
    },
    /**
     * 输入自定义链接
     * @returns {Promise<string>}
     */
    async inputCustomLink() {
      try {
        const res = await this.$prompt('请输入自定义链接', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: 'https://',
          inputPattern: Rules.url,
          inputErrorMessage: '链接格式不正确！'
        })
        return res.value
      } catch (e) {
        this.clearLink()
      }
    },
    /**
     * 输入小程序路径
     * @returns {Promise<string>}
     */
    async inputMiniProgramLink() {
      try {
        const res = await this.$prompt('请输入小程序路径', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入小程序路径'
        })
        return res.value
      } catch (e) {
        this.clearLink()
      }
    },
    /**
     * 默认值发生改变
     * @param newVal
     */
    async defaultValueChange(newVal) {
      this.link = newVal
      if (!newVal) this.link_types = ''
      let option = ''
      let subOption = ''
      for (let i = 0; i < this.options.length; i++) {
        option = this.options[i]
        if (option.value === newVal.type) break
        if (option.children && option.children.length) {
          subOption = option.children.filter(item => item.value === newVal.type)[0]
          if (subOption) break
          option = ''
          subOption = ''
        }
      }
      option && (this.link_types = [option.value])
      subOption && (this.link_types = [option.value, subOption.value])
      if (newVal && newVal.type === 'shop-home' && !this.shopItem) {
        this.shopItem = await API_Shop.getShopDetail(newVal.value)
      }
      if (newVal && newVal.type === 'mini-page' && !this.miniPageItem) {
        this.miniPageItem = await API_Pages.getPageDetail(newVal.value, false)
      }
    },
    /**
     * 获取店铺链接
     * @returns {Promise<string>}
     */
    async getShopLink() {
      if (this.$$ShopInfo) {
        return this.$$ShopInfo['shop_id']
      } else {
        this.show_shop_picker = true
        return undefined
      }
    },
    async getShopLinkId() {
      if (this.$$ShopInfo) {
        return this.$$ShopInfo['shop_id']
      } else {
        return ''
      }
    },
    /**
     * 店铺选择器确认
     * @param items
     */
    handleShopPickerConfirm(items) {
      if (!items.length) return
      this.shopItem = items[0]
      this.link = {
        type: 'shop-home',
        value: items[0]['shop_id']
      }
      this.$emit('update', this.link)
    },
    /**
     * 商品选择器确认
     * @param items
     */
    handleGoodsPickerConfirm(items) {
      if (!items.length) return
      this.link = {
        type: 'part-goods',
        value: items[0]['goods_id']
      }
      this.$emit('update', this.link)
    },
    /**
     * 页面选择器确认
     * @param items
     */
    handlePagePickerConfirm(items) {
      if (!items.length) return
      this.miniPageItem = items[0]
      this.link = {
        type: 'mini-page',
        value: items[0].id
      }
      this.$emit('update', this.link)
    }
  }
}
</script>

<style lang="scss" scoped>
.link-selector {
  position: relative;
  display: flex;
  width: 100%;
  .link-selector__link {
    display: inline-block;
    width: 100%;
  }
  ::v-deep .el-tag {
    display: flex;
    align-items: center;
    position: relative;
    color: #155bd4;
    border-color: #155bd4;
    border-radius: 2px;
    width: 100%;
    height: 28px;
    box-sizing: border-box;
    margin-right: 5px;
    overflow: hidden;
    .el-tag__close {
      position: absolute;
      top: auto;
      right: 5px;
      color: #155bd4;
      &:hover {
        color: #ffffff;
        background-color: #155bd4;
      }
    }
    .link-selector__tag-content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 10px;
      max-width: 208px;
    }
  }
  ::v-deep .el-cascader {
    width: 100%;
  }
}
</style>
