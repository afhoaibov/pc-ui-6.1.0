import SettingTypes from '@/utils/setting-types'

export default {
  name: 'shop-info',
  label: {
    title: '店铺信息',
    icon: require('@/assets/icon-component-label_ShopInfo.png'),
    limit: 50
  },
  sort: 9,
  data: {
    // 店铺信息
    shopInfo: '',
    // 背景图片
    background_image: '',
    // 店铺样式
    shop_style: 1
  },
  settings: {
    shopInfo: {
      type: SettingTypes.custom,
      component_name: 'ShopInfoSelector'
    },
    background_image: {
      type: SettingTypes.custom,
      component_name: 'ShopInfoBackgroundImage'
    },
    shop_style: {
      type: SettingTypes.radio_button,
      label: '显示样式',
      column: true,
      options: ['一', '二', '三', '四', '五'].map((item, index) => ({
        label: `样式${item}`,
        value: index + 1,
        icon: `rb-icon-shop-info-${index + 1}`
      }))
    }
  }
}
