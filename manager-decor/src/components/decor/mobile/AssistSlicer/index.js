import SettingTypes from '@/utils/setting-types'

export default {
  name: 'assist-slicer',
  label: {
    title: '辅助分割',
    icon: require('@/assets/icon-component-label_AssistSlicer.png'),
    limit: 200
  },
  sort: 7,
  data: {
    // 分割类型
    slicer_type: 'blank',
    // 空白高度
    blank_height: 60,
    // 分割线样式
    slicer_style: 'solid',
    // 左右边距
    slicer_padding: 0,
    // 分割线颜色
    slicer_color: '#e5e5e5',
    // 背景颜色
    background_color: 'rgba(255,255,255,0)'
  },
  settings: {
    slicer_type: {
      type: SettingTypes.radio_button,
      label: '分割类型',
      options: [
        { label: '辅助空白', value: 'blank', icon: 'rb-icon-white' },
        { label: '辅助线', value: 'line', icon: 'rb-icon-line' }
      ]
    },
    blank_height: {
      type: SettingTypes.slider,
      label: '空白高度',
      show: data => data.slicer_type === 'blank',
      props: {
        min: 0,
        max: 200
      }
    },
    slicer_style: {
      type: SettingTypes.radio_button,
      label: '分割线样式',
      show: data => data.slicer_type === 'line',
      options: [
        { label: '实线', value: 'solid', icon: 'rb-icon-line-solid' },
        { label: '虚线', value: 'dashed', icon: 'rb-icon-line-dashed' },
        { label: '点线', value: 'dotted', icon: 'rb-icon-line-dotted' }
      ]
    },
    slicer_padding: {
      type: SettingTypes.radio_button,
      label: '左右边距',
      show: data => data.slicer_type === 'line',
      options: [
        { label: '无边距', value: 0, icon: 'rb-icon-line-no-padding' },
        { label: '左右留边', value: 30, icon: 'rb-icon-line-padding' }
      ]
    },
    slicer_color: {
      type: SettingTypes.color_picker,
      label: '辅助线颜色',
      default: '#e5e5e5',
      show: data => data.slicer_type === 'line'
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: 'rgba(255,255,255,0)'
    }
  }
}
