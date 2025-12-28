<template>
  <div>
    <div class="distribution-content">
      <div class="menu-content">
        <div class="menu-item">
          <p>
            <span>团队订单数量：</span>
            <span class="num">{{distributionInfo.child_order_count}}</span>
          </p>
          <p>
            <span>团队订单金额：</span>
            <span class="num">{{distributionInfo.child_order_money}}</span>
          </p>
        </div>
        <div class="menu-item">
          <p>
            <span>一级订单数量：</span>
            <span class="num">{{distributionInfo.order_count_lv1}}</span>
          </p>
          <p>
            <span>一级订单金额：</span>
            <span class="num">{{distributionInfo.order_amount_lv1}}</span>
          </p>
        </div>
        <div class="menu-item">
          <p>
            <span>二级订单数量：</span>
            <span class="num">{{distributionInfo.order_count_lv2}}</span>
          </p>
          <p>
            <span>二级订单金额：</span>
            <span class="num">{{distributionInfo.order_amount_lv2}}</span>
          </p>
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
          <div class="order-table">
            <ul class="order-table-tbody">
              <li v-for="order in orderList" :key="order.order_sn">
                <div class="order-tbody-ordersn">
                  <div>
                    <span class="virtual-order-tag" v-if="order.order_type === 'VIRTUAL'">虚拟订单</span>
                    <span>订单编号：
                     <clipboard :text="order.order_sn" />
                    </span>
                    <span>下单时间：{{ order.create_time | unixToDate }}</span>
                    <span>
                      下单人：
                      <img v-if="order.member_avatar" class="agent-member-avatar" :src="order.member_avatar" alt="">
                      <img v-else class="agent-member-avatar" src="@/assets/images/icon-noface.jpg" alt="">
                      {{ order.member_name }}</span>
                  </div>
                  <span class="status-text">{{order.commission_status | filterStatus}}</span>
                </div>
                <div class="order-tbody-item">
                  <div class="order-item-sku">
                    <div class="sku-item">
                      <div class="goods-image">
                        <router-link :to="'/goods/' + order.goods_id" target="_blank">
                          <img :src="order.goods_image" :alt="order.goods_name">
                        </router-link>
                      </div>
                      <div class="goods-name-box">
                        <router-link :to="'/goods/' + order.goods_id" class="goods-name" target="_blank">
                          <span >{{ order.goods_name }}</span>
                        </router-link>
                      </div>
                      <div class="sku-price">
                        <span>
                          <!-- {{ order.goods_price | unitPrice }} -->
                          <en-price :price="order.goods_price" :sizeRatio="0.9" size="12" />
                        </span>
                      </div>
                      <div class="sku-num">x {{ order.goods_num }}</div>
                    </div>
                  </div>
                  <div class="order-item-price">
                    <strong>
                      <!-- {{ order.goods_total_amount | unitPrice }} -->
                      <en-price :price="order.goods_total_amount" :sizeRatio="0.9" size="12" />
                    </strong>
                  </div>
                  <div class="order-brokerage">
                    <p>
                      <strong>佣金</strong>
                    </p>
                    <strong class="commission-price">
                      <!-- {{order.commission | unitPrice}} -->
                      <en-price :price="order.commission" :sizeRatio="0.9" size="12" />
                    </strong>
                  </div>
                  <div class="order-item-status">
                    <span :class="[
                      order.pay_status === 'PAY_NO' &&
                      order.payment_type === 'ONLINE' &&
                      order.order_status === 'CONFIRM' &&
                      'wait-pay'
                    ]">{{ order.order_status_text }} </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="pagination-box" v-if="orderList.length">
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
import { cloneObj } from '@/utils/index'
import { Select, Option, DatePicker, Button } from 'element-ui'
Vue.use(Select).use(Option).use(DatePicker).use(Button)

