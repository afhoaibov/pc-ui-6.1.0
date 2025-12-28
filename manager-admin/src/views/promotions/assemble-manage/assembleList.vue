<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
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
                  <el-input size="medium" v-model="advancedForm.name" clearable></el-input>
                </el-form-item>
                <el-form-item label="店铺名称">
                  <en-shop-picker @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
                </el-form-item>
                <el-form-item label="活动状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="待开始" value="WAIT"/>
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
                    :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
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
        <el-table-column prop="promotion_name" label="活动名称"/>
        <el-table-column label="活动时间" min-width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.start_time | unixToDate }}</span> ～
            <span>{{ scope.row.end_time | unixToDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="required_num" label="参团人数"/>
        <el-table-column prop="limit_time" label="成团时限（小时）"/>
        <el-table-column prop="enable_mocker" :formatter="assVirtual" label="虚拟成团"/>
        <el-table-column prop="status_text" label="活动状态"/>
        <el-table-column prop="seller_name" label="店铺名称"/>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleViewAssembleDetail(scope.row)"
            >查看</el-button>
            <assembleOpenOrClose
              v-if="scope.row.option_status !== 'NOTHING'"
              :row="scope.row"
              size="mini"
              type="danger"
              @clickEmit="handleCloseAssemble"
            >{{ scope.row.option_status | operaStatus }}</assembleOpenOrClose>
          </template>
        </el-table-column>
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
  import assembleOpenOrClose from './assembleOpenOrClose.vue'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'assembleList',
    data() {
      return {
        // 列表loading状态
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20
        },
        /** 列表数据 */
        tableData: {
          data: []
        },

        /** 开始/关闭文本提示 */
        tip: '关闭',

        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_AssembleList()
    },
    components: {
      assembleOpenOrClose
    },
    filters: {
      operaStatus(val) {
        switch (val) {
          case 'CAN_OPEN': return '开启'
          case 'CAN_CLOSE': return '关闭'
        }
      }
    },
    methods: {
      /** 是否开启了虚拟成团 */
      assVirtual(row) {
        return row.enable_mocker === 1 ? '开启' : '关闭'
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_AssembleList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_AssembleList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          name: data
        }
        this.GET_AssembleList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        const params = cloneObj(this.params)

        this.params = Object.assign(params, advancedForm)

        delete this.params.start_time
        delete this.params.end_time
        const { act_time_range } = advancedForm
        if (act_time_range) {
          this.params.start_time = parseInt(act_time_range[0] /= 1000)
          this.params.end_time = parseInt(act_time_range[1] /= 1000)
        }
        delete this.params.act_time_range
        this.params.page_no = 1
        this.GET_AssembleList()
      },

      /** 获取拼团活动列表 */
      GET_AssembleList() {
        this.loading = true
        API_Promotion.getAssembleList(this.params).then(response => {
          this.loading = false
          this.tableData = { ...response }
        })
      },

      /** 关闭/开启某个拼团活动 */
      handleCloseAssemble(row) {
        const tip = row.option_status === 'CAN_OPEN' ? '确定要开启此拼团活动？' : '确定要关闭此拼团活动？'
        // opera_type  0：开启，1：关闭
        const opera_type = row.option_status === 'CAN_OPEN' ? 0 : 1
        this.$confirm(tip, '提示', { type: 'warning' }).then(() => {
          API_Promotion.changeAssembleStatus(row.promotion_id, opera_type).then(() => {
            this.$message.success('成功')
            this.GET_AssembleList()
          })
        }).catch(() => {})
      },

      /** 查看某个拼团活动详情 */
      handleViewAssembleDetail(row) {
        this.$router.push({ name: 'assembleDetail', params: { promotion_id: row.promotion_id }})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .time-tag {
    display: block;
    width: 80px;
    margin: 5px 0;
  }
  .input-new-tag {
    width: 112px;
  }

  .container ::v-deep input::-webkit-outer-spin-button,
  .container ::v-deep input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
</style>
