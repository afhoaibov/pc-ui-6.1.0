import SettingTypes from '@/utils/setting-types'

export default {
  name: 'screen-carousel',
  label: {
    title: 'Carousel',
    icon: require('@/assets/icon-component-label_ScreenCarousel.svg'),
    limit: 200
  },
  sort: 12,
  data: {
    // 标题
    title: '标题',
    // 链接列表
    links: [],
    // 垂直边距
    vertical_margin: 32,
    // 水平边距
    horizontal_margin: 32
  },
  settings: {
    title: {
      type: SettingTypes.input,
      label: '警告标题'
    },
    links: {
      type: SettingTypes.imageLinkEditor,
      label: '链接列表',
      limit: 7,
      addText: '添加链接'
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
