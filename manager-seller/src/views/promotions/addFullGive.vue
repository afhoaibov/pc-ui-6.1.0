<template>
  <div class="bg-in-stock">
    <el-form label-width="120px" :model="fullGiveForm" :rules="fullGiveFormRule" :disabled="isCheck" ref="fullGiveForm">
      <!-- 活动标题 -->
      <el-form-item label="活动标题：" prop="title">
        <el-input v-model="fullGiveForm.title" clearable style="width:500px" placeholder="请输入活动标题"/>
      </el-form-item>
      <!-- 活动方式 -->
      <el-form-item label="活动方式：" prop="type">
        <el-radio-group v-model="fullGiveForm.discount_type" @change="changeDiscountType">
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
              style="width: 50%;
            height: 50px;
            line-height: 50px;
            background: #eeeeee;
            margin-top: 20px;
            padding-left:10px;
            "
            >
              <div style="float:left;">
                {{c_index+1}}级优惠
              </div>
              <div style="float:left; margin-left:80%">
                <el-button
                  v-if="c_index !== 0"
                  type="text"
                  @click="handleRemoveRange(c_index)"
                >删除</el-button>
              </div>
            </div>
            <el-form-item
              label="优惠门槛：">
              满
              <el-input
              v-if="fullGiveForm.discount_type !== 1"
                v-model="item.threshold"
                :controls="false"
                oninput="value = value.replace(/[^\d]/g,'')"
                style="margin:5px; width: 100px;"
              />
              <el-input
              v-else
                v-model="item.threshold"
                :controls="false"
                oninput="value = value.replace(/[^\d.]/g,'').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
                style="margin:5px; width: 100px;"
              />
              <span v-if="fullGiveForm.discount_type !== 1">件</span>
            </el-form-item>
            <el-form-item label="优惠内容：">
              <el-checkbox label="免邮费" v-model="item.is_free_ship" :true-label=1 :false-label=0></el-checkbox>
            </el-form-item>
            <!--自营店--送积分-->
            <el-form-item label=" " prop="point_value">
              <el-checkbox label="送积分" v-model="item.is_send_point" :true-label=1 :false-label=0 @change="checkChange(item)"></el-checkbox>
              <span class="integral-show" v-if="item.is_send_point === 1">
                    <el-input
                      style="width:100px;"
                      size="mini"
                      oninput="value = value.replace(/[^\d]/g,'')"
                      v-model="item.point_value" :maxlength="8"></el-input> 分
                  </span>
            </el-form-item>
            <!-- 送优惠券 -->
            <el-form-item label=" " prop="bonus_id">
              <el-checkbox label="送优惠券" v-model="item.is_send_bonus" :true-label=1 :false-label=0 @change="checkChange(item)"></el-checkbox>
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
              <el-button type="text" v-if="item.is_send_bonus === 1" @click="addCoupon">新增</el-button>
            </el-form-item>
            <!--送赠品-->
            <el-form-item label=" " prop="gift_id">
              <el-checkbox label="送礼品" v-model="item.is_send_gift"  :true-label=1 :false-label=0 @change="checkChange(item)"></el-checkbox>
              <el-select
                v-if="item.is_send_gift === 1"
                v-model="item.gift_id"
                placeholder="请选择"
                @change="(e) => changeGift(e, c_index)">
                <el-option
                  v-for="item in giftList"
                  :key="item.gift_id"
                  :label="item.gift_name"
                  :value="item.gift_id">
                </el-option>
              </el-select>
              <el-button type="text" v-if="item.is_send_gift === 1" @click="addGift">新增</el-button>
            </el-form-item>
          </div>
          <div>
            <el-button @click="addConditions()" v-if="$route.params.opera_type !== 'detail'">新增优惠</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="参与活动商品：" required>
        <el-radio-group v-model="fullGiveForm.range_type" @change="goodsChange">
          <el-radio :label="1">全部商品</el-radio>
          <el-radio :label="2">部分商品</el-radio>
        </el-radio-group>
        <span style="color:#969696">已选择({{ fullGiveForm.goods_list.length }})个商品</span>
        <div v-show="fullGiveForm.range_type === 2" style="margin-bottom:10px;">
          <el-button type="primary" @click="showGoodsSelector" v-if="$route.params.opera_type !== 'detail'">选择商品</el-button>
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
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  @click="handleCancleJoin(scope.$index, scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="danger" style="margin-top:10px"  @click="cancelall" v-if="$route.params.opera_type !== 'detail'">批量移除</el-button>
        </div>
      </el-form-item>
      <div style="width:100px; margin:0 auto;" v-if="!isCheck">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-form>
    <!--优惠券组件-->
    <Coupon
      :couponModelShow="couponModelShow"
      @saveCoupon="saveCoupon"
      :showFreeType="false"
      :isFree="false"
    ></Coupon>
    <!--赠品组件-->
    <add-gift
      :giftModelShow="giftModelShow"
      @saveGift="saveGift"/>
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
  import { CategoryPicker } from '@/components'
  import * as API_Gift from '@/api/gift'
  import * as API_coupon from '@/api/coupon'
  import { AddGift, Coupon } from './components'
  import * as API_activity from '@/api/activity'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'addFullGive',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      [AddGift.name]: AddGift,
      [Coupon.name]: Coupon
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
        // 表单规则
        fullGiveFormRule: {
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
          threshold: [{ value: 0 }]
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
        /* 新增优惠卷弹框 */
        couponModelShow: false,
        giftModelShow: false,
        giftList: [],
        // 活动id
        Id: '',
        // 是否为查看
        isCheck: false
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          const routeName = newVal.name

          if (routeName === 'addFullGive') {
            this.Id = ''
            this.fullGiveForm = {
              seller_list: [],
              goods_list: [],
              range_type: 1,
              seller_scope: 'ALL',
              type: 0,
              contents: [{ threshold: '', is_free_ship: 0, is_send_point: 0, point_value: '', is_send_bonus: 0, is_send_gift: 0 }],
              title: '',
              take_time: '',
              discount_type: 1
            }
            this.bonusForm = {
              threshold: [{ value: 0 }]
            }
            this.isCheck = false
          } else if (routeName === 'editFullGive' || routeName === 'checkFullGiveDetail') {
            this.Id = newVal.params.promotion_id
            this.isCheck = false
            this.fullGiveForm.contents = []
            this.GET_fullGiveDetail()
          }
          if (routeName === 'checkFullGiveDetail') {
            this.isCheck = true
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
      /** 切换优惠类型 */
      changeDiscountType() {
        const contents = cloneObj(this.fullGiveForm.contents)
        contents.map(item => {
          item.threshold = ''
        })
        this.$set(this.fullGiveForm, 'contents', contents)
      },

      changeGift(e, index) {
        const contents = cloneObj(this.fullGiveForm.contents)
        contents[index].gift_id = e
        this.$set(this.fullGiveForm, 'contents', contents)
      },
      // 参选商品改变
      goodsChange(val) {
        if (val === 1) {
          this.fullGiveForm.goods_list = []
          this.skuIds = []
        }
      },
      // 是否选中
      checkChange(data) {
        if (data.is_send_gift === 0) {
          data.gift_id = ''
        } else if (data.is_send_bonus === 0) {
          data.bonus = ''
        } else if (data.is_send_point === 0) {
          data.point_value = ''
        }
        this.$forceUpdate()
      },
      /** 优惠券监听 */
      saveCoupon(target) {
        this.couponModelShow = false
        target && this.GET_CouponsList()
      },
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

      /** 新增赠品 */
      addGift() {
        this.giftModelShow = true
      },
      /** 赠品监听  */
      saveGift(target) {
        this.giftModelShow = false
        target && this.GET_giftList()
      },
      /** 新增优惠券 */
      addCoupon() {
        this.couponModelShow = true
      },
      // 商品分页大小发生改变
      handlePageSizeChangeGoods(size) {
        this.Goodspage_size = size
      },
      // 商品分页页数发生改变
      handlePageCurrentChangeGoods(page) {
        this.Goodspage_no = page
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
      // 移除区间
      handleRemoveRange(index) {
        this.fullGiveForm.contents.splice(index, 1)
      },

      /** 保存商品选择器选择的商品 */
      refreshFunc(val) {
        if (val) {
          this.fullGiveForm.goods_list = val
        }
      },

      /** 显示商品选择器*/
      showGoodsSelector() {
        this.showDialog = true
        this.skuIds = this.fullGiveForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      /** 取消参加*/
      handleCancleJoin(index, row) {
        this.fullGiveForm.goods_list.forEach((elem, _index) => {
          if (index === _index) {
            this.fullGiveForm.goods_list.splice(_index, 1)
          }
        })
        this.skuIds = this.fullGiveForm.goods_list.map(key => {
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
          this.fullGiveForm.goods_list.forEach((elem, index) => {
            if (elem.goods_id === key) {
              this.fullGiveForm.goods_list.splice(index, 1)
            }
          })
          this.$message.success('批量取消成功！')
        })
        this.skuIds = this.fullGiveForm.goods_list.map(key => {
          return key.sku_id
        })
      },
      // 获取活动详情
      async GET_fullGiveDetail() {
        const res = await API_activity.getFullGiveActivityDetails(this.Id)
        res.step_list.map(item => {
          this.addConditions(item)
        })
        this.fullGiveForm.discount_type = res.discount_type
        this.fullGiveForm.range_type = res.range_type
        this.fullGiveForm.goods_list = res.goods_list
        this.fullGiveForm.title = res.title
        this.fullGiveForm.take_time = [parseInt(res.start_time) * 1000, parseInt(res.end_time) * 1000]
      },
      // 保存区间
      handleSave() {
        this.$refs['fullGiveForm'].validate((valid) => {
          if (valid) {
            const fullGiveForm = this.fullGiveForm
            if (this.fullGiveForm.goods_list.length === 0 && this.fullGiveForm.range_type === 2) return this.$message.error('请选择至少一个商品！')

            if (fullGiveForm.contents.some((val, index) => {
              return fullGiveForm.contents.some((item, idx) => { return item.threshold === val.threshold && idx !== index })
            })) {
              this.$message.error('优惠门槛金额不可重复！')
              return
            }
            this.fullGiveForm.start_time = parseInt(this.fullGiveForm.take_time[0] / 1000)
            this.fullGiveForm.end_time = parseInt(this.fullGiveForm.take_time[1] / 1000)
            const params = {
              ...this.fullGiveForm,
              step_list: this.fullGiveForm.contents
            }
            delete params.take_time
            delete params.type
            delete params.contents
            if (this.Id) {
              API_activity.saveFullGiveActivity(this.Id, params).then((res) => {
                this.$message.success('编辑成功!')
                this.$router.push({ path: '/promotions/full-give' })
                this.$store.state.tagsView.cachedViews = this.$store.state.tagsView.cachedViews.filter(tab => tab !== 'addFullGive')
                this.$store.state.tagsView.visitedViews = this.$store.state.tagsView.visitedViews.filter(tab => tab.name !== 'addFullGive')
              })
            } else {
              API_activity.addFullGiveActivity(params).then((res) => {
                this.$message.success('保存成功!')
                this.$router.push({ path: '/promotions/full-give' })
                this.$store.state.tagsView.cachedViews = this.$store.state.tagsView.cachedViews.filter(tab => tab !== 'addFullGive')
                this.$store.state.tagsView.visitedViews = this.$store.state.tagsView.visitedViews.filter(tab => tab.name !== 'addFullGive')
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
    ::v-deep {
      .el-form-item__content {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .el-form-item__error {
        width: 100%;
      }
      .el-table__row td {
        padding-bottom: 0;
      }
      .el-cascader-node>.el-radio, .el-radio:last-child{
        margin-right: 30px;
      }
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
