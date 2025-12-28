<template>
  <div>
    <div class="distribution-content">
      <div class="menu-content">
        <div class="menu-item">
          <p>团队总人数</p>
          <p class="num">{{distributionInfo.child_team_count_lv1 + distributionInfo.child_team_count_lv2 + 1}}</p>
        </div>
        <div class="menu-item">
          <p>一级成员人数</p>
          <p class="num">{{distributionInfo.child_team_count_lv1}}</p>
        </div>
        <div class="menu-item">
          <p>二级成员人数</p>
          <p class="num">{{distributionInfo.child_team_count_lv2}}</p>
        </div>
      </div>
      <div class="message-content">
        <div class="table-box">
          <el-table  :data="teamList" style="width: 100%">
            <el-table-column label="成员信息" prop="uname" align="center" >
              <template slot-scope="scope">
                <img v-if="scope.row.face" :src="scope.row.face" class="team-user-img" />
                <img v-else src="@/assets/images/icon-noface.jpg" class="team-user-img">
                {{scope.row.uname}}
              </template>
            </el-table-column>
            <el-table-column label="分销级别" prop="level" align="center" />
            <el-table-column label="下级人数" prop="number" align="center" >
              <template slot-scope="scope">
                {{scope.row.number || 0}}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagination-box" v-if="teamList.length">
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
import * as API_distribution from '@/api/distribution'

export default {
  name: 'distributionTeam',
  head() {
    return {
      title: `我的团队-${this.site.title}`
    }
  },
  data() {
    return {
      // 分销商信息
      distributionInfo: {},
      // 团队列表
      teamList: [],
      params: {
        page_no: 1,
        page_size: 10,
        data_total: 0
      }
    }
  },
  mounted() {
    this.getDistributionChildren()
    this.getDistributionUserInfo()
  },
  methods: {
    handleCurrentPageChange(page) {
      this.params.page_no = page
      this.getDistributionChildren()
    },
    /** 获取团队列表 */
    getDistributionChildren() {
      API_distribution.getDistributionChildren().then(res => {
        this.teamList = res.data
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
      justify-content: center;
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
      }
    }
  }
  .message-content {
    border-top: 1px solid #e7e7e7;
    .table-box {
      max-height: 530px;
      overflow: auto;
      .team-user-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    .pagination-box {
      text-align: right;
    }
  }
}
</style>
