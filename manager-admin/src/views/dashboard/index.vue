<template>
  <div class="dashboard-container" v-loading="loading">
    <div class="base-box">
      <el-col class="base-item" v-on:click.native="handleJump('goodsList')">
        <i class="el-icon-shopping-bag-1 base-icon" style="color: rgb(255, 156, 110)"></i>
        <div>
          <p class="number" style="color: rgb(255, 156, 110);">{{pageData.goods_count}}</p>
          <p>商品数量</p>
        </div>
      </el-col>
      <el-col class="base-item" v-on:click.native="handleJump('memberList')">
        <i class="el-icon-user base-icon" style="color: rgb(105, 192, 255);"></i>
        <div>
          <p class="number" style="color: rgb(105, 192, 255);">{{pageData.member_count}}</p>
          <p>会员数量</p>
        </div>
      </el-col>
      <el-col class="base-item" v-on:click.native="handleJump('orderList')">
        <i class="el-icon-tickets base-icon" style="color: rgb(255, 133, 192);;"></i>
        <div>
          <p class="number" style="color: rgb(255, 133, 192);">{{pageData.order_count}}</p>
          <p>订单数量</p>
        </div>
      </el-col>
      <el-col class="base-item" v-on:click.native="handleJump('shopList')">
        <i class="el-icon-house base-icon" style="color: #18a058;"></i>
        <div>
          <p class="number" style="color: #18a058;">{{pageData.shop_count}}</p>
          <p>店铺数量</p>
        </div>
      </el-col>
    </div>
    <el-row class="row-box">
      <div class="title">
				<div class="line"></div>
				今日待办
			</div>
      <el-col :span="4" class="col-item" v-on:click.native="handleJump('goodsAudit')">
				<p class="number">{{pageData.wait_audit_goods_count}}</p>
        <p>待审核商品</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('shopAudit')">
        <p class="number">{{pageData.wait_audit_shop_count}}</p>
        <p>待审核店铺</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('complaintList')">
				<p class="number">{{pageData.wait_handle_complain_count}}</p>
        <p>待审核投诉</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('serviceList')">
				<p class="number">{{pageData.wait_handle_service_count}}</p>
        <p>待人工处理售后</p>
      </el-col>
			<el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('putforwardApply')">
				<p class="number">{{pageData.wait_audit_withdraw_count}}</p>
        <p>待审核分销提现</p>
      </el-col>
    </el-row>

		<div class="base-box">
			<el-col class="count-box">
				<div class="title">
					流量概括
				</div>
				<div class="count-item">
					<div class="count-child">
						<p>今日访客数</p>
						<p class="value">{{pageData.today_visit_count}}</p>
					</div>
					<div class="count-child">
						<p>昨日访客数</p>
						<p class="value">{{pageData.yesterday_visit_count}}</p>
					</div>
				</div>
				<div class="count-item">
					<div class="count-child">
						<p>前七日访客数</p>
						<p class="value">{{pageData.seven_day_visit_count}}</p>
					</div>
					<div class="count-child">
						<p>前三十日访客数</p>
						<p class="value">{{pageData.thirty_day_visit_count}}</p>
					</div>
				</div>
			</el-col>
			<el-col class="count-box" >
				<div class="title">
					今日概括
				</div>
        <div class="count-item">
					<div class="today-count-child">
						<p >今日订单数</p>
						<p class="value">{{pageData.today_order_count}}</p>
					</div>
					<div class="today-count-child">
						<p>今日交易额</p>
						<p class="value">{{MixinUnitOfCurrency}}{{pageData.today_order_amount}}</p>
					</div>
          <div class="today-count-child">
						<p>今日新增店铺</p>
						<p class="value">{{pageData.today_shop_count}}</p>
					</div>
				</div>
        <div class="count-item">
					<div class="today-count-child">
						<p>今日新增会员数</p>
						<p class="value">{{pageData.today_member_count}}</p>
					</div>
					<div class="today-count-child">
						<p>今日新增商品数量</p>
						<p class="value">{{pageData.today_goods_count}}</p>
					</div>
          <div class="today-count-child">
						<p>今日新增评论</p>
						<p class="value">{{pageData.today_comment_count}}</p>
					</div>
				</div>
			</el-col>
    </div>

    <div class="base-box">
      <el-col class="count-box" >
				<div class="title">
					流量走势
				</div>
        <el-date-picker
          v-model="pvChartTimeRange"
          type="daterange"
          align="center"
          :editable="false"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="getIndexPvChart"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
        <div id="pvChart" :style="{height: tableHeight + 'px'}"></div>

      </el-col>
      <el-col class="count-box">
				<div class="title">
					交易趋势
				</div>
        <el-date-picker
          v-model="turnoverTimeRange"
          type="daterange"
          align="center"
          :editable="false"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="getIndexTurnoverChart"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
        <div id="turnoverChart" :style="{height: tableHeight + 'px'}"></div>
      </el-col>
    </div>
    <div class="hot-box">
      <div class="title-box">
        <div class="title">
          热卖商品TOP10
        </div>
        <el-date-picker
          v-model="hotGoodsTimeRange"
          type="daterange"
          align="center"
          :editable="false"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="getIndexHotGoods"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
      </div>

      <el-table stripe :data="hotGoodsList" border :height="480">
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" :class="[isO2O ? 'o2o-goods-name' : 'goods-name']" v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a>
          </template>
        </el-table-column>
        <el-table-column label="销售价" width="130">
          <template slot-scope="scope">{{ scope.row.price | unitPrice }}</template>
        </el-table-column>
      </el-table>
    </div>
    <div class="hot-box">
      <div class="title-box">
        <div class="title">
          热卖店铺TOP10
        </div>
        <el-date-picker
          v-model="hotShopTimeRange"
          type="daterange"
          align="center"
          :editable="false"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="getIndexHotShop"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
      </div>

      <el-table stripe :data="hotShopList" border :height="480">
        <el-table-column label="店铺名称" prop="seller_name">
        </el-table-column>
        <el-table-column label="销售额" width="130">
          <template slot-scope="scope">{{ scope.row.order_price | unitPrice }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import * as API_Common from '@/api/common'

  export default {
    name: 'dashboard',
    data() {
      return {
        loading: true,
        pageData: {},
        pvChartTimeRange: [],
        turnoverTimeRange: [],
        hotGoodsTimeRange: [],
        hotShopTimeRange: [],
        tableHeight: document.body.clientHeight / 2,
        hotShopList: [],
        hotGoodsList: []
      }
    },
    activated() {
      window.onresize = this.countTableHeight
    },
    mounted() {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      start.setHours(0, 0, 0, 0)

      const timeRange = [start.getTime(), end.getTime()]
      this.pvChartTimeRange = timeRange
      this.turnoverTimeRange = timeRange
      this.hotGoodsTimeRange = timeRange
      this.hotShopTimeRange = timeRange

      this.getIndexPvChart()
      this.getIndexHotShop()
      this.getIndexHotGoods()
      this.getIndexTurnoverChart()
      API_Common.getIndexData().then(response => {
        this.loading = false
        this.pageData = response
      })
    },
    methods: {
      handleJump(url) {
        this.$router.push({ name: url })
      },
      getIndexHotShop() {
        const hotShopTimeRange = this.hotShopTimeRange
        const params = {
          start_time: parseInt(hotShopTimeRange[0] / 1000),
          end_time: parseInt(hotShopTimeRange[1] / 1000)
        }
        API_Common.getIndexHotShop(params).then(res => {
          this.hotShopList = res.data
        })
      },
      getIndexHotGoods() {
        const hotGoodsTimeRange = this.hotGoodsTimeRange
        const params = {
          start_time: parseInt(hotGoodsTimeRange[0] / 1000),
          end_time: parseInt(hotGoodsTimeRange[1] / 1000)
        }
        API_Common.getIndexHotGoods(params).then(res => {
          this.hotGoodsList = res.data
        })
      },
      /** 获取交易趋势图表数据 */
      getIndexTurnoverChart() {
        const turnoverTimeRange = this.turnoverTimeRange
        const params = {
          start_time: parseInt(turnoverTimeRange[0] / 1000),
          end_time: parseInt(turnoverTimeRange[1] / 1000)
        }
        API_Common.getIndexTurnoverChart(params).then(res => {
          this.turnoverChart = echarts.init(document.getElementById('turnoverChart'))
          this.turnoverChart.setOption({
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: res.xAxis
            },
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            },
            tooltip: { trigger: 'item' },
            legend: {
              data: [res.series[0].name, res.series[1].name]
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: res.series[0].name,
                data: res.series[0].data,
                type: 'line',
                itemStyle: {
                  normal: {
                    color: '#67C23A',
                    lineStyle: {
                      color: '#67C23A'
                    }
                  }
                },
                areaStyle: {
                  color: '#e1f3d8',
                  opacity: 0.5
                }
              },
              {
                name: res.series[1].name,
                data: res.series[1].data,
                type: 'line',
                itemStyle: {
                  normal: {
                    color: '#409EFF',
                    lineStyle: {
                      color: '#409EFF'
                    }
                  }
                },
                areaStyle: {
                  color: '#79bbff',
                  opacity: 0.5
                }
              }
            ]
          })
        })
      },
      /** 窗口缩放时计算table高度 */
      countTableHeight() {
        if (this.turnoverChart) {
          this.turnoverChart.resize()
        }
        if (this.pvChart) {
          this.pvChart.resize()
        }
      },
      /** 获取流量统计 */
      getIndexPvChart() {
        const pvChartTimeRange = this.pvChartTimeRange
        const params = {
          start_time: parseInt(pvChartTimeRange[0] / 1000),
          end_time: parseInt(pvChartTimeRange[1] / 1000)
        }
        API_Common.getIndexPvChart(params).then(res => {
          this.pvChart = echarts.init(document.getElementById('pvChart'))
          this.pvChart.setOption({
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: res.xAxis
            },
            tooltip: { trigger: 'item' },
            legend: {
              right: 50,
              data: [res.series[0].name]
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: res.series[0].data,
                type: 'line',
                itemStyle: {
                  normal: {
                    color: '#409EFF',
                    lineStyle: {
                      color: '#409EFF'
                    }
                  }
                },
                areaStyle: {
                  color: '#66b1ff',
                  opacity: 0.5
                }
              }
            ]
          })
        })
      },
      // 页面是否有权限
      pageHasPermission(url) {
        const routers = this.$router.getRoutes()
        return routers.filter(item => item.path.indexOf(url) !== -1).length !== 0
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .dashboard-container {
    // height: 100%;
    padding: 15px;
    background: #f8f9fa;
    ::v-deep .el-card__body {
      padding: 14px;
    }
  }
	.count-box {
		background: #fff;
    border-radius: 12px;
		padding: 20px;
		margin: 0 10px;
    cursor: pointer;
    transition: .3s;
    border: 1px solid #ebeef5;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
		.count-item {
			display: flex;
      .today-count-child {
				width: calc(100% / 3);
        padding-left: 20px;
				font-size: 15px;
				color: #333;
				font-weight: 500;
				margin-bottom: 10px;
        .value {
					font-size: 21px;
					color: #ff5c58;
					font-weight: 700;
					margin: 10px 0;
				}
      }
			.count-child {
				width: 50%;
				padding-left: 20px;
				font-size: 15px;
				color: #333;
				font-weight: 500;
				margin-bottom: 10px;
				.value {
					font-size: 21px;
					color: rgb(105, 192, 255);
					font-weight: 700;
					margin: 10px 0;
				}
			}
		}
	}
  .hot-box {
    margin: 20px;
    background: #fff;
    padding:20px;
    border-radius: 20px;
    cursor: pointer;
    transition: .3s;
    border: 1px solid #ebeef5;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    .title-box {
      display: flex;
      align-items: center;
      justify-content:space-between;
      margin-bottom: 10px;
    }
  }
  .base-box {
    margin: 20px 10px;
    display: flex;
		justify-content: space-between;
    .base-item {
      background: #fff;
      border-radius: 12px;
      height: 85px;
      display: flex;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: .3s;
			margin: 0 10px;
      border: 1px solid #ebeef5;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }
      .base-icon {
        font-size: 50px;
        margin-right: 40px;
      }
      .number {
        font-size: 22px;
        font-weight: 500;
        margin-bottom: 10px;
      }
      p {
        margin: 0;
        font-size: 15px;
        color: #555;
        text-align: left;
      }
    }
  }
	.title {
		font-size: 18px;
		color: #444;
		font-weight: 500;
		margin-bottom: 20px;
		display: flex;
		.line {
			height: 24px;
			width: 4px;
			border-radius: 2px;
			background: #1c9399;
			margin-right: 16px;
		}
	}
	.row-box {
		background: #fff;
		border-radius: 12px;
    margin: 20px;
		padding: 20px;
		border: 1px solid #ebeef5;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		.col-item {
			background: hsla(0,0%,92.2%,.5333333333333333);
			border-radius: 12px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			height: 84px;
			color: #333;
			font-size: 14px;
      cursor: pointer;
			transition: .3s;
			border: 1px solid #dcdfe6;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
			.number {
				color: #1c9399;
				font-size: 18px;
				font-weight: 500;
				margin-bottom: 10px;
			}
			p {
				margin: 0;
			}
		}
	}

  // .el-col {
  //   border-radius: 4px;
  // }
  // .goods-name {
  //   color: #4183c4;
  //   &:hover { color: #f42424 }
  // }
  // .o2o-goods-name {
  //   color: #4183c4;
  // }
</style>
