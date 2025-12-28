import SettingTypes from '@/utils/setting-types'
import { uuid } from '@/utils/foundation'

export default {
  name: 'image-text-nav',
  label: {
    title: '图文导航',
    icon: require('@/assets/icon-component-label_ImageTextNavigator.png'),
    limit: 10
  },
  sort: 4,
  data: {
    // 导航列表
    navList: ['一', '二', '三', '四'].map(item => ({
      __key: uuid(),
      image: '',
      title: `导航${item}`,
      link: ''
    })),
    // 导航类型【image-text：图文，text：文字】
    nav_type: 'image-text',
    // 导航样式
    nav_style: 'fixed',
    // 一屏显示数量
    nav_show_num: 4,
    // 背景颜色
    background_color: 'rgba(255,255,255,0)',
    // 文字颜色
    text_color: '#303133',
    // 页面边距
    page_edge: 30,
    // 图片缩放大小
    image_scale: 0.66,
    // 图片圆角
    image_radius: 30
  },
  settings: {
    navList: {
      type: SettingTypes.custom,
      component_name: 'ImageTextNavSelector'
    },
    nav_type: {
      type: SettingTypes.radio_button,
      label: '导航类型',
      options: [
        { label: '图文导航', value: 'image-text' },
        { label: '文字导航', value: 'text' }
      ]
    },
    nav_style: {
      type: SettingTypes.radio_button,
      label: '导航样式',
      options: [
        { label: '固定', value: 'fixed', icon: 'rb-icon-fixed' },
        { label: '横向滑动', value: 'scroll', icon: 'rb-icon-scroll' }
      ]
    },
    page_edge: {
      type: SettingTypes.slider,
      label: '页面边距',
      props: {
        min: 0,
        max: 30
      }
    },
    image_scale: {
      type: SettingTypes.slider,
      label: '图片缩放',
      props: {
        min: 0.3,
        max: 1,
        step: 0.01
      }
    },
    image_radius: {
      type: SettingTypes.slider,
      label: '图片圆角',
      props: {
        min: 0,
        max: 750
      }
    },
    nav_show_num: {
      type: SettingTypes.select,
      label: '一屏显示',
      show: data => data.nav_style === 'scroll',
      options: [...new Array(10)].map((item, index) => ({
        label: `${index + 1}个导航`,
        value: index + 1
      }))
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: 'rgba(255,255,255,0)'
    },
    text_color: {
      type: SettingTypes.color_picker,
      label: '文字颜色',
      default: '#000000'
    }
  }
}
