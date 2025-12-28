import SettingTypes from '@/utils/setting-types'

// 默认分割图标
const slicer_icon = 'data:image/png;base64,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';

export default {
  name: 'title-slicer-bar',
  label: {
    title: '标题分隔栏',
    icon: require('@/assets/icon-component-label_SlicerBar.svg'),
    limit: -1
  },
  sort: 1,
  data: {
    // 标题
    title: '我是标题',
    // 标题颜色
    title_font_color: '#333333',
    // 背景颜色
    background_color: 'rgba(255,255,255,0)',
    // 高度
    height: 45,
    // 分割图
    slicer_icon: {
      src: slicer_icon
    },
  },
  settings: {
    title: {
      type: SettingTypes.input,
      label: '标题文字'
    },
    title_font_color: {
      type: SettingTypes.color_picker,
      label: '标题颜色',
      default: '#333333'
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: 'rgba(255,255,255,0)'
    },
    height: {
      type: SettingTypes.slider,
      label: '高度',
      props: {
        min: 45,
        max: 100
      }
    },
    slicer_icon: {
      type: SettingTypes.custom,
      component_name: 'TitleSlicerBarIcon'
    }
  }
}
