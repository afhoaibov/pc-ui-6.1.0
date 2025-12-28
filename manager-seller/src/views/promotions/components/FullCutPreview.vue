<template>
  <div class="bg-in-stock">
    <el-form
      label-width="120px"
      :model="fullReductionForm"
      ref="fullReductionForm"
      disabled>
      <!-- 活动标题 -->
      <el-form-item label="活动标题：" prop="title">
        <el-input
          v-model="fullReductionForm.title"
          style="width:500px"
          placeholder="请输入活动标题"/>
      </el-form-item>
      <!-- 活动方式 -->
      <el-form-item label="活动方式：" prop="discount_type">
        <el-radio-group v-model="fullReductionForm.discount_type">
          <el-radio :label="1">满额减</el-radio>
          <el-radio :label="2">满件减</el-radio>
        </el-radio-group>
      </el-form-item>
      <!--生效时间 开始时间--截止时间-->
      <el-form-item label="生效时间：" prop="take_time">
        <el-date-picker
          v-model="fullReductionForm.take_time"
          type="datetimerange"
          value-format="timestamp"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          placement="bottom-start"
          :default-time="[MixinDefaultTime, MixinDefaultTime]"
          :picker-options="{disabledDate(time) {return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime() > endTime }}">
        </el-date-picker>
      </el-form-item>
      <!-- 优惠条件 -->
      <el-form-item label="优惠条件：" required>
        <span style="color:#969696">可设置阶梯优惠,最多5个阶梯等级</span>
        <div style="padding:10px;">
          <el-form ref="bonusForm" :model="bonusForm" class="range-form">
            <el-table :data="bonusTableData" border>
              <el-table-column label="层级" align="center">
                <template slot-scope="scope">{{ scope.$index + 1 }}</template>
              </el-table-column>
              <el-table-column label="优惠门槛" align="center">
                <template slot-scope="scope">
                  <el-form-item
                  >
                    满
                    <el-input
                      disabled
                      v-model="bonusForm.threshold[scope.$index].value"
                      style="margin:5px; width: 100px"
                    />
                    <span v-if="fullReductionForm.discount_type !== 1">件</span>
                  </el-form-item>

                </template>
              </el-table-column>
              <el-table-column label="优惠方式" align="center">
                <template slot-scope="scope">
                  <el-form-item>
                    <el-radio :label="1" v-if="bonusForm.type === 1">
                      减
                      <el-input
                        disabled
                        v-if="bonusForm.type === 1"
                        style="margin:5px; width: 100px"
                        v-model="bonusForm.discount[scope.$index].value" />
                    </el-radio>
                    <el-radio :label="2" v-if="bonusForm.type === 2">
                      打<el-input
                        disabled
                        v-if="bonusForm.type === 2"
                        style="margin:5px; width: 100px"
                        v-model="bonusForm.discount[scope.$index].value" />
                      折
                    </el-radio>
                  </el-form-item>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </div>
      </el-form-item>
      <el-form-item label="参与活动商品：" required >
        <el-radio-group v-model="fullReductionForm.range_type">
          <el-radio :label='1'>全部商品</el-radio>
          <el-radio :label='2'>部分商品</el-radio>
        </el-radio-group>
        <span style="color:#969696">已选择({{ fullReductionForm.goods_list.length }})个商品</span>
        <div v-show="fullReductionForm.range_type === 2" style="margin-bottom:10px;">
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
            :data="fullReductionForm.goods_list"
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
  import * as API_activity from '@/api/activity'

  export default {
    name: 'FullCutPreview',
    props: {
      promotionId: {
        type: String
      }
    },
    data() {
      return {
        fullReductionForm: {
          goods_list: [],
          range_type: 1,
          type: 0,
          discount_type: 1,
          title: '',
          take_time: []
        },

        // 表格表单数据
        bonusForm: {
          type: 1,
          threshold: [{ value: 0 }],
          discount: [{ value: 0 }]
        }
      }
    },
    computed: {
      bonusTableData() {
        const { threshold, reductionYuan, discount } = this.bonusForm
        return threshold.map((item) => ({
          threshold: item,
          discount
        }))
      }
    },
    watch: {
      promotionId: {
        handler(val) {
          if (val) {
            this.GET_fullReductionDetail()
          }
        },
        immediate: true
      }
    },
    mounted() {
      // 获取某天23:59:59秒的时间戳
      this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
    },
    methods: {
      // 添加区间
      handleAddRange(threshold, discount, activityId) {
        const isAdd = typeof threshold === 'object'
        threshold = isAdd ? 0 : threshold
        discount = isAdd ? 0 : discount
        activityId = isAdd ? 0 : activityId
        if (this.bonusForm.threshold.length === 5) {
          this.$message.error('最多5个阶梯等级!')
          return
        }
        const perKey = Math.random().toString(36).slice(-6)
        const discountKey = Math.random().toString(36).slice(-6)
        this.bonusForm.threshold.push({ value: threshold, __key: perKey })
        this.bonusForm.discount.push({ value: discount, __key: discountKey })
      },

      // 获取活动详情
      async GET_fullReductionDetail() {
        const res = await API_activity.getFullCutActivityDetails(this.promotionId)
        let type
        if (Array.isArray(res.step_list)) {
          this.bonusForm.threshold = []
          this.bonusForm.discount = []
          res.step_list.forEach(item => {
            type = item.type
            this.handleAddRange(item.threshold, item.discount, item.activityId)
          })
        }
        this.bonusForm.type = type
        this.fullReductionForm.title = res.title
        this.fullReductionForm.discount_type = res.discount_type
        this.fullReductionForm.range_type = res.range_type
        this.fullReductionForm.goods_list = res.goods_list
        this.fullReductionForm.take_time = [parseInt(res.start_time) * 1000, parseInt(res.end_time) * 1000]
      }
    }
  }
</script>
<style scoped lang="scss">
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
    ::v-deep .el-cascader-node>.el-radio, .el-radio:last-child {
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
}
</style>
