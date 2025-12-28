<template>
  <div class="time-limit">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns"></div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入活动名称"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="活动名称">
                  <el-input size="medium" v-model="advancedForm.seckill_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="活动状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="未开始" value="0"/>
                    <el-option label="进行中" value="1"/>
                    <el-option label="已结束" value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                  <el-date-picker
                    v-model="advancedForm.act_time_range"
                    type="daterange"
                    :picker-options="{ shortcuts: MixinPickerShortcuts }"
                    range-separator="-"
                    align="right"
                    :editable="false"
                    unlink-panels
                    value-format="timestamp"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="seckill_name" label="活动名称"/>
        <el-table-column label="活动日期">
          <template slot-scope="scope">
            <span>{{ scope.row.start_day | unixToDate('yyyy-MM-dd') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报名截止时间">
          <template slot-scope="scope">
            <span>{{ scope.row.apply_end_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="seckill_rule" label="报名条件"/>
        <el-table-column prop="status_text" label="活动状态"/>
        <el-table-column label="报名状态" :formatter="marketStatus"/>
        <el-table-column label="操作" align="left" width="160">
          <template slot-scope="scope">
            <el-button
              type="primary"
              v-if="scope.row.is_apply === 0"
              @click="handleSignUpTimeLimt(scope.row)">报名
            </el-button>
            <el-button
              type="primary"
              v-if="scope.row.is_apply === 3 || scope.row.is_apply === 1"
              @click="activityGoodsInfo(scope.row)">查看商品
            </el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        slot="pagination"
        v-if="pageData"
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
  import * as API_activity from '@/api/activity'
  import { CategoryPicker } from '@/components'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'timeLimit',
    components: {
      [CategoryPicker.name]: CategoryPicker
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_LimitActivityList()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_LimitActivityList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_LimitActivityList()
      },

      /** 报名状态格式化 */
      marketStatus(row, column, cellValue) {
        switch (row.is_apply) {
          case 0: return '未报名'
          case 1: return '已报名'
          case 2: return '报名截止（未报名）'
          case 3: return '报名截止（已报名）'
        }
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          seckill_name: data
        }
        this.GET_LimitActivityList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)

        this.params = {
          ...this.params,
          ...advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        const { act_time_range } = advancedForm
        if (act_time_range) {
          this.params.start_time = parseInt(act_time_range[0] /= 1000)
          this.params.end_time = parseInt(act_time_range[1] /= 1000)
        }
        delete this.params.act_time_range
        this.params.page_no = 1
        this.GET_LimitActivityList()
      },

      /** 获取限时活动列表*/
      GET_LimitActivityList() {
        this.loading = true
        API_activity.getLimitTimeActivityList(this.params).then(response => {
          this.loading = false
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
          this.tableData = response.data
        }).catch(() => {
          this.loading = false
        })
      },

      /** 报名 */
      handleSignUpTimeLimt(row) {
        this.$router.push({ name: 'addTimeLimit', params: { id: row.seckill_id, callback: this.GET_LimitActivityList }})
      },

      /** 活动商品信息 已报名*/
      activityGoodsInfo(row) {
        // this.$router.push({ path: `/promotions/activity-goods-data/${row.seckill_id}` })
        this.$router.push({ name: 'activityGoodsData', params: { id: row.seckill_id, callback: this.GET_LimitActivityList }})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .time-limit ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }

  .time-limit ::v-deep .el-table td:not(.is-left) {
    text-align: center;
  }

  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-search {
    margin-right: 10px;
  }

  .goods-image {
    width: 50px;
    height: 50px;
  }

</style>
