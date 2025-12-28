<template>
  <div>
    <div class="distribution-content">
      <div class="menu-content">
        <div class="menu-item">
          <p>总收益</p>
          <p class="num">{{distributionInfo.total_commission}}</p>
        </div>
        <div class="menu-item">
          <p>待入账佣金</p>
          <p class="num">{{distributionInfo.wait_commission}}</p>
        </div>
        <div class="menu-item">
          <p>可提现佣金</p>
          <p class="num">{{distributionInfo.total_income}}</p>
          <el-button class="withdrawal-btn" type="danger" size="small" @click="handleWithdraw">申请提现</el-button>
        </div>
      </div>
      <div class="message-content">
        <div class="table-box">
          <el-table  :data="listData" style="width: 100%">
            <el-table-column label="提现单号" prop="withdraw_sn" align="center"/>
            <el-table-column label="提现金额" prop="price" align="center" />
            <el-table-column label="提现方式" prop="way" align="center">
              <template slot-scope="scope">
                {{scope.row.way === 'ALIPAY' ? '支付宝' : '微信'}}
              </template>
            </el-table-column>
            <el-table-column label="提现状态" prop="state" align="center" >
              <template slot-scope="scope">
                {{getStatus(scope.row.state)}}
              </template>
            </el-table-column>
            <el-table-column label="申请时间" prop="create_time" align="center">
              <template slot-scope="scope">
                {{scope.row.create_time | unixToDate}}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button class="submit-btn" size="mini" @click="handleWithdrawDetail(scope.row)">查看</el-button>
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
    <!--查看详细-->
    <el-dialog title="提现详情" :visible.sync="isShowWithdrawDetail" width="30%" align="center">
      <div class="detail-info">
        <span>提现单号：</span>
        {{ withdrawDetail.withdraw_sn }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'WECHAT'">
        <span>微信转账批次单号：</span>
        {{ withdrawDetail.wechat_out_batch_no }}
      </div>
      <div class="detail-info">
        <span>提现金额：</span>
        <!-- {{ withdrawDetail.price | unitPrice }} -->
          <en-price :price="withdrawDetail.price" :sizeRatio="0.9" size="12" direction="column" />
      </div>
      <div class="detail-info">
        <span>提现状态：</span>
        {{ getStatus(withdrawDetail.state) }}
      </div>
      <div class="detail-info">
        <span>提现方式：</span>
        {{ withDrawWay(withdrawDetail.way) }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_sn">
        <span>第三方转账单号：</span>
        {{ withdrawDetail.transfer_sn }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'ALIPAY'">
        <span>真实姓名：</span>
        {{ withdrawDetail.real_name }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.way === 'ALIPAY'">
        <span>支付宝账号：</span>
        {{ withdrawDetail.account_info }}
      </div>
      <div class="detail-info">
        <span>申请时间：</span>
        {{ withdrawDetail.create_time | unixToDate }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.complete_time">
        <span>完成时间：</span>
        {{ withdrawDetail.complete_time | unixToDate }}
      </div>
      <div class="detail-info">
        <span>申请提现客户端：</span>
        {{ withDrawClientType(withdrawDetail.client_type) }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.audit_operator">
        <span>审核人员：</span>
        {{ withdrawDetail.audit_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.audit_remark">
        <span>审核备注：</span>
        {{ withdrawDetail.audit_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_operator">
        <span>转账人员：</span>
        {{ withdrawDetail.transfer_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.transfer_remark">
        <span>转账备注：</span>
        {{ withdrawDetail.transfer_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.close_operator">
        <span>关闭人员：</span>
        {{ withdrawDetail.close_operator }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.close_remark">
        <span>关闭原因：</span>
        {{ withdrawDetail.close_remark }}
      </div>
      <div class="detail-info" v-if="withdrawDetail.fail_reason">
        <span>提现失败原因：</span>
        {{ withdrawDetail.fail_reason }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowWithdrawDetail = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Vue from 'vue'
import * as API_distribution from '@/api/distribution'
import { Dialog } from 'element-ui'
Vue.use(Dialog)

export default {
  name: 'commissionWithdrawal',
  head() {
    return {
      title: `佣金提现-${this.site.title}`
    }
  },
  data() {
    return {
      // 分销商信息
      distributionInfo: {},
      // 列表
      listData: [],
      params: {
        page_no: 1,
        page_size: 10
      },
      // 是否展示提现详情dialog
      isShowWithdrawDetail: false,
      // 提现详情信息
      withdrawDetail: ''
    }
  },
  computed: {
    /** 账户详情 */
    accountInfo() {
      return (info) => {
        return JSON.parse(info)
      }
    },
    getStatus() {
      return (status) => {
        switch (status) {
          case 'WAIT_AUDIT':
            return '待审核'
          case 'AUDIT_PASS':
            return '待转账'
          case 'TRANSFERRING':
            return '转账中'
          case 'AUDIT_FAIL':
            return '审核未通过'
          case 'FINISHED':
            return '已完成'
          case 'CLOSED':
            return '已关闭'
          case 'TRANSFER_FAILED':
            return '提现失败'
        }
      }
    },
    /** 提现方式格式化 */
    withDrawWay() {
      return (way) => {
        switch (way) {
          case 'ALIPAY':
            return '支付宝'
          case 'WECHAT':
            return '微信'
        }
      }
    },
    /** 提现客户端格式化 */
    withDrawClientType() {
      return (client_type) => {
        switch (client_type) {
          case 'PC':
            return '电脑浏览器'
          case 'H5':
            return '手机浏览器'
          case 'WECHAT_H5':
            return '手机浏览器'
          case 'APP':
            return '移动应用'
          case 'MINI':
            return '微信小程序'
        }
      }
    }
  },
  mounted() {
    this.getWithdrawalsList()
    this.getDistributionUserInfo()
  },
  methods: {
    handleCurrentPageChange(page) {
      this.params.page_no = page
      this.getWithdrawalsList()
    },

    /** 查看提现详情 */
    handleWithdrawDetail(row) {
      this.withdrawDetail = row
      this.isShowWithdrawDetail = true
    },

    /** 获取提现记录 */
    getWithdrawalsList() {
      API_distribution.getWithdrawalsList(this.params).then(res => {
        this.listData = res.data
        this.params.data_total = res.data_total
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
        name: 'applyForWithdraw'
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
    .table-box {
      max-height: 530px;
      overflow: auto;
      font-size: 12px;
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
div.detail-info {
  text-align: left;
  padding: 10px 0;
  span {
    font-weight: bold;
  }
}
</style>
