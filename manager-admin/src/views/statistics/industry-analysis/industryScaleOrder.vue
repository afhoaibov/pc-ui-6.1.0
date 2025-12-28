<template>
  <div v-loading="loading" id="industry-scale-order-chart" style="height: 300px"></div>
</template>

<script>
  import * as echarts from 'echarts'
  import * as API_Statistics from '@/api/statistics'
  import echartsOptions from '../echartsOptions'

  export default {
    name: 'industryScaleOrder',
    props: ['params', 'curTab'],
    data() {
      return {
        loading: false
      }
    },
    watch: {
      curTab: 'GET_IndustryScaleOrder',
      params: {
        handler: 'GET_IndustryScaleOrder',
        deep: true
      }
    },
    methods: {
      /** 获取会员下单量 */
      GET_IndustryScaleOrder() {
        if (this.curTab !== 'order' || this.loading) return
        this.loading = true
        API_Statistics.getIndustryScaleOrder(this.params).then(response => {
          this.loading = false
          const { data, localName, name } = response.series
          const { yAxis } = response
          this.echarts = echarts.init(document.getElementById('industry-scale-order-chart'))
          this.echarts.setOption(echartsOptions({
            titleText: name,
            seriesData: data,
            xAxis: {
              type: 'value',
              boundaryGap: [0, 0.01]
            },
            yAxisType: 'category',
            yAxisData: yAxis,
            seriesName: '下单量'
          }))
          this.echarts.resize()
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
