<template>
  <div class="discount-manager">
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
          <el-button type="primary" @click="handleAddCoupon">新增</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advancedWidth="500"
            advanced
            placeholder="请输入优惠券名称">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="优惠券名称">
                  <el-input size="medium" v-model="advancedForm.keyword" clearable></el-input>
                </el-form-item>
                <el-form-item label="领取方式">
                  <el-select v-model="advancedForm.type" placeholder="请选择" clearable>
                    <el-option label="免费领取" value="FREE_GET"/>
                    <el-option label="活动赠送" value="ACTIVITY_GIVE"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="生效方式">
                  <el-select v-model="advancedForm.effective_type" placeholder="请选择" clearable>
                    <el-option label="按有效期生效" value="AUTO_TAKE_EFFECT"/>
                    <el-option label="领取即生效" value="EFFECTIVE_AFTER_RECEIVING"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
                    <el-option label="未生效" value="0"/>
                    <el-option label="生效中" value="1"/>
                    <el-option label="已失效" value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="有效期">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.coupon_time_limit"
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
        <el-table-column prop="title" label="优惠券名称">
          <template slot-scope="scope">
            <span class="drawer-text" @click="handlePreview(scope.row)">{{scope.row.title}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="coupon_price" label="优惠券面额" :formatter="MixinFormatPrice" />
        <el-table-column prop="coupon_threshold_price" label="门槛金额" :formatter="MixinFormatPrice" />
        <el-table-column prop="type" label="领取方式" :formatter="formatterReceiveType"/>
        <el-table-column prop="effective_type" label="生效方式" :formatter="formatterEffectiveType"/>
        <el-table-column prop="effective_time_text" label="有效期" width="300"/>
        <el-table-column prop="status_text" label="状态" />
        <el-table-column label="发放/限领/已领 数量">
          <template slot-scope="scope">
            {{ scope.row.create_num }} / {{ scope.row.limit_num === 0 ? '不限' : scope.row.limit_num }} / {{ scope.row.received_num }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px" align="left">
          <template slot-scope="scope">
            <el-button
              type="success"
              v-if="scope.row.received_num === 0 && scope.row.status !== 2"
              @click="handleEditCoupons(scope.row)">编辑
            </el-button>
            <el-button
              type="danger"
              v-if="scope.row.status !== 2 && scope.row.create_num > scope.row.received_num"
              @click="handleCancelCoupons(scope.row)">作废
            </el-button>
            <el-button
              type="danger"
              @click="handleDeleteCoupons(scope.row)">删除
            </el-button>
            <el-button
              type="primary"
              v-if="scope.row.received_num > 0"
              @click="handleOperateReceiveList(scope.row)">领取记录
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
      <coupon-preview slot="drawer" :couponId="currentRow.coupon_id" />
    </en-table-layout>
    <!--优惠券组件-->
    <Coupon
      :couponModelShow="couponModelShow"
      :currentcouponId="currentcouponId"
      @saveCoupon="saveCoupon"
    ></Coupon>

  </div>
</template>

<script>
  import * as API_coupon from '@/api/coupon'
  import { CategoryPicker } from '@/components'
  import { Coupon } from './components'
  import CouponPreview from './components/CouponPreview'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'discountManager',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      [Coupon.name]: Coupon,
      CouponPreview
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
        tableData: null,

        /** 列表分页数据 */
        pageData: null,

        /** 高级搜索数据 */
        advancedForm: {},

        /** 优惠券弹框显示*/
        couponModelShow: false,

        /** 当前优惠券ID*/
        currentcouponId: '',

        /** 优惠券表单*/
        couponModelForm: {
          /** 优惠券名称*/
          title: '',

          /** 优惠券面额*/
          coupon_price: 2,

          /** 使用限制*/
          coupon_threshold_price: 2,

          /** 使用时限 */
          coupon_time_limit: '2017-02-25',

          /** 发放数量（个） */
          create_num: 2,

          /** 已使用量（个） */
          used_num: 2
        },
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览商品数据
        currentRow: {}
      }
    },
    mounted() {
      this.GET_CouponsList()
    },
    methods: {
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      /** 优惠券领取方式 */
      formatterReceiveType(row) {
        if (row.type === 'FREE_GET') {
          return '免费领取'
        }
        return '活动赠送'
      },
      /** 优惠券生效方式 */
      formatterEffectiveType(row) {
        if (row.effective_type === 'AUTO_TAKE_EFFECT') {
          return '按有效期生效'
        }
        return '领取即生效'
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_CouponsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_CouponsList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_size: 10,
          page_no: 1,
          keyword: data
        }
        this.GET_CouponsList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const params = cloneObj(this.params)
        delete params.keyword

        this.params = {
          ...params,
          page_no: 1,
          ...this.advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.coupon_time_limit) {
          this.params.start_time = this.advancedForm.coupon_time_limit[0] / 1000
          this.params.end_time = this.advancedForm.coupon_time_limit[1] / 1000
        }
        delete this.params.coupon_time_limit
        this.GET_CouponsList()
      },

      GET_CouponsList() {
        this.loading = true
        API_coupon.getCouponsList(this.params).then(response => {
          this.loading = false
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
          this.tableData = response.data
          /** 已经使用量 */
          this.tableData.forEach(key => {
            key.used_num = key.used_num || 0
          })
        })
      },

      /** 删除优惠券 */
      handleDeleteCoupons(row) {
        this.$confirm('删除后用户将无法领取此优惠券，用户已领取的优惠券不受此操作影响，确认删除此优惠券吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          API_coupon.deleteCoupons(row.coupon_id).then(() => {
            this.GET_CouponsList()
            this.$message.success('操作成功！')
          })
        }).catch(() => {})
      },

      /** 修改*/
      handleEditCoupons(row) {
        this.couponModelShow = true
        this.currentcouponId = row.coupon_id
      },
      /** 作废 */
      handleCancelCoupons(row) {
        this.$confirm('作废后用户将无法领取此优惠券，用户已领取的优惠券不受此操作影响，确认将此优惠券作废吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          API_coupon.cancelCoupons(row.coupon_id).then(() => {
            this.GET_CouponsList()
            this.$message.success('操作成功！')
          })
        }).catch(() => {})
      },
      /** 新增优惠券*/
      handleAddCoupon() {
        this.couponModelShow = true
        this.currentcouponId = ''
      },
      /** 领取记录 */
      handleOperateReceiveList(row) {
        this.$router.push({ name: 'receiveList', params: { id: row.coupon_id }})
      },
      /** 优惠券监听 */
      saveCoupon(target) {
        this.couponModelShow = false
        this.currentcouponId = ''
        target && this.GET_CouponsList()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

  .discount-manager ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }

  .discount-manager ::v-deep .el-table td:not(.is-left) {
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
  .drawer-text {
    color: #006BB4;
    cursor: pointer;
    &:hover {
      text-decoration:underline;
    }
  }

</style>
