<template>
  <div class="full-give">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.title"
      @closeDrawer="showDrawer = false">
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button type="primary" @click="handleAddFullGive">新增</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入活动名称">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="活动名称">
                  <el-input v-model="advancedForm.title" clearable></el-input>
                </el-form-item>
                <el-form-item label="活动状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
                    <el-option label="未开始" value="0"/>
                    <el-option label="进行中" value="1"/>
                    <el-option label="已结束" value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="商品参与方式">
                  <el-select v-model="advancedForm.range_type" placeholder="请选择" clearable>
                    <el-option label="全部商品参与" value="1"/>
                    <el-option label="部分商品参与" value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="活动优惠方式">
                  <el-select v-model="advancedForm.discount_type" placeholder="请选择" clearable>
                    <el-option label="满额赠" value="1"/>
                    <el-option label="满件赠" value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.act_time_range"
                    type="datetimerange"
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
        <!--活动名称-->
        <el-table-column prop="title" label="活动名称">
          <template slot-scope="scope">
            <span class="drawer-text" @click="handlePreview(scope.row)">{{scope.row.title}}</span>
          </template>
        </el-table-column>
        <!--开始时间-->
        <el-table-column label="开始时间">
          <template slot-scope="scope">
            <span>{{ scope.row.start_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <!--结束时间-->
        <el-table-column label="结束时间">
          <template slot-scope="scope">
            <span>{{ scope.row.end_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <!--商品参与活动方式-->
        <el-table-column prop="range_type" label="商品参与方式" :formatter="rangeType"/>
        <!--活动方式-->
        <el-table-column prop="discount_type" label="活动方式" :formatter="discountType"/>
        <!--活动状态-->
        <el-table-column label="活动状态" prop="status_text"/>
        <!--操作-->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 'END' || scope.row.status === 'UNDERWAY'"
              type="success"
              @click="handleDetailMould(scope.row)">查看
            </el-button>
            <el-button
              v-if="scope.row.status === 'WAIT'"
              type="success"
              @click="handleEditMould(scope.row)">编辑
            </el-button>
            <el-button
              v-if="scope.row.status === 'UNDERWAY'"
              type="danger"
              @click="handleCloseFullGive(scope.row)">关闭
            </el-button>
            <el-button
              v-if="scope.row.status !== 'UNDERWAY'"
              type="danger"
              @click="handleDeleteFullGive(scope.row)">删除
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

      <full-give-preview slot="drawer" :promotionId="currentRow.id" />
    </en-table-layout>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import * as API_activity from '@/api/activity'
  import FullGivePreview from './components/FullGivePreview'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'fullGive',
    components: {
      FullGivePreview
    },
    computed: {
      ...mapGetters([
        'shopInfo'
      ])
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

        /** 列表数据*/
        tableData: [],

        /** 列表分页数据 */
        pageData: null,

        /** 高级搜索数据 */
        advancedForm: {},

        // 侧边预览显隐
        showDrawer: false,
        // 当前预览商品数据
        currentRow: {}
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'fullGive') return
          this.GET_FullGiveActivityList()
        }
      }
    },
    methods: {
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      /** 商品参与活动方式 */
      rangeType(row) {
        if (row.range_type === 1) {
          return '全部商品参与'
        }
        return '部分商品参与'
      },

      /** 活动方式 */
      discountType(row) {
        if (row.discount_type === 1) {
          return '满额赠'
        }
        return '满件赠'
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          keyword: data
        }
        this.GET_FullGiveActivityList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        this.params = {
          ...this.params,
          page_no: 1,
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
        delete this.params.keyword
        this.GET_FullGiveActivityList()
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_FullGiveActivityList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_FullGiveActivityList()
      },

      /** 跳转至新增满赠活动页面 */
      handleAddFullGive() {
        this.$router.push({ name: 'addFullGive' })
      },

      /** 跳转至编辑满赠活动页面 */
      handleEditMould(row) {
        this.$router.push({ name: 'editFullGive', params: { promotion_id: row.id }})
      },

      /** 跳转至满赠活动详情页面 */
      handleDetailMould(row) {
        this.$router.push({ name: 'checkFullGiveDetail', params: { promotion_id: row.id }})
      },

      /** 获取活动信息*/
      GET_FullGiveActivityList() {
        this.loading = true
        API_activity.getFullGiveActivityList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      },

      /** 删除满赠优惠活动 */
      handleDeleteFullGive(row) {
        this.$confirm('确认删除当前活动信息吗？', '确认信息', { type: 'warning' })
          .then(() => this.toDelActivity(row))
          .catch(() => {})
      },

      /** 执行删除*/
      toDelActivity(row) {
        API_activity.deleteFullGiveActivity(row.id).then(() => {
          this.$message.success('删除成功！')
          this.GET_FullGiveActivityList()
        })
      },

      /** 关闭活动 */
      handleCloseFullGive(row) {
        this.$confirm('关闭后不能再次开启，确认要关闭当前活动吗？', '确认信息', { type: 'warning' })
          .then(() => this.toCloseActivity(row))
          .catch(() => {})
      },

      /** 执行关闭 */
      toCloseActivity(row) {
        API_activity.closeFullGiveActivity(row.id).then(response => {
          this.$message.success('关闭成功！')
          this.GET_FullGiveActivityList()
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .full-give ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }

  .full-give ::v-deep .toolbar {
    padding: 15px;
  }
  .drawer-text {
    color: #006BB4;
    cursor: pointer;
    &:hover {
      text-decoration:underline;
    }
  }
</style>


