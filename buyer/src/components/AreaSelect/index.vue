
<template>
  <!-- 未开启国际化 -->
  <el-input
    v-if="showType == 1 && !open_i18n"
    type="number"
    v-model="mobile"
    placeholder="请输入手机号"
    v-bind="$attrs"
    @input="handleInput">
  </el-input>

  <!-- 国际化开启包含输入框 -->
  <el-input
    type="number"
    v-model="mobile"
    placeholder="请输入手机号"
    v-bind="$attrs"
    @input="handleInput"
    v-else-if="showType == 1 && open_i18n">
    <SelectItem
      slot="prepend"
      :areaLabel_n="areaLabel_n"
      :areaCodesList="areaCodesList"
      @selectChanged="selectChanged"/>
  </el-input>

  <!-- 仅区号下拉选项 -->
  <SelectItem
    v-else-if="showType == 0 && open_i18n"
    :areaLabel_n="areaLabel_n"
    :areaCodesList="areaCodesList"
    @selectChanged="selectChanged" />
</template>

<script>
import Vue from 'vue'
import { Input } from 'element-ui'
import request from '@/utils/request'
import { api } from '~/ui-domain'
import { RegExp } from '~/ui-utils'
import SelectItem from './SelectItem'

Vue.use(Input)

export default {
  name: 'EnAreaSelect',
  components: {
    SelectItem
  },
  props: {
    value: [String, Number],
    /** 使用类型 1-包含input输入框样式 0-仅区号下拉选项 */
    showType: {
      type: Number,
      default: 0
    },
    areaCode: {
      type: [String, Number],
      default: ''
    }
  },
  model: {
    prop: 'value',
    event: 'update'
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      api: `${api.base}/base/countries`,
      mobile: '',
      areaValue_n: process.env.I18N ? '86' : '',
      areaLabel_n: process.env.I18N ? '+86' : '',
      mobile_regex: '',
      // 国际化区号
      areaCodesList: []
    }
  },
  created() {
    if (this.open_i18n) {
      this.GET_Countries()
    } else {
      this.mobile_regex = RegExp.mobile
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (!newVal) {
          this.mobile = ''
          return
        }
        if (newVal.indexOf(',') !== -1) {
          const mobile = newVal.split(',')
          this.mobile = mobile[1]
          if (this.open_i18n) {
            this.setMobileRegex(mobile[0])
          }
        } else {
          this.mobile = newVal
        }
      }
    },
    // 默认已选区号
    areaCode: {
      handler(val) {
        if (val) {
          this.setMobileRegex(val)
        }
      },
      immediate: true
    }
  },
  computed: {
    mobileValue() {
      const { areaValue_n, mobile, open_i18n } = this
      if (!open_i18n) return mobile
      return areaValue_n + ',' + mobile
    }
  },
  methods: {
    /** 更新验证规则 */
    setMobileRegex(val) {
      this.areaValue_n = val
      this.areaLabel_n = '+' + val
      this.areaCodesList.forEach((e) => {
        if (e.tel === val) {
          this.mobile_regex = '/' + e.mobile_regex + '/'
        }
      })
    },
    /** 手机号格式化 */
    formatValid(val) {
      const open_i18n = this.open_i18n
      if (open_i18n && val && val.indexOf(',') !== -1) {
        const areaValue_n = val.split(',')[0]
        const mobile = val.split(',')[1]
        return areaValue_n + mobile
      } else {
        if (open_i18n) {
          return this.areaValue_n + val
        }
        return val
      }
    },

    /** 查询所有国家/区号 */
    GET_Countries() {
      request({
        url: this.api,
        method: 'get',
        loading: false
      }).then(response => {
        const areaValue_n = this.areaValue_n
        this.areaCodesList = response
        if (areaValue_n && !this.mobile_regex) {
          response.forEach((e) => {
            if (e.tel === areaValue_n) {
              this.mobile_regex = '/' + e.mobile_regex + '/'
            }
          })
        }
      })
    },

    /** 下拉区号选中 */
    selectChanged(countryInfo) {
      this.areaValue_n = countryInfo.tel
      this.areaLabel_n = '+' + countryInfo.tel
      this.mobile_regex = '/' + countryInfo.mobile_regex + '/'
      this.handleEmit()
    },

    handleInput(val) {
      this.handleEmit()
    },

    handleEmit() {
      const { mobile } = this
      this.$emit('update', mobile)
    }
  }
}
</script>
