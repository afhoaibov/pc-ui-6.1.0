import SettingTypes from '@/utils/setting-types'

export default {
  name: 'rich-text',
  label: {
    title: '富文本',
    icon: require('@/assets/icon-component-label_RichText.png'),
    limit: 300
  },
  sort: 5,
  data: {
    // 背景颜色
    background_color: '#f9f9f9',
    // 是否全屏显示
    full_screen: false,
    // 富文本HTML
    content: ''
  },
  settings: {
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: '#f9f9f9'
    },
    full_screen: {
      type: SettingTypes.boolean,
      label: '全屏显示',
      props: {
        activeText: '全屏显示',
        inactiveText: '不全屏显示'
      }
    },
    content: {
      type: SettingTypes.custom,
      component_name: 'RichTextEditor'
    }
  }
}
