<template>
  <div>
    <el-dialog
      title="保证金流水"
      :visible.sync="show"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="onClose">
      <el-table
        :data="tableData.data"
        style="width: 100%">
        <el-table-column
          prop="actual_pay_amount"
          label="实缴金额">
          <template slot-scope="scope">
            <span>{{scope.row.type ? '+' : '-'}}{{scope.row.actual_pay_amount}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="total_amount"
          label="剩余金额"
          >
        </el-table-column>
        <el-table-column
          prop="voucher"
          label="凭证">
          <template slot-scope="scope">
            <img
              @click="handlePreviewImage(item)"
              class="voucher-img"
              v-for="item in voucherFormatter(scope.row.voucher)"
              :src="item"
              alt="">
          </template>
        </el-table-column>
				<el-table-column
          width="180"
          label="申请时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column
          label="审核状态">
          <template slot-scope="scope">{{ scope.row.auth_status | statusFilter }}</template>
        </el-table-column>
        <el-table-column
          prop="audit_remark"
          label="审核备注">
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="tableData.data"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="tableData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.data_total">
      </el-pagination>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onClose">确 定</el-button>
      </span>
    </el-dialog>
    <viewer ref="viewer" :images="viewerImages" style="display: none">
      <img v-for="src in viewerImages" :src="src" :key="src" alt="" />
    </viewer>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import 'viewerjs/dist/viewer.css'

export default {
  name: 'DeductMargin',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    shopId: {
      type: String
    }
  },
  data() {
    return {
      show: false,
      params: {
        page_no: 1,
        page_size: 10
      },
      tableData: {},
      viewerImages: []
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
  filters: {
    statusFilter(val) {
      switch (val) {
        case 'WAIT_AUDIT': return '待审核'
        case 'PASS_AUDIT': return '审核通过'
        case 'REFUSE_AUDIT': return '审核未通过'
        default: return ''
      }
    }
  },
  watch: {
    value(val) {
      this.show = val
      if (val) {
        this.getShopRemainingMargin()
      }
    }
  },
  methods: {
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.getShopRemainingMargin()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.getShopRemainingMargin()
    },
    /**
     * 预览图片
     * @param message
     */
    handlePreviewImage(url) {
      this.viewerImages = [url]
      this.$refs['viewer']['$viewer']['show']()
    },

    /** 获取列表数据 */
    getShopRemainingMargin() {
      const params = this.params
      params.shop_id = this.shopId
      API_Shop.getShopRemainingMargin(params).then(res => {
        this.tableData = res
      })
    },

    /** 关闭弹窗 */
    onClose() {
      this.$emit('onClose')
    }

  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.el-pagination {
  text-align: right;
  margin-top: 20px;
}
.voucher-img {
  width: 50px;
  height: 50px;
  cursor: pointer;
}

</style>
