import SettingTypes from '@/utils/setting-types'

export default {
  name: 'goods',
  label: {
    title: '商品模块',
    icon: require('@/assets/icon-component-label_Goods.png'),
    limit: -1
  },
  sort: 5,
  data: {
    // 商品列表
    goodsList: []
  },
  settings: {
    goodsList: {
      type: SettingTypes.goods
    }
  }
}
