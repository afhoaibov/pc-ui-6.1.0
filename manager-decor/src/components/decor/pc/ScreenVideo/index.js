import SettingTypes from '@/utils/setting-types'

export default {
  name: 'screen-video',
  label: {
    title: '大屏视频',
    icon: require('@/assets/icon-component-label_ScreenVideo.svg'),
    limit: 200
  },
  sort: 10,
  data: {
    // 视频资源
    video_source: '',
    // 视频宽度
    video_width: 100,
    // 视频高度
    video_height: 0,
    // 填充方式
    object_fit: 'unset',
    // 显示更多按钮
    show_more_btn: false,
    // 更多按钮链接
    more_btn_link: '',
    // 背景色
    background_color: 'rgba(255,255,255, 0)'
  },
  settings: {
    video_source: {
      type: SettingTypes.video,
      label: '选择视频'
    },
    video_width: {
      type: SettingTypes.slider,
      label: '视频宽度',
      props: {
        min: 0,
        max: 100,
        'format-tooltip': (value) => {
          if (value === 0) return '自适应'
          return `${value}%`
        }
      }
    },
    video_height: {
      type: SettingTypes.slider,
      label: '视频高度',
      props: {
        min: 0,
        max: 1920,
        'format-tooltip': (value) => {
          if (value === 0) return '自适应'
          return `${value}px`
        }
      }
    },
    object_fit: {
      type: SettingTypes.radio_button,
      label: '填充方式',
      column: true,
      maxlength: 4,
      options: [
        { label: 'Unset', value: 'unset' },
        { label: 'None', value: 'none' },
        { label: 'Contain', value: 'contain' },
        { label: 'Cover', value: 'cover',  },
        { label: 'Fill', value: 'fill' },
        { label: 'Scale-Down', value: 'scale-down' },
      ]
    },
    show_more_btn: {
      type: SettingTypes.boolean,
      label: '显示更多按钮'
    },
    more_btn_link: {
      type: SettingTypes.link,
      label: '更多按钮链接',
      show: data => data.show_more_btn
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: 'rgba(255,255,255,0)'
    }
  }
}
