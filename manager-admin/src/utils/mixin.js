/**
 * Created by Andste on 2018/5/9.
 */

import Vue from 'vue'
import { Foundation } from '~/ui-utils'
import { api, domain } from '~/ui-domain'
import i18n from '@/lang'
import Storage from '@/utils/storage'
import request from '@/utils/request'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      // 图片上传API
      MixinUploadApi: api.admin + '/admin/uploaders',
      // 图片上传API
      MixinUploadStreamApi: api.admin + '/admin/uploaders/stream',
      // 管理端access_token
      MixinAccessToken: {
        Authorization: Storage.getItem('admin_access_token'),
        language: Storage.getItem('adminLanguage') || 'zh-CN'
      },
      // 地区API
      MixinRegionApi: api.base + '/base/regions/@id/children',
      // 国际化国家API
      MixinCountriesINTApi: api.admin + '/admin/countries',
      // 国际化省API
      MixinRegionINTApi: api.admin + '/admin/states',
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
      }],
      // 是否开启o2o
      isO2O: process.env.O2O,
      // API
      MixinApi: api,
      // 是否开启了IM
      MixinIsIM: process.env.IM,
      // 开启了国际化
      MixinI18n: process.env.I18N
    }
  },
  computed: {
    ...mapGetters(['havePermission']),
    /**
     * 缓存页面数组
     * @returns {default.computed.cachedViews|(function())|Array|*|getters.cachedViews}
     */
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    /**
     * 返回默认时间 + 5分钟
     * 用于日期时间选择器的默认时间
     * @returns {string}
     * @constructor
     */
    MixinDefaultTime() {
      const today = new Date()
      let hours = today.getHours()
      let minutes = today.getMinutes() + 5
      let seconds = today.getSeconds()
      if (hours < 10) hours = '0' + hours
      if (minutes < 10) minutes = '0' + minutes
      if (seconds < 10) seconds = '0' + seconds
      return hours + ':' + minutes + ':' + seconds
    },
    // Domain
    MixinDomain() {
      const domainMap = JSON.parse(JSON.stringify(domain))
      
      return domainMap
    },
    // 买家端PC域名
    MixinBuyerDomain() {
      return this.MixinDomain.buyer_pc
    },
    // 买家端WAP域名
    MixinBuyerWapDomain() {
      return this.MixinDomain.buyer_wap
    },
    // 货币单位
    MixinUnitOfCurrency() {
      return process.env.I18N ? (this.$store.getters.baseCurrency.symbol || '$') : '￥'
    }
  },
  methods: {
    /** 导出提示 */
    MixinExportConfirm() {
      this.$confirm('下载任务已进入队列，可能需要花费一些时间，请稍后在导出记录中查看！', '下载报表', {
        confirmButtonText: '查看进度',
        cancelButtonText: '关闭'
      }).then(() => {
        const havePermission = this.havePermission('deriveRecord')
        if (havePermission) {
          this.$router.push({ name: 'deriveRecord' })
        } else {
          this.$message.error('当前角色未开启后台任务权限，请开启后查看！')
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    /** 返回克隆后的对象 */
    MixinClone(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    /** 用于修改单条表格数据后，set到tableData中 */
    MixinSetTableData(tableData, idName, id, response) {
      const { data } = tableData
      const index = data.findIndex(item => item[idName] === id)
      Vue.set(data, index, response)
    },
    /** 用于判断表单是否为空 */
    MixinRequired(message, trigger = 'blur', type = undefined) {
      return { required: true, message: message, trigger: trigger, type }
    },
    /** 格式化金钱 */
    MixinFormatPrice(row, column, cellValue, index) {
      if (typeof cellValue !== 'number') return ''
      return this.MixinUnitOfCurrency + Foundation.formatPrice(cellValue)
    },
    /** 格式化时间戳 */
    MixinUnixToDate(row, column, cellValue, index) {
      return Foundation.unixToDate(cellValue)
    },
    /**
     * 请求方法
     */
    MixinRequest(options) {
      return request(options)
    },
    /**
     * 打印HTML字符串
     * @constructor
     */
    MixinPrintHtmlStr(html) {
      const width = 1000
      const height = 800
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      const printWin = window.open('', '', `width=${width}, height=${height}, left=${left}, top=${top}`)
      printWin.document.write(html)
      printWin.document.close()
      printWin.focus()
      printWin.print()
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
    }
  }
}
