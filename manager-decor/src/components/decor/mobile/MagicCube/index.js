import SettingTypes from '@/utils/setting-types'

export default {
  name: 'magic-cube',
  label: {
    title: '魔方',
    icon: require('@/assets/icon-component-label_MagicCube.png'),
    limit: 200
  },
  sort: 6,
  data: {
    // 魔方密度
    block_density: '2x1',
    // 魔方块列表
    blockList: [],
    // 魔方样式
    magic_style: 'row-two',
    // 图片间隙
    image_space: 0,
    // 页面间距
    page_edge: 0
  },
  settings: {
    block_density: {
      type: SettingTypes.select,
      label: '魔方密度',
      show: data => data.magic_style === 'custom',
      options: [
        { label: '4x4', value: '4x4' },
        { label: '5x5', value: '5x5' },
        { label: '6x6', value: '6x6' },
        { label: '7x7', value: '7x7' }
      ]
    },
    blockList: {
      type: SettingTypes.custom,
      component_name: 'MagicCubeBlocks'
    },
    magic_style: {
      type: SettingTypes.radio_button,
      label: '魔方样式',
      column: true,
      options: [
        { label: '一行两个', value: 'row-two', icon: 'rb-icon-cuberow' },
        { label: '一行三个', value: 'row-three', icon: 'rb-icon-cuberow2' },
        { label: '一行四个', value: 'row-four', icon: 'rb-icon-cuberow1' },
        { label: '左二右二', value: 'left-right-two', icon: 'rb-icon-cube' },
        { label: '左一右二', value: 'left-one-right-two', icon: 'rb-icon-cubeto' },
        { label: '上一下二', value: 'top-one-bottom-two', icon: 'rb-icon-cube-upto' },
        { label: '左一右三', value: 'left-one-right-three', icon: 'rb-icon-cubeto1' },
        { label: '自定义', value: 'custom', disabled: true, tooltip: '自定义样式开发中', icon: 'rb-icon-cube-custom' }
      ]
    },
    image_space: {
      type: SettingTypes.slider,
      label: '图片间隙',
      props: {
        min: 0,
        max: 60
      }
    },
    page_edge: {
      type: SettingTypes.slider,
      label: '页面间距',
      props: {
        min: 0,
        max: 60
      }
    }
  }
}
