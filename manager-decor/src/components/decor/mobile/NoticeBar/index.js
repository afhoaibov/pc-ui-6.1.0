import SettingTypes from '@/utils/setting-types'

export default {
  name: 'notice-bar',
  label: {
    title: '公告',
    icon: require('@/assets/icon-component-label_Notice.png'),
    limit: 20
  },
  sort: 11,
  data: {
    // 公告内容
    content: '',
    // 公告背景颜色
    background_color: '#fff8e9',
    // 公告内容颜色
    content_color: '#646566',
    // 是否可关闭
    closeable: false
  },
  settings: {
    content: {
      type: SettingTypes.input,
      label: '公告',
      props: {
        placeholder: '请填写公告内容'
      }
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: '#fff8e9'
    },
    content_color: {
      type: SettingTypes.color_picker,
      label: '文字颜色',
      default: '#646566'
    },
    closeable: {
      type: SettingTypes.boolean,
      label: '是否可关闭'
    }
  }
}
