import SettingTypes from '@/utils/setting-types'

export default {
  name: 'page-params',
  label: {
    title: '页面参数',
    icon: require('@/assets/icon-accessary_PageParams.png')
  },
  sort: 1,
  data: {
    // 页面名称、标题
    page_name: '页面标题',
    // 页面描述
    page_desc: ''
  },
  settings: {
    page_name: {
      type: SettingTypes.input,
      label: '页面名称',
      props: {
        placeholder: '请填写页面标题，最多50个字符！',
        maxlength: 50
      }
    },
    page_desc: {
      type: SettingTypes.input,
      label: '页面描述',
      props: {
        type: 'textarea',
        placeholder: '填写页面描述可更好的让人了解你的页面！',
        maxlength: 200
      }
    }
  }
}
