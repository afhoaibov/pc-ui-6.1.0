<template>
  <div class="order-list">
    <en-table-layout
      toolbar
      pagination
      :loading="loading"
      :tableData="tableData"
      :tips="true"
      :showDrawer="showDrawer"
      :drawerTitle="`订单编号：${currentRow.sn}`"
      @closeDrawer="showDrawer = false">
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          导出时，会按右侧高级搜索中的筛选条件导出全部数据。如果不需要，请先清空筛选条件！
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <export-button
            buttonText="导出订单"
            @exportEvent="exportEvent"
            style="margin-right: 10px;" />
          <el-button size="mini" type="primary" style="margin-left: 5px" @click="handleBatchDeliverGoods">批量发货</el-button>
          <el-button
            v-if="!MixinIsSupplier()"
            size="mini"
            type="primary"
            style="margin-left: 5px"
            @click="virtualCheckDialogShow = true">虚拟订单核销</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="500"
            placeholder="请输入订单编号或者商品名称">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="订单编号">
                  <el-input v-model="advancedForm.order_sn" clearable></el-input>
                </el-form-item>
                <el-form-item label="商品名称">
                  <el-input v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="买家账号">
                  <el-input v-model="advancedForm.buyer_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="下单日期">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.order_time_range"
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
                <el-form-item label="订单来源">
                  <el-select v-model="advancedForm.client_type" placeholder="请选择" clearable>
                    <el-option label="PC" value="PC"/>
                    <el-option label="H5" value="H5"/>
                    <el-option label="微信H5" value="WECHAT_H5"/>
                    <el-option label="小程序" value="MINI"/>
                    <el-option label="APP" value="APP"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="订单状态">
                  <el-select v-model="advancedForm.tag" placeholder="请选择订单状态">
                    <el-option
                      v-for="item in orderStatusList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="订单类型" v-if="supplyGood">
                  <el-select v-model="advancedForm.supplier_type" placeholder="请选择订单类型">
                    <el-option
                      v-for="item in orderTypeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <order-base-info slot="drawer" :orderSn="currentRow.sn" />
    </en-table-layout>
    <div class="my-table-out" :style="{maxHeight: tableMaxHeight + 'px', paddingBottom: tableData && tableData.length ? '40px' : '20px'}">
      <table class="my-table">
        <thead>
        <tr class="bg-order">
          <th class="shoplist-header">
            <el-checkbox v-model="checkAll">全选</el-checkbox>
            <span style="width: 100%;">商品名称</span>
            <span>单价/数量</span>
          </th>
          <th>买家</th>
          <!--<th>下单时间</th>-->
          <th>订单状态</th>
          <!--<th>来源</th>-->
          <th>实付金额</th>
        </tr>
        </thead>
        <tbody v-for="item in tableData">
        <tr style="width: 100%;height: 10px;"></tr>
        <tr class="bg-order">
          <td class="shoplist-content-out" colspan="3">
            <el-checkbox
              v-model="item.isSelected"
              :disabled="!item.order_operate_allowable_vo.allow_ship"
              @change="checkOne(item.isSelected, item)"/>

            <div style="display: flex; display: inline-block; margin-right: 30px;">
              <span class="drawer-text" @click="handlePreview(item)">
                订单编号：{{item.sn}}
              </span>
              <clipboard buttonCopy :text="item.sn" />
              <span class="virtual-order-tag" v-if="item.order_type === 'VIRTUAL'">虚拟订单</span>
              <el-tag type="success" v-if="item.enterprise_id">企业订单</el-tag>
            </div>

            <span class="tit-text"> 下单时间: {{ item.create_time | unixToDate }}</span>
            <span class="tit-text"> 来源: {{ item.client_type_text }}</span>

            <svg-icon v-if="item.client_type === 'PC'" iconClass="pc" style="width: 15px;height: 15px;" />
            <svg-icon v-else iconClass="mobile" style="width: 15px;height: 15px;"/>
          </td>
          <td>
            <el-button type="text" @click="handleOperateOrder(item)">查看详情</el-button>
          </td>
        </tr>
        <tr>
          <!--商品-->
          <td>
            <p v-for="shop in item.sku_list" class="shoplist-content">
              <span class="goods-info">
                <img :src="shop.goods_image" alt="" class="goods-image"/>
                <span class="virtual-order-tag" v-if="item.order_type === 'VIRTUAL'">虚拟商品</span>
                <span>
                  <span v-if="MixinIsSupplier()">{{ shop.name }}</span>
                  <a v-else :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${shop.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;">{{ shop.name }}</a>
                  <span class="supplier-name" v-if="shop.supplier_goods">供应商：{{shop.supplier_goods.supplier_name }}</span>
                </span>
              </span>
              <span>
                <a v-if="!MixinIsSupplier()" class="trade-record" :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/snapshot?id=${shop.snapshot_id}&sku_id=${shop.sku_id}&orderData=${item.order_amount}&owner=SELLER&token=${tokenStorage}`" :target="isO2O ? '' : '_blank'">
                  <el-button type="text">交易快照</el-button>
                </a>
                <span v-if="!shop.point">{{shop.original_price | unitPrice}} × {{ shop.num }}</span>
                <span v-if="shop.point && shop.point > 0">({{shop.original_price | unitPrice}}+{{ shop.point }}积分) × {{ shop.num }}</span>
              </span>
            </p>
          </td>
          <!--买家-->
          <td> {{ item.member_name }}</td>
          <!--订单状态-->
          <td>
            {{ item.order_status_text }}
            <el-tooltip placement="top" v-if="item.order_operate_allowable_vo.allow_check_cancel && item.order_status != 'CANCELLED'">
              <div slot="content">当前订单已申请售后服务，请到"售后<br/>管理-售后服务列表"中查看相关信息</div>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </td>
          <!--实付金额-->
          <td>
            <div class="order-money">
              <!--订单总金额-->
              <span class="order-amount">{{ item.order_amount | unitPrice}}</span>
              <!--积分-->
              <span v-if="item.paid_point && item.paid_point > 0">积分({{ item.paid_point }})</span>
              <!--运费/邮费-->
              <span>运费({{ item.shipping_amount | unitPrice }})</span>
              <!--商家调价-->
              <span v-if="item.modify_price && item.modify_price !== 0">调价({{ item.modify_price | unitPrice }})</span>
              <!--支付方式-->
              <span>{{ item.payment_name }}</span>
            </div>
          </td>
        </tr>
        </tbody>
        <div v-if="tableData.length === 0 " class="empty-block">
          暂无数据
        </div>
      </table>
    </div>
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

    <!--批量发货-->
    <el-dialog title="批量发货" :visible.sync="logisticsShow" width="50%" align="center" style="text-align: left;"
               v-loading="loading" element-loading-text="批量发货中">
      <el-steps :active="deliverStep" finish-status="success" align-center>
        <el-step title="物流公司" description="选择物流公司"></el-step>
        <el-step title="发货" description="打印电子面单并发货"></el-step>
      </el-steps>

      <el-form
        status-icon
        ref="cainiaoForm"
        label-width="100px"
        style="margin-left: 40px;margin-top: 20px;" v-if="deliverStep===0">
        <el-form-item label="物流公司:">
          <el-select placeholder="请选择物流公司" clearable style="width: 300px;"
                     v-model="selectLogisticId" @change="onLogisticChange">
            <el-option
              v-for="item in logisticsData"
              :key="item.logistics_company_do.id"
              :label="item.logistics_company_do.name"
              :value="item.logistics_company_do.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button style="margin-top: 12px;" v-if="deliverStep===0" @click="deliverStepNext()">下一步</el-button>

      <el-table
        :data="orderWaybill"
        border
        style="width: 100%; margin-top: 20px;" v-if="deliverStep>=1" >
        <el-table-column
          fixed
          prop="order_sn"
          label="订单号">
        </el-table-column>
        <el-table-column label="快递单号">
          <template slot-scope="scope">
            <el-input v-model="scope.row.waybill_code" @change="() => { scope.row.waybill_code = scope.row.waybill_code.trim() }"
                      :maxlength="20"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <el-button style="margin-top: 12px;" v-if="deliverStep>=1" @click="deliverStep=0">上一步</el-button>
      <el-button style="margin-top: 12px;" type="primary" v-if="deliverStep>=1 && selectLogistic.logistics_company_do.is_waybill === 1" @click="produceElectronicSurface">打印面单 & 发货</el-button>
      <el-button style="margin-top: 12px;" type="primary" v-if="deliverStep>=1 && selectLogistic.logistics_company_do.is_waybill !== 1" @click="produceElectronicSurface">全部发货</el-button>
    </el-dialog>

    <!-- 虚拟订单核销 -->
    <el-dialog title="虚拟商品核销" :visible.sync="virtualCheckDialogShow" :close-on-click-modal="false" width="30%" align="center">
      <!--主体-->
      <div>
        <el-form
        :model="virtualCheckForm"
        ref="virtualCheckForm"
        :rules="virtualRules"
        label-position="left"
        label-width="110px">
          <el-form-item label="商品兑换码：" prop="redeem_code">
            <el-input type="text" placeholder="请输入兑换码" v-model="virtualCheckForm.redeem_code" />
          </el-form-item>
        </el-form>
        <div class="el-dialog__footer">
          <el-button size="medium" @click="virtualCheckDialogShow = false">取消</el-button>
          <el-button size="medium" type="primary" @click="virtualCheckSubmit">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_order from '@/api/order'
  import * as API_logistics from '@/api/expressCompany'
  import { CategoryPicker } from '@/components'
  import Storage from '@/utils/storage'
  import OrderBaseInfo from './components/OrderBaseInfo'
  import { CaiNiaoPrinter } from '@/components/CaiNiaoPrinter'
  import ExportButton from '@/components/ExportButton'
  import { exportConfirm } from '@/utils/index'

  // 菜鸟电子面单打印组件
  var printer = null

  export default {
    name: 'orderList',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      OrderBaseInfo,
      ExportButton
    },
    data() {
      return {
        // Table最大高度
        tableMaxHeight: (document.body.clientHeight - 230),
        /** 列表loading状态 */
        loading: false,
        supplyGood: process.env.supplyGood,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          ...this.$route.query
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 高级搜索数据 */
        advancedForm: {},
        tokenStorage: Storage.getItem('seller_access_token'),
        orderTypeList: [
          { value: 0, label: '普通订单' },
          { value: 1, label: '供应商订单' }
        ],
        isIndeterminate: true,
        /** 是否全选*/
        // checkAll: false,
        /** 物流信息弹框是否显示 */
        logisticsShow: false,
        /** 物流信息 */
        logisticsData: [],

        /** 电子面单数据 */
        orderWaybill: [],

        /** 批量发货步骤条 */
        deliverStep: 1,

        /** 是否加载activated */
        loadingActivated: false,
        /** 是否显示核销弹窗 */
        virtualCheckDialogShow: false,
        /** 虚拟商品兑换 */
        virtualCheckForm: {
          redeem_code: ''
        },
        virtualRules: {
          redeem_code: [
            { required: true, message: '请填写兑换码', trigger: 'blur' }
          ]
        },
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览商品数据
        currentRow: {},

        // 选择的物流公司id
        selectLogisticId: null,
        selectLogistic: {
          logistics_company_do: {}
        }
      }
    },
    computed: {
      orderStatusList() {
        let list = [
          { value: 'ALL', label: '全部' },
          { value: 'WAIT_PAY', label: '待付款' },
          { value: 'WAIT_SHIP', label: '待发货' },
          { value: 'WAIT_ROG', label: '待收货' },
          { value: 'COMPLETE', label: '已完成' },
          { value: 'REDEEM_OFF', label: '已核销' },
          { value: 'CANCELLED', label: '已取消' },
          { value: 'WAIT_AUTH', label: '待审核' }
        ]
        if (this.MixinIsSupplier()) {
          // 供应商
          list = list.filter(v => v.value !== 'REDEEM_OFF')
        }
        return list
      },
      /** 全选 */
      checkAll: {
        get() {
          if (!this.tableData.length) { return false }
          const filterTableData = this.tableData.filter(item => item.order_status_text === '待发货' && !item.order_operate_allowable_vo.allow_check_cancel)
          if (!filterTableData.length) { return false }
          return filterTableData.every(item => item.isSelected)
        },
        set() {
          const filterArr = this.tableData.filter(item => item.order_status_text === '待发货' && !item.order_operate_allowable_vo.allow_check_cancel)
          if (filterArr.every(item => item.isSelected)) {
            filterArr.forEach(item => { item.isSelected = false })
            return false
          } else {
            filterArr.forEach(item => { item.isSelected = true })
            return true
          }
        }
      },
      selectData: function() {
        return this.tableData.filter(item => item.isSelected)
      }
    },
    mounted() {
      this.loadingActivated = true
      this.GET_OrderList()
      this.getLogisticsCompanies()
      this.getCainiao()
    },
    activated() {
      if (this.loadingActivated) return
      delete this.params.market_enable
      this.params = {
        ...this.params,
        ...this.$route.query
      }

      this.GET_OrderList()
      window.onresize = this.countTableHeight
    },
    deactivated() {
      this.loadingActivated = false
    },
    methods: {
      /** 获取菜鸟配置 **/
      getCainiao() {
        API_logistics.getCainiaoWaybillToken().then((response) => {
          if (!response.token || response.token === '') {
            return
          }
          printer = new CaiNiaoPrinter(response.ip, response.port)
        })
      },
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      /** 虚拟商品核销提交 */
      virtualCheckSubmit() {
        const virtualCheckForm = this.virtualCheckForm
        this.$refs['virtualCheckForm'].validate((valid) => {
          if (!valid) return
          API_order.virtualGoodsVerification(virtualCheckForm).then(res => {
            this.virtualCheckDialogShow = false
            this.virtualCheckForm = {
              redeem_code: ''
            }
            this.$message.success('核销成功！')
          }).catch(() => {
            this.virtualCheckForm = {
              redeem_code: ''
            }
          })
        })
      },

      /** 计算高度 */
      countTableHeight() {
        this.tableHeight = (document.body.clientHeight - 54 - 35 - 50)
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_OrderList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_OrderList()
      },

      /** 订单状态改变 */
      changeOrderStatus(data) {
        delete this.params.keywords
        delete this.params.order_status
        if (data) {
          this.params = {
            ...this.params,
            order_status: data
          }
          this.params.page_no = 1
          this.params.page_size = 10
        }
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.GET_OrderList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          page_no: 1,
          keywords: data
        }
        delete this.params.order_status
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.GET_OrderList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          page_no: 1,
          ...this.advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.order_time_range) {
          this.params.start_time = this.advancedForm.order_time_range[0] / 1000
          this.params.end_time = this.advancedForm.order_time_range[1] / 1000
        }
        delete this.params.keywords
        delete this.params.order_time_range
        this.GET_OrderList()
      },

      /** 查看、操作订单 */
      handleOperateOrder(item) {
        this.$router.push({ path: `/order/detail/${item.sn}` })
      },
      checkOne(value, currentItem) {
        currentItem.isSelected = value
      },

      /** 批量发货 */
      handleBatchDeliverGoods() {
        if (this.selectData.length > 0) {
          this.getLogisticsCompanies()
          if (!this.logisticsData.length) {
            this.$message.error('请配置物流或电子面单相关信息！')
          } else {
            this.deliverStep = 0
            this.logisticsShow = true
          }
        } else {
          this.$message.error('请选择发货订单！')
        }
      },

      /** 获取物流公司信息列表 */
      getLogisticsCompanies() {
        API_logistics.getEnabledExpressCompanyList({}).then(response => {
          this.logisticsData = response
        })
      },

      /** 生成电子面单 */
      produceElectronicSurface() {
        var waybills = []
        this.orderWaybill.forEach(item => {
          waybills.push({
            order_sn: item.order_sn,
            waybill_code: item.waybill_code
          })
        })
        const _params = {
          logistics_id: this.selectLogistic.logistics_company_do.id,
          waybills: waybills
        }
        this.$confirm(this.selectLogistic.logistics_company_do.is_waybill === 1 ? '确认生成电子面单并打印发货?' : '确认要全部发货?', '提示', { type: 'warning' }).then(() => {
          this.loading = true
          API_order.batchGenerateCaiNiaoWaybill(_params).then((response) => {
            this.orderWaybill = response

            // 打印电子面单
            this.orderWaybill.forEach(item => {
              if (item.print_data !== '') {
                this.handlePrint(item)
              }
            })
            this.GET_OrderList()
            this.loading = false
            this.deliverStep = 2
            this.$message.success('批量发货成功！')
            // eslint-disable-next-line handle-callback-err
          }).catch(function(error) {
            setTimeout(() => {
              this.loading = false
            }, 3000)
          }
          )
        })
      },

      /** 打印电子面单 */
      handlePrint(item) {
        if (!item || !item.print_data || item.print_data === '') {
          return false
        }
        if (!printer) {
          this.$message.error('请配置菜鸟电子面单后再进行打印！')
          return false
        }
        printer.setCallBack((data) => {
          if (data && data.status === 'success') {
            // this.$message.success('电子面单打印任务添加成功')
          }
        })
        const printData = JSON.parse(item.print_data)
        printer.doPrint(item.print_data, item.waybill_code, printData.templateURL)
      },

      onLogisticChange(value) {
        this.selectLogistic = this.logisticsData.filter(item => item.logistics_company_do.id === value)[0]
      },

      deliverStepNext() {
        if (this.deliverStep === 0) {
          // 判断是否选择物流公司
          if (!this.selectLogisticId || this.selectLogisticId === '') {
            this.$message.error('请选择物流公司！')
            return false
          }
          // 电子面单预生成
          const _params = {
            order_sns: this.selectData.map(item => {
              return item.sn
            }),
            logistics_id: this.selectLogistic.logistics_company_do.id
          }
          API_order.batchPreviewCaiNiaoWaybill(_params).then((response) => {
            this.orderWaybill = response
          })
        }
        this.deliverStep++
      },

      /** 导出操作 */
      exportEvent() {
        API_order.exportOrders(this.params).then(res => {
          exportConfirm(this)
        })
      },

      GET_OrderList() {
        this.loading = true
        API_order.getOrderList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data.map(item => {
            item.isSelected = false
            return item
          })
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .order-list ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }
  /* 工具条*/
  .inner-toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #fff !important;
  }

  /*暂无数据时的样式*/
  .order-list ::v-deep .el-table__empty-block {
    display: none;
  }
  .virtual-order-tag {
    color: #da5f27;
    border: 1px solid  #da5f27;
    padding: 2px;
    border-radius: 4px;
    font-size: 10px;
    margin: 0 5px;
  }

  .empty-block {
    position: relative;
    min-height: 60px;
    line-height: 60px;
    text-align: center;
    width: 190%;
    height: 100%;
    font-size: 14px;
    color: #606266;
  }

  /*表格信息*/
  .my-table-out{
    white-space: nowrap;
    overflow-y: scroll;
    text-overflow: ellipsis;
    width: 100%;
  }
  .my-table {
    width: 100%;
    // margin-bottom: 40px;
    background: #fff;
    border-collapse: collapse;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    .bg-order {
      background: #FAFAFA;
    }
    thead {
      th {
        padding: 10px 0;
        border: 1px solid #ebeef5;
        border-collapse: collapse;
        color: #909399;
      }
      th.shoplist-header {
        padding: 10px 20px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
      }
    }
    tbody {
      margin-top: 10px;
      td {
        border: 1px solid #ebeef5;
        border-collapse: collapse;
        text-align: center;
        padding: 0;
      }
      td:first-child {
        text-align: left;
      }
      td:not(:first-child) {
        padding: 3px;
      }
      td.shoplist-content-out {
        .drawer-text {
          color: #006BB4;
          cursor: pointer;
          &:hover {
            text-decoration:underline;
          }
        }

        .tit-text {
          margin-right: 30px;
        }
        padding-left: 20px;
      }

      /*商品信息*/
      p.shoplist-content:not(:last-child) {
        border-bottom: 1px solid #ebeef5;
        border-collapse: collapse;
      }
      p.shoplist-content {
        margin: 0;
        padding: 0 20px;
        box-sizing: padding-box;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        .goods-info {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: flex-start;
          align-items: center;
          .supplier-name {
            display: block;
            color: #E6A23C;
            margin-top: 10px;
          }
          padding: 10px 0;
          img {
            display: block;
            margin-right: 10px;
          }
          a {
            display: block;
            color: #409EFF;
            max-width: 850px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sku-spec {
            color: #ff9800;
            margin: 0;
          }
        }
      }
      div.order-money {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        span {
          display: inline-block;
          padding: 5px;
        }
        span.order-amount {
          color: red;
        }
      }
    }
    /* 商品图片 */
    .goods-image {
      width: 50px;
      height: 50px;
    }
    /** 交易快照 */
    .trade-record {
      display: inline-block;
      margin-right: 50px;
    }
  }

  /*分页信息*/
  section>div {
    position: relative;
  }
  .el-pagination {
    text-align: right;
    width: 100%;
    background: #ffffff;
    height: 40px;
    position: absolute;
    bottom: 0;
    right: 0;
    border-top: 1px solid #e5e5e5;
    padding: 5px 20px;
  }
</style>

