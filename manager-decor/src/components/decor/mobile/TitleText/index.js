import SettingTypes from '@/utils/setting-types'

// 文字对齐方式
const positionOptions = [
  { label: '居左显示', value: 'left', icon: 'rb-icon-align-left' },
  { label: '居中显示', value: 'center', icon: 'rb-icon-align-center' }
]

export default {
  name: 'title-text',
  label: {
    title: '标题文本',
    icon: require('@/assets/icon-component-label_TitleText.png'),
    limit: 50
  },
  sort: 1,
  data: {
    // 标题文字
    title: '标题',
    // 标题字体大小
    title_font_size: 32,
    // 标题字体粗细
    title_font_weight: 'bold',
    // 标题颜色
    title_color: '#323233',
    // 描述文字
    desc: '描述内容',
    // 描述字体大小
    desc_font_size: 24,
    // 描述字体粗细
    desc_font_weight: '400',
    // 描述颜色
    desc_color: '#969799',
    // 标题、描述对齐
    position: 'left',
    // 背景颜色
    background_color: '#ffffff',
    // 显示底部分割线
    show_bottom_slicer: false,
    // 显示更多
    show_more: false,
    // 查看更多样式【1、2、3】
    more_style: 1,
    // 查看更多文字
    more_text: '查看更多',
    // 查看更多链接
    more_link: ''
  },
  settings: {
    title: {
      type: SettingTypes.input,
      label: '标题内容'
    },
    desc: {
      type: SettingTypes.input,
      label: '描述内容',
      props: {
        type: 'textarea',
        placeholder: '请输入描述了内容，最多100个字！',
        maxlength: 100
      },
      space_line: true
    },
    position: {
      type: SettingTypes.radio_button,
      label: '位置显示',
      options: positionOptions
    },
    title_font_size: {
      type: SettingTypes.radio_button,
      label: '标题大小',
      options: [
        { label: '大（16号）', value: 32, icon: 'rb-icon-font-x' },
        { label: '中（14号）', value: 28, icon: 'rb-icon-font-m' },
        { label: '小（12号）', value: 24, icon: 'rb-icon-font-s' }
      ]
    },
    desc_font_size: {
      type: SettingTypes.radio_button,
      label: '描述大小',
      options: [
        { label: '大（16号）', value: 32, icon: 'rb-icon-font-x' },
        { label: '中（14号）', value: 28, icon: 'rb-icon-font-m' },
        { label: '小（12号）', value: 24, icon: 'rb-icon-font-s' }
      ]
    },
    title_font_weight: {
      type: SettingTypes.radio_button,
      label: '标题粗细',
      options: [
        { label: '常规体', value: '400', icon: 'rb-icon-font-regular' },
        { label: '加粗体', value: 'bold', icon: 'rb-icon-font-bold' }
      ]
    },
    desc_font_weight: {
      type: SettingTypes.radio_button,
      label: '描述粗细',
      options: [
        { label: '常规体', value: '400', icon: 'rb-icon-font-regular' },
        { label: '加粗体', value: 'bold', icon: 'rb-icon-font-bold' }
      ]
    },
    title_color: {
      type: SettingTypes.color_picker,
      label: '标题颜色',
      default: '#323233'
    },
    desc_color: {
      type: SettingTypes.color_picker,
      label: '描述颜色',
      default: '#969799'
    },
    background_color: {
      type: SettingTypes.color_picker,
      label: '背景颜色',
      default: '#ffffff'
    },
    show_bottom_slicer: {
      type: SettingTypes.boolean,
      label: '底部分割线',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      },
      space_line: true
    },
    show_more: {
      type: SettingTypes.boolean,
      label: '查看更多',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      },
      option: {
        key: 'more_style',
        type: 'radio',
        options: [
          { label: '样式一', value: 1 },
          { label: '样式二', value: 2 },
          { label: '样式三', value: 3 }
        ],
        custom_component_name: 'TitleTextMoreStyle'
      }
    }
  }
}
