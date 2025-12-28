<template>
  <div id="regional-analysis-member-chart" v-loading="loading" style="height: 600px"></div>
</template>

<script>
  import * as API_Statistics from '@/api/statistics'
  import * as echarts from 'echarts'
  import echartsOptionsMap from '../echartsOptionsMap'

  export default {
    name: 'regionalAnalysis',
    props: ['params', 'curTab'],
    data() {
      return {
        /** 列表loading状态 */
        loading: false
      }
    },
    watch: {
      curTab: 'GET_RegionalAnalysisMember',
      params: {
        immediate: true,
        deep: true,
        handler: 'GET_RegionalAnalysisMember'
      }
    },
    methods: {
      /** 获取下单会员数据 */
      GET_RegionalAnalysisMember() {
        if (this.curTab !== 'member' || this.loading) return
        this.loading = true
        API_Statistics.getRegionalAnalysisMember(this.params).then(response => {
          this.loading = false
          const { data, name } = response
          const _data = data.map((item, index) => ({ name: name[index], value: Number(data[index]) }))
          this.echarts = echarts.init(document.getElementById('regional-analysis-member-chart'))
          this.echarts.setOption(echartsOptionsMap({
            titleText: '下单会员分布',
            seriesName: '下单会员数',
            seriesData: _data
          }))
          this.echarts.resize()
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
