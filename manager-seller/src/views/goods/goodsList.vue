<template>
  <div class="goods-list">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.goods_name"
      :selectionChange="handleSelectionChange"
      @closeDrawer="showDrawer = false"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="btn-box">
          <el-button @click="publishGoods" type="primary">发布商品</el-button>
          <el-button type="success" @click="handlerBatchUp">批量上架</el-button>
          <el-button type="danger" @click="showUnderReason">批量下架</el-button>
          <export-button
            buttonText="导出商品"
            @exportEvent="exportEvent"
            style="margin-right: 10px;" />
          <el-button @click="gotoRecycle"  type="primary">回收站</el-button>
        </div>
        <div class="toolbar-btns">
          <div class="btns-box">
            <!--商品状态 上架 下架-->
            <div class="conditions">
              <span>商品状态：</span>
              <el-select
                class="choose-machine"
                v-model="params.market_enable"
                placeholder="请选择商品状态"
                @change="changeGoodsStatus"
                clearable>
                <el-option
                  v-for="item in goodsStatusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </div>
            <!--商品类型-->
            <div class="conditions" v-if="!MixinIsSupplier()">
              <span>商品类型：</span>
              <el-select
                class="choose-machine"
                v-model="params.goods_type"
                placeholder="请选择商品类型"
                @change="changeGoodsType"
                clearable>
                <el-option key="NORMAL" label="普通商品" value="NORMAL"/>
                <el-option key="VIRTUAL" label="虚拟商品" value="VIRTUAL"/>
              </el-select>
            </div>

            <div class="conditions" v-if="!MixinIsSupplier()">
              <span>积分商品：</span>
              <el-switch
                  v-model="params.point_disable"
                  active-color="#13ce66"
                  active-value="1"
                  inactive-value="0"
                  @change="GET_GoodsList">
              </el-switch>
            </div>
          </div>

          <!--商品分组 获取分组列表-->
          <div class="conditions" v-if="!MixinIsSupplier()">
            <span>店铺分组：</span>
            <en-category-picker class="choose-machine" size="mini" @changed="changeGoodsCateGory" :clearable='true'/>
          </div>
          <div class="toolbar-search">
            <en-table-search @search="searchEvent" placeholder="请输入商品名称或编号"/>
          </div>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column
          type="selection"
          width="55" />
        <el-table-column label="商品名称" min-width="200">
          <template slot-scope="scope">
            <div class="goods-info">
              <div class="goods-image" style="margin: 0 20px;">
                <img :src="scope.row.thumbnail"/>
              </div>
              <div class="goods-name-box">
                <div class="goods-name drawer-text" @click="handlePreview(scope.row)">
                  {{ scope.row.goods_name }}
                </div>
                <span>
                  商品编号:
                  <clipboard :text="scope.row.sn" />
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格">
          <template slot-scope="scope">
            <div v-if="scope.row.point_disable === 0">
              <span>{{ scope.row.price | unitPrice }}</span>
            </div>
            <div v-if="scope.row.point_disable === 1">
              <span v-if="scope.row.price && scope.row.price !== 0">{{ scope.row.price | unitPrice }} + {{ scope.row.exchange_point }}积分</span>
              <span v-else>{{ scope.row.exchange_point }}积分</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际库存">
          <template slot="header">
            <span>实际库存</span>
            <el-tooltip effect="dark" content="订单发货时扣减" placement="top">
              <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div class="edit-stock">
              {{ scope.row.quantity }}
              <i v-if="scope.row.source_type !== 'SUPPLIER'" class="iconfont el-icon-edit" style="margin-left: 5px; font-size: 15px; cursor:pointer;" @click="handleStockGoods(scope.row)"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可用库存">
          <template slot="header">
            <span>可用库存</span>
            <el-tooltip effect="dark" content="创建订单时扣减" placement="top">
              <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ scope.row.enable_quantity }}</template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate('yyyy-MM-dd hh:mm') }}</template>
        </el-table-column>
        
        <el-table-column  label="状态">
          <template slot-scope="scope">
            <span>{{ scope.row | marketStatus }}</span>
            <div class="under-reason" v-if="scope.row.market_enable === 0" @click="showUnderReasonEvent(scope.row)">(下架原因)</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" style="text-align: left;">
          <template slot-scope="scope">
            <template v-if="!MixinIsSupplier()">
              <el-button
                size="mini"
                type="text"
                v-if="scope.row.market_enable === 1"
                @click="handlePromotionGoods(scope.row)">推广
              </el-button>
            </template>
            <el-button
              size="mini"
              type="text"
              @click="handleEditGoods(scope.row)">编辑
            </el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleSkuInfo(scope.row)">
              {{scope.row.source_type === 'SUPPLIER' ? '查看': ''}}SKU
            </el-button>
            <el-button
              size="mini"
              type="text"
              v-if="scope.row.market_enable === 0"
              @click="handleDeleteGoods(scope.row)">删除
            </el-button>
            <el-button
              size="mini"
              type="text"
              v-if="scope.row.market_enable === 0"
              @click="handlerBatchUp(scope.row)">上架
            </el-button>
            <el-button
              size="mini"
              type="text"
              v-if="scope.row.market_enable === 1"
              @click="handlerGoodsUnder(scope.row)">下架
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
      <!-- 侧边预览 -->
      <goods-base-info slot="drawer" :goodsId="currentRow.goods_id"  />
    </en-table-layout>
    <!--库存编辑-->
    <el-dialog title="编辑实际库存" :visible.sync="goodsStockshow" width="50%" class="pop-sku">
      <div class="goods-stock-info">
        <span class="goods_title">商品标题</span>
        <span class="goods_name">
          <a :href="`${MixinBuyerDomain}/goods/${goodsId}`" target="_blank">{{ goodsName }}</a>
        </span>
      </div>
      <div v-if="goodsStockshow">
        <el-form
          v-if="goodsStocknums === 0"
          ref="goodsStockData"
          :model="goodsStockData"
          :rules="rules"
          label-width="100px"
          @submit.native.prevent
          style="width: 50%;"
        >
          <el-form-item label="实际库存" prop="quantity" >
            <el-input v-model="goodsStockData.quantity" />
          </el-form-item>
        </el-form>
        <en-table-layout
          :tableData="goodsStockData"
          :loading="loading"
          v-if="goodsStocknums > 0"
          :stripe="false"
        >
          <template slot="table-columns">
            <el-table-column
              v-for="(item, index) in goodsStockTitle"
              v-if="item.prop !== 'sku_id'"
              :label="item.label"
              :key="index"
            >
              <template slot-scope="scope">
                <el-input v-if="item.prop === 'quantity'" @blur="checkQuantity(scope.row.quantity)" style="width: 50%" v-model="scope.row.quantity"/>
                <span v-if="item.prop !== 'quantity'" >{{ scope.row[item.prop] }}</span>
              </template>
            </el-table-column>
          </template>
        </en-table-layout>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="goodsStockshow = false">取 消</el-button>
        <el-button type="primary" @click="reserveStockGoods">确 定</el-button>
      </div>
    </el-dialog>
    <!--下架原因-->
    <el-dialog title="下架原因" :visible.sync="isShowUnderReason" width="20%" >
      <div align="center">{{ under_reason }}</div>
    </el-dialog>
    <!-- 推广 -->
    <el-dialog
      @close="closePromotionDialog"
      title="商品推广"
      :visible.sync="showPromotionDialog"
      class="promotion-dialog">
      <div class="promotion-wrap" id="promotion">
        <p class="title">H5推广链接</p>
        <div class="url-box">
          <p class="url">{{promotionData.codeUrl}}</p>
          <el-button
            type="text"
            v-clipboard:copy="promotionData.codeUrl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            >
            复制链接
          </el-button>
        </div>
        <p class="title">PC推广链接</p>
        <div class="url-box">
          <p class="url">{{promotionData.pcUrl}}</p>
          <el-button
            type="text"
            v-clipboard:copy="promotionData.pcUrl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            >
            复制链接
          </el-button>
        </div>
        <div class="code-box">
          <div class="code-item">
            <div class="code">
              <img
                :src="promotionData.programCode"
                alt=""
                class="code">
            </div>
            <p class="download-btn" @click="downloadProgramCode">下载小程序码</p>
          </div>
          <div class="code-item">
            <qrcode-vue
              size="160"
              :value="promotionData.codeUrl"
              level="H"
            ></qrcode-vue>
            <p class="download-btn" @click="downloadCode">下载二维码</p>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 下架原因 -->
    <sold-out-reason-dialog
      v-model="showReasonDialog"
      @handleClose="showReasonDialog = false"
      @handleConform="handlerBatchUnder" />
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import { CategoryPicker } from '@/components'
  import { RegExp } from '~/ui-utils'
  import { cloneObj, exportConfirm } from '@/utils/index'
  import GoodsBaseInfo from './components/GoodsBaseInfo'
  import QrcodeVue from 'qrcode.vue'
  import ExportButton from '@/components/ExportButton'
  import SoldOutReasonDialog from './components/SoldOutReasonDialog'

  export default {
    name: 'goodsList',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      GoodsBaseInfo,
      QrcodeVue,
      ExportButton,
      SoldOutReasonDialog
    },
    data() {
      const checkQuantity = (rule, value, callback) => {
        if (!value && value !== 0) {
          return callback(new Error('实际库存不能为空'))
        }
        setTimeout(() => {
          if (!/^[0-9]\d*$/.test(value)) {
            callback(new Error('请输入整数'))
          } else if (!(parseInt(value) >= 0 && parseInt(value) <= 99999999)) {
            callback(new Error('请输入0 - 99999999之间的正整数'))
          } else {
            callback()
          }
        }, 500)
      }
      const checkMoney = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('返利金额不能为空'))
        }
        setTimeout(() => {
          if (!RegExp.money.test(value)) {
            callback(new Error('请输入正确的金额'))
          } else if (parseFloat(value) < 0 || parseFloat(value) > 99999999) {
            callback(new Error('请输入0~99999999之间的金额'))
          } else {
            callback()
          }
        }, 500)
      }

      return {
        /** 列表loading状态 */
        loading: false,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          // 商品类型 默认为'' NORMAL 正常商品 VIRTUAL 虚拟商品
          goods_type: '',
          // 是否检索积分商品
          point_disable: 0, // 0 否 1是
          ...this.$route.query
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 商品状态列表 */
        goodsStatusList: [
          { value: 0, label: '已下架' },
          { value: 1, label: '出售中' }
        ],

        /** 当前商品分组*/
        categoryId: '',

        /** 当前商品id*/
        goodsId: '',

        /** 当前商品名称*/
        goodsName: '',

        /** 商品库存显示*/
        goodsStockshow: false,

        /** 是否显示下架原因 */
        isShowUnderReason: false,

        /** 下架原因 */
        under_reason: '',

        /** 库存商品数量*/
        goodsStocknums: 0,

        /** 商品库存列表数据*/
        goodsStockData: null,

        /** 商品库存列表表头数据 */
        goodsStockTitle: [],

        /** 要合并的列的位置数组 */
        concactArray: [],

        /** 校验规则 */
        rules: {
          quantity: [
            { validator: checkQuantity, trigger: 'blur' }
          ]
        },

        /** 店铺信息 */
        shopInfo: this.$store.getters.shopInfo,
        // 推广弹窗显隐
        showPromotionDialog: false,
        // 当前推广商品
        promotionData: {},
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览操作商品数据
        currentRow: {},
        // 批量操作ids
        goodsIds: [],
        // 下架原因填写
        showReasonDialog: false
      }
    },
    filters: {
      /** 销售状态格式化 */
      marketStatus(row) {
        switch (row.is_auth) {
          case 0 : return row.market_enable === 1 ? '待审核' : '已下架'
          case 1 : return row.market_enable === 1 ? '售卖中' : '已下架'
          case 2 : return row.market_enable === 1 ? '审核拒绝' : '已下架'
        }
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          this.showDrawer = false
          this.currentRow = {}
          if (newVal.name !== 'goodsList') return
          this.init()
        }
      }
    },
    methods: {
      /** 商品导出 */
      exportEvent() {
        const params = this.params
        if (!Number(params.point_disable)) {
          delete params.point_disable
        }
        API_goods.exportGoods(params).then(() => {
          exportConfirm(this)
        })
      },

      showUnderReason() {
        if (!this.goodsIds.length) {
          this.$message.error('请选择要下架的商品！')
          return
        }
        this.showReasonDialog = true
      },
      /** 初始化 */
      init() {
        this.params = { ...this.params, ...this.$route.query }
        this.params.market_enable && (this.params.market_enable = parseInt(this.params.market_enable))
        this.GET_GoodsList()
      },
      /** 批量操作商品选中 */
      handleSelectionChange(val) {
        this.goodsIds = val.map(item => item.goods_id)
      },
      /** 批量上架 */
      handlerBatchUp(row = null) {
        let goodsIds = this.goodsIds
        if (row && row.goods_id) {
          // 单个商品上架架操作
          goodsIds = [row.goods_id]
        }
        if (!goodsIds.length) {
          this.$message.error('请选择要上架的商品！')
          return
        }
        let tips = '确认要上架这些商品吗？'
        if (goodsIds.length === 1) {
          tips = '确认要上架此商品吗？'
        }
        this.$confirm(tips, '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUp(goodsIds).then(res => {
            this.$message.success('上架成功！')
            this.goodsIds = []
            this.GET_GoodsList()
          })
        }).catch(() => {})
      },

      /** 下架操作 */
      handlerBatchUnder(underReason) {
        let { goodsIds, currentRow } = this
        let tips = '确认要下架这些商品吗？'
        if (!goodsIds.length && currentRow.goods_id) {
          goodsIds = [currentRow.goods_id]
          tips = '确认要下架此商品吗？'
        }
        this.$confirm(tips, '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUnder(goodsIds, { reason: underReason }).then(res => {
            this.showReasonDialog = false
            this.goodsIds = []
            this.$message.success('下架成功！')
            this.GET_GoodsList()
          })
        })
      },

      /** 单个商品下架操作 */
      handlerGoodsUnder(row) {
        this.currentRow = row
        this.showReasonDialog = true
      },
      /** 查看预览 */
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      /** 库存边界限制 */
      checkQuantity(value) {
        if (!value && value !== 0) {
          this.$message.error('库存不能为空')
        } else if (!RegExp.integer.test(value) && parseInt(value) !== 0) {
          this.$message.error('请输入整数')
        } else if (!(parseInt(value) >= 0 && parseInt(value) <= 99999999)) {
          this.$message.error('请输入0 - 99999999之间的正整数')
        }
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_GoodsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_GoodsList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          page_no: 1,
          keyword: data
        }
        this.GET_GoodsList()
      },

      /** 切换上下架状态*/
      changeGoodsStatus(val) {
        delete this.params.market_enable
        if (val !== '' && val !== -1) {
          this.params = {
            ...this.params,
            market_enable: val
          }
        }
        this.GET_GoodsList()
      },

      /** 切换商品类型 */
      changeGoodsType(val) {
        delete this.params.goods_type
        if (val !== '') {
          this.params = {
            ...this.params,
            goods_type: val
          }
        }
        this.GET_GoodsList()
      },

      /** 切换分组*/
      changeGoodsCateGory(data) {
        delete this.params.shop_cat_path
        if (data && Array.isArray(data) && data.length !== 0) {
          this.params = {
            ...this.params,
            shop_cat_path: '0|' + data.join('|') + '|'
          }
        }
        this.GET_GoodsList()
      },

      /** 显示下架原因 */
      showUnderReasonEvent(row) {
        this.isShowUnderReason = false
        this.isShowUnderReason = true
        this.under_reason = row.under_message
      },

      GET_GoodsList() {
        this.loading = true
        const params = cloneObj(this.params)
        if (!Number(params.point_disable)) {
          delete params.point_disable
        }

        API_goods.getGoodsList(params).then(response => {
          this.loading = false
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
          this.tableData = response.data
        })
      },

      /** 发布商品*/
      publishGoods() {
        this.$router.push({ name: 'goodPublish', params: { callback: this.GET_GoodsList }})
      },
      /** 跳转回收站*/
      gotoRecycle() {
        this.$router.push({ path: '/goods/recycle-station' })
      },

      /** SKU管理 */
      handleSkuInfo(row) {
        this.$router.push({ name: 'goodsSku', params: { goodsid: row.goods_id, callback: this.GET_GoodsList }})
      },

      /** 编辑商品 isdraft 商品列表1*/
      handleEditGoods(row) {
        this.$router.push({ name: 'goodPublish', params: { goodsid: row.goods_id, isdraft: 1, callback: this.GET_GoodsList }})
      },
      /** 关闭推广弹窗 */
      closePromotionDialog() {
        this.showPromotionDialog = false
        this.promotionData = {}
      },
      /** 推广显示 */
      handlePromotionGoods(row) {
        this.showPromotionDialog = true
        this.promotionData.pcUrl = `${this.MixinBuyerDomain}/goods/${row.goods_id}`
        this.promotionData.codeUrl = `${this.MixinBuyerWapDomain}/goods-module/goods?goods_id=${row.goods_id}`
        API_goods.goodsGoodsProgramCode(row.goods_id).then(res => {
          this.$set(this.promotionData, 'programCode', res)
        }).catch(() => {
          this.$message.error('小程序码获取失败')
        })
      },
      /** 复制成功 */
      onCopy(e) {
        this.$message.success('已复制')
      },

      /** 复制失败 */
      onError(e) {
        this.$message.error('抱歉，您的由于您的浏览器不支持，请手动复制。')
      },
      /** 小程序二维码下载 */
      downloadProgramCode() {
        const programCode = this.promotionData.programCode
        if (!programCode) {
          this.$message.error('小程序码获取失败')
          return
        }
        let image = new Image()
        // 解决跨域 Canvas 污染问题
        image.setAttribute('crossOrigin', 'anonymous')
        image.onload = function() {
          let canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          let context = canvas.getContext('2d')
          context.drawImage(image, 0, 0, image.width, image.height)
          let url = canvas.toDataURL('image/png') // 得到图片的base64编码数据
          let a = document.createElement('a') // 生成一个a元素
          let event = new MouseEvent('click') // 创建一个单击事件
          a.download = '小程序码' // 设置图片名称
          a.href = url // 将生成的URL设置为a.href属性
          a.dispatchEvent(event) // 触发a的单击事件
        }
        image.src = programCode
      },

      /** 二维码下载 */
      downloadCode() {
        // 获取canvas标签
        let canvas = document.getElementById('promotion').getElementsByTagName('canvas')
        // 创建a标签
        let a = document.createElement('a')
        // 获取二维码的url并赋值为a.href
        a.href = canvas[0].toDataURL('img/png')
        // 设置下载文件的名字
        a.download = '推广二维码'
        // 点击事件
        a.click()
        this.$message.success('下载完成')
      },

      /** 删除商品 */
      handleDeleteGoods(row) {
        this.$confirm('确认删除此商品, 是否继续?', '提示', { type: 'warning' }).then(() => {
          const _ids = [row.goods_id].toString()
          API_goods.deleteGoods(_ids).then(() => {
            this.GET_GoodsList()
            this.$message.success('删除商品成功！')
          })
        })
      },
      /** 库存 */
      handleStockGoods(row) {
        this.goodsId = row.goods_id
        this.goodsName = row.goods_name
        API_goods.getGoodsStockList(row.goods_id).then((response) => {
          this.goodsStockTitle = []
          this.goodsStockData = []
          this.goodsStocknums = response.filter(item => Array.isArray(item.spec_list)).length
          // 构造待发货字段
          if (this.goodsStocknums > 0) {
            this.$nextTick(() => {
              response.forEach((key) => {
                this.goodsStockTitle = [
                  { label: 'SKU', prop: 'sku' },
                  { label: '实际库存', prop: 'quantity' }
                ]
                // 构造表结构
                let _skuData = key.spec_list.map(item => item.spec_value_name).join('/')
                const _key = {
                  sku: _skuData,
                  sku_id: key.sku_id,
                  quantity: key.quantity
                }
                this.goodsStockData.push(Object.assign(_key))
              })
            })
          } else {
            this.goodsStockData = response[0]
          }
          this.goodsStockshow = true
        })
      },

      /** 保存库存商品 */
      reserveStockGoods() {
        let _params = []
        if (Array.isArray(this.goodsStockData)) {
          _params = this.goodsStockData.map((elem) => {
            return {
              quantity_count: elem.quantity,
              sku_id: elem.sku_id
            }
          })
        } else {
          _params.push({
            quantity_count: this.goodsStockData.quantity,
            sku_id: this.goodsStockData.sku_id
          })
        }
        const _res = _params.some(key => {
          return !(parseInt(key.quantity_count) >= 0 && parseInt(key.quantity_count) <= 99999999) || !/^[0-9]\d*$/.test(key.quantity_count)
        })
        if (_res) {
          this.$message.error('实际库存须为0 - 99999999之间的整数')
          return
        }
        API_goods.reserveStockGoods(this.goodsId, _params).then(() => {
          this.goodsStockshow = false
          this.$message.success('实际库存商品保存成功')
          this.GET_GoodsList()
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .goods-list ::v-deep .el-table--scrollable-x .el-table__body-wrapper {
    overflow-x: inherit;
  }
  .goods-list ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }
  .goods-list ::v-deep .el-table {
    width: 100%;
    .el-button--text {
      font-size: 15px;
      margin: 0;
      font-weight: 600;
      span {
        padding: 0 10px;
        border-right: 1.5px solid #409EFF;
      }
      &:last-child span {
        border-right: none;
      }
    }
  }
  .goods-list ::v-deep .toolbar {
    height: auto !important;
  }
  .goods-list ::v-deep .promotion-dialog {
    .el-dialog {
      width: 650px;
    }
  }
  .promotion-wrap {
    .title {
      color: #333;
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 20px 0;
    }
    .url-box {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .url {
        width: 540px;
        margin: 0;
        padding: 8px 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        margin-right: 20px;
        font-size: 14px;
      }
    }
    .code-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 40px auto 0;
      width: 80%;
      .code-item {
        margin: 0 20px;
        .code {
          width: 160px;
          height: 160px;
        }
        .download-btn {
          color: #409EFF;
          cursor: pointer;
          font-size: 14px;
          text-align: center;
          &:hover {
            text-decoration:underline;
          }
        }
      }
    }
  }
  .inner-toolbar {
    width: 100%;
    display: block !important;
    .btn-box {
      margin-bottom: 20px;
    }
  }
  .goods-info {
    display: flex;
    align-items: center;
    .drawer-text {
      color: #006BB4;
      cursor: pointer;
      &:hover {
        text-decoration:underline;
      }
    }
    .goods-image {
      img {
        width: 80px;
        height: 80px;
      }
    }
    .goods-name-box {
      text-align: left;
      .goods-name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }

  .goods-list ::v-deep .pop-sku {
    .toolbar {
      display: none;
    }
    .el-form-item__label {
      text-align: left;
    }
    .el-table__header-wrapper {
      th, tr {
        background-color: #e1e1e1;
      }
    }
    .el-table__body-wrapper {
      max-height: 440px;
      overflow-y: scroll;
    }
    .goods-stock-info {
      padding-bottom: 20px;
      .goods_title {
        color: #919EAF;
        margin-right: 40px;
      }
    }
  }


  .toolbar-search {
    margin-right: 10px;
    width: 20%;
  }

  div.toolbar-btns {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    .btns-box {
      display: flex;
    }
    div {
      span {
        display: inline-block;
        font-size: 14px;
        color: #606266;
      }
    }
    .conditions {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;
      min-width: 18%;
      .choose-machine {
        width: 60%;
      }
    }
  }

  /*下架原因*/
  .under-reason {
    color: red;
    cursor: pointer;
  }
  .edit-stock {
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover .el-icon-edit {
      display: block;
    }
    .el-icon-edit {
      display: none;
    }
  }
</style>
