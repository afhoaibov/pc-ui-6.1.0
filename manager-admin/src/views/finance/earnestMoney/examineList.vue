<template>
  <div class="container">
    <en-table-layout
      ref="shopTable"
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入店铺名称"/>
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

        <el-table-column label="操作" width="220" align="left">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleExamine(scope.row)">审核</el-button>
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
    <!-- 审核弹窗 -->
    <el-dialog
      title="审核"
      width="550px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="dialog-wrap"
    >
      <el-form  label-width="80px"  @submit.native.prevent>
        <el-form-item required label="是否通过" >
          <el-radio-group v-model="examineForm.pass" style="width: 204px">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="凭证信息" >
          <img
            v-if="examineItem.voucher"
            alt=""
            @click="handlePreviewImage(item)"
            class="voucher-img"
            v-for="item in voucherFormatter(examineItem.voucher)"
            :src="item">
        </el-form-item>
        <el-form-item label="备注信息" >
          <el-input
            v-model="examineForm.message"
            type="textarea"
            placeholder="请输入审核备注（120字以内）"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEvent">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览 -->
    <viewer ref="viewer" :images="viewerImages" style="display: none">
      <img v-for="src in viewerImages" :src="src" :key="src" alt="" />
    </viewer>
  </div>
</template>

<script>
  import * as API_Shop from '@/api/shop'
  import 'viewerjs/dist/viewer.css'

  export default {
    name: 'examineList',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 20,
          auth_status: 'WAIT_AUDIT'
        },
        /** 列表数据 */
        tableData: {},
        /** 高级搜索数据 */
        advancedForm: {},
        // 审核弹窗显隐
        dialogVisible: false,
        examineForm: {
          pass: 1,
          message: ''
        },
        // 当前审核数据
        examineItem: {},
        // 图片预览数据
        viewerImages: []
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'examineList') return
          this.getMarginFlowList()
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
      /** 搜索事件触发 */
      searchEvent(text) {
        this.params.page_no = 1
        this.params.shop_name = text
        if (!text) delete this.params.shop_name
        this.getMarginFlowList()
      },

      /**
       * 预览图片
       * @param message
       */
      handlePreviewImage(url) {
        this.viewerImages = [url]
        this.$refs['viewer']['$viewer']['show']()
      },
      /** 审核提交 */
      submitEvent() {
        const examineForm = this.examineForm
        if (examineForm.message.trim() && examineForm.message.trim().length > 120) {
          this.$message.error('备注内容不得超出120字！')
          return
        }
        examineForm.id = this.examineItem.id
        API_Shop.earnestMoneyExamine(examineForm).then(res => {
          this.dialogVisible = false
          this.examineForm = {
            pass: 1,
            message: ''
          }
          this.getMarginFlowList()
          this.$message.success('提交成功！')
        })
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getMarginFlowList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getMarginFlowList()
      },

      /** 审核操作 */
      handleExamine(row) {
        this.dialogVisible = true
        this.examineItem = row
      },

      /** 获取保证金列表 */
      getMarginFlowList() {
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
.container ::v-deep .dialog-wrap {
  .voucher-img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
    cursor: pointer;
  }
}
.inner-toolbar {
	display: flex;
	justify-content: flex-end !important;
}
</style>
