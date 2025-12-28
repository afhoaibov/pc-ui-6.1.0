<template>
  <div class="distribution-message">
    <add-distribution-user v-if="!isDistribution" @addDistributionSuccess="addDistributionSuccess" />
    <div class="distribution-content" v-else>
      <div class="user-content">
        <div class="income-base user-info">
          <img :src="distributionUserInfo.avatar" v-if="distributionUserInfo.avatar" class="user-avatar"  />
          <img src="@/assets/images/icon-noface.jpg" v-else  class="user-avatar"  />
          <div>
            <p>{{distributionUserInfo.name}}</p>

            <p>手机：
              <clipboard :text="distributionUserInfo.phone | formatMobile" />
            </p>
          </div>
        </div>
        <div class="income-base income-item">
          <p>总收益</p>
          <p class="income-price">
            <!-- {{distributionUserInfo.total_commission | unitPrice}} -->
            <en-price :price="distributionUserInfo.total_commission" :sizeRatio="0.9" size="15" />
          </p>
        </div>
        <div class="income-base income-item">
          <p>待入账金额</p>
          <p class="income-price">
            <!-- {{distributionUserInfo.wait_commission | unitPrice}} -->
            <en-price :price="distributionUserInfo.wait_commission" :sizeRatio="0.9" size="15" />
          </p>
        </div>
        <div class="income-base income-item">
          <p>可提现金额</p>
          <p class="income-price">
            <!-- {{distributionUserInfo.total_income | unitPrice}} -->
            <en-price :price="distributionUserInfo.total_income" :sizeRatio="0.9" size="15" />
          </p>
        </div>
      </div>
      <div class="menu-content">
        <router-link to="/member/distribution/distribution-team" class="menu-item">
          <img src="@/assets/images/fx_team.png" class="menu-img" />
          <p>我的团队</p>
        </router-link>
        <router-link to="/member/distribution/distribution-brokerage" class="menu-item">
          <img src="@/assets/images/fx_wallet.png" class="menu-img" />
          <p>佣金明细</p>
        </router-link>
        <router-link to="/member/distribution/distribution-order" class="menu-item">
          <img src="@/assets/images/fx_order.png" class="menu-img" />
          <p>分销订单</p>
        </router-link>
        <router-link to="/member/distribution/distribution-goods" class="menu-item">
          <img src="@/assets/images/fx_goods.png" class="menu-img" />
          <p>推广商品</p>
        </router-link>
      </div>
      <div class="message-content">
        <div class="title">分销动态</div>
        <div class="table-box">
          <el-table  :data="messageList" style="width: 100%">
            <el-table-column label="时间" prop="create_time" align="center" >
              <template slot-scope="scope">
                {{scope.row.create_time | unixToDate}}
              </template>
            </el-table-column>
            <el-table-column label="内容" prop="content" align="center" />
          </el-table>
        </div>
        <div class="pagination-box" v-if="messageList.length">
          <el-pagination
            @current-change="handleCurrentPageChange"
            :current-page.sync="messageParams.page_no"
            :page-size="messageParams.page_size"
            layout="total, prev, pager, next"
            :total="messageParams.data_total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import { RegExp } from '~/ui-utils'
import * as API_distribution from '@/api/distribution'
import { Form, FormItem } from 'element-ui'
import AddDistributionUser from './components/AddDistributionUser'

Vue.use(Form).use(FormItem)

export default {
  name: 'distributionManage',
  components: {
    AddDistributionUser
  },
  head() {
    return {
      title: `分销管理-${this.site.title}`
    }
  },
  data() {
    return {
      // 是否为分销商
      isDistribution: true,
      // 分销商信息
      distributionUserInfo: {
        total_commission: 0,
        wait_commission: 0,
        total_income: 0
      },
      // 分销动态
      messageList: [],
      messageParams: {
        page_no: 1,
        page_size: 10,
        data_total: 0
      }
    }
  },
  computed: {
  },
  async mounted() {
    const isDistribution = await API_distribution.checkDistribution()
    this.isDistribution = isDistribution
    if (isDistribution) {
      this.getDistributionUserInfo()
      this.getDistributionMessage()
    }
  },
  methods: {
    handleCurrentPageChange(page) {
      this.messageParams.page_no = page
      this.getDistributionMessage()
    },
    async addDistributionSuccess() {
      const isDistribution = await API_distribution.checkDistribution()
      this.isDistribution = isDistribution
      this.getDistributionUserInfo()
    },
    /** 获取分销动态信息 */
    getDistributionMessage() {
      API_distribution.getDistributionMessage(this.messageParams).then(res => {
        this.messageList = res.data
        this.messageParams.data_total = res.data_total
      })
    },

    /** 获取分销商数据 */
    getDistributionUserInfo() {
      API_distribution.getDistributionUserInfo().then(res => {
        if (res) {
          this.distributionUserInfo = res
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.distribution-message ::v-deep .el-table th.el-table__cell.is-leaf {
  border: none;
}
.distribution-message ::v-deep .el-table::before {
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
      width: calc(100% / 4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #333;
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
    }
  }
  .message-content {
    border-top: 1px solid #e7e7e7;
    .table-box {
      max-height: 530px;
      overflow: auto;
    }
    .title {
      font-size: 15px;
      color: #666;
      text-align: center;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #e7e7e7;
      font-weight: 600;
    }
    .pagination-box {
      text-align: right;
    }
  }
  .user-content {
    border-bottom: 1px solid #e7e7e7;
    align-items: center;
    display: flex;
    padding: 10px 0;

    .user-info {
      font-size: 14px !important;
      font-weight: 400 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: left !important;
      .user-avatar {
        width: 90px;
        height: 90px;
        margin-right: 10px;
        border-radius: 50%;
        border: 5px solid #fff;
        box-shadow: 0 0px 5px #ccc;
      }
    }
    .income-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .income-base {
      align-self: stretch;
      width: calc(100% / 3);
      text-align: center;
      font-size: 15px;
      color: #666;
      font-weight: 600;
      padding: 10px 0;
      border-right: 1px solid #e7e7e7;
      &:last-child {
        border: none;
      }
      .income-price {
        margin-top: 10px;
      }
    }
  }
}
</style>
