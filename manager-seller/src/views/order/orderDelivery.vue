<template>
  <div class="orderDelivery">
    <div class="message">
      <div class="info-box">
        <p><span>订单号：</span>{{ order_sn }}</p>
        <p><span>商家：</span>{{ seller_name }}</p>
      </div>
      <el-button style="float: right; padding: 3px 0" type="text" @click="logisticsCompanyShow = true">添加物流信息</el-button>
    </div>
    <el-table :data="tableData" :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
      <el-table-column type="index" label="序号" width="150px" />
      <el-table-column prop="product_id" label="SKU编码" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="num" label="数量" />
    </el-table>
    <div class="deliveryBox">
      <el-button class="delivery" type="primary" @click="delivery()"
        v-if="tableData.length !== 0">发货</el-button>
      <el-button plain type="primary" @click="printWaybill" v-if="this.orderWaybill && this.orderWaybill.print_data && this.orderWaybill.print_data !== ''">打印电子面单</el-button>
    </div>
    <!--发货对话框 dialog-->
    <el-dialog title="发货" :visible.sync="deliveryVisible" width="650px" :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form
        status-icon
        ref="cainiaoForm"
        label-width="100px">
        <el-form-item label="物流公司:">
          <el-select
            v-model="selectLogisticId"
            placeholder="请选择物流公司"
            clearable
            style="width: 300px;"
            @change="onLogisticChange"
            :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != '' ">
            <el-option
              v-for="item in logisticsData"
              :key="item.logistics_company_do.id"
              :label="item.logistics_company_do.name"
              :value="item.logistics_company_do.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号:">
          <el-input maxlength="100" style="width: 300px;" v-model="selectLogistic.ship_no" :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != ''"></el-input>
          <el-button-group v-if="selectLogistic.logistics_company_do.is_waybill == 1">
            <el-button
              type="primary"
              plain
              :disabled="orderWaybill.waybill_code && orderWaybill.waybill_code != ''"
              :loading="produceElectronicLoading"
              @click="produceElectronicSurface()">生成电子面单
            </el-button>
            <el-button
              type="primary"
              plain
              :disabled="selectLogistic.logistics_company_do.is_waybill !== 1 || selectLogistic.ship_no === ''"
              :loading="printWaybillLoading"
              @click="printWaybill()">打印电子面单
            </el-button>
            <el-button
              type="primary"
              plain
              :disabled="selectLogistic.logistics_company_do.is_waybill !== 1 || selectLogistic.ship_no === ''"
              :loading="cancelWaybillLoading"
              @click="cancelWaybill()">取消电子面单
            </el-button>
          </el-button-group>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="primary" @click="deliverGoods()" style="width: 80px;">发货</el-button>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deliveryVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDeliveryForm()">确 定</el-button>
      </div>
    </el-dialog>
    <!--物流信息-->
    <en-logistics-company :logisticsShow="logisticsCompanyShow" @logisticsChanged="logisticsChanged"
      @logstictisClosed="logstictisClosed" />
  </div>
</template>

<script>
import * as API_order from '@/api/order'
import * as API_logistics from '@/api/expressCompany'
import { CaiNiaoPrinter } from '@/components/CaiNiaoPrinter'
import { LogisticsCompany } from './components'

