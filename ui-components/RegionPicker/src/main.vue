<template>
  <div class="region-picker">
    <div v-if="!open_i18n" :id="'AS-' + _uid"></div>
    <el-form v-else :model="regionForm" ref="regionFormRef" :rules="regionFormRules">
      <el-form-item required label="国家/地区" prop="country_code">
        <el-select
          v-model="regionForm.country_code"
          :loading="country_loading"
          placeholder="请选择国家/地区"
          size="small"
          filterable
          @change="handleSelectCountry"
        >
          <el-option
            v-for="item in countryList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
            class="areal-item"
          >
            <div class="areal-item__inner">
              <span>{{ item.name }}</span>
              <img class="flag" :src="'data:image/png;base64,' + `${item.flag}`" alt="">
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 选中为中国时 -->
      <el-form-item
        v-if="regionForm.country_code === 'CN'"
        required
        label="省份地区"
        prop="region_id"
      >
        <div :id="'AS-' + _uid"></div>
      </el-form-item>
      <template v-else>
        <el-form-item v-if="regionList.length" required label="省份地区" prop="region_id">
          <el-select
            v-model="regionForm.region_id"
            :loading="region_loading"
            placeholder="请选择省份地区"
            filterable
            size="small"
            @change="handleSelectRegion"
          >
            <el-option
              v-for="item in regionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else required label="省份地区" prop="region_name">
          <el-input
            v-model="regionForm.region_name"
            size="small"
            placeholder="请选择省份地区"
            @change="emitData"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="cityList.length" required label="城市" prop="city_id">
          <el-select
            v-model="regionForm.city_id"
            :loading="city_loading"
            placeholder="请选择城市"
            filterable
            size="small"
            @change="handleSelectCity"
          >
            <el-option
              v-for="item in cityList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else required label="城市" prop="city_name">
          <el-input
            v-model="regionForm.city_name"
            size="small"
            placeholder="请填写城市"
            @change="emitData"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import $ from 'jquery'
import './jquery.addressSelect'
import { api } from '~/ui-domain'
import request from '@/utils/request'

