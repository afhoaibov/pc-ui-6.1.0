import SettingTypes from '@/utils/setting-types'

export default {
  name: 'goods-corridor',
  label: {
    title: '商品连廊',
    icon: require('@/assets/icon-component-label_GoodsCorridor.svg'),
    limit: -1
  },
  sort: 13,
  data: {
    // 商品列表
    goodsList: [],
    // 标题
    head_title: '24小时精选商品',
    // 副标题
    head_subtitle: '每天10点更新',
    // 更多文本
    more_text: '查看更多限时优惠',
    // 更多链接
    more_link: ''
  },
  settings: {
    goodsList: {
      type: SettingTypes.goods
    },
    head_title: {
      type: SettingTypes.input,
      label: '标题文字'
    },
    head_subtitle: {
      type: SettingTypes.input,
      label: '副标题'
    },
    more_text: {
      type: SettingTypes.input,
      label: '更多文字'
    },
    more_link: {
      type: SettingTypes.link,
      label: '更多链接'
    }
  }
}