// 菜鸟电子面单打印组件
var printer = null
export default {
  name: 'orderDelivery',
  components: {
    [LogisticsCompany.name]: LogisticsCompany
  },
  data() {
    return {
      tableData: [],
      /** 当前订单编号 */
      order_sn: '',
      seller_name: '',
      /** 发货对话框 */
      deliveryVisible: false,
      /** 发货对话框表单 */
      deliveryForm: {},
      /** 发货规则 */
      deliveryRules: {
        logisticsCompany: { required: true, message: '请选择物流公司', trigger: 'change' },
        logisticsOrderNo: { required: true, message: '请填写物流单号', trigger: 'blur' }
      },
      /** 物流公司列表 */
      logisticsData: [],
      // 选择的物流公司id
      selectLogisticId: null,
      selectLogistic: {
        logistics_company_do: {}
      },
      produceElectronicLoading: false,
      cancelWaybillLoading: false,
      printWaybillLoading: false,
      // 菜鸟电子面单数据
      orderWaybill: {},
      /** 是否显示物流信息弹框 */
      logisticsCompanyShow: false
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        console.log(newVal)
        if (newVal.name !== 'orderDelivery') return
        this.order_sn = newVal.query.order_sn
        this.getLogisticsCompanies()
        this.queryOrdersItems(this.order_sn)
        this.getCainiao()
      }
    }
  },
  methods: {
    /** 生成电子面单 */
    produceElectronicSurface() {
      const _params = {
        order_sn: this.order_sn,
        logistics_id: this.selectLogistic.logistics_company_do.id
      }
      this.$confirm('确认生成电子面单?', '提示', { type: 'warning' }).then(() => {
        this.produceElectronicLoading = true
        API_order.generateCaiNiaoWaybill(_params).then((response) => {
          this.orderWaybill = response
          this.logisticsData.forEach(key => {
            if (_params.logistics_id === key.logistics_company_do.id) {
              key.ship_no = this.orderWaybill.waybill_code
            }
          })
          this.produceElectronicLoading = false
          this.$message.success('生成电子面单成功！')
          // eslint-disable-next-line handle-callback-err
        }).catch(function(error) {
          setTimeout(() => {
            this.produceElectronicLoading = false
          }, 3000)
        })
      })
    },

    // 取消电子面单
    cancelWaybill() {
      const _params = {
        waybill_code: this.orderWaybill.waybill_code,
        logistics_id: this.selectLogistic.logistics_company_do.id
      }
      this.$confirm('确认取消生成的电子面单?', '提示', { type: 'warning' }).then(() => {
        this.cancelWaybillLoading = true
        API_order.cancelCaiNiaoWaybill(_params).then((response) => {
          this.cancelWaybillLoading = false
          if (!response) {
            this.$message.error('取消电子面单失败！')
            return false
          }
          this.orderWaybill = {}
          this.logisticsData.forEach(key => {
            if (_params.logistics_id === key.logistics_company_do.id) {
              key.ship_no = ''
            }
          })
          this.$message.success('取消电子面单成功！')
          // eslint-disable-next-line handle-callback-err
        }).catch(function(error) {
          setTimeout(() => {
            this.cancelWaybillLoading = false
          }, 3000)
        })
      })
    },
    /** 监听物流公司信息开启/关闭操作 */
    logisticsChanged() {
      this.getLogisticsCompanies()
    },

    logstictisClosed(target) {
      this.logisticsCompanyShow = target
    },
    printWaybill() {
      if (!this.orderWaybill || !this.orderWaybill.print_data || this.orderWaybill.print_data === '') {
        this.$message.error('电子面单数据异常！')
        return false
      }
      if (!printer) {
        this.$message.error('请配置菜鸟电子面单后再进行打印！')
        return false
      }
      printer.setCallBack((data) => {
        this.printWaybillLoading = false
        if (data && data.status === 'success') {
          this.$message.success('电子面单打印任务添加成功')
        }
      })
      this.printWaybillLoading = true
      const printData = JSON.parse(this.orderWaybill.print_data)
      printer.doPrint(this.orderWaybill.print_data, this.orderWaybill.waybill_code, printData.templateURL)
    },
    /** 获取菜鸟配置 **/
    getCainiao() {
      API_logistics.getCainiaoWaybillToken().then((response) => {
        if (!response.token || response.token === '') {
          return
        }
        printer = new CaiNiaoPrinter(response.ip, response.port)
      })
    },
    /** 查询发货订单的sku列表 */
    queryOrdersItems(order_sn) {
      API_order.queryOrdersItems(order_sn).then(res => {
        this.tableData = res.item_list
        this.order_sn = res.order_sn
        this.seller_name = res.seller_name
      })
    },
    /** 获取物流公司信息列表 */
    getLogisticsCompanies() {
      API_logistics.getEnabledExpressCompanyList({}).then(response => {
        this.logisticsData = response
        this.logisticsData.forEach(key => {
          this.$set(key, 'ship_no', '')
        })
        this.getCainiaoWaybill()
      })
    },
    /** 获取生成的菜鸟电子面单 */
    getCainiaoWaybill() {
      API_order.getCaiNiaoWaybill({ order_sn: this.order_sn }).then((response) => {
        this.orderWaybill = response
        this.logisticsData.forEach(key => {
          if (response.logistics_id === key.logistics_company_do.id) {
            key.ship_no = this.orderWaybill.waybill_code
            this.selectLogisticId = key.logistics_company_do.id
            this.onLogisticChange(this.selectLogisticId)
          }
        })
      })
    },
    onLogisticChange(value) {
      this.selectLogistic = this.logisticsData.filter(item => item.logistics_company_do.id === value)[0]
    },
    /** 发货 */
    delivery() {
      this.deliveryVisible = true
    },
    /** 确定发货 */
    submitDeliveryForm() {
      if (!this.selectLogistic.ship_no) {
        this.$message.error('请填写快递单号')
        return
      } else if (!/^[A-Za-z0-9]+$/.test(this.selectLogistic.ship_no)) {
        this.$message.error('快递单号不符合规则，请输入字母或者数字')
        return
      }
      const _params = {
        /** 发货单号 */
        ship_no: this.selectLogistic.ship_no,
        /** 物流公司id */
        logi_id: this.selectLogistic.logistics_company_do.id,
        /** 物流公司名称 */
        logi_name: this.selectLogistic.logistics_company_do.name
      }
      this.$confirm('确认发货?', '提示', { type: 'warning' }).then(() => {
        API_order.deliveryGoods(this.order_sn, _params).then(() => {
          this.$message.success('发货成功')
          this.$store.dispatch('delCurrentViews', {
            view: this.$route,
            $router: this.$router
          })
          this.$router.push({ path: `/order/detail/${this.order_sn}` })
          this.deliveryVisible = false
        })
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.orderDelivery {
  background-color: #ffffff;

  .message {
    box-sizing: border-box;
    padding: 18px;
    display: flex;
    justify-content: space-between;
    .info-box {
      display: flex;
    }

    p {
      margin-right: 40px;
      color: #888;

      span {
        color: #000;
      }
    }
  }

  .deliveryBox {
    width: 100%;
    overflow: hidden;
    padding: 20px 40px;

    .delivery {
      float: right;
    }
  }
}
</style>
