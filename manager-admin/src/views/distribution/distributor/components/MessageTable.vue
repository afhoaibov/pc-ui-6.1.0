<template>
  <div class="brokerage-wrap">
    <en-table-layout
      pagination
      :border="true"
      :tableData="tableData"
      :loading="loading">
      <template slot="table-columns">
        <el-table-column
          label="类型"
          prop="event_type_text"
          :filters="filtersList"
          :filter-method="handleFilterType"
          filter-placement="bottom-end">
        </el-table-column>
        <el-table-column
          label="分销商"
          prop="member_name">
          <template slot-scope="scope">
            <div class="user-info">
              <img v-if="scope.row.member_avatar" :src="scope.row.member_avatar" alt="" class="user-img">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
              <span>{{scope.row.member_name}}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="内容"
          prop="content" />

        <el-table-column
          label="操作人类型"
          prop="oper_type_text" />

        <el-table-column
          label="操作人"
          prop="user">
          <template slot-scope="scope">
            <div class="user-info">
              <img v-if="scope.row.oper_avatar" :src="scope.row.oper_avatar" alt="" class="user-img">
              <img v-else src="@/assets/images/icon-noface.jpg" alt="" class="user-img">
              <span>{{scope.row.oper_name}}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="动态时间"
          prop="create_time">
          <template slot-scope="scope">
            <span> {{scope.row.create_time | unixToDate}}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              class="theme-color"
              @click="handleOperateSee(scope.row)">详情</el-button>
          </template>
        </el-table-column> -->
      </template>
      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="pageData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>

  </div>
</template>

<script>
  import * as API_distribution from '@/api/distribution'

  export default {
    name: 'MessageTable',
    props: {
      moreParams: {
        type: Object
      }
    },
    data() {
      return {
        filtersList: [
          { text: '佣金', value: 'COMMISSION' },
          { text: '分销商', value: 'DISTRIBUTION' },
          { text: '绑定关系', value: 'BIND' },
          { text: '分销业绩', value: 'ACHIEVEMENT' }
        ],
        // 列表loading状态
        loading: false,

        // 列表参数
        params: {
          page_no: 1,
          page_size: 10
        },
        // 列表数据
        tableData: [],

        /** 分页信息 */
        pageData: {},
        event_type_text: ''
      }
    },
    watch: {
      moreParams: {
        handler(val) {
          if (val) {
            this.getDistributionMessageList()
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      handleFilterType(value, row) {
        return row.event_type === value
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getDistributionMessageList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getDistributionMessageList()
      },

      /** 获取消息列表 */
      getDistributionMessageList() {
        let params = this.params
        if (Object.keys(this.moreParams).length) {
          params = { ...this.moreParams, ...params }
        }
        API_distribution.getDistributionMessageList(params).then(response => {
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
  .brokerage-wrap ::v-deep .toolbar {
    height: auto !important;
  }
  .theme-color {
    color: #5441bc;
  }
  .brokerage-wrap {
    .container {
      background: #fff;
    }
    .user-info {
      display: flex;
      align-items: center;
    }
    .user-img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
  }



</style>
