<template>
  <div class="pro-list">
    <div class="pro-title">配&ensp;送&ensp;至&ensp;&ensp;</div>
    <div class="pro-content">
      <en-region-picker
        v-if="!open_i18n"
        :api="MixinRegionApi"
        @changed="regionConfirm"
      />
      <el-link v-if="open_i18n" type="primary" @click="showRegion">{{ regionName }}</el-link>
      <!-- <en-region-picker
        :api="MixinRegionApi"
        @changed="handleShipAreaChange"
        style="display: inline-block"
      /> -->
      <span class="area-tip">{{ stockMsg }}</span>
    </div>
    <en-region-picker-dialog
      v-if="open_i18n"
      ref="regionPickerDialog"
      :visible.sync="regionVisible"
      @confirm="regionConfirm"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { Link } from 'element-ui'
import * as API_Goods from '@/api/goods'
Vue.use(Link)

export default {
  name: 'goods-ship',
  props: ['goods-id'],
  data() {
    return {
      in_store: 2,
      regionVisible: false,
      regionName: '请选择地址',
      open_i18n: process.env.I18N
    }
  },
  computed: {
    stockMsg() {
      if (this.in_store === 0) return '该地区无货'
      if (this.in_store === 1) return '该地区有货'
      return ''
    }
  },
  methods: {
    handleShipAreaChange(object) {
      const goods_id = this.goodsId
      const area_id = object.internal_region_id || object.overseas_region.state_id
      API_Goods.getGoodsShip(goods_id, area_id).then(response => {
        this.in_store = response
        this.$emit('in-stock-change', response)
      })
    },
    showRegion() {
      this.regionVisible = true
    },
    regionConfirm(e) {
      this.regionName = this.MixinFormatRegions(e)
      this.handleShipAreaChange(e)
    }
  }
}
</script>

<style lang="scss" scoped>
.pro-list {
  ::v-deep .region-picker {
    display: flex;
    align-items: center;
    line-height: normal;
  }
  ::v-deep .app-address {
    z-index: 1;
  }
  ::v-deep .area-tip {
    color: #666;
    margin-left: 10px;
  }
}
</style>
