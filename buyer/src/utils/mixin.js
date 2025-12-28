import { api, domain } from '~/ui-domain'
import { Foundation } from '~/ui-utils'
import i18n from '@/lang'
import Storage from '@/utils/storage'
import * as XLSX from 'xlsx'
import { unitPrice } from './filters'

export default {
  data() {
    return {
      // 图片上传API
      MixinUploadApi: `${api.buyer}/buyer/uploaders`,
      // buyer端access_token
      MixinAccessToken: {Authorization: Storage.getItem('access_token')},
      // 地区上传API
      MixinRegionApi: `${api.base}/base/regions/@id/children`,
      // API
      MixinApi: api,
      // 开启了国际化
      MixinI18n: process.env.I18N,
      // 日期选择器快捷选项
      MixinPickerShortcuts: [{
        text: '最近一周',
        onClick(picker) {
          const today = new Date()
          const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
          const end = timestamp
          const start = timestamp - 3600 * 1000 * 24 * 7
          picker.$emit('pick', [start, end])
        }
      }, {
        text: '最近一个月',
        onClick(picker) {
          const today = new Date()
          const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
          const end = timestamp
          const start = timestamp - 3600 * 1000 * 24 * 30
          picker.$emit('pick', [start, end])
        }
      }, {
        text: '最近三个月',
        onClick(picker) {
          const today = new Date()
          const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
          const end = timestamp
          const start = timestamp - 3600 * 1000 * 24 * 90
          picker.$emit('pick', [start, end])
        }
      }]
    }
  },
  computed: {
    /** 计算是否有forward */
    MixinForward() {
      let { forward } = this.$route.query
      return forward ? `?forward=${decodeURIComponent(forward)}` : ''
    },
    /** 站点信息 */
    site() {
      return this.$store.getters.site
    },
    // 域名
    MixinDomain() {
      const domainMap = JSON.parse(JSON.stringify(domain))
      
      return domainMap
    },
    // 货币单位
    MixinUnitOfCurrency() {
      return process.env.I18N ? (this.$store.getters.base_currency.symbol || '$') : '￥'
    }
  },
  methods: {
    /** 格式化时间戳 */
    MixinUnixToDate(row, column, cellValue, index) {
      return Foundation.unixToDate(cellValue)
    },
    /** 滚动到顶部【动画】 */
    MixinScrollToTop(top) {
      // eslint-disable-next-line no-undef
      $('html,body').animate({ scrollTop: top || 0 }, 300)
    },
    /** 用得比较多，放到mixin里 */
    MixinRequired(message, trigger) {
      return { required: true, pattern: /^\S.*$/gi, message: message, trigger: trigger || 'blur' }
    },
    /** 返回上一页 */
    MixinRouterBack() {
      if (window.history.length <= 1) {
        location.href = '/'
      } else {
        window.history.back()
      }
    },
    /** 是否为微信浏览器 */
    MixinIsWeChatBrowser() {
      return /micromessenger/i.test(navigator.userAgent)
    },
    /** base64转Blob */
    MixinBase64toBlob(base64) {
      const byteString = atob(base64.split(',')[1])
      const mimeString = base64.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], {type: mimeString})
    },
    /**
     * 打开IM
     * @constructor
     */
    MixinOpenIm(shop, params = {}) {
      if (process.env.IM) {
        let url = `/chat?shop_id=${shop.shop_id}`
        if (params.goods_id) url += `&goods_id=${params.goods_id}`
        url = this.$router.resolve(url).href
        window.open(url)
      } else {
        if (!shop.shop_qq) return this.$message.error('当前店铺没有配置客服联系方式！')
        window.open(`http://wpa.qq.com/msgrd?v=3&uin=${shop.shop_qq}&site=qq&menu=yes`)
      }
    },
    /**
     * 模拟睡眠
     * @param timer
     * @returns {Promise<unknown>}
     * @constructor
     */
    MixinMockSleep(timer) {
      return new Promise(resolve => {
        setTimeout(resolve, timer)
      })
    },
    /**
     * 国际化模板
     * @param data
     * @param key
     * @returns {*|string}
     * @constructor
     */
    MixinI18nTemplate(data, key) {
      return Foundation.i18nTemplateFormatter(data, key, i18n)
    },
    /**
     * 导出Excel
     * @param json   要导出的json数据
     * @param name   要导出的文件名
     * @param type   要导出的数据类型
     * @constructor
     */
    MixinExportJsonToExcel(json, name = 'data', type = 'application/octet-stream') {
      let wb = { SheetNames: [], Sheets: {}, Props: { }}
      if (!Array.isArray(json)) json = [json]
      json.forEach(item => {
        wb.SheetNames.push(item.sheet_name)
        wb.Sheets[item.sheet_name] = XLSX.utils.json_to_sheet(item.sheet_values, item.sheet_options)
      })
      const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }
      let blob = new Blob([s2ab(XLSX.write(wb, wopts))], { type })
      let link = document.createElement('a')
      document.body.appendChild(link)
      link.style.display = 'none'
      link.href = window.URL.createObjectURL(blob)
      link.download = `${name}.xlsx`
      link.click()
      // 释放资源
      setTimeout(() => {
        URL.revokeObjectURL(link.href)
      }, 100)

      function s2ab(s) {
        if (typeof ArrayBuffer !== 'undefined') {
          const buf = new ArrayBuffer(s.length)
          const view = new Uint8Array(buf)
          for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
          return buf
        } else {
          const buf = new Array(s.length)
          for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF
          return buf
        }
      }
    },
    /**
     * 地区选择器默认数据
     * @param data
     * @param prefix
     * @returns {(*|number)[]|{country_code: *, city_name: *, country_name: *, region_id: *, region_name: *, city_id: *}}
     * @constructor
     */
    MixinGetRegionDefaultData(data, prefix = '') {
      const country_code = data[`${prefix}country_code`]
      if (!country_code || country_code === 'CN') {
        return [
          data[`${prefix}province_id`] || -1,
          data[`${prefix}city_id`] || -1,
          data[`${prefix}county_id`] || -1,
          data[`${prefix}town_id`] || -1
        ]
      }
      return {
        country_code: data[`${prefix}country_code`],
        country_name: data[`${prefix}country_name`],
        region_id: data[`${prefix}province_id`],
        region_name: data[`${prefix}province`],
        city_id: data[`${prefix}city_id`],
        city_name: data[`${prefix}city`]
      }
    },
    /**
     * 格式化地址
     * @param data
     * @param prefix
     * @param separator
     * @returns {string}
     * @constructor
     */
    MixinFormatRegions(data, prefix = '', separator = '') {
      const country_code = data[`${prefix}country_code`]
      let address = []
      if (!country_code || country_code === 'CN') {
        if (data[`${prefix}province`]) address.push(data[`${prefix}province`])
        if (data[`${prefix}city`]) address.push(data[`${prefix}city`])
        if (data[`${prefix}county`]) address.push(data[`${prefix}county`])
        if (data[`${prefix}town`]) address.push(data[`${prefix}town`])
      } else {
        address.push(data[`${prefix}country_name`])
        address.push(data[`${prefix}province`])
        address.push(data[`${prefix}city`])
      }
      if (separator === false) return address
      return address.join(separator)
    },
    // 国际化下的价格，基准货币*选中货币汇率
    MixinI18nPrice(price) {
      if (!process.env.I18N) return ''
      price = Math.abs(price)
      const { symbol, rate } = this.$store.getters.current_currency
      const unit = symbol || '$'
      return unitPrice(price / rate, unit)
    }
  }
}