export default {
  name: 'EnRegionPicker',
  props: {
    default: {
      default: null
    },
    api: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      countryList: [],
      regionList: [],
      cityList: [],
      regionForm: {
        country_code: '',
        region_id: '',
        region_name: '',
        city_id: '',
        city_name: ''
      },
      country_loading: false,
      region_loading: false,
      city_loading: false,
      selectedCountry: '',
      selectedRegion: '',
      selectedCity: '',
      addressObject: '',
      regionData: ''
    }
  },
  watch: {
    default: {
      handler: 'setDefaultData'
    }
  },
  mounted () {
    this.regionData = ''
    if (this.open_i18n) {
      this.GET_Countries()
    } else {
      this.initAddressSelect(this.default)
    }
  },
  computed: {
    regionFormRules() {
      const hasRegion = this.regionList.length !== 0
      const hasCity = this.cityList.length !== 0
      return {
        country_code: this.MixinRequired('请选择国家/地区'),
        // region_id: this.MixinRequired(hasRegion ? '请选择省份地区' : '请填写省份地区', hasRegion ? 'change' : 'blur'),
        region_id: this.MixinRequired('请选择省份地区', 'change'),
        region_name: this.MixinRequired('请填写省份地区', 'blur'),
        // city_id: this.MixinRequired(hasCity ? '请选择城市' : '请填写城市', hasCity ? 'change' : 'blur')
        city_id: this.MixinRequired('请选择城市', 'change'),
        city_name: this.MixinRequired('请填写城市', 'blur'),
      }
    }
  },
  methods: {
    setDefaultData() {
      if (this.open_i18n && !Array.isArray(this.default)) {
        const { country_code, country_name, region_id, region_name, city_id, city_name } = this.default
        this.regionForm.country_code = country_code
        this.regionForm.country_name = country_name
        this.regionForm.region_id = region_id
        this.regionForm.region_name = region_name
        this.regionForm.city_id = city_id
        this.regionForm.city_name = city_name
        this.emitData()
        if (country_code) this.GET_Regions(country_code)
        if (region_id) this.GET_Cities(region_id)
      } else {
        this.regionForm.country_code = 'CN'
        this.regionForm.country_name = '中国'
        this.initAddressSelect(this.default)
      }
    },
    callback(object) {
      this.addressObject = object
      this.regionForm.region_id = object.last_id
      this.emitData()
      if (this.open_i18n) {
        this.$refs['regionFormRef'].validateField('region_id')
      }
    },
    initAddressSelect(deData) {
      this.$nextTick(() => {
        $(document.getElementById(`AS-${this._uid}`)).addressSelect({
          api: this.api,
          callback: this.callback,
          deData: deData || null
        })
      })
    },
    /** 查询所有国家 */
    async GET_Countries() {
      this.country_loading = true
      try {
        this.countryList = await request({
          url: `${api.base}/base/countries`,
          method: 'get',
          loading: false
        })
      } finally {
        this.country_loading = false
      }
    },
    /** 查询国家下的省 */
    async GET_Regions(country_code) {
      this.region_loading = true
      try {
        this.regionList = await request({
          url: `${api.base}/base/countries/${country_code}/states`,
          method: 'get',
          loading: false
        })
      } finally {
        this.region_loading = false
      }
    },
    /** 查询国家下的省下的城市 */
    async GET_Cities(region_id) {
      this.city_loading = true
      try {
        this.cityList = await request({
          url: `${api.base}/base/countries/${region_id}/cities`,
          method: 'get',
          loading: false
        })
      } finally {
        this.city_loading = false
      }
    },
    handleSelectCountry(country_code) {
      const country = this.countryList.find(item => item.code === country_code)
      this.regionForm.region_id = ''
      this.regionForm.city_id = ''
      this.regionForm.city_name = ''
      this.selectedCountry = country
      this.selectedRegion = ''
      this.selectedCity = ''
      this.regionList = []
      this.cityList = []
      this.$emit('handleCountryChanged', country)
      if (country_code === 'CN') {
        this.initAddressSelect()
      } else {
        this.GET_Regions(country_code)
      }
      this.emitData()
    },
    handleSelectRegion(region_id) {
      this.regionForm.city_id = ''
      this.regionForm.city_name = ''
      const region = this.regionList.find(item => item.id === region_id)
      if (!region) return
      this.selectedRegion = region
      this.selectedCity = ''
      this.cityList = []
      if (region.has_city === 1) {
        this.GET_Cities(region_id)
      }
      this.emitData()
    },
    handleSelectCity(city_id) {
      this.selectedCity = this.cityList.find(item => item.id === city_id)
      this.emitData()
    },
    emitData() {
      if (this.open_i18n && this.regionForm.country_code !== 'CN') {
        const data = { region_type: 1 }
        data.country_code = this.selectedCountry.code || this.regionForm.country_code || ''
        data.country_name = this.selectedCountry.name || this.regionForm.country_name || ''
        data.overseas_region = {
          state_id: this.selectedRegion.id || this.regionForm.region_id || '',
          state_name: this.selectedRegion.name || this.regionForm.region_name || '',
          city_id: this.selectedCity.id || this.regionForm.city_id || '',
          city_name: this.selectedCity.name || this.regionForm.city_name || ''
        }
        this.$emit('changed', data)
        this.regionData = data
      } else {
        const { last_id } = this.addressObject
        const data = { region_type: 0 }
        data.country_code = 'CN'
        data.country_name = '中国'
        data.internal_region_id = last_id
        this.$emit('input', last_id)
        this.$emit('changed', data)
        this.regionData = data
      }
    }
  }
}
</script>
<style lang="scss">
.region-picker {
  ::v-deep .app-address-body {
    left: 0 !important;
  }
}
.areal-item {
  margin-bottom: 10px;
  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    img {
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
