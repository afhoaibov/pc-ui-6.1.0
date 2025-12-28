<template>
  <div class="bg-shop-summary" ref="shopSummary">
    <el-select v-model="type" placeholder="请选择" @change="changeHotType">
      <el-option
        v-for="item in orderOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"/>
    </el-select>
    <en-year-month-picker @changed="changeYearMonth"></en-year-month-picker>
    <el-button type="primary" @click="handleSearchHot">开始搜索</el-button>
    <br>
    <br>
    <div class="charts-info">
      <div id="regionalAnalysisMap" :style="[{height:tableHeight + 'px'}, {width:tableWidth+'px'}]"></div>
      <div id="regionalAnalysisChart" :style="[{height:tableHeight + 'px'},{width:tableWidth+'px'}]"></div>
    </div>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import * as API_regionalAnalysis from '@/api/regionalAnalysis'
  import echartMapChina from '@/assets/echart-map-china'

  const otherKeys = {
    '内蒙古自治区': '内蒙古',
    '广西壮族自治区': '广西',
    '西藏自治区': '西藏',
    '宁夏回族自治区': '宁夏',
    '新疆维吾尔自治区': '新疆',
    '香港特别行政区': '香港',
    '澳门特别行政区': '澳门'
  }

  export default {
    name: 'regionalAnalysis',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          /** 当前选择的日期类型 */
          cycle_type: 'MONTH',

          /** 年份 */
          year: '2018',

          /** 月份*/
          month: '6',

          /** 数据类型 */
          type: 'ORDER_MEMBER_NUM'
        },

        type: 'ORDER_MEMBER_NUM',

        /** 选择的数据项*/
        orderOptions: [
          { label: '下单会员数', value: 'ORDER_MEMBER_NUM' },
          { label: '下单金额', value: 'ORDER_PRICE' },
          { label: '下单量', value: 'ORDER_NUM' }
        ],
        tableHeight: document.body.clientHeight * 0.82,
        tableWidth: document.body.clientWidth - 250
      }
    },
    mounted() {
      echarts.registerMap('china', echartMapChina)
      this.GET_RegionalAnalysis()
      window.onresize = this.countTableHeight
    },
    methods: {
      /** 窗口缩放时计算table高度 */
      countTableHeight() {
        this.tableHeight = document.body.clientHeight * 0.82
        this.tableWidth = this.$refs.shopSummary.clientWidth - 50

        /** 图表刷新 */
        if (this.regionalAnalysisMap) {
          this.regionalAnalysisMap.resize()
        }
        if (this.regionalAnalysisChart) {
          this.regionalAnalysisChart.resize()
        }
      },

      /** 改变日期的回调*/
      changeYearMonth(obj) {
        this.params = {
          ...this.params,

          cycle_type: obj.type,

          year: obj.year
        }
        if (obj.type === 'MONTH') {
          this.params = {
            ...this.params,

            cycle_type: obj.type,

            year: obj.year,

            month: parseInt(obj.month)
          }
        }
      },

      /** 改变焦点时触发 */
      changeHotType(target) {
        this.params = {
          ...this.params,
          type: target
        }
        this.type = target
      },

      /** 搜索触发*/
      handleSearchHot() {
        this.GET_RegionalAnalysis()
      },

      /** 图表数据*/
      GET_RegionalAnalysis() {
        API_regionalAnalysis.getRegionalAnalysisList(this.params).then(response => {
          this.loading = false
          /** x轴信息  此处应当为中国34个行政区划的名称*/
          const xData = response.map((item) => { return item.name })
          const xName = this.orderOptions.filter(key => { return this.params.type === key.value })[0].label

          const mapData = response.map(item => {
            item.name = item.name.replace('省', '').replace('市', '')
            if (otherKeys[item.name]) {
              item.name = otherKeys[item.name]
            }
            item.value = Number(item.value)
            return item
          })
          if (!mapData.find(item => item.name === '南海诸岛')) {
            mapData.push({ name: '南海诸岛', value: 0 })
          }
          const maxVal = Math.max(...mapData.map(item => item.value))

          /** tooltip提示信息 */
          let seriesName = ''
          this.orderOptions.forEach(key => {
            if (key.value === this.type) {
              seriesName = key.label
            }
          })
          /** 地图 */
          this.regionalAnalysisMap = echarts.init(document.getElementById('regionalAnalysisMap'))
          this.regionalAnalysisMap.setOption({
            title: { text: '区域分析统计', x: 'center' },
            tooltip: {
              trigger: 'item',
              show: true,
              formatter: function(params, ticket, callback) {
                const res = params.data.name + '<br>' + params.seriesName + '：' + params.data.value
                return res
              }
            },
            visualMap: {
              min: 0,
              max: maxVal,
              left: 'right',
              text: ['高', '低'],
              calculable: true,
              inRange: {
                color: [
                  '#eeeeee',
                  '#e0f3f8',
                  '#ffffbf',
                  '#fee090',
                  '#fdae61',
                  '#f46d43',
                  '#d73027'
                ]
              }
            },
            toolbox: {
              show: true,
              right: 50,
              orient: 'vertical',
              left: 'right',
              top: 'center',
              showTitle: true,
              feature: {
                restore: {},
                saveAsImage: {}
              }
            },
            series: [
              {
                name: seriesName,
                type: 'map',
                mapType: 'china',
                roam: false,
                label: {
                  normal: {
                    show: true
                  },
                  emphasis: {
                    show: true
                  }
                },
                data: mapData
              }
            ]
          })
          /** 折线图 */
          this.regionalAnalysisChart = echarts.init(document.getElementById('regionalAnalysisChart'))
          this.regionalAnalysisChart.setOption({
            title: { text: '地区排行', x: 'center' },
            tooltip: {
              trigger: 'axis',
              show: true,
              formatter: function(params, ticket, callback) {
                const res = params[0].name + '<br>' + params[0].seriesName + '：' + params[0].value
                return res
              }
            },
            legend: { show: true, orient: 'vertical', data: [{ name: seriesName }], bottom: '10px' },
            color: ['#7CB5EC'],
            toolbox: {
              show: true,
              right: 50,
              showTitle: true,
              feature: {
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
              }
            },
            xAxis: {
              name: xName,
              type: 'value',
              // 设置成1保证坐标轴分割刻度显示成整数。
              minInterval: 1
            },
            yAxis: {
              name: '省级行政区划',
              type: 'category',
              axisTick: { show: false },
              data: xData
            },
            series: [
              {
                name: seriesName,
                type: 'bar',
                data: response,
                label: {
                  normal: {
                    show: true
                  }
                },
                markPoint: {
                  data: [
                    { type: 'max', name: '最大值' },
                    { type: 'min', name: '最小值' }
                  ]
                },
                markLine: {
                  data: [
                    { type: 'average', name: '平均值' }
                  ]
                }
              }
            ]
          })
        })
        this.countTableHeight()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .bg-shop-summary {
    background: #fff;
    padding: 20px;
  }
  .charts-info {
    div {
      display: inline-block;
      width: 48%;
    }
  }

</style>
