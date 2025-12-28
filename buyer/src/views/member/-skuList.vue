<template>
  <el-table :data="skuList" style="width: 100%" class="sku-table">
    <el-table-column label="商品列表" align="center" width="100">
      <template slot-scope="scope">
        <router-link :to="'/goods/' + scope.row.goods_id" target="_blank">
          <img :src="scope.row[image]" class="goods-image">
        </router-link>
      </template>
    </el-table-column>
    <el-table-column label="商品名称" align="center">
      <template slot-scope="scope">
        <div style="display: inline-block">
          <router-link :to="'/goods/' + scope.row.goods_id" target="_blank" class="goods-name">
            <span class="goods-tag" v-if="order_type === 'VIRTUAL'">虚拟商品</span>
<!--            <span v-if="order_type === 'PINTUAN'" class="assemble-color">多人拼团</span>-->
            <span>{{ scope.row[name] }}</span>
          </router-link>
          <p v-if="scope.row.spec_list" class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
          <p style="display: flex; justify-content: center;" v-if="scope.row.promotion_tags && scope.row.promotion_tags.length">
            <span
              class="sku-act-tag"
              v-for="(tag, index) in scope.row.promotion_tags"
              :key="index">
              {{ tag }}
            </span>
          </p>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="商品单价" align="center" width="120">
      <template slot-scope="scope">
        <div v-if="scope.row.point && scope.row.point !== 0">
          <span v-if="scope.row.original_price">
            <en-price :price="scope.row.original_price" size="12"/>+
          </span>{{ scope.row.point }}积分
        </div>
        <div v-else><en-price :price="scope.row.original_price" size="12"/></div>
      </template>
    </el-table-column>
    <el-table-column label="数量" align="center" width="90">
      <template slot-scope="scope">{{ scope.row[num] }}</template>
    </el-table-column>
    <el-table-column label="商品小计" align="center" width="120">
      <template slot-scope="scope">
        <div v-if="scope.row.point && scope.row.point !== 0">
          <span v-if=" scope.row.original_price">
            <en-price :price="scope.row[num] * scope.row.original_price" size="12"/>+
          </span>{{ scope.row.point_total }}积分
        </div>
        <div v-else><en-price :price="scope.row[num] * scope.row.original_price" size="12"/></div>
      </template>
    </el-table-column>
    <template v-if="isVirtualOrder && pay_status === 'PAY_YES' && order_status !== 'CANCELLED'">
      <el-table-column label="有效期至" align="center" width="100">
        <template slot-scope="scope">{{ scope.row.expired_time | unixToDate  }}</template>
      </el-table-column>
      <el-table-column label="兑换码" align="center" >
        <template slot-scope="scope">
          <el-button size="mini" type="primary" v-if="isExpired(scope.row.expired_time)" disabled >已过期</el-button>
          <template v-else>
            <el-button size="mini" type="primary" v-if="!scope.row.use_redeem" @click="showQRCode(scope.row)">查看兑换码</el-button>
            <el-button size="mini" type="primary" v-else disabled >已核销</el-button>
          </template>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
export default {
  name: 'member-sku-list',
  props: {
    order_type: {
      type: String
    },
    pay_status: {
      type: String
    },
    order_status: {
      type: String
    },
    skuList: {
      type: Array
    },
    image: {
      default: 'goods_image'
    },
    name: {
      default: 'goods_name'
    },
    price: {
      default: 'price'
    },
    num: {
      default: 'num'
    },
    total: {
      default: 'total'
    }
  },
  computed: {
    isExpired() {
      return (time) => {
        return Date.now() > (time * 1000)
      }
    },
    isVirtualOrder() {
      if (this.order_type === 'VIRTUAL') return true
      return this.skuList.some(item => item.goods_type === 'VIRTUAL')
    }
  },
  methods: {
    showQRCode(row) {
      this.$emit('showQRCode', row)
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;
.goods-tag {
  padding: 1px 4px;
  color: #f42424;
  border: 1px solid #f42424;
  border-radius: 4px;
  font-size: 10px;
  min-width: 50px;
}
.sku-table ::v-deep .el-table__header th:first-child .cell {
  font-size: 16px;
  font-weight: bold;
}
.el-table {
  border: 1px solid #ebeef5;
  border-bottom: none;
  font-size: 12px;
}
.goods-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  .assemble-color {
    color: theme.$color-main;
    border: 1px solid theme.$color-main;
    border-radius: 3px;
  }
}
.goods-image {
  width: 50px;
  height: 50px;
}
.sku-act-tag {
  display: inline-block;
  padding: 0 5px;
  line-height: 15px;
  border: 1px solid theme.$color-main;
  color: theme.$color-main;
  border-radius: 4px;
}
</style>
