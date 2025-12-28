<template>
  <el-table v-if="giftList && giftList.length" :data="giftList" class="gift-table" style="width: 100%">
    <el-table-column label="赠品列表" width="100" align="center">
      <template slot-scope="scope">
        <img src="../../assets/images/icon-color-point.png" class="goods-image" v-if="scope.row.meta_key === 'GIFT_POINT'">
        <img src="../../assets/images/icon-color-coupon.png" class="goods-image" v-else-if="scope.row.meta_key === 'COUPON'">
        <img src="../../assets/images/baoyou.png" class="goods-image" v-else-if="scope.row.meta_key === 'FREE_FREIGHT'">
        <img :src="scope.row.meta_value.giftImage" class="goods-image" v-else>
      </template>
    </el-table-column>
    <el-table-column label="赠品名称" align="center">
      <template slot-scope="scope">
        <div style="display: inline-block">
          <span v-if="scope.row.meta_key === 'FREE_FREIGHT'">免邮费</span>
          <span v-else class="goods-name">{{ scope.row.meta_value.giftName }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="赠品价值" width="120" align="center">
      <template slot-scope="scope">
        <span v-if="scope.row.meta_key === 'GIFT_POINT'">{{scope.row.meta_value.giftValue + '积分'}}</span>
        <span v-else-if="scope.row.meta_key === 'FREE_FREIGHT'"></span>
        <span v-else>
          <!-- {{ scope.row.meta_value.giftValue | unitPrice }} -->
          <en-price :price="scope.row.meta_value.giftValue" :sizeRatio="0.9" />
        </span>
      </template>
    </el-table-column>
    <el-table-column label="描述" width="100" align="center">
      <template slot-scope="scope">
        <span v-if="scope.row.meta_key === 'COUPON'">满{{scope.row.meta_value.thresholdPrice}},减{{scope.row.meta_value.giftValue}}</span>
        <span v-if="scope.row.meta_key === 'GIFT_POINT'">赠送{{scope.row.meta_value.giftValue + '积分'}}</span>
      </template>
    </el-table-column>
    <el-table-column label="" width="90"/>
    <el-table-column label="" width="120"/>
  </el-table>
</template>

<script>
// 订单附赠赠品和优惠券列表
export default {
  name: 'gift-list',
  props: ['gift-list'],
  created() {
    this.handleGift()
  },
  methods: {
    /* 处理赠品 */
    handleGift() {
      this.giftList.forEach((gift) => {
        gift.meta_value = JSON.parse(gift.meta_value)
        if (gift.meta_key === 'COUPON') {
          gift.meta_value = gift.meta_value[0]
          gift.meta_value = { giftValue: gift.meta_value.couponPrice, giftName: gift.meta_value.title, thresholdPrice: gift.meta_value.couponThresholdPrice, giftImage: '../../assets/images/coupon.png' }
        } else if (gift.meta_key === 'GIFT') {
          gift.meta_value = gift.meta_value[0]
          gift.meta_value = {giftValue: gift.meta_value.giftPrice, giftName: gift.meta_value.giftName, giftImage: gift.meta_value.giftImg}
        } else if (gift.meta_key === 'GIFT_POINT') {
          gift.meta_value = {giftValue: gift.meta_value, giftName: '积分', giftImage: 'http://shoptnt-statics.oss-cn-beijing.aliyuncs.com/test/goods/552BE6AE90C246F1BC890CFB27EA3352.jpeg_400x400'}
        }
      })
      console.log(this.giftList, 999)
    }
  }
}
</script>

<style lang="scss" scoped>
.gift-table ::v-deep .el-table__header th:first-child .cell {
  font-size: 16px;
  font-weight: bold;
}
.el-table {
  border: 1px solid #ebeef5;
  border-bottom: none;
  font-size: 12px;
  margin-top: 10px;
}
.el-table ::v-deep .el-table__header .cell {
  text-align: center
}
.el-table ::v-deep .el-table__body .cell {
  text-align: center
}
.goods-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.goods-image {
  width: 50px;
  height: 50px;
}
</style>
