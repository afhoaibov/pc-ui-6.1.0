import SettingTypes from '@/utils/setting-types'

export default {
  name: 'video-module',
  label: {
    title: '视频',
    icon: require('@/assets/icon-component-label_Video.png'),
    limit: 50
  },
  sort: 12,
  data: {
    // 视频链接
    video: {
      src: '',
      cover: ''
    },
    // 封面类型
    cover_type: 'original',
    // 视频封面
    video_cover: '',
    // 在非H5端显示视频模块
    not_h5_show: false
  },
  settings: {
    not_h5_show: {
      type: SettingTypes.boolean,
      label: '在非H5端显示'
    }
  }
}
