<template>
  <div>
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            advancedWidth="465"
            placeholder="请输入会员ID搜索"
          >
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column label="会员ID" prop="member_id">
        </el-table-column>
        <el-table-column label="会员名称" prop="member_name">
        </el-table-column>
        <el-table-column label="签到时间">
          <template slot-scope="scope">{{ scope.row.sign_in_date | unixToDate }}</template>
        </el-table-column>
        <el-table-column label="内容描述" prop="description" />
      </template>

      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="tableData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.data_total">
      </el-pagination>
    </en-table-layout>
  </div>
</template>

<script>
  import * as API_Promotion from '@/api/promotion'
  import { Foundation } from '~/ui-utils'

  export default {
    name: 'signInRecord',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          sign_activity_id: ''
        },

        /** 列表数据 */
        tableData: '',

        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    watch: {
      $route: {
        handler(val) {
          if (val.name === 'signInRecord' && val.query.id) {
            this.params.sign_activity_id = val.query.id
            this.getSignInRecord()
          }
        },
        immediate: true
      }
    },
    mounted() {
      this.getSignInRecord()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getSignInRecord()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getSignInRecord()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.member_id = data
        if (!data) delete this.params.member_id
        this.getSignInRecord()
      },

      /** 获取团购活动列表 */
      getSignInRecord() {
        this.loading = true
        API_Promotion.getSignInRecord(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style type="text/scss" lang="scss">

</style>
