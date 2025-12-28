import SettingTypes from '@/utils/setting-types'

export default {
  name: 'screen-alert',
  label: {
    title: '大屏警告',
    icon: require('@/assets/icon-component-label_ScreenAlert.svg'),
    limit: 200
  },
  sort: 11,
  data: {
    // 标题
    title: '警告标题',
    // 副标题
    subtitle: '警告副标题',
    // 按钮文字
    btn_text: '查看更多',
    // 按钮链接
    btn_link: '',
    // 垂直边距
    vertical_margin: 32,
    // 水平边距
    horizontal_margin: 32,
    // 内容颜色
    content_color: '#511F0C',
    // 背景色
    background_color: '#F3BB8D'
  },
  settings: {
    title: {
      type: SettingTypes.input,
      label: '警告标题'
    },
    subtitle: {
      type: SettingTypes.input,
      label: '警告副标题'
    },
    btn_text: {
      type: SettingTypes.input,
      label: '按钮文字'
    },
    btn_link: {
      type: SettingTypes.link,
      label: '按钮链接'
    },
    vertical_margin: {
      type: SettingTypes.slider,
      label: '垂直边距',
      props: {
        min: 0,
        max: 100
      }
    },
    horizontal_margin: {
      type: SettingTypes.slider,
      label: '水平边距',
      props: {
        min: 0,
        max: 100
      }
    },
    content_color: {
      type: SettingTypes.color_picker,
      label: '内容颜色',
      default: '#511F0C'
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: '#F3BB8D'
    }
  }
}
