import SettingTypes from '@/utils/setting-types'

export default {
  name: 'image-swiper',
  label: {
    title: '图片轮播',
    icon: require('@/assets/icon-component-label_ImageAdv.png'),
    limit: 5
  },
  sort: 4,
  data: {
    // 图片列表
    imageList: [],
    // 轮播高度
    swiper_height: 500,
    // 显示轮播分页器
    show_pagination: true,
    // 指示器颜色
    pagination_color: 'rgba(0,0,0,0.8)',
    // 激活的指示器颜色
    pagination_active_color: '#ffffff',
    // 自动播放
    autoplay: true,
    // 轮播方向
    direction: 'horizontal',
    // 图片填充
    image_fill: 'cover',
    // 切换效果
    effect: 'fade'
  },
  settings: {
    imageList: {
      type: SettingTypes.custom,
      component_name: 'ImageSwiperSelector'
    },
    swiper_height: {
      type: SettingTypes.slider,
      label: '轮播高度',
      props: {
        min: 20,
        max: 1210
      }
    },
    show_pagination: {
      type: SettingTypes.boolean,
      label: '显示分页器'
    },
    pagination_color: {
      type: SettingTypes.color_picker,
      label: '指示器颜色',
      default: 'rgba(0,0,0,0.8)'
    },
    pagination_active_color: {
      type: SettingTypes.color_picker,
      label: '指示器颜色(激活)',
      default: '#ffffff'
    },
    autoplay: {
      type: SettingTypes.boolean,
      label: '自动切换'
    },
    direction: {
      type: SettingTypes.radio_button,
      label: '轮播方向',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' }
      ]
    },
    image_fill: {
      type: SettingTypes.radio_button,
      label: '图片填充',
      options: [
        { label: '填充', value: 'cover', icon: 'rb-icon-img-cover' },
        { label: '周边留白', value: 'contain', icon: 'rb-icon-img-contain' }
      ]
    },
    effect: {
      type: SettingTypes.radio_button,
      label: '切换效果',
      options: [
        { label: '渐隐', value: 'fade' },
        { label: '滑动', value: 'slide' },
        { label: '立方体', value: 'cube' },
        { label: '封面', value: 'coverflow' }
      ]
    }
  }
}
