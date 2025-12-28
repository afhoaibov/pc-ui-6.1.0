import axios from 'axios'
import SettingTypes from '@/utils/setting-types'
import * as Foundation from '@/utils/foundation'
import Storage from '@/utils/storage'
import request from '@/utils/request'
import { api, domain } from '~/ui-domain'
import { decorType, clientType } from '@/utils/decor-types'
import { mapGetters } from 'vuex'

export default {
  props: ['preview'],
  computed: {
    ...mapGetters(['activated', 'accessories']),
    previews: {
      get() {
        return this.$store.getters.previews
      },
      set(value) {
        this.$store.dispatch('setPreviewsAction', value)
      }
    },
    // 表单数据
    $$FormData() {
      if (this.preview) return this.preview.data
      const previews = this.activated.indexOf('accessory') !== -1 ? this.accessories : this.previews
      const preview = previews.filter(item => item.__key === this.activated)[0]
      return preview ? preview.data : {}
    },
    // 激活预览项
    $$ActivatedPreview() {
      if (!this.activated) return ''
      const previews = this.activated.indexOf('accessory') !== -1 ? this.accessories : this.previews
      return previews.filter(item => item.__key === this.activated)[0] || ''
    },
    // 附加项数据
    $$AccessoriesData() {
      const object = {}
      this.accessories.forEach(item => {
        object[item.name] = item.data
      })
      return object
    },
    // Foundation
    $$Foundation() {
      return Foundation
    },
    // 配置类型
    $$SettingTypes() {
      return SettingTypes
    },
    // 装修类型
    $$DecorType() {
      return decorType
    },
    // 是商家装修
    $$IsSeller() {
      return decorType === 'seller'
    },
    // 是后台装修
    $$IsAdmin() {
      return decorType === 'admin'
    },
    // 是装修站点
    $$IsDecor() {
      return true
    },
    // 客户端类型
    $$ClientType() {
      return clientType
    },
    // 是移动端
    $$IsMobile() {
      return clientType === 'mobile'
    },
    // 是PC端
    $$IsPC() {
      return clientType === 'pc'
    },
    // 上传接口
    $$UploadApi() {
      return `${api[decorType]}/${decorType}/uploaders`
    },
    // 各端域名
    $$Domain() {
      const domainMap = JSON.parse(JSON.stringify(domain))
      
      return domainMap
    },
    MixinBuyerDomain() {
      return this.$$Domain.buyer
    },
    // 店铺信息，只有在seller类型下才会有值
    $$ShopInfo() {
      if (decorType !== 'seller') return
      const shopInfo = Storage.getItem('seller_shop')
      return shopInfo ? JSON.parse(shopInfo) : undefined
    },
    $$GetBuyerPCDomain() {
      if (this.$$IsDecor) return this.$$Domain['buyer_pc']
      return this.$router.resolve('/').href
    }
  },
  methods: {
    /**
     * 获取value获取option
     * @param value
     * @param options
     */
    $$GetOptionByValue(value, options) {
      return options.filter(item => item.value === value)[0] || ''
    },
    /**
     * 请求方法
     */
    $$Request(options) {
      return request(options)
    },
    /**
     * 上传文件类型
     * @param type
     * @returns {string}
     */
    $$UploadAccept(type = 'image') {
      if (type === 'image') {
        return 'image/jpg,image/jpeg,image/png,image/webp,image/bmp,image/gif'
      }
      if (type === 'video') {
        return 'video/mp4,video/mov,video/m4v,video/flv,video/x-flv,video/mkv,video/wmv,video/avi,video/rmvb,video/3gp'
      }
    },
    /**
     * 错误并且关闭窗口
     * @param message
     * @param title
     */
    $$ErrorAndCloseWindow(message = '操作非法！', title = '错误') {
      return this.$alert(message, title, { type: 'error' }).finally(window.close)
    },
    /**
     * ElUpload自定义上传方法
     * @param options
     * @returns {Promise<any>}
     */
    $$UploadHttpRequest(options) {
      const formData = new FormData()
      formData.append('file', options.file)
      if (typeof options.data === 'object') {
        Object.keys(options.data).forEach(key => formData.append(key, options.data[key]))
      }
      const cancelTokenSource = axios.CancelToken.source()
      const promise = new Promise((resolve, reject) => {
        request({
          cancelToken: cancelTokenSource.token,
          url: options.action || `${api[decorType]}/${decorType}/uploaders`,
          method: 'post',
          loading: false,
          data: formData,
          onUploadProgress(e) {
            if (e.loaded > 0) {
              e.percent = e.loaded / e.total * 100
            }
            if (options.onProgress) {
              options.onProgress(e)
            }
          }
        }).then(resolve).catch((error) => reject(error, options.file))
      })
      promise.abort = cancelTokenSource.cancel
      return promise
    },
    /**
     * 获取连接值
     * @param link
     */
    $$GetLinkValue(link) {
      if (!link) return ''
      let href = this.$$IsDecor ? this.$$Domain['buyer_pc'] : ''
      link = typeof link.type === 'string' ? link : link.link
      switch (link.type) {
        case 'mini-page':
          href += `/mini-page?id=${link.value}`; break
        case 'shop-home':
          href += `/shop/${link.value}`; break
        case 'user-center':
          href += '/member'; break
        case 'goods':
          href += '/goods'; break
        case 'part-goods':
          href += `/goods/${link.value}`; break
        case 'cart':
          href += '/cart'; break
        case 'category':
          href += '/goods'; break
        case 'coupons':
          href += '/coupons'; break
        case 'seckill':
          href += '/seckill'; break
				case 'points-mall':
					href += '/points-mall'; break
				case 'assemble':
					href += '/assemble'; break
        case 'custom':
          href = link.value
      }
      return href
    }
  }
}
