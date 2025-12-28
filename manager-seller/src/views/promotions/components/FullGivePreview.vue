<template>
  <div class="bg-in-stock">
    <el-form
      label-width="120px"
      :model="fullGiveForm"
      disabled
      ref="fullGiveForm">
      <!-- 活动标题 -->
      <el-form-item label="活动标题：" prop="title">
        <el-input v-model="fullGiveForm.title" clearable style="width:500px" placeholder="请输入活动标题"/>
      </el-form-item>
      <!-- 活动方式 -->
      <el-form-item label="活动方式：" prop="type">
        <el-radio-group v-model="fullGiveForm.discount_type">
          <el-radio :label="1">满额送</el-radio>
          <el-radio :label="2">满件送</el-radio>
        </el-radio-group>
      </el-form-item>
      <!--生效时间 开始时间--截止时间-->
      <el-form-item label="生效时间：" prop="take_time">
        <el-date-picker
          v-model="fullGiveForm.take_time"
          type="datetimerange"
          value-format="timestamp"
          placement="bottom-start"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[MixinDefaultTime, MixinDefaultTime]"
          :picker-options="{disabledDate(time) {return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime() > endTime }}"
        >
        </el-date-picker>
      </el-form-item>
      <!-- 优惠条件 -->
      <el-form-item label="优惠条件：" required>
        <span style="color:#969696">每级优惠不叠加，如：满足二级优惠条件后则不再享有一级优惠。最多支持五级优惠。</span>
        <div style="padding:10px;">
          <div v-for="(item, c_index) in fullGiveForm.contents" :key="c_index">
            <div
              class="discount-items"
            >
              <div style="float:left;">
                {{c_index+1}}级优惠
              </div>
            </div>
            <el-form-item
              label="优惠门槛：">
              满
              <el-input
              v-if="fullGiveForm.discount_type !== 1"
                v-model="item.threshold"
                :controls="false"
                style="margin:5px; width: 100px;"
              />
              <el-input
              v-else
                v-model="item.threshold"
                :controls="false"
                style="margin:5px; width: 100px;"
              />
              <span v-if="fullGiveForm.discount_type !== 1">件</span>
            </el-form-item>
            <el-form-item label="优惠内容：">
              <el-checkbox label="免邮费" v-model="item.is_free_ship" :true-label=1 :false-label=0></el-checkbox>
            </el-form-item>
            <!--自营店--送积分-->
            <el-form-item prop="point_value" class="discount-model">
              <el-checkbox label="送积分" v-model="item.is_send_point" :true-label=1 :false-label=0 ></el-checkbox>
              <span class="integral-show" v-if="item.is_send_point === 1">
                    <el-input
                      style="width:100px;"
                      size="mini"
                      oninput="value = value.replace(/[^\d]/g,'')"
                      v-model="item.point_value" :maxlength="8"></el-input> 分
                  </span>
            </el-form-item>
            <!-- 送优惠券 -->
            <el-form-item prop="bonus_id" class="discount-model">
              <el-checkbox label="送优惠券" v-model="item.is_send_bonus" :true-label=1 :false-label=0></el-checkbox>
              <el-select
                v-if="item.is_send_bonus === 1"
                v-model="item.bonus_id"
                placeholder="请选择" >
                <el-option
                  v-for="item in couponList"
                  :key="item.coupon_id"
                  :value="item.coupon_id"
                  :label="item.title">
                </el-option>
              </el-select>
            </el-form-item>
            <!--送赠品-->
            <el-form-item prop="gift_id" class="discount-model">
              <el-checkbox label="送礼品" v-model="item.is_send_gift"  :true-label=1 :false-label=0></el-checkbox>
              <el-select
                v-if="item.is_send_gift === 1"
                v-model="item.gift_id"
                placeholder="请选择">
                <el-option
                  v-for="item in giftList"
                  :key="item.gift_id"
                  :label="item.gift_name"
                  :value="item.gift_id">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="参与活动商品：" required>
        <el-radio-group v-model="fullGiveForm.range_type" >
          <el-radio :label="1">全部商品</el-radio>
          <el-radio :label="2">部分商品</el-radio>
        </el-radio-group>
        <span style="color:#969696">已选择({{ fullGiveForm.goods_list.length }})个商品</span>
        <div v-show="fullGiveForm.range_type === 2" style="margin-bottom:10px;">
          <div
            style="
            width: 100%;
            height: 50px;
            line-height: 50px;
            background: #eeeeee;
            margin-top: 20px;
          "
          >
            &nbsp;已选商品列表
          </div>
          <el-table
            :data="fullGiveForm.goods_list"
            ref="bonusTable"
            border
            :cell-style="{ textAlign: 'center' }"
            :header-cell-style="{ textAlign: 'center', background: '#f4f4f4' }"
            style="width: 100%;"
          >
            <!--商品信息-->
            <el-table-column  label="商品信息">
              <template slot-scope="scope">
                <div class="goods-info">
                  <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'">
                    <img :src="scope.row.thumbnail" alt="" class="goods-image">
                  </a>
                  <div>
                    <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;"><span v-html="scope.row.goods_name">{{ scope.row.goods_name }}</span></a>
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 商品价格 -->
            <el-table-column label="商品价格">
              <template slot-scope="scope">
                <div class="sku-list">
                  <span>{{ scope.row.price | unitPrice }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 商品规格 -->
            <el-table-column label="规格SKU">
              <template slot-scope="scope">
                <div class="sku-list">
                  <span v-if="scope.row.specs">{{ scope.row.specs }}</span>
                  <span v-else>{{ scope.row.properties_name }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import * as API_Gift from '@/api/gift'
  import * as API_coupon from '@/api/coupon'
  import * as API_activity from '@/api/activity'

  export default {
    name: 'FullGivePreview',
    props: {
      promotionId: {
        type: String
      }
    },
    data() {
      return {
        /** 优惠券列表 */
        couponList: [],
        /** 赠品id */
        gift_id: '',
        /** 优惠券Id */
        bonus_id: '',
        // 优惠条件
        fullGiveForm: {
          seller_list: [],
          goods_list: [],
          range_type: 1,
          seller_scope: 'ALL',
          type: 0,
          contents: [],
          title: '',
          take_time: '',
          discount_type: 1
        },
        giftList: []
      }
    },
    watch: {
      promotionId: {
        immediate: true,
        handler(val) {
          if (val) {
            this.GET_fullGiveDetail()
          }
        }
      }
    },
    mounted() {
      /** 优惠券列表 */
      this.GET_CouponsList()
      /** 赠品列表 */
      this.GET_giftList()
      // 获取某天23:59:59秒的时间戳
      this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
    },
    methods: {
      /** 获取优惠券列表 */
      GET_CouponsList() {
        API_coupon.listActivityCoupons().then(response => {
          this.couponList = response
        })
      },

      /** 获取赠品列表 */
      GET_giftList() {
        API_Gift.getGiftsAllList().then(response => {
          this.giftList = response
        })
      },

      // 添加区间
      addConditions(data) {
        if (this.fullGiveForm.contents.length === 5) {
          this.$message.error('最多5个阶梯等级!')
          return
        }
        if (data) {
          this.fullGiveForm.contents.push(data)
        } else {
          this.fullGiveForm.contents.push({ threshold: '', is_free_ship: 0, is_send_point: 0, point_value: '', is_send_bonus: 0, is_send_gift: 0 })
        }
      },

      // 获取活动详情
      async GET_fullGiveDetail() {
        const res = await API_activity.getFullGiveActivityDetails(this.promotionId)
        this.fullGiveForm.contents = []
        res.step_list.map(item => {
          this.addConditions(item)
        })
        this.fullGiveForm.discount_type = res.discount_type
        this.fullGiveForm.range_type = res.range_type
        this.fullGiveForm.goods_list = res.goods_list
        this.fullGiveForm.title = res.title
        this.fullGiveForm.take_time = [parseInt(res.start_time) * 1000, parseInt(res.end_time) * 1000]
      }
    }
  }
</script>

<style scoped lang="scss">
.discount-items {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #eeeeee;
  margin-top: 20px;
  padding-left:10px;
}
.bg-in-stock {
  background-color: #fff;
  margin: 10px;
  .range-form {
    ::v-deep .el-form-item__content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    ::v-deep .el-form-item__error {
      width: 100%;
    }
    ::v-deep .el-table__row td {
      padding-bottom: 0;
    }
    ::v-deep .el-cascader-node>.el-radio, .el-radio:last-child{
      margin-right: 30px;
    }
  }
  /*平铺*/
  div.base-info-item {
    h4 {
      padding:0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }
    h4 + div {
      margin-top: 15px;
    }
    .el-form-item {
      margin-left: 5%;
      min-width: 300px;
    }
    .el-form-item__content {
      margin-left: 120px;
      text-align: left;
    }
    p.goods-group-manager {
      padding-left: 12.3%;
      text-align: left;
      color: #999;
      font-size: 13px;
    }
  }

  /*商品表格信息*/
  .goods-table {
    ::v-deep thead>tr {
      th:nth-child(2) {
        text-align: left !important;
      }
    }
  }
  /*商品图片*/
  .goods-image {
    width: 50px;
    height: 50px;
  }
  .discount-model{
    margin-left: 122px;
  }
}
</style>
