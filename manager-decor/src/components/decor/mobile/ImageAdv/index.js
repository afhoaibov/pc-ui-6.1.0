import SettingTypes from '@/utils/setting-types'

export default {
  name: 'image-adv',
  label: {
    title: '图片广告',
    icon: require('@/assets/icon-component-label_ImageAdv.png'),
    limit: 300
  },
  sort: 3,
  data: {
    // 图片模板
    image_tpl: 'single',
    // 图片列表
    imageList: [],
    // 图片样式
    image_style: 'normal',
    // 图片倒角
    image_chamfer: 'straight',
    // 页面边距
    page_edge: 0,
    // 图片间距
    image_space: 0,
    // 轮播海报高度
    swiper_height: 260
  },
  settings: {
    image_tpl: {
      type: SettingTypes.radio_button,
      label: '选择模板',
      column: true,
      options: [
        { label: '一行一个', value: 'single', icon: 'rb-icon-up2end' },
        { label: '轮播海报', value: 'swiper', icon: 'rb-icon-carousel' },
        { label: '大图横向滑动', value: 'big-slide', icon: 'rb-icon-big-slide' },
        { label: '小图横向滑动', value: 'small-slide', icon: 'rb-icon-small-slide' },
        { label: '导航横向滑动', value: 'nav-slide', icon: 'rb-icon-nav-slide' },
        { label: '绘制热区', value: 'hotarea', icon: 'rb-icon-hotarea' },
      ],
      space_line: true
    },
    image_list: {
      type: SettingTypes.custom,
      component_name: 'ImageAdvSelector',
      space_line: true
    },
    image_style: {
      type: SettingTypes.radio_button,
      label: '图片样式',
      options: [
        { label: '常规', value: 'normal', icon: 'rb-icon-image-ad-normal' },
        { label: '投影', value: 'shadow', icon: 'rb-icon-shadow' }
      ]
    },
    image_chamfer: {
      type: SettingTypes.radio_button,
      label: '图片倒角',
      options: [
        { label: '直角', value: 'straight', icon: 'rb-icon-corner-straight' },
        { label: '圆角', value: 'round', icon: 'rb-icon-corner-round' }
      ]
    },
    page_edge: {
      type: SettingTypes.slider,
      label: '页面边距',
      props: {
        min: 0,
        max: 60
      }
    },
    image_space: {
      type: SettingTypes.slider,
      label: '图片间距',
      show: (data) => data.image_tpl !== 'swiper',
      props: {
        min: 0,
        max: 60
      }
    },
    swiper_height: {
      type: SettingTypes.slider,
      label: '轮播高度',
      show: data => data.image_tpl === 'swiper',
      props: {
        min: 0,
        max: 750
      }
    }
  }
}
