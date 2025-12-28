<template>
  <div class="oder-wrap">
    <div class="inner-toolbar">
      <div class="toolbar-items">
        <span class="label">下单用户：</span>
        <el-input v-model="pageParams.member_name"  placeholder="请输入下单用户名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">分销用户：</span>
        <el-input v-model="pageParams.agent_member_name"  placeholder="请输入分销用户名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">订单号：</span>
        <el-input v-model="pageParams.order_sn"  placeholder="请输入订单号" maxlength="50" clearable />
      </div>
    </div>
    <div class="inner-toolbar">
      <div class="toolbar-items">
        <span class="label">分佣时间：</span>
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
        <span class="label">入账状态：</span>
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

    <div class="statistics-content">
      <el-row style="width: 80%">
        <el-col class="statistics-item" :span="4">
          <div>
            <span class="tag color1">●</span>
            <span>返佣订单数量</span>
          </div>
          <div>
            <span class="number">{{ statisticsData.order_num || 0 }}</span>单
          </div>
        </el-col>
        <el-col class="statistics-item" :span="4">
          <div style="display: flex; flex-wrap: nowrap; ">
            <span class="tag color2">●</span>
            <span>累计佣金</span>
          </div>
          <div style="display: flex; flex-wrap: nowrap; ">
            <span class="number">{{ statisticsData.commission_total | unitPrice }}</span>
          </div>
        </el-col>
        <el-col class="statistics-item" :span="4">
          <div>
            <span class="tag color5">●</span>
            <span>已到账佣金</span>
          </div>
          <div>
            <span class="number">{{statisticsData.confirm_commission_total | unitPrice}}</span>
          </div>
        </el-col>
        <el-col class="statistics-item" :span="4">
          <div>
            <span class="tag color3">●</span>
            <span>待入账佣金</span>
          </div>
          <div>
            <span class="number">{{statisticsData.wait_commission_total | unitPrice}}</span>
          </div>
        </el-col>
        <el-col class="statistics-item" :span="4">
          <div>
            <span class="tag color4">●</span>
            <span>已退回佣金</span>
          </div>
          <div>
            <span class="number">{{ statisticsData.return_commission_total | unitPrice}}</span>
          </div>
        </el-col>
      </el-row>

    </div>
    <brokerage-table :moreParams="params" @changePage="changePage" />
  </div>
</template>

<script>
  import BrokerageTable from './components/BrokerageTable'
  import * as API_distribution from '@/api/distribution'

  export default {
    name: 'brokerage-detail',
    components: { BrokerageTable },
    data() {
      return {
        pageParams: {},
        // 列表参数
        params: {},
        createTime: null,
        statisticsData: {} // 统计数据
      }
    },
    mounted() {
      this.getBrokerageTotal()
    },

    methods: {
      changePage(page) {
        this.params.page_no = page.page_no
        this.params.page_size = page.page_size
      },

      /** 获取订单统计数据 */
      getBrokerageTotal() {
        API_distribution.getBrokerageTotal(this.params).then(res => {
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
        this.getBrokerageTotal()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .oder-wrap {
    ::v-deep .el-date-editor--datetimerange.el-input__inner {
      width: auto;
    }
    background: #fff;
    padding: 20px;
    .border-top {
      border-top: 1px dashed #efefef;
    }
    .statistics-content {
      display: flex;
      align-items: center;
      width: 100%;
      .big-width {
        min-width: 350px !important;
      }
      .statistics-item {
        height: 40px;
        padding: 20px;
        box-shadow: 0 0 4px rgba(0,0,0,.2);
        color: #666;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin: 10px 20px;
        flex-wrap: nowrap;
        justify-content: space-between;
        min-width: 220px;
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
