import SettingTypes from '@/utils/setting-types'
import { decorType } from '@/utils/decor-types'

const fixed_top_tip = `${decorType === 'seller' ? '仅在店铺首页或微页面生效' : '仅在微页面生效'}`

export default {
  name: 'goods-search',
  label: {
    title: '商品搜索',
    icon: require('@/assets/icon-component-label_GoodsSearch.png'),
    limit: 2
  },
  sort: 8,
  data: {
    // 显示位置
    position: 'normal',
    // 展示模式
    show_style: 'resident',
    // 框体样式
    frame_style: 'square',
    // 文本位置
    text_position: 'left',
    // frame_height
    frame_height: 80,
    // 背景颜色
    background_color: '#f9f9f9',
    // 框体颜色
    frame_color: '#ffffff',
    // 文本颜色
    text_color: '#969799'
  },
  settings: {
    position: {
      type: SettingTypes.radio_button,
      label: '显示位置',
      options: [
        { label: '正常模式', value: 'normal', icon: 'rb-icon-search-normal' },
        { label: '滚动至顶部固定', value: 'fixed-top', icon: 'rb-icon-search-sticky', tooltip: fixed_top_tip }
      ]
    },
    show_style: {
      type: SettingTypes.radio_button,
      label: '展示模式',
      show: (data) => data.position === 'fixed-top',
      options: [
        { label: '常驻模式', value: 'resident', icon: 'rb-icon-search-fixed' },
        { label: '上滑消失下滑出现', value: 'scroll-visible', icon: 'rb-icon-search-scroll', tooltip: fixed_top_tip }
      ]
    },
    frame_style: {
      type: SettingTypes.radio_button,
      label: '框体样式',
      options: [
        { label: '方形', value: 'square', icon: 'rb-icon-search-square' },
        { label: '圆形', value: 'round', icon: 'rb-icon-search-round' }
      ]
    },
    text_position: {
      type: SettingTypes.radio_button,
      label: '文本位置',
      options: [
        { label: '居左', value: 'left', icon: 'rb-icon-align-left' },
        { label: '居中', value: 'center', icon: 'rb-icon-align-center' }
      ]
    },
    frame_height: {
      type: SettingTypes.slider,
      label: '框体高度',
      props: {
        min: 56,
        max: 80
      }
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: '#f9f9f9'
    },
    frame_color: {
      type: SettingTypes.color_picker,
      label: '框体颜色',
      default: '#ffffff'
    },
    text_color: {
      type: SettingTypes.color_picker,
      label: '文本颜色',
      default: '#969799'
    }
  }
}
