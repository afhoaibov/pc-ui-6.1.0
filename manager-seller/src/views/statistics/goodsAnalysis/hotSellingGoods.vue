<template>
  <div class="bg-shop-summary">
    <en-year-month-picker @changed="changeYearMonth"></en-year-month-picker>
    <br>
    <br>
    <el-tabs v-model="hotType" type="border-card" @tab-click="changeHotType">
      <el-tab-pane label="下单商品金额" name="price">
        <div v-if="hotType === 'price'" id="orderAmount" :style="[{height:tableHeight + 'px'}]"></div>
        <en-table-layout pagination :tableData="tableDatas" :loading="loading">
          <template slot="table-columns">
            <el-table-column prop="goods_name" label="商品名称" />
            <el-table-column label="下单商品总金额" >
              <template slot-scope="scope">{{ scope.row.sum | unitPrice }}</template>
            </el-table-column>
          </template>
        </en-table-layout>
      </el-tab-pane>
      <el-tab-pane label="下单商品数" name="amount">
        <div v-if="hotType === 'amount'" id="orderGoodsNum" :style="[{height:tableHeight + 'px'}]"></div>
        <en-table-layout pagination :tableData="tableData" :loading="loading">
          <template slot="table-columns">
            <el-table-column prop="goods_name" label="商品名称" />
            <el-table-column prop="all_num" label="下单商品数量" />
          </template>
        </en-table-layout>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import * as API_HotGoods from '@/api/hotGoods'
  import { CategoryPicker } from '@/components'
  export default {
    name: 'hotSellingGoods',
    components: {
      [CategoryPicker.name]: CategoryPicker
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {

          cycle_type: 'MONTH',

          year: '2018',

          month: '6'
        },

        /** 热卖商品*/
        hotType: 'price',

        /** 列表数据 */
        tableData: [],
        tableDatas: [],

        tableHeight: document.body.clientHeight / 2
      }
    },
    watch: {
    },
    mounted() {
      window.onresize = this.countTableHeight
    },
    methods: {
      /** 窗口缩放时计算table高度 */
      countTableHeight() {
        if (navigator.userAgent.indexOf('Firefox') > 0) {
          this.tableHeight = document.documentElement.clientHeight / 2
        } else {
          this.tableHeight = document.body.clientHeight / 2
        }
        /** 图表刷新 */
        if (this.orderAmountChart) {
          this.orderAmountChart.resize()
        }
        if (this.orderGoodsNumChart) {
          this.orderGoodsNumChart.resize()
        }
      },

      /** 改变日期的回调*/
      changeYearMonth(obj) {
        this.params = {
          cycle_type: obj.type,

          year: obj.year,

          month: obj.month
        }
        this.hotType === 'price' ? this.GET_OrderAmountData() : this.GET_OrderGoodsNumData()
      },

      /** 改变热卖焦点时触发 */
      changeHotType() {
        this.hotType === 'price' ? this.GET_OrderAmountData() : this.GET_OrderGoodsNumData()
      },

      /** 下单金额数量 */
      GET_OrderAmountData() {
        /** 下单金额Top30charts */
        API_HotGoods.getHotGoodsPrice(this.params).then(async response => {
          this.loading = false
          await this.$nextTick()
          this.orderAmountChart = echarts.init(document.getElementById('orderAmount'))
          this.orderAmountChart.setOption({
            title: { text: '热卖商品Top30', x: 'center' },
            tooltip: {
              trigger: 'axis',
              show: true,
              formatter: function(params, ticket, callback) {
                if (params[0].name && params[0].value) {
                  return `排名:${params[0].name}<br>${params[0].seriesId.replace(/0/, '')}：${params[0].value}`
                }
              }
            },
            legend: { orient: 'vertical', data: [{ name: response.series.name, textStyle: { borderColor: '#7CB5EC' }}], bottom: '10px' },
            color: ['#7CB5EC'],
            toolbox: {
              show: true,
              right: 50,
              showTitle: true,
              feature: {
                magicType: { type: ['bar', 'line'] },
                restore: {},
                saveAsImage: {}
              }
            },
            xAxis: {
              name: '排名',
              type: 'category',
              data: response.xAxis
            },
            yAxis: {
              name: '下单金额',
              type: 'value',
              axisLabel: {
                formatter: '{value}'
              }
            },
            series: [
              {
                name: '总金额',
                type: 'bar',
                barWidth: 50,
                data: response.series.data,
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
        /** 下单金额Top30table */
        API_HotGoods.getHotGoodsPricePage(this.params).then(response => {
          this.loading = false
          /** 列表信息 */
          this.tableDatas = response.data
        })
        this.countTableHeight()
      },

      /** 下单商品数量 */
      GET_OrderGoodsNumData() {
        /** 下单商品数量排行前30图表数据 */
        API_HotGoods.getHotGoodsNum(this.params).then(async response => {
          this.loading = false
          await this.$nextTick()
          this.orderGoodsNumChart = echarts.init(document.getElementById('orderGoodsNum'))
          this.orderGoodsNumChart.setOption({
            title: { text: '热卖商品Top30', x: 'center' },
            tooltip: {
              trigger: 'axis',
              show: true,
              formatter: function(params, ticket, callback) {
                if (params[0].name && params[0].value) {
                  return `排名:${params[0].name}<br>${params[0].seriesId.replace(/0/, '')}：${params[0].value}`
                }
              }
            },
            legend: { orient: 'vertical', data: [{ name: '下单商品数', textStyle: { borderColor: '#7CB5EC' }}], bottom: '10px' },
            color: ['#7CB5EC'],
            toolbox: {
              show: true,
              right: 50,
              showTitle: true,
              feature: {
                magicType: { type: ['bar', 'line'] },
                restore: {},
                saveAsImage: {}
              }
            },
            xAxis: {
              name: '排名',
              type: 'category',
              data: response.xAxis
            },
            yAxis: {
              name: '下单商品数量（个）',
              type: 'value',
              axisLabel: {
                formatter: '{value}'
              }
            },
            series: [
              {
                name: '下单商品数',
                type: 'bar',
                data: response.series.data,
                barWidth: 50,
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
        /** 下单商品数量排行前30表格数据 */
        API_HotGoods.getHotGoodsNumPage(this.params).then(response => {
          this.loading = false
          /** 列表信息 */
          this.tableData = response.data
        })
        this.countTableHeight()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .bg-shop-summary {
    margin: 15px;
    padding: 15px;
    background-color: #fff;
    border: 1px solid #9a9a9a;
    p {
      margin: 15px 0;
      text-align: left;
    }
  }
  .bg-shop-summary {
    ::v-deep .el-table td:not(.is-left) {
      text-align: center;
    }
    ::v-deep .el-tab-pane{
      width:100%;
    }
  }
</style>