export default {
  name: 'distributionOrder',
  head() {
    return {
      title: `分销订单-${this.site.title}`
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
      distributionInfo: {},
      orderListTotal: {},
      // 订单列表
      orderList: [],
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
  filters: {
    // 状态过滤器
    filterStatus(status) {
      switch (status) {
        case 'WAIT': return '待入账'
        case 'CONFIRM': return '已入账'
        case 'RETURN': return '已退回'
      }
    }
  },
  mounted() {
    this.getOrderListTotal()
    this.getDistributionUserInfo()
    this.getDistributionOrderList()
  },
  methods: {
    /** 获取分销订单数据 */
    getDistributionOrderList() {
      API_distribution.getDistributionOrderList(this.params).then(res => {
        this.orderList = res.data
        this.params.data_total = res.data_total
      })
    },
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
      this.getDistributionOrderList()
    },
    handleCurrentPageChange(page) {
      this.params.page_no = page
      this.getDistributionOrderList()
    },
    /** 获取列表统计 */
    getOrderListTotal() {
      const params = cloneObj(this.params)
      params.status = params.commission_status
      delete params.commission_status
      API_distribution.getOrderListTotal(params).then(res => {
        this.orderListTotal = res
      })
    },

    /** 获取分销商数据 */
    getDistributionUserInfo() {
      API_distribution.getDistributionUserInfo().then(res => {
        if (res) {
          this.distributionInfo = res
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/color" as theme;

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
      padding-left: 40px;
      font-size: 15px;
      color: #666;
      margin: 20px 0;
      border-right: 1px solid #efefef;
      &:hover {
        cursor: pointer;
      }
      &:last-child {
        border: none;
      }
      p {
        margin-bottom: 10px;
      }
      .num {
        margin: 10px 0;
        color: #333;
        font-weight: 500;
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
      // max-height: 530px;
      overflow: auto;
      .order-table {
        .order-table-thead {
          display: flex;
          align-items: center;
          height: 20px;
          padding: 8px 0;
          text-align: center;
          color: #999;
        }

        .order-table-tbody {
          li {
            margin-bottom: 20px;
          }
        }

        .order-tbody-title {
          background-color: #faece0;
          border: 1px solid #f9dbcc;
          padding: 9px 0;
          text-align: left;
          .seller-name {
            color: #53514f;
            font-weight: 600;
            margin: 0 20px 0 10px;
            .el-icon-s-shop {
              color: #999;
              font-size: 16px;
            }
          }

          .pay-type {
            color: #53514f;
            font-weight: 600;
            // margin-left: 20px;
          }

          .price {
            color: theme.$color-main;
            font-size: 14px;
            font-weight: 600;

            em {
              font-size: 12px;
              font-weight: normal;
            }
          }
        }

        .order-tbody-ordersn {
          background-color: #fff;
          border: 1px solid #f9dbcc;
          padding: 5px 0;
          color: #999;
          height: 20px;
          font-size: 12px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .agent-member-avatar {
            width: 20px;
            height: 20px;
          }
          .status-text {
            font-weight: 600;
            font-size: 14px;
            color: #67C23A;
          }

          span {
            margin: 0 20px 0 5px;
          }
        }

        .virtual-order-tag {
          color: #da5f27;
          border: 1px solid #da5f27;
          padding: 0 2px;
          border-radius: 4px;
          font-size: 10px;
          margin: 0 0 0 5px;
        }

        .order-tbody-item {
          display: flex;
          align-items: center;
          position: relative;
          border: 1px solid #f9dbcc;
          border-top: none;

          .order-item-sku {
            width: 630px;
          }

          .sku-item {
            display: flex;
            align-items: center;
            margin-top: 6px;
          }

          .goods-image {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 86px;
            height: 86px;

            a {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 66px;
              height: 66px;
              text-align: center;
              border: 1px solid #ccc;
              background-color: #fff;
            }

            img {
              width: 62px;
              height: 62px;
            }
          }

          .goods-name-box {
            width: 450px - 86px;

            .sku-act-tag {
              display: inline-block;
              padding: 0 5px;
              line-height: 15px;
              margin-right: 5px;
              border: 1px solid theme.$color-main;
              color: theme.$color-main
            }

          }

          .goods-name {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;

            .assemble-color {
              color: theme.$color-main;
              border: 1px solid theme.$color-main;
              border-radius: 3px;
            }
          }

          .sku-price,
          .sku-num {
            width: 80px;
            text-align: center;
          }

          .after-sale-btn {
            width: 70px;

            a {
              color: #666;
              display: block;
            }

            a:hover {
              color: theme.$color-main;
            }
          }
          .order-brokerage {
            width: 120px;
            text-align: center;
            .commission-price {
              color: theme.$color-main;
            }
          }
          .order-item-price,
          .order-item-status {
            width: 100px;
            text-align: center;
          }

          .order-item-price {
            width: 150px;

            &::before {
              content: ' ';
              position: absolute;
              top: 0;
              right: 390px;
              width: 1px;
              height: 100%;
              background-color: #f9dbcc;
            }

            &::after {
              content: ' ';
              position: absolute;
              top: 0;
              right: 230px;
              width: 1px;
              height: 100%;
              background-color: #f9dbcc;
            }
          }

          .order-item-status {
            width: 120px;

            &::after {
              content: ' ';
              position: absolute;
              top: 0;
              right: 120px;
              width: 1px;
              height: 100%;
              background-color: #f9dbcc;
            }
          }

          .order-item-operate {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 110px;

            a {
              display: block;
              width: 80px;
              // min-height: 30px;
              padding: 6px 0;
              border: 1px solid #ccc;
              text-align: center;
              background: #f9f9f9;
              color: #666;
              cursor: pointer;
              margin-bottom: 5px;

              &:first-child {
                margin-top: 5px;
              }

              ;

              &:hover {
                background: #eaeaea;
              }
            }
          }
        }
      }
    }
    .pagination-box {
      text-align: right;
    }
  }
}
</style>
