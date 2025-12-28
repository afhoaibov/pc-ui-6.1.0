<template>
  <div class="assemble-manager">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.promotion_name"
      @closeDrawer="showDrawer = false">

      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button type="primary" @click="handleAssemble">新增</el-button>
        </div>
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
                  <el-input size="medium" v-model="advancedForm.name" clearable></el-input>
                </el-form-item>
                <el-form-item label="活动状态">
                  <el-select clearable v-model="advancedForm.status" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="未开始" value="WAIT"/>
                    <el-option label="进行中" value="UNDERWAY"/>
                    <el-option label="已失效" value="END"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="虚拟成团">
                  <el-select clearable v-model="advancedForm.enable_mocker" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="开启" value="1"/>
                    <el-option label="关闭" value="0"/>
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
        <el-table-column prop="promotion_name" label="活动名称">
          <template slot-scope="scope">
            <span class="drawer-text" @click="handlePreview(scope.row)">{{scope.row.promotion_name}}</span>
          </template>
        </el-table-column>
        <!--活动标题-->
        <el-table-column prop="promotion_title" label="活动标题"/>
        <!--起止时间-->
        <el-table-column label="起止时间" min-width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.start_time | unixToDate }}</span> ～
            <span>{{ scope.row.end_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <!--参团人数-->
        <el-table-column prop="required_num" label="参团人数"/>
        <!--活动状态-->
        <el-table-column prop="status_text" label="活动状态"/>
        <!--成团时限（小时）-->
        <el-table-column prop="limit_time" label="成团时限（小时）"/>
        <!--是否虚拟成团-->
        <el-table-column prop="enable_mocker" :formatter="assVirtual" label="虚拟成团"/>
        <!--操作-->
        <el-table-column label="操作" width="410" align="left">
          <template slot-scope="scope">
						<el-button
              type="success"
              @click="handleViewAssemble(scope.row)">查看
            </el-button>
            <el-button
              v-if="scope.row.status === 'WAIT'"
              type="success"
              @click="handleAssemble(scope.row)">修改
            </el-button>
            <el-button
              v-if="scope.row.status !== 'END'"
              type="primary"
              @click="handleMangerAssemble(scope.row)">管理
            </el-button>
            <el-button
              v-if="scope.row.status !== 'UNDERWAY'"
              type="danger"
              @click="handleDeleteAssemble(scope.row)">删除
            </el-button>
            <el-button
              v-if="scope.row.option_status === 'CAN_OPEN'"
              type="primary"
              @click="handleOpenAssemble(scope.row)">开启
            </el-button>
            <el-button
              v-if="scope.row.option_status === 'CAN_CLOSE'"
              type="danger"
              @click="handleCloseAssemble(scope.row)">关闭
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

      <assemble-preview slot="drawer" :promotionId="currentRow.promotion_id" />
    </en-table-layout>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import * as API_activity from '@/api/activity'
  import { cloneObj } from '@/utils/index'
  import AssemblePreview from './components/AssemblePreview'

  export default {
    name: 'assembleManager',
    components: {
      AssemblePreview
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

        // 是否不可编辑 即是否是进行中 或者已失效状态 默认可以
        editEnabled: true,

        /** 高级搜索数据 */
        advancedForm: {},

        /** 当前时间 */
        currentTime: Date.now(),
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览商品数据
        currentRow: {}
      }
    },
    mounted() {
      this.GET_AssembleActivityList()
    },
    methods: {
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      assVirtual(row) {
        return row.enable_mocker === 1 ? '开启' : '关闭'
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          name: data
        }
        this.GET_AssembleActivityList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        const params = cloneObj(this.params)

        delete params.start_time
        delete params.end_time
        delete params.name

        this.params = Object.assign(params, advancedForm)

        const { act_time_range } = advancedForm
        if (act_time_range) {
          this.params.start_time = parseInt(act_time_range[0] /= 1000)
          this.params.end_time = parseInt(act_time_range[1] /= 1000)
        }
        delete this.params.act_time_range
        this.params.page_no = 1
        this.GET_AssembleActivityList()
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_AssembleActivityList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_AssembleActivityList()
      },

      /** 获取活动列表 */
      GET_AssembleActivityList() {
        this.loading = true
        API_activity.getAssembleActivityList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        }).catch(() => {
          this.loading = false
        })
      },
      /** 查看活动详情 */
      handleViewAssemble(row) {
        this.$router.push({ name: 'viewAssemble', params: { promotion_id: row.promotion_id }})
      },
      /** 新增/编辑活动 */
      handleAssemble(row) {
        if (row.promotion_id) {
          this.$router.push({ name: 'editAssemble', params: { promotion_id: row.promotion_id, callback: this.GET_AssembleActivityList }})
        } else {
          this.$router.push({ name: 'addAssemble', params: { callback: this.GET_AssembleActivityList }})
        }
      },

      /** 删除活动 */
      handleDeleteAssemble(row) {
        this.$confirm('确认删除当前活动？', '确认信息', { type: 'warning' }).then(() => {
          API_activity.delAssembleActivity(row.promotion_id).then(() => {
            this.$message.success('删除成功！')
            this.GET_AssembleActivityList()
          })
        }).catch(() => {})
      },

      /** 开启活动 */
      handleOpenAssemble(row) {
        this.$confirm('确认开启当前活动？', '确认信息', { type: 'warning' }).then(() => {
          API_activity.openCloseAssembleActivity(row.promotion_id, 0).then(() => {
            this.$message.success('操作成功！')
            this.GET_AssembleActivityList()
          })
        }).catch(() => {})
      },

      /** 关闭活动 */
      handleCloseAssemble(row) {
        this.$confirm('确认关闭当前活动？', '确认信息', { type: 'warning' }).then(() => {
          API_activity.openCloseAssembleActivity(row.promotion_id, 1).then(() => {
            this.$message.success('操作成功！')
            this.GET_AssembleActivityList()
          })
        }).catch(() => {})
      },

      /** 管理活动商品 */
      handleMangerAssemble(row) {
        this.$router.push({ name: 'assembleGoods', params: { promotion_id: row.promotion_id }, query: {
          promotion_name: row.promotion_name,
          start_time: row.start_time,
          end_time: row.end_time,
          status: row.status
        }})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .assemble-manager ::v-deep div.toolbar {
    height: 70px;
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
