import SettingTypes from '@/utils/setting-types'

export default {
  name: 'goods',
  label: {
    title: '商品模块',
    icon: require('@/assets/icon-component-label_Goods.png'),
    limit: 20
  },
  sort: 2,
  data: {
    // 商品列表
    goodsList: [],
    // 列表样式
    list_style: 'single',
    // 商品样式
    goods_style: 'white-outline',
    // 商品倒角
    goods_chamfer: 'straight',
    // 图片比例
    image_ratio: '3:2',
    // 图片填充
    image_fill: 'cover',
    // 文本样式
    text_font_weight: '400',
    // 文本对齐方式
    text_align: 'left',
    // 页面边距
    page_edge: 30,
    // 商品间距
    goods_space: 20,
    // 显示商品名称
    show_goods_name: true,
    // 显示商品价格
    show_goods_price: true,
    // 显示商品原价
    show_goods_original_price: true,
    // 显示商品购买按钮
    show_goods_buy_btn: true,
    // 购买按钮样式
    goods_buy_btn_style: 1,
    // 购买按钮文字
    goods_buy_btn_text: '',
    // 显示商品角标
    show_goods_badge: false,
    // 商品角标类型
    goods_badge_style: 'new'
  },
  settings: {
    goodsList: {
      type: SettingTypes.custom,
      component_name: 'GoodsSettingSelector',
      space_line: true
    },
    list_style: {
      type: SettingTypes.radio_button,
      label: '列表样式',
      column: true,
      options: [
        { label: '大图模式', value: 'single', icon: 'rb-icon-big' },
        { label: '一行两个', value: 'row-two', icon: 'rb-icon-small' },
        { label: '一行三个', value: 'row-three', icon: 'rb-icon-small' },
        { label: '详细列表', value: 'column', icon: 'rb-icon-list' },
        { label: '一大两小', value: 'hybrid', icon: 'rb-icon-hybrid' },
        { label: '横向滚动', value: 'row-scroll', icon: 'rb-icon-swipe' },
      ],
      optionsChange(value, data) {
        if (value === 'column') {
          data.image_ratio = '1:1'
          data.text_align = 'left'
        }
        if (value === 'row-three' || value === 'row-scroll') {
          const { goods_buy_btn_style: g, text_align } = data
          if (g === 3 || g === 4 || g === 7 || g === 8) {
            data.goods_buy_btn_style = 1
          }
          if (text_align === 'center') {
            data.show_goods_buy_btn = false
          }
        }
      },
      space_line: true
    },
    goods_style: {
      type: SettingTypes.radio_button,
      label: '商品样式',
      column: true,
      options: [
        { label: '白边无底', value: 'white-outline' },
        { label: '卡牌投影', value: 'card-shadow' },
        { label: '描边白底', value: 'outline-white-bottom' },
        { label: '无边透明底', value: 'transparent' }
      ]
    },
    goods_chamfer: {
      type: SettingTypes.radio_button,
      label: '商品倒角',
      options: [
        { label: '直角', value: 'straight', icon: 'rb-icon-corner-straight' },
        { label: '圆角', value: 'round', icon: 'rb-icon-corner-round' }
      ]
    },
    image_ratio: {
      type: SettingTypes.radio_button,
      label: '图片比例',
      options: [
        { label: '3:2', value: '3:2', disabled: data => data.list_style === 'column', icon: 'rb-icon-3-2' },
        { label: '1:1', value: '1:1', icon: 'rb-icon-1-1' },
        { label: '3:4', value: '3:4', disabled: data => data.list_style === 'column', icon: 'rb-icon-3-4' },
        { label: '16:9', value: '16:9', disabled: data => data.list_style === 'column', icon: 'rb-icon-16-9' }
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
    text_font_weight: {
      type: SettingTypes.radio_button,
      label: '文本样式',
      options: [
        { label: '常规体', value: '400', icon: 'rb-icon-font-regular' },
        { label: '加粗体', value: 'bold', icon: 'rb-icon-font-bold' }
      ]
    },
    text_align: {
      type: SettingTypes.radio_button,
      label: '文本对齐',
      options: [
        { label: '左对齐', value: 'left', icon: 'rb-icon-align-left' },
        { label: '居中对齐', value: 'center', disabled: data => data.list_style === 'column', icon: 'rb-icon-align-center' }
      ],
      optionsChange(value, data) {
        if (value === 'center') {
          const { list_style } = data
          // 在居中情况下，如果是一行三个或者横向滚动，就不显示购买按钮。
          if (list_style === 'row-three' || list_style === 'row-scroll') {
            data.show_goods_buy_btn = false
          }
          // 在居中情况下，如果购买按钮样式处于1，2，5，6的样式下，就重置成样式3。
          switch (data.goods_buy_btn_style) {
            case 1: case 2: case 5: case 6:
              data.goods_buy_btn_style = 3;
          }
        }
      }
    },
    page_edge: {
      type: SettingTypes.slider,
      label: '页面边距',
      props: {
        min: 0,
        max: 60
      }
    },
    goods_space: {
      type: SettingTypes.slider,
      label: '商品间距',
      props: {
        min: 0,
        max: 60
      },
      space_line: true
    },
    show_goods_name: {
      type: SettingTypes.boolean,
      label: '商品名称',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      }
    },
    show_goods_price: {
      type: SettingTypes.boolean,
      label: '商品价格',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      }
    },
    show_goods_buy_btn: {
      type: SettingTypes.boolean,
      label: '购买按钮',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      },
      disabled: goodsBuyBtnDisabled,
      option: {
        type: 'radio',
        key: 'goods_buy_btn_style',
        options: [
          { label: '样式1', value: 1, disabled: goodsBuyBtnStyleDisabledByAlign },
          { label: '样式2', value: 2, disabled: goodsBuyBtnStyleDisabledByAlign },
          { label: '样式3', value: 3, disabled: goodsBuyBtnStyleDisabledByListStyle },
          { label: '样式4', value: 4, disabled: goodsBuyBtnStyleDisabledByListStyle },
          { label: '样式5', value: 5, disabled: goodsBuyBtnStyleDisabledByAlign },
          { label: '样式6', value: 6, disabled: goodsBuyBtnStyleDisabledByAlign },
          { label: '样式7', value: 7, disabled: goodsBuyBtnStyleDisabledByListStyle },
          { label: '样式8', value: 8, disabled: goodsBuyBtnStyleDisabledByListStyle }
        ],
        custom_component_name: 'GoodsSettingCustomBuyBtn'
      }
    },
    show_goods_badge: {
      type: SettingTypes.boolean,
      label: '商品角标',
      props: {
        activeText: '显示',
        inactiveText: '不显示'
      },
      option: {
        key: 'goods_badge_style',
        type: 'radio',
        options: [
          { label: '新品', value: 'new' },
          { label: '热卖', value: 'hot' },
          { label: 'NEW', value: 'NEW' },
          { label: 'HOT', value: 'HOT' },
          { label: '自定义', value: '' }
        ],
        custom_component_name: 'GoodsSettingCustomBadgeStyle'
      }
    }
  }
}

/**
 * 购买按钮样式是否禁用
 * @param data
 * @returns {boolean}
 */
function goodsBuyBtnStyleDisabledByListStyle(data) {
  const { list_style } = data
  // 如果是一行三个或者横向滚动，禁用按钮
  return list_style === 'row-three' || list_style === 'row-scroll';
}

/**
 * 购买按钮样式是否禁用
 * @param data
 * @returns {boolean}
 */
function goodsBuyBtnStyleDisabledByAlign(data) {
  // 如果是居中对齐，禁用按钮
  return data.text_align === 'center';
}

/**
 * 购买按钮是否禁用
 * @param data
 * @returns {boolean}
 */
function goodsBuyBtnDisabled(data) {
  const { list_style, text_align } = data
  // 在文字居中的情况下，才可能会有禁用购买按钮的情况
  if (text_align === 'center') {
    // 如果列表样式是一行三个或者横向滚动，就禁用购买按钮
    return list_style === 'row-three' || list_style === 'row-scroll'
  }
  return false
}
