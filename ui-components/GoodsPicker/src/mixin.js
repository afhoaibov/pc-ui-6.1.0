/**
 * Created by Andste on 2018/5/28.
 */

import request from '@/utils/request'

export default {
  props: {
    // 选择器类型，后台管理：admin，商家中心：seller
    type: {
      type: String,
      default: 'admin'
    },
    sku: {
      type: Boolean,
      required: false,
      default: false
    },
    // 显示dialog
    show: {
      type: Boolean,
      default: false
    },
    api: String,
    // 获取多个商品API
    multipleApi: String,
    // 分类API
    categoryApi: String,
    // 最大可选个数
    limit: {
      type: Number,
      default: 0
    },
    // 默认数据
    defaultData: {
      type: Array,
      default: function () {
        return []
      }
    },
    // 排除
    excludeData: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 商品类型 【NORMAL: 普通商品, VIRTUAL：虚拟商品, POINT：积分商品】
    goodsType: {
      type: String,
      default: ''
    },
		// 国际化语言 项目开启国际化时传入
		lang: {
			type: String,
      default: ''
		},
    // 扩展参数
    extendParams: {
      type: Object,
      default: () => ({})
    }
  },
  data: function() {
    return {
      params: {
        page_no: 1,
        page_size: 10,
        // 商品分类路径
        category_path: '',
        // 店铺名称
        seller_name: '',
        // 商品类型
        goods_type: this.goodsType,
        // 一个或多个商品ids
        goods_ids: [],
        // 已审核通过的
        is_auth: 1,
        // 在售中的
        market_enable: 1,
				shop_type: 'NORMAL'
      },
      /** 加载状态 */
      loading: false,
      /** 商品列表 */
      goodsList: [],
      /** 已选列表 */
      selectedList: [],
      dialogVisible: this.show
    }
  },
  watch: {
		lang: function(newVal) {
			this.GET_GoodsList()
		},
    show: function(newVal) {
      this.dialogVisible = newVal
      if (this.goodsList.length === 0 && newVal === true) {
        this.GET_GoodsList()
        this.$nextTick(function() {
          this.$selectedList = document.getElementById('goods-picker-selected-' + this._uid)
        })
      }
    },
    dialogVisible: function(newVal) {
      newVal === false && this.$emit('close')
    },
    defaultData: {
      immediate: true,
      handler: 'defaultDataChanged'
    }
  },
  computed: {
    /** 计算已选择个数 */
    selectedNum: function() {
      return this.selectedList.filter(function(item) {
        return !!item
      }).length
    },
    /** 获取商品列表API */
    _api() {
      if (this.api) return this.api
      if (this.type === 'admin') {
				if (this.sku) {
					return 'admin/goods/skus'
				} else {
					if (this.lang) {
						// 国际化商品列表获取api
						return '/admin/i18n/goods/selector'
					}
					return 'admin/goods'
				}
      } else {
				if (this.sku) {
					return 'seller/goods/skus'
				} else {
					if (this.lang) {
						// 国际化商品列表获取api
						return '/seller/i18n/goods/selector'
					}
					return 'seller/goods?disabled=1'
				}
      }
    },
    /** 获取多个商品API */
    _multipleApi() {
      if (this.multipleApi) return this.multipleApi
      if (this.type === 'admin') {
        return this.sku ? 'admin/goods/skus/@ids/details' : 'admin/goods/@ids/details'
      } else {
        return this.sku ? 'seller/goods/skus/@ids/details' : 'seller/goods/@ids/details'
      }
    },
    /** 分类API */
    _categoryApi() {
      if (this.categoryApi) return this.categoryApi
      if (this.type === 'admin') {
        return 'admin/goods/categories/@id/children'
      } else {
        return 'seller/goods/category/@id/children'
      }
    },
    /** 商品key */
    goodsKey() {
      return this.sku ? 'sku_id' : 'goods_id'
    }
  },
  methods: {
    /** 确认 */
    handleConfirm: function() {
      this.$emit('confirm', this.selectedList.filter(function(item) {
        return !!item
      }))
      this.$emit('close')
      this.selectedList = []
    },
    /** 加载更多 */
    handleLoadMore: function() {
      if (this.loading) return
      this.params.page_no += 1
      this.GET_GoodsList()
    },
    /** 点击商品【可能是选择也可能是取消】 */
    handleClickItem: function(item) {
      let _index = this.selectedList.findIndex(_item => _item[this.goodsKey] === item[this.goodsKey])
      if (_index !== -1) {
        this.selectedList.splice(_index, 1)
      } else {
        let limit = this.limit
        if (limit > 0 && this.selectedList.filter(function(item) {
          return !!item
        }).length >= limit) {
          this.$message.error('超过最大可选个数：' + this.limit)
          return
        }
        this.selectedList.push(item)
        this.scrollToBottom()
      }
    },
    /** 从已选商品中移除商品 */
    handleRemoveItem: function(item, index) {
      this.selectedList.splice(index, 1)
    },
    /** 已选择列表滚动到底部 */
    scrollToBottom: function() {
      let _this = this
      this.$nextTick(function() {
        let $sel = _this.$selectedList
        $sel.scrollTop = $sel.scrollHeight
      })
    },
    /** 当默认数据发生改变 */
    defaultDataChanged: function(newVal) {
      this.selectedList = []
      if (newVal && newVal.length > 0) {
        let _this = this
        this.GET_GoodsByGoodsIds(newVal).then(function(response) {
          _this.selectedList = response
        })
      }
    },
    /** 计算是否已被选 */
    isSelected: function(goods) {
      let _this = this
      return this.selectedList.findIndex(function (item) {
        return item[_this.goodsKey] === goods[_this.goodsKey]
      }) !== -1
    },
    /** 获取商品列表 */
    GET_GoodsList: function(clean) {
      if (!clean) clean = false
      this.loading = true
      !!clean && (this.params.page_no = 1)
      let params = this.params
      let _params = {}
      let _this = this
      Object.keys(this.params).forEach(function (key) {
        if (String(_this.params[key])) _params[key] = params[key]
      })
			if (this.lang) {
				_params.tag = this.lang
			}
      request({
        url: this._api,
        method: 'get',
        loading: false,
        params: { ..._params, ...this.extendParams }
      }).then(function (response) {
        _this.loading = false
        let data = response.data
        data.map(function (item) {
          item.goods_image = item.thumbnail
          item.goods_price = item.price
          return item
        })
        // 如果clean为true，先清空goodsList
        !!clean && (_this.goodsList = [])
        data.forEach(function (item) {
          _this.goodsList.push(item)
        })
      })
    },
    /** 根据商品条码获取商品信息 */
    GET_GoodsByGoodsIds: function(ids) {
      ids = typeof ids === 'string'
        ? ids.replace(/，/g, ',')
        : ids.join(',')
      let _this = this
      return new Promise(function (resolve, reject) {
        request({
          url: _this._multipleApi.replace('@ids', ids),
          method: 'get',
          loading: false
        }).then(function (response) {
          let data = response.map(function (item) {
            item.goods_image = item.thumbnail
            item.goods_price = item.price
            return item
          })
          resolve(data)
        }).catch(reject)
      })
    }
  }
}
