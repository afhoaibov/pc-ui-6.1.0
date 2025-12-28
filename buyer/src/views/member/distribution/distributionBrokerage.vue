<template>
  <div>
    <div class="distribution-content">
      <div class="menu-content">
        <div class="menu-item">
          <p>总收益</p>
          <p class="num">
            <!-- {{(distributionInfo.total_commission || 0) | unitPrice}} -->
            <en-price :price="distributionInfo.total_commission || 0" size="15" direction="column" />
          </p>
        </div>
        <div class="menu-item">
          <p>待入账佣金</p>
          <p class="num">
            <!-- {{(distributionInfo.wait_commission || 0) | unitPrice}} -->
            <en-price :price="distributionInfo.wait_commission || 0" size="15" direction="column" />
          </p>
        </div>
        <div class="menu-item">
          <p>已提现佣金</p>
          <p class="num">
            <!-- {{(distributionInfo.received_income || 0) | unitPrice}} -->
            <en-price :price="distributionInfo.received_income || 0" size="15" direction="column" />
          </p>
        </div>
        <div class="menu-item">
          <p>可提现佣金</p>
          <p class="num">
            <!-- {{(distributionInfo.total_income || 0) | unitPrice}} -->
            <en-price :price="distributionInfo.total_income || 0" size="15" direction="column" />
          </p>
          <el-button class="withdrawal-btn" type="danger" size="small" @click="handleWithdraw">提现</el-button>
        </div>
      </div>
      <div class="message-content">
        <div class="search-box">
          <el-select size="small" v-model="params.commission_status" placeholder="请选择">
            <el-option
              v-for="item in selectOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
            </el-option>
          </el-select>
          <el-date-picker
            size="small"
            v-model="orderTimeRange"
            type="datetimerange"
            align="center"
            :editable="false"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="{ disabledDate(time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }">
          </el-date-picker>
          <el-button type="danger" size="small" @click="searchEvent">筛选</el-button>
        </div>
        <div class="table-box">
          <el-table  :data="listData" style="width: 100%">
            <el-table-column label="用户信息" prop="member_name" align="center" />
            <el-table-column label="订单" prop="order_sn" align="center" />
            <el-table-column label="时间" prop="state" align="center" width="200">
              <template slot-scope="scope">
                {{scope.row.create_time | unixToDate}}
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="commission_status" align="center" width="80">
              <template slot-scope="scope">
                {{getStatus(scope.row.commission_status)}}
              </template>
            </el-table-column>
            <el-table-column label="收益" prop="commission" align="center" width="140">
              <template slot-scope="scope">
                <span class="commission">+{{ scope.row.commission | unitPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="回退" prop="commission" align="center" width="140">
              <template slot-scope="scope">
                <span class="commission-minus">-{{ scope.row.return_commission | unitPrice }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagination-box" v-if="listData.length">
          <el-pagination
            @current-change="handleCurrentPageChange"
            :current-page.sync="params.page_no"
            :page-size="params.page_size"
            layout="total, prev, pager, next"
            :total="params.data_total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import * as API_distribution from '@/api/distribution'
import { DatePicker } from 'element-ui'
Vue.use(DatePicker)

export default {
  name: 'distributionBrokerage',
  head() {
    return {
      title: `佣金明细-${this.site.title}`
    }
  },
  data() {
    return {
      selectOptions: [
        { name: '全部', code: '' },
        { name: '待入账', code: 'WAIT' },
        { name: '已入账', code: 'CONFIRM' },
        { name: '已退回', code: 'RETURN' }
      ],
      // 分销商信息
      distributionInfo: {
        total_commission: 0,
        wait_commission: 0,
        received_income: 0,
        total_income: 0
      },
      listBrokerageTotal: {},
      // 分佣列表
      listData: [],
      params: {
        commission_status: '',
        page_no: 1,
        page_size: 10,
        start_time: '',
        end_time: ''
      },
      orderTimeRange: []
    }
  },
  computed: {
    getStatus() {
      return (status) => {
        switch (status) {
          case 'WAIT':
            return '待入账'
          case 'CONFIRM':
            return '已入账'
          case 'RETURN':
            return '已退回'
        }
      }
    }
  },
  mounted() {
    this.getBrokerageList()
    this.getBrokerageTotal()
    this.getDistributionUserInfo()
  },
  methods: {
    /** 检索 */
    searchEvent() {
      this.params.page_no = 1
      if (this.orderTimeRange && this.orderTimeRange.length) {
        let start_time = this.orderTimeRange[0]
        let end_time = this.orderTimeRange[1]
        if (typeof this.orderTimeRange[0] !== 'number') {
          start_time.getTime()
          end_time.getTime()
        }
        this.params.start_time = Math.floor(start_time / 1000)
        this.params.end_time = Math.floor(end_time / 1000)
      } else {
        this.params.start_time = this.params.end_time = ''
      }
      this.getBrokerageList()
    },
    handleCurrentPageChange(page) {
      this.params.page_no = page
      this.getBrokerageList()
    },
    /** 获取分佣列表 */
    getBrokerageList() {
      API_distribution.getBrokerageList(this.params).then(res => {
        this.listData = res.data
        this.params.data_total = res.data_total
      })
    },
    /** 获取列表金额统计 */
    getBrokerageTotal() {
      const params = this.params
      params.status = params.commission_status
      delete params.commission_status
      API_distribution.getBrokerageTotal(params).then(res => {
        this.listBrokerageTotal = res
      })
    },

    /** 获取分销商数据 */
    getDistributionUserInfo() {
      API_distribution.getDistributionUserInfo().then(res => {
        if (res) {
          this.distributionInfo = res
        }
      })
    },
    handleWithdraw() {
      this.$router.push({
        name: 'commissionWithdrawal'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.distribution-content ::v-deep .el-table th.el-table__cell.is-leaf {
  border: none;
}
.distribution-content ::v-deep .el-table::before {
  background-color: #fff;
}
.distribution-content {
  border: 1px solid #e7e7e7;
  min-height: 600px;
  .menu-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .menu-item {
      width: calc(100% / 3);
      display: flex;
      flex-direction: column;
      align-items: center;
      align-self: stretch;
      justify-items: flex-start;
      font-size: 14px;
      font-weight: 500;
      color: #444;
      margin: 20px 0;
      border-right: 1px solid #efefef;
      &:hover {
        cursor: pointer;
      }
      &:last-child {
        border: none;
      }
      .menu-img {
        width: 90px;
        height: 90px;
        margin-bottom: 10px;
      }
      .num {
        margin: 10px 0;
        font-size: 15px;
      }
      .withdrawal-btn {
        padding: 6px 15px;
      }
    }
  }
  .message-content {
    border-top: 1px solid #e7e7e7;
    .search-box {
      text-align: right;
      margin: 10px 10px 10px 0;
    }
    .table-box {
      max-height: 530px;
      overflow: auto;
      .commission-minus {
        color: #f42424;
      }
      .commission {
        color: #67C23A;
      }
    }
    .pagination-box {
      text-align: right;
    }
  }
}
</style>
