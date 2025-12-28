<template>
  <div class="distributor-wrap">
    <div class="top-content">
      <div class="user-info basic-box">
        <img v-if="userData.avatar" :src="userData.avatar" alt="" class="user-img">
        <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
        <span>用户名：{{ userData.uname }}</span>
        <span>分销商姓名：{{ userData.name }}</span>
        <span>分销商手机：{{ userData.phone | formatMobile }}</span>
        <span class="theme-color">上级分销商：{{ userData.agent_member_uname_lv1 || '-' }}</span>

      </div>
      <div class="statistical-content basic-box">
        <div class="title">
          团队统计
        </div>
        <div class="team-list border-bot">
          <div class="team-item mg-r">
            <div class="label">团队人数（包含当前分销商）：</div>
            <div><span class="number">{{ teamCount }}</span>人</div>
          </div>
          <div class="team-item mg-r">
            <div class="label">一级团队人数：</div>
            <div><span class="number">{{ userData.child_team_count_lv1 }}</span>人</div>
          </div>
          <div class="team-item mg-r">
            <div class="label">二级团队人数：</div>
            <div><span class="number">{{ userData.child_team_count_lv2 }}</span>人</div>
          </div>
        </div>
        <div class="title">
          业绩统计
        </div>
        <div class="team-list ">
          <div class="team-item">
            <div class="label">团队分销总金额：</div>
            <div><span class="number">{{ userData.child_order_money | unitPrice }}</span></div>
          </div>
          <div class="team-item">
            <div class="label">一级分销总金额：</div>
            <div><span class="number">{{ userData.order_amount_lv1 | unitPrice }}</span></div>
          </div>
          <div class="team-item">
            <div class="label">二级分销总金额：</div>
            <div><span class="number">{{ userData.order_amount_lv2 | unitPrice }}</span></div>
          </div>
        </div>
        <div class="team-list border-bot">
          <div class="team-item">
            <div class="label">团队分销订单：</div>
            <div><span class="number">{{ userData.child_order_count }}</span>单</div>
          </div>
          <div class="team-item">
            <div class="label">一级分销订单：</div>
            <div><span class="number">{{ userData.order_count_lv1 }}</span>单</div>
          </div>
          <div class="team-item">
            <div class="label">二级分销订单：</div>
            <div><span class="number">{{ userData.order_count_lv2 }}</span>单</div>
          </div>
        </div>
        <div class="title">
          资产信息
        </div>
        <div class="team-list ">
          <div class="team-item">
            <div class="label">累计佣金：</div>
            <div><span class="number number-color">{{ userData.total_commission | unitPrice }}</span></div>
          </div>
          <div class="team-item">
            <div class="label">待入账佣金：</div>
            <div><span class="number number-color">{{ userData.wait_commission | unitPrice }}</span></div>
          </div>
          <div class="team-item">
            <div class="label">已提现佣金：</div>
            <div><span class="number number-color">{{ (userData.received_income || 0) | unitPrice }}</span></div>
          </div>
          <div class="team-item">
            <div class="label">可提现佣金：</div>
            <div><span class="number number-color">{{ userData.total_income | unitPrice }}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="table-content basic-box">
      <el-radio-group v-model="tabVal" fill="#5441bc">
        <el-radio-button label="message">分销动态</el-radio-button>
        <el-radio-button label="order">分销订单</el-radio-button>
        <el-radio-button label="info">佣金明细</el-radio-button>
      </el-radio-group>

      <message-table v-show="tabVal === 'message'" :moreParams="{ distribution_member_id: memberId }" />
      <distribution-order-table v-show="tabVal === 'order'" :moreParams="{ distribution_member_id: memberId }" />
      <brokerage-table v-show="tabVal === 'info'" :moreParams="{ agent_member_id: memberId }" />

    </div>

  </div>
</template>

<script>
import * as API_distribution from '@/api/distribution'
import BrokerageTable from './components/BrokerageTable'
import DistributionOrderTable from './components/DistributionOrderTable'
import MessageTable from './components/MessageTable'

export default {
  name: 'distributorDetail',
  components: { BrokerageTable, DistributionOrderTable, MessageTable },
  data() {
    return {
      tabVal: 'message',
      memberId: '', // 分销商iD
      userData: {} // 分销商数据
    }
  },
  computed: {
    teamCount() {
      // 团队总人数 一级+二级人数 +分销商本人
      return this.userData.child_team_count_lv1 + this.userData.child_team_count_lv2 + 1
    }
  },
  watch: {
    $route: {
      handler(val) {
        const params = val.params
        if (params.member_id) {
          this.memberId = params.member_id
          this.getDistributionDetail()
        }
      },
      immediate: true
    }
  },

  methods: {
    /** 获取分销商详情 */
    getDistributionDetail() {
      API_distribution.getDistributionDetail(this.memberId).then(res => {
        this.userData = res
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
$themeColor: #5441bc;

.theme-color {
  color: $themeColor;
}

.distributor-wrap {
  padding: 10px;
  .basic-box {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 0px 04px rgba(0, 0, 0, .2);
  }

  .table-content {
    padding: 20px;
    margin-top: 10px;
  }

  .top-content {
    display: flex;
    min-height: 500px;

    .user-info {
      width: 40%;
      color: #333;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 50px;

      .user-img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }

      span {
        margin-top: 20px;
      }
    }

    .statistical-content {
      width: 60%;
      padding: 30px;
      box-sizing: border-box;
      margin-left: 20px;

      .mg-r {
        margin-right: 100px !important;
      }

      .border-bot {
        border-bottom: 1px dashed #e7e7e7;
      }

      .title {
        color: #333;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .team-list {
        display: flex;
        margin-bottom: 20px;
        padding-bottom: 30px;

        .team-item {
          color: #666;
          font-size: 12px;
          margin-right: 50px;

          .label {
            margin-bottom: 10px;
          }

          .number {
            font-size: 18px;
            font-weight: 500;
            margin-right: 10px;
          }

          .number-color {
            color: $themeColor;
          }
        }

      }
    }
  }

}</style>


