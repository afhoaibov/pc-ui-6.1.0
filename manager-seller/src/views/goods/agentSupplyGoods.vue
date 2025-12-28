<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="出售中商品" name="sellingGoods">
        <en-table-layout
          :tableData="sellingTableData.data">
          <template slot="table-columns">
            <el-table-column label="商品名称" min-width="450">
              <template slot-scope="scope">
                <div class="goods-info">
                  <div class="goods-image" style="margin: 0 20px;">
                    <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'">
                      <img :src="scope.row.thumbnail"/>
                    </a>
                  </div>
                  <div class="goods-name-box">
                    <div class="goods-name">
                      <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;"><span v-html="scope.row.goods_name">{{ scope.row.goods_name }}</span></a>
                    </div>
                    <span>商品编号:{{scope.row.sn}}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="售卖价格" width="150">
              <template slot-scope="scope">{{ scope.row.price | unitPrice }}</template>
            </el-table-column>
            <el-table-column label="成本价格" width="150">
              <template slot-scope="scope">{{ scope.row.cost | unitPrice }}</template>
            </el-table-column>
            <el-table-column label="实际库存" width="150">
              <template slot-scope="scope" slot="header">
                <span>实际库存</span>
                <el-tooltip effect="dark" content="订单发货时扣减" placement="top">
                  <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
                </el-tooltip>
              </template>
              <template slot-scope="scope">{{ scope.row.quantity }}
                <i v-if="scope.row.is_edit" class="iconfont el-icon-edit" style="margin-left: 5px; font-size: 15px; cursor:pointer;" @click="handleStockGoods(scope.row)"></i>
              </template>
            </el-table-column>
            <el-table-column label="可用库存" width="150">
              <template slot-scope="scope" slot="header">
                <span>可用库存</span>
                <el-tooltip effect="dark" content="创建订单时扣减" placement="top">
                  <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
                </el-tooltip>
              </template>
              <template slot-scope="scope">{{ scope.row.enable_quantity }}</template>
            </el-table-column>
            <el-table-column label="上架时间" width="150">
              <template slot-scope="scope">{{ scope.row.create_time | unixToDate('yyyy-MM-dd hh:mm') }}</template>
            </el-table-column>
            <el-table-column  label="供应商" width="150">
              <template slot-scope="scope">{{ scope.row.seller_name }}</template>
            </el-table-column>
            <el-table-column label="操作" width="300" style="text-align: left;">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleUnderGoods(scope.row)">下架
                </el-button>
              </template>
            </el-table-column>
          </template>
          <el-pagination
            slot="pagination"
            v-if="sellingPageData"
            @size-change="handleSellingPageSizeChange"
            @current-change="handleSellingPageCurrentChange"
            :current-page="sellingPageData.page_no"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="sellingPageData.page_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="sellingPageData.data_total">
          </el-pagination>
        </en-table-layout>
      </el-tab-pane>
      <el-tab-pane label="供应商商品库" name="aboveGoods">
        <en-table-layout
          :tableData="aboveTableData.data">
          <template slot="table-columns">
            <el-table-column label="商品名称" min-width="450">
              <template slot-scope="scope">
                <div class="goods-info">
                  <div class="goods-image" style="margin: 0 20px;">
                    <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'">
                      <img :src="scope.row.thumbnail"/>
                    </a>
                  </div>
                  <div class="goods-name-box">
                    <div class="goods-name">
                      <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;"><span v-html="scope.row.goods_name">{{ scope.row.goods_name }}</span></a>
                    </div>
                    <span>商品编号:{{scope.row.sn}}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="成本价格" width="150">
              <template slot-scope="scope">{{ scope.row.price | unitPrice }}</template>
            </el-table-column>
            <el-table-column label="实际库存" width="150">
              <template slot-scope="scope" slot="header">
                <span>实际库存</span>
                <el-tooltip effect="dark" content="订单发货时扣减" placement="top">
                  <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
                </el-tooltip>
              </template>
              <template slot-scope="scope">{{ scope.row.quantity }}
                <i v-if="scope.row.is_edit" class="iconfont el-icon-edit" style="margin-left: 5px; font-size: 15px; cursor:pointer;" @click="handleStockGoods(scope.row)"></i>
              </template>
            </el-table-column>
            <el-table-column label="可用库存" width="150">
              <template slot-scope="scope" slot="header">
                <span>可用库存</span>
                <el-tooltip effect="dark" content="创建订单时扣减" placement="top">
                  <i class="iconfont el-icon-info" style="margin-left: 5px;"></i>
                </el-tooltip>
              </template>
              <template slot-scope="scope">{{ scope.row.enable_quantity }}</template>
            </el-table-column>
            <el-table-column label="上架时间" width="150">
              <template slot-scope="scope">{{ scope.row.create_time | unixToDate('yyyy-MM-dd hh:mm') }}</template>
            </el-table-column>
            <el-table-column  label="供应商" width="150">
              <template slot-scope="scope">{{ scope.row.seller_name }}</template>
            </el-table-column>
            <el-table-column label="操作" width="300" style="text-align: left;">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleAboveGoods(scope.row)">上架
                </el-button>
              </template>
            </el-table-column>
          </template>
          <el-pagination
            slot="pagination"
            v-if="abovePageData"
            @size-change="handleAbovePageSizeChange"
            @current-change="handleAbovePageCurrentChange"
            :current-page="abovePageData.page_no"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="abovePageData.page_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="abovePageData.data_total">
          </el-pagination>
        </en-table-layout>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="上架商品" :visible.sync="aboveGoodsDialog" width="30%">
      <el-form :model="goodsData" ref="goodsData" label-width="100px" v-if="goodsSkunums === 1" :rules="rules">
        <el-form-item label="商品分类" prop="category">
          <en-category-picker :api="goodsApi" @changed="categoryChanged"/>
        </el-form-item>
      </el-form>
      <el-form :model="goodsSkuData" ref="goodsSkuData" label-width="100px" v-if="goodsSkunums === 1" :rules="rules">
        <el-form-item label="成本价格">
          <el-input  v-model="price" :disabled="true"/>
        </el-form-item>
        <el-form-item label="销售价格" v-if="goodsSkunums === 1">
          <el-input  v-model="goodsSkuData.price"/>
        </el-form-item>
      </el-form>
      <en-table-layout
        :tableData="goodsSkuData"
        v-if="goodsSkunums > 1"
        :stripe="false">
        <template slot="table-columns">
          <el-table-column
            v-for="(item, index) in goodsSkuTitle"
            v-if="item.prop !== 'sku_id'"
            :label="item.label"
            :key="index">
            <template slot-scope="scope">
              <el-input v-if="item.prop === 'price'" style="width: 50%" v-model="scope.row.price"/>
              <span v-if="item.prop !== 'price'" >{{ scope.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </template>
      </en-table-layout>
      <div slot="footer" class="dialog-footer">
        <el-button @click="aboveGoodsDialog = false">取 消</el-button>
        <el-button type="primary" @click="reserveSkuGoods">上 架</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  export default {
    name: 'agentSupplyGoods',
    data() {
      return {
        activeName: 'sellingGoods',
        /** 出售中商品列表数据 **/
        sellingTableData: [],
        /** 待上架商品列表数据 **/
        aboveTableData: [],
        /** 出售中列表参数**/
        sellingParams: {
          page_no: 1,
          page_size: 10
        },
        /** 带上架列表参数**/
        aboveParams: {
          page_no: 1,
          page_size: 10
        },
        /** 出售中列表分页数据 */
        sellingPageData: [],
        /** 待上架列表分页数据 */
        abovePageData: [],
        /** 是否显示上架弹框 **/
        aboveGoodsDialog: false,
        /** 商品分组选择器列表api*/
        goodsApi: 'seller/goods/category/seller/children',
        /** 成本价格 */
        price: '',
        goodsSkunums: 0,
        goodsSkuTitle: [],
        goodsSkuData: null,
        /** 当前商品id*/
        goods_id: '',
        /** 当前商品分组id*/
        goodsData: {
          category_id: ''
        },
        /** 校验规则 */
        rules: {
          category: [
            { required: true, message: '商品分组不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
      this.GET_AboveGoods()
      this.GET_SellingGoods()
    },
    methods: {
      /** 切换面板 **/
      handleClick(tab, event) {
        this.activeName = tab.name
      },
      /** 分类选择组件值发生改变 */
      categoryChanged(data) {
        this.goodsData.category_id = data.category_id || ''
      },
      /** 下架*/
      handleUnderGoods(row) {
        this.$confirm('确认下架此商品, 是否继续?', '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUnder(row.goods_id).then(() => {
            this.$message.success('下架成功')
            this.GET_AboveGoods()
            this.GET_SellingGoods()
          })
        })
      },
      /** 上架弹框显示 **/
      handleAboveGoods(row) {
        this.price = row.price
        this.goods_id = row.goods_id
        this.aboveGoodsDialog = true
        API_goods.getSkuGoodsList(row.goods_id).then(response => {
          this.goodsSkuTitle = this.goodsSkuData = []
          this.goodsSkunums = response.length
          if (response.length > 1) {
            this.$nextTick(() => {
              response.forEach((key) => {
                this.goodsSkuTitle = [
                  { label: 'SKU', prop: 'sku' },
                  { label: '成本价格', prop: 'cost' },
                  { label: '销售价格', prop: 'price' }
                ]
                // 构造表结构
                let _skuData = []
                key.spec_list.forEach(elem => {
                  _skuData.push(elem.spec_value)
                })
                _skuData = _skuData.join('/')
                const _key = {
                  sku: _skuData,
                  sku_id: key.sku_id,
                  cost: key.cost,
                  price: key.price
                }
                this.goodsSkuData.push(Object.assign(_key))
              })
            })
          } else {
            this.goodsSkuData = response[0]
          }
        })
      },
      /** 上架表单提交 */
      reserveSkuGoods() {
        if (this.goodsData.category_id === '') {
          this.$message.error('请选择商品分组！')
          return false
        }
        let _params = []
        if (Array.isArray(this.goodsSkuData)) {
          _params = this.goodsSkuData.map((elem) => {
            return {
              cost: elem.cost,
              price: elem.price,
              sku_id: elem.sku_id
            }
          })
        } else {
          _params.push({
            cost: this.goodsSkuData.cost,
            price: this.goodsSkuData.price,
            sku_id: this.goodsSkuData.sku_id
          })
        }
        API_goods.aboveSupplyGoods(this.goods_id, _params, this.goodsData.category_id).then(() => {
          this.aboveGoodsDialog = false
          this.GET_AboveGoods()
          this.GET_SellingGoods()
        })
      },
      /** 分页大小发生改变 */
      handleSellingPageSizeChange(size) {
        this.params.page_size = size
        this.GET_SellingGoods()
      },

      /** 分页页数发生改变 */
      handleSellingPageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SellingGoods()
      },
      /** 获取出售中商品列表**/
      GET_SellingGoods() {
        API_goods.getSellingGoodsList(this.sellingParams).then(response => {
          this.sellingTableData = response
          this.sellingPageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      },
      /** 分页大小发生改变 */
      handleAbovePageSizeChange(size) {
        this.params.page_size = size
        this.GET_AboveGoods()
      },

      /** 分页页数发生改变 */
      handleAbovePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_AboveGoods()
      },
      /** 获取待上架商品列表**/
      GET_AboveGoods() {
        API_goods.getAboveGoodsList(this.aboveParams).then(response => {
          this.aboveTableData = response
          this.abovePageData = {
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
  .goods-info {
    display: flex;
    align-items: center;
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
</style>
