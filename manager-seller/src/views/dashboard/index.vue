<template>
  <div class="dashboard-container" v-loading="loading">
    <el-row :gutter="20" type="flex" justify="space-around">
      <el-col  :span="24">
        <div class="grid-content bg-purple-light">
          <!--logo-->
          <div class="logo">
            <div class="shop-img-icon">
              <img v-if="shopInfo.shop_logo" :src="shopInfo.shop_logo">
              <img v-if="!shopInfo.shop_logo" src="../../assets/icon-no-shop-logo.png">
              <span class="to-change-shop-icon" @click="toChangeShopIcon">更改图标</span>
            </div>
            <el-upload
              class="upload-demo"
              style="display: none;"
              :action="`${MixinUploadApi}?scene=shop`"
              :headers="MixinAccessToken"
              :limit="1"
              :file-list="fileList"
              :before-upload="handleShopLogoBefore"
              :on-success="uploaded">
              <button style="visibility: hidden;" ref="uploadBtn"></button>
            </el-upload>
          </div>
          <!--文字信息-->
          <div class="shop-info">
            <div class="shop-info-basic">
              <span>{{ shopInfo.shop_name }}</span>
              <span>（用户名：{{ user_info.username }}）</span>
              <!--是否是平台自营-->
              <span v-if="parseInt(shopInfo.self_operated) === 1">平台自营</span>
            </div>
            <div class="shop-info-credit">
              <span>
                卖家信用：{{shopInfo.shop_credit}}分 &nbsp;
              </span>
              <div></div>
              <span>店铺地址：{{shopInfo.shop_province}}
                {{shopInfo.shop_city}}
                {{shopInfo.shop_county}}
                {{shopInfo.shop_town}}</span>
            </div>
          </div>
          <!--动态评分-->
          <div class="score">
            <p>店铺动态评分</p>
            <div class="active-score">
              <div>
                <span>描述</span>
                <span>{{shopInfo.shop_description_credit_text}}分</span>
              </div>
              <div>
                <span>服务</span>
                <span>{{shopInfo.shop_service_credit_text}}分</span>
              </div>
              <div>
                <span>发货</span>
                <span>{{shopInfo.shop_delivery_credit_text}}分</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row-box">
      <div class="title">
				<div class="line"></div>
				今日待办
			</div>
      <el-col :span="4" class="col-item" v-on:click.native="handleJump('understock')">
				<p class="number">{{pageData.warning_goods_count}}</p>
        <p>商品库存预警</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('serviceList')">
        <p class="number">{{pageData.after_sale_order_num}}</p>
        <p>待处理售后</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('complaintList')">
				<p class="number">{{pageData.wait_handle_complain_count}}</p>
        <p>待处理投诉</p>
      </el-col>
      <el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('orderList', {order_status: 'WAIT_SHIP'})">
				<p class="number">{{pageData.wait_ship_order_num}}</p>
        <p>待发货订单</p>
      </el-col>
			<el-col :span="4" :offset="1" class="col-item" v-on:click.native="handleJump('consultation')">
				<p class="number">{{pageData.pending_member_ask}}</p>
        <p>待处理买家咨询</p>
      </el-col>
    </el-row>

		<div class="base-box">
			<el-col class="count-box">
				<div class="title">
					商品概括
				</div>
				<div class="count-item">
          <div class="count-child" @click="handleJump('goodsList', {market_enable: 1})">
						<p>出售中</p>
						<p class="value">{{pageData.market_goods}}</p>
					</div>
					<div class="count-child" @click="handleJump('goodsList', {market_enable: 0})">
						<p>待上架</p>
						<p class="value">{{pageData.pending_goods}}</p>
					</div>
				</div>
				<div class="count-item" @click="handleJump('authGoodsList')">
					<div class="count-child">
						<p>待审核</p>
						<p class="value">{{pageData.wait_audit_goods_count}}</p>
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
						<p class="value">￥{{pageData.today_order_amount}}</p>
					</div>
				</div>
        <div class="count-item">
          <div class="today-count-child">
						<p>今日新增商品</p>
						<p class="value">{{pageData.today_goods_count}}</p>
					</div>
					<div class="today-count-child">
						<p>今日新增访客</p>
						<p class="value">{{pageData.today_visit_count}}</p>
					</div>
				</div>
			</el-col>
    </div>

    <div class="base-box">
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
          @change="getTurnoverChart"
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
          @change="getHotGoodsCount"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
      </div>

      <el-table stripe :data="hotGoodsList" border :height="480">
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" :class="[isO2O ? 'o2o-goods-name' : 'goods-name']" v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a>
          </template>
        </el-table-column>
        <el-table-column label="销售数量" width="130">
          <template slot-scope="scope">{{ scope.row.goods_num }}</template>
        </el-table-column>
      </el-table>
    </div>
    <div class="hot-box">
      <div class="title-box">
        <div class="title">
          交易额TOP10
        </div>
        <el-date-picker
          v-model="hotGoodsAmountTimeRange"
          type="daterange"
          align="center"
          :editable="false"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="getHotGoodsAmount"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
        </el-date-picker>
      </div>

      <el-table stripe :data="hotAmountList" border :height="480">
        <el-table-column label="商品名称" prop="goods_name">
        </el-table-column>
        <el-table-column label="销售额" width="130">
          <template slot-scope="scope">{{ scope.row.price | unitPrice('￥') }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import * as API_Dashboard from '@/api/dashboard'
  import * as API_shop from '@/api/shop'

  export default {
    name: 'dashboard',
    data() {
      return {
        loading: true,
        pageData: {},
        shopInfo: {},
        /** 商家图标*/
        fileList: [],
        turnoverTimeRange: [],
        hotGoodsTimeRange: [],
        hotGoodsAmountTimeRange: [],
        tableHeight: document.body.clientHeight / 2,
        hotAmountList: [],
        hotGoodsList: []
      }
    },
    activated() {
      window.onresize = this.countTableHeight
    },
    computed: {
      /** 用户信息 */
      user_info() {
        return this.$store.getters.user
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.turnoverChart = this.$echarts.init(document.getElementById('turnoverChart'))
      })
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      start.setHours(0, 0, 0, 0)

      const timeRange = [start.getTime(), end.getTime()]

      this.turnoverTimeRange = timeRange
      this.hotGoodsTimeRange = timeRange
      this.hotGoodsAmountTimeRange = timeRange

      this.getHotGoodsAmount()
      this.getHotGoodsCount()
      this.getTurnoverChart()
      this.getDashboardShopScore()
      API_Dashboard.getDashboardData().then(response => {
        this.loading = false
        this.pageData = response
      })
    },
    methods: {
      /** 图片上传之前的校验 */
      handleShopLogoBefore(file) {
        const isImage = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
        if (!isImage) {
          this.$message.error('上传头像图片只能是 JPG、JPEG或PNG格式!')
          return isImage
        }
        return new Promise((resolve, reject) => {
          let reader = new FileReader()
          reader.onload = (event) => {
            let image = new Image()
            image.onload = () => {
              let width = image.width
              let height = image.height
              if (width !== height) {
                this.$message.error('图片必须是正方形图片！')
                reject()
              }
              resolve()
            }
            image.src = event.target.result
          }
          reader.readAsDataURL(file)
        })
      },
      /** 上传成功后的钩子 更换图片 置空存储数组*/
      uploaded(response) {
        this.shop_info.shop_logo = response.url
        this.fileList = []
        API_shop.updateShopLogo({ logo: response.url }).then(() => {
          this.$message.success('店铺LOGO修改成功')
          this.$store.dispatch('getShopInfoAction')
        })
      },
      /** 店铺LOGO上传 */
      toChangeShopIcon() {
        this.$refs.uploadBtn.click()
      },
      /** 获取店铺基础信息 */
      getDashboardShopScore() {
        API_Dashboard.getDashboardShopScore().then(res => {
          this.shopInfo = res
        })
      },
      handleJump(url, query) {
        if (this.pageHasPermission(url)) {
          this.$router.push({ name: url, query })
        } else {
          this.$message.error('暂无权限查看！')
        }
      },
      getHotGoodsAmount() {
        const hotGoodsAmountTimeRange = this.hotGoodsAmountTimeRange
        const params = {
          start_time: parseInt(hotGoodsAmountTimeRange[0] / 1000),
          end_time: parseInt(hotGoodsAmountTimeRange[1] / 1000)
        }
        API_Dashboard.getHotGoodsAmount(params).then(res => {
          this.hotAmountList = res.data
        })
      },
      getHotGoodsCount() {
        const hotGoodsTimeRange = this.hotGoodsTimeRange
        const params = {
          start_time: parseInt(hotGoodsTimeRange[0] / 1000),
          end_time: parseInt(hotGoodsTimeRange[1] / 1000)
        }
        API_Dashboard.getHotGoodsCount(params).then(res => {
          this.hotGoodsList = res.data
        })
      },
      /** 获取交易趋势图表数据 */
      getTurnoverChart() {
        const turnoverTimeRange = this.turnoverTimeRange
        const params = {
          start_time: parseInt(turnoverTimeRange[0] / 1000),
          end_time: parseInt(turnoverTimeRange[1] / 1000)
        }
        API_Dashboard.getTurnoverChart(params).then(res => {
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
        /** 图表刷新 */
        setTimeout(() => {
          this.turnoverChart.resize
        })
      },
      // 页面是否有权限
      pageHasPermission(name) {
        const routers = this.$router.getRoutes()
        return routers.filter(item => item.name === name).length !== 0
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .dashboard-container {
    height: 100%;
    padding: 5px;
    margin: 5px;
    ::v-deep .el-card__body {
      padding: 14px;
    }
  }
  /*商家基本信息*/
  div.grid-content {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: stretch;
    background: #fff;
    border-radius: 10px;
    margin: 0 10px;
    padding: 0 20px;
    /*logo*/
    .logo {
      padding: 15px;
      position: relative;
      box-sizing: content-box;
      div.shop-img-icon {
        width: 100px;
        height: 100px;
        &:hover span.to-change-shop-icon {
          display: block;
        }
        span.to-change-shop-icon {
          display: none;
          position: absolute;
          left: 16px;
          bottom: 14px;
          z-index: 10;
          width: 100px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          font-size: 12px;
          font-weight: normal;
          background: rgba(33, 33, 33, .6);
          color: #fff;
          cursor: pointer;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          cursor: pointer;
          border: 1px solid #999;
        }
      }
    }

    /*商家信息*/
    .shop-info {
      flex-grow: 5;
      padding-top: 30px;
      /*商家主营信息*/
      .shop-info-basic {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        span:first-child {
          color: #333;
          font: 18px/36px "microsoft yahei";
          letter-spacing: normal;
          vertical-align: bottom;
          word-spacing: normal;
        }
        span:last-child {
          color: #999;
          font-size: 12px;
          letter-spacing: normal;
          line-height: 28px;
          margin-left: 12px;
          vertical-align: bottom;
          word-spacing: normal;
        }
      }
      /*卖家信用*/
      .shop-info-credit {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        ::v-deep span {
          display: inline-block;
          margin-left:0 !important;
          color: #999;
          font-size: 12px;
          letter-spacing: normal;
          line-height: 28px;
          vertical-align: bottom;
          word-spacing: normal;
        }
        .shop-icon {
          margin:0 40px;
        }
      }
    }

    /*动态评分*/
    .score {
      flex-grow: 2.5;
      text-align: right;
      padding:5px 20px;
      p {
        margin: 0;
        text-align: left;
        border-bottom: 1px dotted #e7e7e7;
        font-size: 14px;
        color: #999;
        line-height: 20px;
        padding-bottom: 5px;
      }
      div.active-score {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content:space-around;
        align-items: center;
        margin-top: 5px;
        div {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          justify-content:space-around;
          align-items: center;
          span:first-child {
            color: #333;
            display: inline-block;
            font-size: 14px;
            text-align: center;
            padding: 5px 0px;
            font-weight: bold;
          }
          span:last-child {
            display: inline-block;
            font-size: 14px;
            text-align: center;
            padding: 5px 0px;
            color: #da542e;
          }
        }
      }
    }
  }
	.count-box {
		background: #fff;
    border-radius: 12px;
		padding: 20px;
		margin: 0 10px;
    cursor: pointer;
    transition: .5s;
    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 10px 0 #ccc;
    }
		.count-item {
			display: flex;
      .today-count-child {
				width: 50%;
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
					color: #409EFF;
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
    transition: .5s;
    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 10px 0 #ccc;
    }
    .title-box {
      display: flex;
      align-items: center;
      justify-content:space-between;
      margin-bottom: 10px;
    }
  }
  .base-box {
    margin: 20px 0;
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
      transition: .5s;
			// margin: 0 10px 0 0;
      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 0 10px 0 #ccc;
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
			background: #FF715F;
			margin-right: 16px;
		}
	}
	.row-box {
		background: #fff;
		border-radius: 12px;
    margin: 20px 10px;
		padding: 20px;
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
			transition: .5s;
      &:hover {
        transform: translateY(-10px);
        // box-shadow: 0 0 10px 0 #ccc;
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
</style>
