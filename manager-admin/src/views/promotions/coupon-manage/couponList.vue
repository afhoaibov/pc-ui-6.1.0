<template>
    <div class="container">
      <en-table-layout
        :tableData="tableData.data"
        :loading="loading"
        :showDrawer="showDrawer"
        :drawerTitle="currentRow.title"
        @closeDrawer="showDrawer = false"
      >
        <div slot="toolbar" class="inner-toolbar">
          <div class="toolbar-btns">
            <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleAddCoupon">添加</el-button>
          </div>
          <div class="toolbar-search">
            <en-table-search
              @search="searchEvent"
              @advancedSearch="advancedSearchEvent"
              :advancedWidth="500"
              advanced
              placeholder="请输入优惠券名称">
              <template slot="advanced-content">
                <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                  <el-form-item label="优惠券名称">
                    <el-input size="medium" v-model="advancedForm.keyword" clearable></el-input>
                  </el-form-item>
                  <el-form-item label="优惠券类型">
                    <el-select v-model="advancedForm.coupon_type" placeholder="请选择" clearable>
                      <el-option label="平台优惠券" value="NORMAL"></el-option>
                      <el-option label="新人优惠券" value="NEWCOMER"></el-option>
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
          <el-table-column prop="use_scope" label="适用范围" :formatter="formatterUseScope"/>
          <el-table-column prop="effective_type" label="生效方式">
            <template slot-scope="scope">
              <span v-if="scope.row.coupon_type !== 'NEWCOMER'">{{scope.row.effective_type | formatterEffectiveType}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="effective_time_text" label="有效期">
            <template slot-scope="scope">
              <span v-if="scope.row.coupon_type !== 'NEWCOMER'">{{scope.row.effective_time_text}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status_text" label="状态" />
          <el-table-column prop="coupon_type" label="优惠券类型">
            <template slot-scope="scope">
              {{scope.row.coupon_type === 'NEWCOMER' ? '新人优惠券' : '平台优惠券'}}
            </template>
          </el-table-column>
          <el-table-column label="发放/限领/已领 数量">
            <template slot-scope="scope">
              <span v-if="scope.row.coupon_type !== 'NEWCOMER'">
                {{ scope.row.create_num }} / {{ scope.row.limit_num === 0 ? '不限' : scope.row.limit_num }} / {{ scope.row.received_num }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="shop_commission" label="店铺承担比例(%)"/>
          <el-table-column label="操作" width="260" align="left">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="success"
                v-if="scope.row.received_num === 0 && scope.row.status !== 2"
                @click="handleEditCoupon(scope.$index, scope.row)">编辑
              </el-button>
              <!-- 非新人优惠券 -->
              <el-button
                size="mini"
                type="danger"
                v-if="scope.row.status !== 2 && scope.row.create_num > scope.row.received_num && scope.row.coupon_type !== 'NEWCOMER'"
                @click="handleCancelCoupon(scope.$index, scope.row)">作废
              </el-button>
              <el-button
                size="mini"
                type="danger"
                v-if="scope.row.coupon_type !== 'NEWCOMER' || !newcomerIsOpen"
                @click="handleDeleteCoupon(scope.$index, scope.row)">删除
              </el-button>
              <el-button
                size="mini"
                type="primary"
                v-if="scope.row.received_num > 0 && scope.row.coupon_type !== 'NEWCOMER'"
                @click="handleOperateReceiveList(scope.$index, scope.row)">领取记录
              </el-button>
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
        <coupon-preview slot="drawer" :couponId="currentRow.coupon_id" />
      </en-table-layout>
    </div>
</template>

<script>
    import { RegExp, Foundation } from '~/ui-utils'
    import * as API_Promotion from '@/api/promotion'
    import CouponPreview from './components/CouponPreview'
    import { cloneObj } from '@/utils/index'

    export default {
      name: 'couponList',
      components: {
        CouponPreview
      },
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
            page_no: 1,
            page_size: 20,
            data_total: 0
          },
          /** 高级搜索数据 */
          advancedForm: {},
          // 侧边预览显隐
          showDrawer: false,
          // 当前预览商品数据
          currentRow: {},
          // 新人优惠券是否开启
          newcomerIsOpen: false
        }
      },
      watch: {
        $route: {
          handler(val) {
            if (val.name === 'couponList') {
              this.GET_CouponsList()
            }
          },
          immediate: true
        }
      },
      filters: {
        /** 优惠券生效方式 */
        formatterEffectiveType(effective_type) {
          if (effective_type === 'AUTO_TAKE_EFFECT') {
            return '按有效期生效'
          }
          return '领取即生效'
        }
      },
      methods: {
        handlePreview(row) {
          this.showDrawer = true
          this.currentRow = row
        },

        /** 优惠券适用范围 */
        formatterUseScope(row) {
          if (row.use_scope === 'ALL') {
            return '全部商品'
          } else if (row.use_scope === 'CATEGORY') {
            return '分类商品'
          } else {
            return '部分商品'
          }
        },
        /** 格式化时间 */
        formatterDate(date) {
          return Foundation.unixToDate(date, 'yyyy-MM-dd')
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

        /** 添加优惠券 */
        handleAddCoupon() {
          this.$router.push({ name: 'coupon', params: { callback: this.GET_CouponsList }})
        },

        /** 编辑优惠券 */
        handleEditCoupon(index, row) {
          this.$router.push({ name: 'couponUpdate', query: { id: row.coupon_id, coupon_type: row.coupon_type }})
        },

        /** 作废优惠券 */
        handleCancelCoupon(index, row) {
          this.$confirm('作废后用户将无法领取此优惠券，用户已领取的优惠券不受此操作影响，确认将此优惠券作废吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            API_Promotion.cancelCoupons(row.coupon_id).then(() => {
              this.GET_CouponsList()
              this.$message.success('操作成功！')
            })
          }).catch(() => {})
        },

        /** 删除优惠券 */
        handleDeleteCoupon(index, row) {
          this.$confirm('删除后用户将无法领取此优惠券，用户已领取的优惠券不受此操作影响，确认删除此优惠券吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            API_Promotion.deleteCoupons(row.coupon_id).then(response => {
              this.$message.success('删除成功！')
              this.GET_CouponsList()
            })
          }).catch(() => {})
        },
        /** 查看领取记录 */
        handleOperateReceiveList(index, row) {
          this.$router.push({ name: 'ReceiveList', params: { id: row.coupon_id }})
        },

        /** 获取优惠劵列表 */
        GET_CouponsList() {
          this.loading = true
          API_Promotion.getCouponsList(this.params).then(response => {
            this.loading = false
            this.tableData = response.web_page
            this.newcomerCoupon = response.newcomer_coupon_list
            this.newcomerIsOpen = response.newcomer_is_open === 1
          }).catch(() => { this.loading = false })
        }
      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
  .el-form-item__content{
    position: relative;
  }
  .icon-percentage{
    position: absolute;
    top: 4px;
    right:12px;
  }
  .drawer-text {
    color: #006BB4;
    cursor: pointer;
    &:hover {
      text-decoration:underline;
    }
  }
</style>
