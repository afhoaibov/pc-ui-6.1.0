<template>
  <div class="distributor-list">
    <en-table-layout pagination :tableData="tableData" :loading="loading">
      <div slot="toolbar" class="inner-toolbar">
        <div class="inner-box">
          <div class="toolbar-items">
            <span class="label">状态：</span>
            <el-select v-model="params.state" placeholder="请选择状态" clearable>
              <el-option label="正常" value="1">
              </el-option>
              <el-option label="已禁用" value="0">
              </el-option>
            </el-select>
          </div>
          <div class="toolbar-items">
            <span class="label">分销商名称：</span>
            <el-input v-model="params.name" placeholder="请输入分销商名称" maxlength="50" clearable />
          </div>
          <div class="toolbar-items">
            <span class="label">手机号：</span>
            <el-input v-model="params.phone" placeholder="请输入手机号" maxlength="50" clearable />
          </div>
          <el-button size="medium" type="primary" @click="onSearch" class="search-btn">搜索</el-button>
        </div>

      </div>
      <template slot="table-columns">

        <el-table-column min-width="100" :label="item.label" v-for="item in TableRow" :key="item.label">
          <template slot-scope="scope">
            <div class="user-info" v-if="item.prop === 'user_info'">
              <img :src="item.face" alt="">
              <span>{{ scope.row.name }}</span>
            </div>

            <span v-else-if="item.prop === 'total_income'">
              {{ scope.row[[item.prop]] | unitPrice }}
            </span>

            <span v-else-if="item.prop === 'child_order_money'">
              {{ scope.row[[item.prop]] | unitPrice }}
            </span>

            <div class="user-info" v-else-if="item.prop === 'superiors'">
              <img :src="item.face" alt="">
              <span>{{ scope.row.agent_member_uname_lv1 }}</span>
            </div>

            <span v-else-if="item.prop === 'state'" :class="['state', { 'state-color': scope.row[item.prop] === 1 }]">
              ● {{ scope.row[item.prop] === 1 ? '正常' : '已禁用' }}
            </span>
            <span v-else>
              <span v-if="item.prop === 'phone'">
                <clipboard :text="scope.row[item.prop] | formatMobile" />
              </span>
              <span v-else>
                {{ scope.row[item.prop] }}
              </span>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="text" class="theme-color" @click="handleOperateSee(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination v-if="tableData" slot="pagination" @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange" :current-page="pageData.page_no" :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size" layout="total, sizes, prev, pager, next, jumper" :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>
  </div>
</template>

<script>
import * as API_distribution from '@/api/distribution'
const TableRow = [
  { label: '分销商名称', prop: 'user_info' },
  { label: '手机号', prop: 'phone' },
  { label: '可提现佣金', prop: 'total_income' },
  { label: '一级团队人数', prop: 'child_team_count_lv1' },
  { label: '二级团队人数', prop: 'child_team_count_lv2' },
  { label: '团队分销订单总额', prop: 'child_order_money' },
  { label: '团队分销订单总数量', prop: 'child_order_count' },
  { label: '状态', prop: 'state' }
]
export default {
  name: 'distributor-list',
  data() {
    return {
      TableRow,
      // 列表loading状态
      loading: false,

      // 列表参数
      params: {
        page_no: 1,
        page_size: 20,
        uname: ''
      },
      // 列表数据
      tableData: [],

      /** 分页信息 */
      pageData: {}
    }
  },

  mounted() {
    this.getDistributionList()
  },

  methods: {
    /** 查看详情 */
    handleOperateSee(row) {
      this.$router.push({
        path: `distributor-detail/${row.member_id}`
      })
    },

    /** 数据检索 */
    onSearch() {
      this.params.page_no = 1
      this.getDistributionList()
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.getDistributionList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.getDistributionList()
    },

    /** 搜索事件触发 */
    searchEvent(data) {
      this.params = {
        page_no: 1,
        page_size: 20,
        uname: data
      }
      this.getDistributionList()
    },

    /** 获取分销商列表 */
    getDistributionList() {
      this.loading = true
      API_distribution.getDistributionList(this.params).then(response => {
        this.loading = false
        this.tableData = response.data
        this.pageData = {
          page_no: response.page_no,
          page_size: response.page_size,
          data_total: response.data_total
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.distributor-list ::v-deep .toolbar {
  height: auto !important;
}

.distributor-list ::v-deep .inner-toolbar {
  display: block !important;

  .inner-box {
    display: flex;
    align-items: center;
  }

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
