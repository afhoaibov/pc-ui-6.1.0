<template>
  <div class="container">
    <en-table-layout
      ref="shopTable"
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入店铺名称"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="店铺名称">
                  <el-input size="medium" v-model="advancedForm.shop_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="审核状态">
                  <el-select v-model="advancedForm.auth_status" placeholder="请选择">
                    <el-option label="全部" value=""/>
                    <el-option label="审核通过" value="PASS_AUDIT"/>
                    <el-option label="审核未通过" value="REFUSE_AUDIT"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="缴纳时间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.time_range"
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
        <el-table-column prop="shop_name" label="店铺名称"></el-table-column>

        <el-table-column prop="actual_pay_amount" label="缴纳金额">
          <template slot-scope="scope">
            <span>{{ scope.row.actual_pay_amount | unitPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="缴纳时间"/>

        <el-table-column label="审核状态">
          <template slot-scope="scope">{{ scope.row.auth_status | statusFilter }}</template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleCheckView(scope.row)">查看</el-button>
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

    <el-dialog
      title="保证金详情"
      width="700px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="dialog-wrap"
    >
    <div class="item-content">
      <div class="item">入驻时间：{{viewItem.create_time | unixToDate}}</div>
      <div class="item">商家名称：{{viewItem.shop_name}}</div>
      <div class="item">保证金额：{{viewItem.actual_pay_amount | unitPrice}}</div>
      <div class="item">审核状态：{{viewItem.auth_status | statusFilter}}</div>
      <div class="item">
        凭证：
        <img
          v-if="viewItem.voucher"
          @click="handlePreviewImage(item)"
          class="voucher-img"
          v-for="item in voucherFormatter(viewItem.voucher)"
          :src="item"
          alt="">
      </div>
      <div class="item">备注信息：{{viewItem.audit_remark}}</div>
    </div>
    </el-dialog>
    <!-- 图片预览 -->
    <viewer ref="viewer" :images="viewerImages" style="display: none">
      <img v-for="src in viewerImages" :src="src" :key="src" alt="" />
    </viewer>
  </div>
</template>

<script>
  import * as API_Shop from '@/api/shop'
  import { cloneObj } from '@/utils/index'
  import 'viewerjs/dist/viewer.css'

  export default {
    name: 'commitRecord',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20,
          auth_status: ''
        },
        /** 列表数据 */
        tableData: {},
        /** 高级搜索数据 */
        advancedForm: {},
        // 侧边预览显隐
        showDrawer: false,
        // 弹窗显隐
        dialogVisible: false,
        viewItem: {},
        viewerImages: []
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'commitRecord') return
          this.getRecordList()
        }
      }
    },
    filters: {
      statusFilter(val) {
        switch (val) {
          case 'WAIT_AUDIT': return '待审核'
          case 'PASS_AUDIT': return '审核通过'
          case 'REFUSE_AUDIT': return '审核未通过'
          default: return '未知状态'
        }
      }
    },
    computed: {
      voucherFormatter() {
        return (voucher) => {
          if (voucher) {
            return voucher.split(',')
          }
          return []
        }
      }
    },

    methods: {
      /**
       * 预览图片
       * @param message
       */
      handlePreviewImage(url) {
        this.viewerImages = [url]
        this.$refs['viewer']['$viewer']['show']()
      },
      /** 查看详情 */
      handleCheckView(row) {
        this.viewItem = row
        this.dialogVisible = true
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getRecordList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getRecordList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        delete this.params.start_time
        delete this.params.end_time
        this.params.page_no = 1
        this.params.shop_name = data
        this.getRecordList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        const params = cloneObj(this.params)
        this.params = Object.assign(params, advancedForm)
        delete this.params.start_time
        delete this.params.end_time
        const { time_range } = advancedForm
        if (time_range) {
          this.params.start_time = parseInt(time_range[0] /= 1000)
          this.params.end_time = parseInt(time_range[1] /= 1000)
        }
        delete this.params.time_range
        this.params.page_no = 1
        this.getRecordList()
      },

      /** 获取提交记录列表 */
      getRecordList() {
        this.loading = true
        API_Shop.getMarginFlowList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style lang="scss" scoped>
.container {
  ::v-deep .dialog-wrap {
    .voucher-img {
      width: 100px;
      height: 100px;
      margin-right: 10px;
      cursor: pointer;
    }
    .item-content {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      .item {
        width: 50%;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        color: #333;
      }
    }
  }
}
.inner-toolbar {
	display: flex;
	justify-content: flex-end !important;
}
</style>
