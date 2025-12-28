<template>
  <div class="oder-wrap">
    <div class="inner-toolbar">
      <div class="toolbar-items">
        <span class="label">下单用户：</span>
        <el-input v-model="pageParams.member_name"  placeholder="请输入下单用户名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">分销商名称：</span>
        <el-input v-model="pageParams.agent_member_name"  placeholder="请输入分销商名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">订单编号：</span>
        <el-input v-model="pageParams.order_sn"  placeholder="请输入订单号" maxlength="50" clearable />
      </div>
    </div>
    <div class="inner-toolbar">
      <div class="toolbar-items">
        <span class="label">商品名称：</span>
        <el-input v-model="pageParams.goods_name"  placeholder="请输入商品名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">结算时间：</span>
        <el-date-picker
          v-model="createTime"
          type="datetimerange"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
          range-separator="-"
          align="center"
          :editable="false"
          unlink-panels
          value-format="timestamp"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </div>
      <div class="toolbar-items">
        <span class="label">结算状态：</span>
        <el-select v-model="pageParams.commission_status" placeholder="请选择结算状态" clearable>
          <el-option
            label="待入账"
            value="WAIT">
          </el-option>
          <el-option
            label="已入账"
            value="CONFIRM">
          </el-option>
          <el-option
            label="已退回"
            value="RETURN">
          </el-option>
        </el-select>
      </div>
      <el-button
        size="medium"
        type="primary"
        @click="onSearch"
        class="search-btn"
      >搜索</el-button>
    </div>


    <div class="statistics-content border-top">
      <el-row  style="width: 80%;">
        <el-col class="statistics-item" :span="4">
          <span>
            <span class="tag color1">●</span> 分销订单数量：
          </span>
          <span class="number">{{statisticsData.order_num}} </span> 单
        </el-col>
        <el-col class="statistics-item" :span="4">
          <span class="tag color2">●</span> 商品结算总金额： <span class="number">{{statisticsData.goods_amount_total | unitPrice}}</span>
        </el-col>

        <el-col class="statistics-item" :span="4">
          <span class="tag color5">●</span> 分佣总金额： <span class="number">{{statisticsData.commission_total | unitPrice}}</span>
        </el-col>

        <el-col class="statistics-item" :span="4">
          <span class="tag color2">●</span> 已退回佣金： <span class="number">{{statisticsData.return_commission_total | unitPrice}}</span>
        </el-col>

        <el-col class="statistics-item" :span="4">
          <span class="tag color4">●</span> 待入账佣金： <span class="number">{{statisticsData.wait_commission_total | unitPrice}}</span>
        </el-col>

        <el-col class="statistics-item" :span="4">
          <span class="tag color3">●</span> 已入账佣金： <span class="number">{{statisticsData.confirm_commission_total | unitPrice}}</span>
        </el-col>
      </el-row>

    </div>

    <order-table :moreParams="params" @changePage="changePage" />
  </div>
</template>

<script>
  import OrderTable from './components/OrderTable'
  import * as API_distribution from '@/api/distribution'

  export default {
    name: 'distributor-order',
    components: { OrderTable },
    data() {
      return {
        pageParams: {},
        // 列表参数
        params: {
          page_no: 1,
          page_size: 10
        },
        createTime: null,
        statisticsData: {} // 统计数据
      }
    },
    mounted() {
      this.getDistributionOrderStatistics()
    },

    methods: {
      changePage(page) {
        this.params.page_no = page.page_no
        this.params.page_size = page.page_size
        this.getDistributionOrderStatistics()
      },

      /** 获取订单统计数据 */
      getDistributionOrderStatistics() {
        API_distribution.getDistributionOrderStatistics(this.params).then(res => {
          this.statisticsData = res
        })
      },

      /** 搜索事件触发 */
      onSearch() {
        const createTime = this.createTime
        const pageParams = this.pageParams

        let params = {}
        for (let key in pageParams) {
          if (pageParams[key]) {
            params[key] = pageParams[key]
          } else {
            delete params[key]
          }
        }
        if (createTime) {
          const getNumberOfSeconds = (time) => {
            return time / 1000
          }
          params.start_time = getNumberOfSeconds(createTime[0])
          params.end_time = getNumberOfSeconds(createTime[1])
        }
        this.params = params
        this.getDistributionOrderStatistics()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .oder-wrap ::v-deep .el-date-editor--datetimerange.el-input__inner {
    width: auto;
  }
  .oder-wrap {
    background: #fff;
    padding: 20px;
    .border-top {
      border-top: 1px dashed #efefef;
    }
    .statistics-content {
      display: flex;
      align-items: center;
      width: 100%;
      // .big-width {
      //   width: calc(70% / 3) !important;
      // }
      .statistics-item {
        height: 40px;
        padding: 20px;
        box-shadow: 0 0 4px rgba(0,0,0,.2);
        color: #666;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin: 10px 20px;
        // width: calc(60% / 3);
        min-width: 260px;
        .number {
          font-size: 18px;
        }
        .tag {
          margin-right: 10px;
        }
        .color1 {
          color: #5441bc;
        }
        .color2 {
          color: #fbb026;
        }
        .color3 {
          color: #5eb359;
        }
        .color4 {
          color: #d81e06;
        }
        .color5 {
          color: #1296db;
        }
      }
    }
  }
  .inner-toolbar {
    display: flex;
    align-items: center;
    padding: 0 20px;
    .search-box {
      justify-content: space-between;
      .search-btn {
        width: 100px;
        margin: 20px;
      }
    }
    .btn-box {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin: 20px;
    }
    .toolbar-items {
      padding: 20px 0;
      margin-right: 30px;
      display: flex;
      align-items: center;
      .label {
        color: #333;
        font-size: 14px;
        //word-wrap: normal;
        White-space: nowrap;
        //min-width: 100px !important;
      }
    }
  }
  // $themeColor: #5441bc;
  .theme-color {
    color: #5441bc;
  }
  .state-color {
    color: #5eb359;
  }
  .state {
    font-weight: 500;
  }
</style>
