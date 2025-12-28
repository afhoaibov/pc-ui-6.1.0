<template>
	<el-form-item :label="getLabelText" :label-width="labelWidth" prop="mobile" :rules="mobileRule" class="mobile-item">
		<el-input v-if="showType == 1 && !open_i18n"  v-model="mobile" placeholder="请输入手机号" v-bind="$attrs"
			@input="handleInput">
		</el-input>
		<el-input v-model="mobile" placeholder="请输入手机号" v-bind="$attrs" @input="handleInput"
			v-else-if="showType == 1 && open_i18n">
			<el-select v-model="areaLabel_n" @change="selectChanged" slot="prepend">
				<el-input class="search" v-model="search" @input="dataFilter" />
				<el-option v-for="(item, index) in AreaCodes" :key="index" :label="'+' + `${item.tel}`" :value="index">
					<div class="areal-item">
						<img class="flag" :src="'data:image/png;base64,' + `${item.flag}`" alt="">
						{{ item.name }}
						<span class="mt" v-if="item.mt">({{ item.mt }})</span>
						<span class="code">+{{ item.tel }}</span>
					</div>
				</el-option>
				<el-option label="-------------------------------暂无更多-------------------------------" value="0"
					disabled></el-option>
			</el-select>
		</el-input>
		<el-select v-else-if="showType == 0 && open_i18n" v-model="areaLabel_n" @change="selectChanged" slot="prepend">
			<el-input class="search" v-model="search" @input="dataFilter" />
			<el-option v-for="(item, index) in AreaCodes" :key="index" :label="'+' + `${item.tel}`" :value="index">
				<div class="areal-item">
					<img class="flag" :src="'data:image/png;base64,' + `${item.flag}`" alt="">
					{{ item.name }}
					<span class="mt" v-if="item.mt">({{ item.mt }})</span>
					<span class="code">+{{ item.tel }}</span>
				</div>
			</el-option>
			<el-option label="-------------------------------暂无更多-------------------------------" value="0" disabled></el-option>
		</el-select>
  </el-form-item>
  
</template>

<script>

import request from '@/utils/request'
import { api } from '~/ui-domain'
import { RegExp, Foundation } from '~/ui-utils'

export default {
  name: 'EnAreaSelect',
  props: {
    value: [String, Number],
    showType: {
      type: Number,
      default: 0
    },
    areaCode: [String, Number],
		labelText: {
			type: String,
			default: ''
		},
    labelWidth: {
      type: String,
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
      mobile: '',
      api: `${api.base}/base/countries`,
      search: '',
      areaValue_n: process.env.I18N ? '86' : '',
      areaLabel_n: process.env.I18N ? '+86' : '',
      mobile_regex: '',
      // 国际化区号
      AreaCodes: [],
      copyAreaCodes: [],
			mobileRule: [
				{
					validator: (rule, value, callback) => {
						const { mobile_regex, mobile } = this
						console.log(this.formatValid(mobile))
						if (!mobile) {
							callback(new Error('请输入手机号！'))
						} else if (mobile_regex && !Foundation.eval2(mobile_regex).test(this.formatValid(mobile))) {
							callback(new Error('手机号码格式有误！'))
						} else {
							callback()
						}
					},
					required: true,
					trigger: 'blur'
				}
			],
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
        if (this.open_i18n && newVal && newVal.indexOf(',') !== -1) {
          const mobile = newVal.split(',')
          this.mobile = mobile[1]
          this.setMobileRegex(mobile[0])
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
		getLabelText() {
			return this.labelText || '手机号码'
		},
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
      this.AreaCodes.forEach((e) => {
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
    dataFilter(val) {
      if (val) {
        this.AreaCodes = this.copyAreaCodes.filter((item) => {
          if (item.name.indexOf(val) > -1 || item.tel.indexOf(val) > -1) {
            return true
          }
        })
      } else {
        this.AreaCodes = this.copyAreaCodes
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
        this.AreaCodes = response
        this.copyAreaCodes = response
        if (areaValue_n) {
          response.forEach((e) => {
            if (e.tel === areaValue_n) {
              this.mobile_regex = '/' + e.mobile_regex + '/'
            }
          })
        }
      })
    },
    selectChanged(e) {
      const countryInfo = this.AreaCodes[e]
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

<style type="text/scss" lang="scss" scoped>
.mobile-item {
	min-width: 300px;
	max-width: 500px;
  ::v-deep .el-input-group__prepend {
    background-color: #fff;
  }

  ::v-deep .el-select {
    width: 80px;

    .el-input__inner {
      width: 80px !important;
    }
  }
}
.areal-item {
  display: flex;
  align-items: center;

  .flag {
    width: 20px;
    margin-right: 10px;
  }

  .code {
    margin-left: 8px;
    font-size: 13px;
    color: #999;
  }

  .mt {
    margin-left: 4px;
  }
}

.search {
  display: block;
  width: 95%;
  margin: 5px auto;
}
</style>