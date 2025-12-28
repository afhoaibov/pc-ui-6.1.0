import SettingTypes from '@/utils/setting-types'

export default {
  name: 'goods-slider',
  label: {
    title: '商品滑块',
    icon: require('@/assets/icon-component-label_GoodsSlider.svg'),
    limit: -1
  },
  sort: 6,
  data: {
    // 左侧链接和图片
    headLink: '',
    // 商品列表
    goodsList: []
  },
  settings: {
    headLink: {
      type: SettingTypes.custom,
      component_name: 'GoodsSliderImageSelector'
    },
    goodsList: {
      type: SettingTypes.goods
    }
  }
}
