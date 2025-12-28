<template>
  <div class="distribution-goods-list">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :height="700"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.goods_name"
      @closeDrawer="showDrawer = false"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <!--商品状态 上架 下架-->
          <div class="conditions">
            <span>是否参与：</span>
            <el-select
              class="choose-machine"
              v-model="params.flag"
              @change="handleChangeFlag"
              clearable>
              <el-option
                label="参与"
                :value="1"></el-option>
                <el-option
                label="不参与"
                :value="0"></el-option>
            </el-select>
          </div>
          <en-table-search @search="searchEvent" placeholder="请输入商品名称或编号"/>
        </div>
      </div>
      <template slot="table-columns">
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
        <el-table-column label="分销规则">
          <template slot-scope="scope">
            <span v-if="!scope.row.join_flag">-</span>
            <div class="goods-rules" v-else>
              <span>一级佣金比例：{{scope.row.ratio_lv1}}%</span>
              <span>二级佣金比例：{{scope.row.ratio_lv2}}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate('yyyy-MM-dd hh:mm') }}</template>
        </el-table-column>
        <el-table-column  label="状态">
          <template slot-scope="scope">
            <span>{{ scope.row | marketStatus }}</span>
            <div class="under-reason" v-if="scope.row.market_enable === 0" @click="showUnderReason(scope.row)">(下架原因)</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="left">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleEditGoods(scope.row)">设置佣金
            </el-button>
            <el-button
              size="mini"
              type="text"
              v-if="scope.row.join_flag === 0"
              @click="setJoinFlag(scope.row)">参与
            </el-button>
            <el-button
              size="mini"
              type="text"
              style="color: #F56C6C;"
              v-if="scope.row.join_flag === 1"
              @click="setJoinFlag(scope.row)">不参与
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

    <!--下架原因-->
    <el-dialog title="下架原因" :visible.sync="isShowUnderReason" width="17%" >
      <div align="center">{{ under_reason }}</div>
    </el-dialog>

    <!--佣金设置-->
    <el-dialog title="设置佣金" :visible.sync="showSettingDialog" width="50%" class="pop-sku">
      <div class="tips">1.设置商品分销的佣金</div>
      <div class="goods-info border-bottom">
        <div class="goods-image" style="margin: 0 20px;">
          <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${settingGoods.goods_id}`" :target="isO2O ? '' : '_blank'">
            <img :src="settingGoods.thumbnail"/>
          </a>
        </div>
        <div class="goods-name-box">
          <div class="goods-name">
            <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${settingGoods.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;"><span v-html="settingGoods.goods_name">{{ settingGoods.goods_name }}</span></a>
          </div>
          <div>
            商品编号：
            <clipboard :text="settingGoods.sn" />
          </div>
          <div>
            商品ID：
            <clipboard :text="settingGoods.goods_id" />
          </div>
        </div>
      </div>

      <el-form
        :model="settingGoodsData"
        ref="settingGoodsForm"
        style="width: 50%;"
        class="setting-form"
        label-width="120px"
        @submit.native.prevent>
        <el-form-item label="是否参与：" prop="join_flag" >
          <el-radio v-model="settingGoodsData.join_flag" :label="1">参与</el-radio>
          <el-radio v-model="settingGoodsData.join_flag" :label="0">不参与</el-radio>
        </el-form-item>
        <template v-if="settingGoodsData.join_flag">
          <el-form-item label="一级佣金比例：" prop="ratio_lv1" >
            <el-input
              oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
              v-model="settingGoodsData.ratio_lv1">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="二级佣金比例：" prop="ratio_lv2" >
            <el-input
              oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
              v-model="settingGoodsData.ratio_lv2">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSettingDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitEvent">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import { CategoryPicker } from '@/components'
  import GoodsBaseInfo from './components/GoodsBaseInfo'

  export default {
    name: 'goodsList',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      GoodsBaseInfo
    },
    data() {
      return {
        /** 店铺信息 */
        shopInfo: this.$store.getters.shopInfo,

        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          flag: ''
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 佣金设置显示*/
        showSettingDialog: false,

        /** 当前设置商品 */
        settingGoods: {},

        /** 当前设置商品from */
        settingGoodsData: {},

        /** 是否显示下架原因 */
        isShowUnderReason: false,

        /** 下架原因 */
        under_reason: '',
        // 侧边预览显隐
        showDrawer: false,
        // 当前预览商品数据
        currentRow: {}
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
        handler(newVal) {
          this.showDrawer = false
          this.currentRow = {}
        }
      }
    },
    mounted() {
      this.getGoodsDistrbutionGoodsList()
    },
    methods: {
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
      },
      /** 获取分销商品列表 */
      getGoodsDistrbutionGoodsList() {
        this.loading = true
        API_goods.getDistributionGoodsList(this.params).then(response => {
          this.loading = false
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
          this.tableData = response.data
        })
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getGoodsDistrbutionGoodsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getGoodsDistrbutionGoodsList()
      },
      /** 切换参与状态 */
      handleChangeFlag() {
        this.params.page_no = 1
        this.getGoodsDistrbutionGoodsList()
      },

      /** 佣金设置提交 */
      submitEvent() {
        this.$refs.settingGoodsForm.validate((valid) => {
          if (valid) {
            API_goods.settingGoodsRebate(this.settingGoodsData).then(res => {
              this.$message.success('设置成功')
              this.showSettingDialog = false
              this.getGoodsDistrbutionGoodsList()
            })
          }
        })
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          page_no: 1,
          name: data
        }
        this.getGoodsDistrbutionGoodsList()
      },

      /** 设置佣金参与状态 */
      setJoinFlag(goods) {
        const params = {
          goods_id: goods.goods_id,
          join_flag: goods.join_flag ? 0 : 1,
          ratio_lv1: goods.ratio_lv1,
          ratio_lv2: goods.ratio_lv2
        }
        API_goods.settingGoodsRebate(params).then(res => {
          this.$message.success('设置成功')
          this.getGoodsDistrbutionGoodsList()
        })
      },

      /** 显示下架原因 */
      showUnderReason(row) {
        this.isShowUnderReason = false
        this.isShowUnderReason = true
        this.under_reason = row.under_message
      },

      /** 设置佣金*/
      handleEditGoods(row) {
        this.settingGoods = row
        this.settingGoodsData = {
          goods_id: row.goods_id,
          join_flag: row.join_flag,
          ratio_lv1: row.ratio_lv1,
          ratio_lv2: row.ratio_lv2
        }
        this.showSettingDialog = true
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .distribution-goods-list {
    ::v-deep .el-table--scrollable-x .el-table__body-wrapper {
      overflow-x: inherit;
    }
    ::v-deep div.toolbar {
      height: 70px;
      padding: 20px 0;
    }
    ::v-deep .el-table {
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
  }

  .setting-form {
    padding-top: 40px;
  }

  .inner-toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
  }
  .goods-rules {
    display: flex;
    flex-direction: column;
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

  .distribution-goods-list ::v-deep .pop-sku {
    .tips {
      border: 1px solid #fbeed5;
      color: #c09853;
      background-color: #fcf8e3;
      margin-bottom: 10px;
      padding: 10px;
    }
    .border-bottom {
      border-bottom: 1px dashed #999;
      padding-bottom: 30px;
    }
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
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
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
      min-width: 24.5%;
      .choose-machine {
        width: 60%;
      }
    }
  }

  .distribution-goods-list ::v-deep div.cell {
    overflow:hidden;

    text-overflow:ellipsis;

    display:-webkit-box;

    -webkit-box-orient:vertical;

    -webkit-line-clamp:2;
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
