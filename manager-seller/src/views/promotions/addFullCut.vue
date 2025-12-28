<template>
  <div class="bg-in-stock">
    <el-form
      label-width="120px"
      :model="fullReductionForm"
      :rules="fullReductionFormRule"
      ref="fullReductionForm"
      :disabled="isCheck">
      <!-- 活动标题 -->
      <el-form-item label="活动标题：" prop="title">
        <el-input
          v-model="fullReductionForm.title"
          clearable
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
                      :disabled="isCheck"
                      v-model="bonusForm.threshold[scope.$index].value"
                      oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
                      style="margin:5px; width: 100px"
                    />
                    <span v-if="fullReductionForm.discount_type !== 1">件</span>
                  </el-form-item>

                </template>
              </el-table-column>
              <el-table-column label="优惠方式" align="center">
                <template slot-scope="scope">
                  <el-form-item>
                    <el-radio-group v-model="bonusForm.type" :disabled="scope.$index !== 0 || isCheck">
                      <el-radio :label="1">
                        减
                        <el-input
                          :disabled="isCheck"
                          v-if="bonusForm.type === 1"
                          oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
                          style="margin:5px; width: 100px"
                          v-model="bonusForm.discount[scope.$index].value" />
                        <el-input v-else
                          :disabled="bonusForm.type === 2 || isCheck"
                          oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
                          style="margin:5px; width: 100px" />
                      </el-radio>
                      <el-radio :label="2">
                        打<el-input
                          :disabled="isCheck"
                          v-if="bonusForm.type === 2"
                          oninput="value = value > 9.99 ? '' : value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');"
                          style="margin:5px; width: 100px"
                          v-model="bonusForm.discount[scope.$index].value" />
                        <el-input
                          v-else
                          :disabled="bonusForm.type === 1 || isCheck"
                          oninput="value = value > 9.99 ? '' : value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
                          style="margin:5px; width: 100px" />
                        折
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button
                    v-if="scope.$index !== 0"
                    type="danger"
                    :disabled="isCheck"
                    @click="handleRemoveRange(scope.$index)"
                  >移除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div style="height: 10px"></div>
            <el-button
              @click="handleAddRange"
              v-if="!isCheck">新增区间</el-button>
          </el-form>
        </div>
      </el-form-item>
      <el-form-item label="参与活动商品：" required @change="goodsChange">
        <el-radio-group v-model="fullReductionForm.range_type">
          <el-radio :label='1'>全部商品</el-radio>
          <el-radio :label='2'>部分商品</el-radio>
        </el-radio-group>
        <span style="color:#969696">已选择({{ fullReductionForm.goods_list.length }})个商品</span>
        <div v-show="fullReductionForm.range_type === 2" style="margin-bottom:10px;">
          <el-button type="primary" @click="showGoodsSelector" v-if="!isCheck" >选择商品</el-button>
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
            @selection-change="selectionChange"
          >
            <el-table-column type="selection"/>
            <!--商品信息-->
            <el-table-column  label="商品信息">
              <template slot-scope="scope">
                <div class="goods-info">
                  <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'">
                    <img :src="scope.row.thumbnail" alt="" class="goods-image">
                  </a>
                  <div>
                    <a
                      :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`"
                      :target="isO2O ? '' : '_blank'"
                       style="color: #00a2d4;"
                       v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a>
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
            <!--操作-->
            <el-table-column label="操作" width="150" v-if="!isCheck">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  @click="handleCancleJoin(scope.$index, scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="danger" style="margin-top:10px"  @click="cancelall" v-if="!isCheck">批量移除</el-button>
        </div>
      </el-form-item>
      <div style="width:100px; margin:0 auto;" v-if="!isCheck">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-form>
    <!--商品选择器-->
    <en-goods-picker
      type="seller"
      sku
      :show="showDialog"
      :defaultData="skuIds"
      @confirm="refreshFunc"
      @close="showDialog = false"/>
  </div>
</template>
<script>
  import * as API_activity from '@/api/activity'
  import { CategoryPicker } from '@/components'

  export default {
    name: 'addFullCut',
    components: {
      [CategoryPicker.name]: CategoryPicker
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
        // 表单规则
        fullReductionFormRule: {
          title: [
            { required: true, message: '请输入活动标题', trigger: 'blur' },
            { min: 2, max: 25, message: '长度在2-25个字符之内', trigger: 'blur' }
          ],
          discount_type: [
            { required: true, message: '请选择活动方式', trigger: 'change' }
          ],
          take_time: [
            { type: 'array', required: true, message: '请选择起止时间', trigger: 'blur' }
          ]
        },
        // 表格表单数据
        bonusForm: {
          type: 1,
          threshold: [{ value: 0 }],
          discount: [{ value: 0 }]
        },
        // 商品列表显示
        goodsShow: true,
        // 商品表格总数
        totalGoods: 0,
        // 商品分页参数
        Goodspage_no: 1,
        Goodspage_size: 10,

        /** 选择的goods_id*/
        selectionids: [],

        /** 商品ids */
        skuIds: [],

        /** 显示/隐藏商品选择器 */
        showDialog: false,
        /** 活动id */
        promotionId: '',
        // 是否为编辑
        isCheck: true,
        hidden: true
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
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name === 'addFullCut') {
            this.promotionId = ''
            this.fullReductionForm = {
              goods_list: [],
              range_type: 1,
              type: 0,
              discount_type: 1,
              title: '',
              take_time: []
            }
            this.bonusForm = {
              type: 1,
              threshold: [{ value: 0 }],
              discount: [{ value: 0 }]
            }
            this.isCheck = false
          } else if (newVal.name === 'editFullCut') {
            this.isCheck = false
            this.promotionId = newVal.params.promotion_id
            this.GET_fullReductionDetail()
          } else if (newVal.name === 'checkFullDetail') {
            this.isCheck = true
            this.promotionId = newVal.params.promotion_id
            this.GET_fullReductionDetail()
          }
        }
      }
    },
    mounted() {
      // 获取某天23:59:59秒的时间戳
      this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
    },
    methods: {
      // 参选商品改变
      goodsChange(val) {
        if (val === 1) {
          this.fullReductionForm.goods_list = []
          this.skuIds = []
        }
      },

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
      // 移除区间
      handleRemoveRange(index) {
        this.bonusForm.threshold.splice(index, 1)
        this.bonusForm.discount.splice(index, 1)
      },
      /** 是否全选商品*/
      changeJoinGoods(val) {
        this.goodsShow = val === 1
      },

      /** 保存商品选择器选择的商品 */
      refreshFunc(val) {
        if (val) {
          console.log(val)
          this.fullReductionForm.goods_list = val
        }
      },

      /** 显示商品选择器*/
      showGoodsSelector() {
        this.showDialog = true
        this.skuIds = this.fullReductionForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      /** 取消参加*/
      handleCancleJoin(index, row) {
        this.fullReductionForm.goods_list.forEach((elem, _index) => {
          if (index === _index) {
            this.fullReductionForm.goods_list.splice(_index, 1)
          }
        })
        this.skuIds = this.fullReductionForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      /** 商品选中项 */
      selectionChange(val) {
        this.selectionids = val.map(item => item.goods_id)
      },

      /** 批量取消 */
      cancelall() {
        this.selectionids.forEach(key => {
          this.fullReductionForm.goods_list.forEach((elem, index) => {
            if (elem.goods_id === key) {
              this.fullReductionForm.goods_list.splice(index, 1)
            }
          })
          this.$message.success('批量取消成功！')
        })
        this.skuIds = this.fullReductionForm.goods_list.map(key => {
          return key.sku_id
        })
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
      },
      // 保存区间
      handleSave() {
        this.$refs['fullReductionForm'].validate((valid) => {
          if (valid) {
            if (this.fullReductionForm.goods_list.length === 0 && this.fullReductionForm.range_type === 2) return this.$message.error('请选择至少一个商品！')
            const step_list = this.bonusForm.threshold.map((item, index) => ({
              type: this.bonusForm.type,
              threshold: item.value,
              discount: this.bonusForm.discount[index].value
            }))

            if (step_list.some((val, index) => {
              return step_list.some((item, idx) => { return item.threshold === val.threshold && idx !== index })
            })) {
              this.$message.error('优惠门槛金额不可重复！')
              return
            }
            if (step_list.some(val => { return (!Number(val.threshold) || !Number(val.discount)) })) {
              this.$message.error('优惠门槛或优惠金额折扣不能为0或空')
              return
            }
            this.fullReductionForm.start_time = parseInt(this.fullReductionForm.take_time[0] / 1000)
            this.fullReductionForm.end_time = parseInt(this.fullReductionForm.take_time[1] / 1000)
            const params = {
              ...this.fullReductionForm,
              step_list: step_list
            }
            delete params.take_time
            delete params.type
            if (this.promotionId) {
              API_activity.saveFullCutActivity(this.promotionId, params).then((res) => {
                this.$message.success('编辑成功!')
                this.$router.push({ path: '/promotions/full-cut' })
                this.$store.state.tagsView.cachedViews = this.$store.state.tagsView.cachedViews.filter(tab => tab !== 'addFullCut')
                this.$store.state.tagsView.visitedViews = this.$store.state.tagsView.visitedViews.filter(tab => tab.name !== 'addFullCut')
              })
            } else {
              API_activity.addFullCutActivity(params).then((res) => {
                this.$message.success('保存成功!')
                this.$router.push({ path: '/promotions/full-cut' })
                this.$store.state.tagsView.cachedViews = this.$store.state.tagsView.cachedViews.filter(tab => tab !== 'addFullCut')
                this.$store.state.tagsView.visitedViews = this.$store.state.tagsView.visitedViews.filter(tab => tab.name !== 'addFullCut')
              })
            }
          } else {
            this.$message.error('表单填写错误,请检查!')
            return
          }
        })
      }
    }
  }
</script>
<style scoped lang="scss">
.bg-in-stock {
  background-color: #fff;
  margin: 10px;
  padding: 25px;
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
