<template>
  <div class="auth-goods-list">
    <en-table-layout
      toolbar
      pagination
      :tableData="tableData"
      :height="700"
      :loading="loading"
      :showDrawer="showDrawer"
      :drawerTitle="currentRow.goods_name"
      @closeDrawer="showDrawer = false">
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <!--商品类型-->
          <div  class="conditions">
            <span>商品类型：</span>
            <el-select
              class="choose-machine"
              v-model="params.goods_type"
              placeholder="请选择商品类型"
              @change="changeGoodsType"
              clearable>
              <el-option key="NORMAL" label="实物商品" value="NORMAL"/>
              <el-option key="VIRTUAL" label="虚拟商品" value="VIRTUAL"/>
            </el-select>
          </div>

          <div class="conditions">
            <span>积分商品：</span>
            <el-switch
                v-model="params.point_disable"
                active-color="#13ce66"
                active-value="1"
                @change="GET_GoodsList">
            </el-switch>
          </div>
        </div>
        <div class="toolbar-search">
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
        <el-table-column label="价格" width="180">
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
          <template slot-scope="scope">{{ scope.row.quantity }}</template>
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
        <el-table-column label="操作" min-width="200" style="text-align: left;">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              @click="handleEditGoods(scope.row)">编辑
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
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import GoodsBaseInfo from './components/GoodsBaseInfo'

  export default {
    name: 'authGoodsList',
    components: {
      GoodsBaseInfo
    },
    data() {
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
          point_disable: '',
          market_enable: 1, // 0 下架 1 上架
          is_auth: 0
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

        /** 当前商品id*/
        goodsId: '',

        /** 要合并的列的位置数组 */
        concactArray: [],

        /** 店铺信息 */
        shopInfo: this.$store.getters.shopInfo,
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
        immediate: true,
        deep: true,
        handler(newVal) {
          this.showDrawer = false
          this.currentRow = {}
          if (newVal.name !== 'authGoodsList') return
          console.log(newVal.query)
          this.params = { ...this.params, ...newVal.query }
          this.GET_GoodsList()
        }
      }
    },
    methods: {
      handlePreview(row) {
        this.showDrawer = true
        this.currentRow = row
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

      GET_GoodsList() {
        this.loading = true
        console.log(this.params)
        API_goods.getGoodsList(this.params).then(response => {
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

      /** 编辑商品 isdraft 商品列表1*/
      handleEditGoods(row) {
        this.$router.push({ name: 'goodPublish', params: { goodsid: row.goods_id, isdraft: 1, callback: this.GET_GoodsList }})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .auth-goods-list ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }

  .auth-goods-list ::v-deep .el-table {
    width: 100%;
    overflow-x: scroll;
    & td:not(.is-left) {
      text-align: center;
    }
  }

  .inner-toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .auth-goods-list ::v-deep .pop-sku {
    .toolbar {
      display: none;
    }
    .el-dialog__body {
      .el-table {
        border: 1px solid #e5e5e5;
      }
    }
    .el-table__body-wrapper {
      max-height: 400px;
      overflow-y: scroll;
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

  .auth-goods-list ::v-deep div.cell {
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

</style>
