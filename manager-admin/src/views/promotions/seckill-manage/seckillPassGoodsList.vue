<template>
  <en-table-layout
    :tableData="tableData.data"
    :loading="loading"
  >

    <div slot="toolbar" class="inner-toolbar">
      <div class="toolbar-btns"></div>
      <div class="toolbar-search">
        <en-table-search
          @search="searchEvent"
          @advancedSearch="advancedSearchEvent"
          advanced
          advancedWidth="465"
          placeholder="请输入商品名称"
        >
          <template slot="advanced-content">
            <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
              <el-form-item label="商品名称">
                <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
              </el-form-item>
              <el-form-item label="店铺名称">
                <en-shop-picker @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
              </el-form-item>
            </el-form>
          </template>
        </en-table-search>
      </div>
    </div>

    <template slot="table-columns">
      <el-table-column label="抢购时刻">
        <template slot-scope="scope">{{ scope.row.time_line < 10 ? '0' + scope.row.time_line : scope.row.time_line }} : 00</template>
      </el-table-column>
      <el-table-column label="商品名称" width="400">
        <template slot-scope="scope">
          <!--<a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" :class="[isO2O ? 'o2o-goods-name' : 'goods-name']" v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a>-->
          <div class="goods-info">
            <div class="goods-image" style="margin: 0 20px;">
              <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'">
                <img :src="scope.row.goods_image"/>
              </a>
            </div>
            <div class="goods-name-box">
              <div class="name" :class="[isO2O ? '' : 'goods-name']">
                <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;"><span v-html="scope.row.goods_name">{{ scope.row.goods_name }}</span></a>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="specs" label="规格SKU"/>
      <el-table-column prop="seller_name" label="店铺名称"/>
      <el-table-column prop="price" :formatter="MixinFormatPrice" label="活动价格"/>
      <el-table-column prop="original_price" :formatter="MixinFormatPrice" label="商品原价"/>
      <!-- <el-table-column prop="sold_quantity" label="售空数量" width="100"/> -->
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
</template>

<script>
  import * as API_Promotion from '@/api/promotion'

  export default {
    name: 'seckillPassGoodsList',
    data() {
      return {
        // 列表loading状态
        loading: false,
        // 列表参数
        params: {
          page_no: 1,
          page_size: 10,
          status: 'PASS',
          seckill_id: this.$route.params.id
        },
        // 列表数据
        tableData: '',
        /** 高级搜索数据 */
        advancedForm: {}
      }
    },
    watch: {
      $route: {
        handler() {
          this.params.seckill_id = this.$route.params.id
          this.GET_SeckillPassGoodsList()
        },
        immediate: true
      }
    },
    // mounted() {
    //   this.GET_SeckillPassGoodsList()
    // },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_SeckillPassGoodsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SeckillPassGoodsList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.goods_name = data
        if (!data) delete this.params.goods_name
        this.GET_SeckillPassGoodsList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        this.params = {
          ...this.params,
          ...this.advancedForm
        }
        this.params.page_no = 1
        this.GET_SeckillPassGoodsList()
      },

      /** 获取规格列表 */
      getSkuList(val) {
        const _val = typeof val === 'string' ? JSON.parse(val) : val
        if (_val) {
          let _specs = []
          _val.forEach(elem => {
            _specs.push(elem.spec_value)
          })
          _specs = _specs.join('/')
          return _specs
        }
        return '/'
      },

      /** 获取待审核商品列表 */
      GET_SeckillPassGoodsList() {
        this.loading = true
        API_Promotion.getSeckillGoods(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .goods-name {
    color: #4183c4;
    &:hover { color: #f42424 }
  }
  .o2o-goods-name {
    color: #4183c4;
  }
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
      .name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .goods-name {
        a:hover {
          color: #f42424 !important;
        }
      }
    }
  }
</style>
