import SettingTypes from '@/utils/setting-types'

export default {
  name: 'goods-tabs',
  label: {
    title: '品牌商品TAB',
    icon: require('@/assets/icon-component-label_GoodsTabs.svg'),
    limit: 200
  },
  sort: 14,
  data: {
    // 标题
    title: '品牌优惠福利',
    // Tab列表
    tabList: []
  },
  settings: {
    title: {
      type: SettingTypes.input,
      label: '标题'
    },
    tabList: {
      type: SettingTypes.custom,
      component_name: 'GoodsTabsCustomTabs'
    }
  }
}
