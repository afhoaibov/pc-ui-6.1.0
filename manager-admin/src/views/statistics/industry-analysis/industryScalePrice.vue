<template>
  <div v-loading="loading" id="industry-scale-price-chart" style="height: 300px"></div>
</template>

<script>
  import * as echarts from 'echarts'
  import * as API_Statistics from '@/api/statistics'
  import echartsOptions from '../echartsOptions'

  export default {
    name: 'industryScalePrice',
    props: ['params', 'curTab'],
    data() {
      return {
        loading: false
      }
    },
    watch: {
      curTab: 'GET_IndustryScalePrice',
      params: {
        handler: 'GET_IndustryScalePrice',
        deep: true
      }
    },
    methods: {
      /** 获取会员下单量 */
      GET_IndustryScalePrice() {
        if (this.curTab !== 'price' || this.loading) return
        this.loading = true
        API_Statistics.getIndustryScalePrice(this.params).then(response => {
          this.loading = false
          const { data, localName, name } = response.series
          const { yAxis } = response
          this.echarts = echarts.init(document.getElementById('industry-scale-price-chart'))
          this.echarts.setOption(echartsOptions({
            titleText: name,
            seriesData: data,
            xAxis: {
              type: 'value',
              boundaryGap: [0, 0.01]
            },
            yAxisType: 'category',
            yAxisData: yAxis,
            seriesName: '下单金额'
          }))
          this.echarts.resize()
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
