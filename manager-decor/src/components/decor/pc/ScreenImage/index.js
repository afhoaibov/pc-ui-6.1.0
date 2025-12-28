import SettingTypes from '@/utils/setting-types'

export default {
  name: 'screen-image',
  label: {
    title: '大屏图片',
    icon: require('@/assets/icon-component-label_ScreenImage.svg'),
    limit: 200
  },
  sort: 11,
  data: {
    // 图片资源
    image_source: '',
    // 标题
    title: '警告标题',
    // 副标题
    subtitle: '警告副标题',
    // 按钮文字
    btn_text: '查看更多',
    // 按钮链接
    btn_link: '',
    // 按钮文字颜色
    btn_text_color: '#ffffff',
    // 内容颜色
    content_color: '#191919',
    // 垂直边距
    vertical_margin: 32,
    // 水平边距
    horizontal_margin: 32
  },
  settings: {
    image_source: {
      type: SettingTypes.image,
      label: '上传图片'
    },
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
    btn_text_color: {
      type: SettingTypes.color_picker,
      label: '按钮文字颜色',
      default: '#ffffff'
    },
    content_color: {
      type: SettingTypes.color_picker,
      label: '内容颜色',
      default: '#191919'
    },
    vertical_margin: {
      type: SettingTypes.slider,
      label: '垂直边距',
      props: {
        min: 0,
        max: 300
      }
    },
    horizontal_margin: {
      type: SettingTypes.slider,
      label: '水平边距',
      props: {
        min: 0,
        max: 100
      }
    }
  }
}
