import SettingTypes from '@/utils/setting-types'

export default {
  name: 'to-shop',
  label: {
    title: '进入店铺',
    icon: require('@/assets/icon-component-label_ToShop.png'),
    limit: 1
  },
  sort: 10,
  data: {
    // 店铺信息
    shopInfo: '',
    // 文案
    label: '进入店铺'
  },
  settings: {
    shopInfo: {
      type: SettingTypes.custom,
      component_name: 'ToShopSelector'
    },
    label: {
      type: SettingTypes.input,
      label: '文案',
      props: {
        maxlength: 7
      }
    }
  }
}
