<template>
  <div class="add-sign-in-wrap">
    <div class="tips-info">
      <h4>操作提示</h4>
      <ul>
        <li>活动状态开启后，会员可以在移动端参加平台的会员签到活动。</li>
        <li>通过设置连续签到可以根据会员连续签到的天数获取不同的积分数量。</li>
        <li>提示：当会员连续签到天数超出设置的最大签到天数后，会员签到天数将被重置。</li>
        <li>例如：设置了连续签到1天给10积分，送xx优惠券，连续签到2天给20积分，送xx优惠券，会员第一天签到会得到10积分，送xx优惠券，连续第二天签到会得到20积分，送xx优惠券，当连续第三天签到时，由于超出了设置的最大签到天数，会员连续签到天数将被重置为1天，所以会员按照连续签到1天设置的奖励回去10积分和xx优惠券。</li>
      </ul>
    </div>

    <div class="sign-in-container">
      <img class="bg-icon" src="/static/img/signin-bg.png" alt="">
      <div class="form-box">
        <el-form
        :model="signForm"
        :rules="signFormRules"
        ref="couponForm"
        label-width="120px"
        :status-icon="false"
        label-position="right"
        :disabled="disabled">
          <el-divider>基础设置</el-divider>
          <el-form-item label="开始时间：" prop="timeRange">
            <el-date-picker
              v-model="signForm.timeRange"
              type="datetimerange"
              align="center"
              :editable="false"
              unlink-panels
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="timestamp"
              :default-time="[MixinDefaultTime, MixinDefaultTime]"
              :picker-options="{disabledDate(time) { return time.getTime()  <  (Date.now() - 8.64E7) }}">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="活动标题：" prop="title">
            <el-input size="medium" v-model="signForm.title" clearable></el-input>
          </el-form-item>
          <el-form-item label="活动规则说明：" prop="description">
            <el-input type="textarea" size="medium" v-model="signForm.description" clearable></el-input>
          </el-form-item>

          <el-divider>签到设置</el-divider>
          <el-form-item label="每签到送" class="point-box" prop="point">
            <el-input size="medium" v-model="signForm.point" clearable></el-input>
            <span>积分</span>
          </el-form-item>

          <div
            :class="['sign-item', index + 1 !== signForm.rewards.length ? 'item-border' : '']"
            v-for="(item, index) in signForm.rewards">
            <div>
              <div class="rewards-item">
                <span class="text">连续签到送</span>
                <el-input size="medium" v-model="item.sign_day" clearable></el-input>
                <span>天， 送</span>
                <div class="right-item">
                  <div class="gift">
                    <el-checkbox true-label="OPEN" false-label="CLOSE"  v-model="item.point_switch"></el-checkbox>
                    <el-input @change="changeSwitch(item, 'point_switch')" size="mini"  v-model="item.points" clearable></el-input>
                    积分
                  </div>
                  <div class="gift">
                    <el-checkbox  true-label="OPEN" false-label="CLOSE" v-model="item.coupon_switch"></el-checkbox>
                    <el-select @change="changeSwitch(item, 'coupon_switch')"  v-model="item.coupon_id" placeholder="请选择优惠券" clearable>
                      <el-option v-for="coupon in couponList" :key="coupon.coupon_id" :label="coupon.title" :value="coupon.coupon_id"/>
                    </el-select>
                    优惠券
                  </div>
                </div>
              </div>
              <div class="rewards-item">
                <span class="text">图标</span>
                <el-upload
                  v-if="!disabled"
                  class="avatar-uploader"
                  :action="MixinUploadApi"
                  :headers="MixinAccessToken"
                  :show-file-list="false"
                  :on-success="(res) => { item.icon = res.url }">
                  <img v-if="item.icon" :src="item.icon" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <img v-else-if="item.icon" :src="item.icon" class="avatar">
                <span class="text">描述</span>
                <el-input type="textarea" size="mini" v-model="item.description" clearable></el-input>
              </div>
            </div>
            <el-button v-if="!disabled" style="margin-left: 30px;" size="mini" type="danger" @click="handlerDelete(index)">删除</el-button>
          </div>
          <div class="btn-box" v-if="!disabled">
            <el-button icon="el-icon-plus" size="mini" type="primary" @click="handlerAddRow">
              新增
            </el-button>
          </div>
          <el-divider>商品设置</el-divider>
          <el-form-item label="热销商品：">
            <en-table-layout
              toolbar
              pagination
              :tableData="tableData">
              <div slot="toolbar" class="inner-toolbar">
                <div class="toolbar-btns" v-if="!disabled">
                  <el-button type="primary" @click="handlerSelectGoods" >选择商品</el-button>
                </div>
              </div>
              <template slot="table-columns">
                <el-table-column label="商品列表" width="180">
                  <template slot-scope="scope">
                    <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'">
                      <img :src="scope.row.thumbnail" class="goods-image"/>
                    </a>
                  </template>
                </el-table-column>
                <el-table-column label="商品名称">
                  <template slot-scope="scope">
                    <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}`" :target="isO2O ? '' : '_blank'" style="color: #00a2d4;" v-html="scope.row.goods_name">{{ scope.row.goods_name }}</a>
                  </template>
                </el-table-column>
                <!-- 商品规格 -->
                <el-table-column label="规格SKU">
                  <template slot-scope="scope">
                    <div class="sku-list">
                      <span v-if="scope.row.spec_list">{{ getSkuList(scope.row.spec_list) }}</span>
                      <span v-else>{{ getSkuList(scope.row.specs) }}</span>
                    </div>
                  </template>
                </el-table-column>
              </template>
            </en-table-layout>
          </el-form-item>
        </el-form>
        <div class="confirm-btn" v-if="!disabled">
          <el-button  size="medium" type="primary" @click="handlerConfirm">保存</el-button>
        </div>
      </div>
    </div>
    <!--商品选择器-->
    <en-goods-picker
      :show="dialogGoodsShow"
      :defaultData="signForm.products"
      @confirm="handleGoodsPickerConfirm"
      @close="dialogGoodsShow = false"/>
  </div>
</template>

<script>
  import * as API_Promotion from '@/api/promotion'
  import { cloneObj } from '@/utils/index'
  import request from '@/utils/request'

  export default {
    name: 'addSignIn',
    data() {
      return {
        signForm: {
          products: [],
          rewards: []
        },
        signFormRules: {
          title: this.MixinRequired('请填写活动标题！'),
          timeRange: this.MixinRequired('请选择活动时间！'),
          description: this.MixinRequired('请填写活动说明！'),
          point: this.MixinRequired('请填写签到赠送积分！')
        },
        couponList: [],
        disabled: false,
        tableData: [],
        dialogGoodsShow: false,
        // 根据商品id，获取商品列表API
        multipleGoodsApi: 'admin/goods/@ids/details'
      }
    },
    watch: {
      $route: {
        handler(val) {
          this.disabled = val.name === 'viewSignIn'
          if ((val.name === 'viewSignIn' || val.name === 'editSignIn') && val.params.id) {
            this.id = val.params.id
            this.getSignInDetail()
          } else {
            this.signForm = {
              rewards: [],
              products: []
            }
            this.tableData = []
          }
        },
        immediate: true
      }
    },
    mounted() {
      this.getCouponsList()
    },
    methods: {
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
      /** 保存商品选择器选择的商品 */
      handleGoodsPickerConfirm(val) {
        const _val = val
        this.tableData = cloneObj(_val)
        this.signForm.products = this.tableData.map(key => key.goods_id)
      },
      /** 商品选择 */
      handlerSelectGoods() {
        this.dialogGoodsShow = true
      },
      /** 优惠选中切换 */
      changeSwitch(item, type) {
        this.$set(item, type, 'OPEN')
      },
      /** 获取活动详情 */
      getSignInDetail() {
        API_Promotion.getSignInDetail(this.id).then(res => {
          const rewards = cloneObj(res.sign_in_rewards)
          rewards.sort(function(a, b) {
            return a.sign_day - b.sign_day
          })
          let firstItem = null
          if (rewards[0].sign_day === 1) {
            firstItem = rewards[0]
            rewards.shift()
          }
          let products = []
          if (res.recommended_product_id) {
            products = res.recommended_product_id.split(',').filter(item => { return item })
          }
          if (products.length) {
            this.GET_GoodsByGoodsIdGroup(res.recommended_product_id)
          }
          this.signForm = {
            products: products,
            point: firstItem ? firstItem.points : '',
            title: res.title,
            end_date: res.end_date,
            start_date: res.start_date,
            description: res.description,
            rewards: rewards,
            timeRange: [parseInt(res.start_date) * 1000, parseInt(res.end_date) * 1000]
          }
        })
      },
      /** 根据商品编号获取商品信息 */
      GET_GoodsByGoodsIdGroup(ids) {
        ids = typeof ids === 'string'
          ? ids.replace(/，/g, ',')
          : ids.join(',')
        ids = ids.split(',').filter(item => !!item).join(',')
        return new Promise((resolve, reject) => {
          request({
            url: this.multipleGoodsApi.replace('@ids', ids),
            method: 'get',
            loading: false
          }).then(response => {
            const data = response.map(item => {
              item.goods_image = item.thumbnail
              item.goods_price = item.price
              return item
            })
            this.tableData = data
          }).catch(reject)
        })
      },
      /** 获取优惠券数据 */
      getCouponsList() {
        API_Promotion.getAllCouponsList().then(res => {
          this.couponList = res
        })
      },
      /** 保存提交 */
      handlerConfirm() {
        this.$refs['couponForm'].validate((valid) => {
          if (valid) {
            const signForm = cloneObj(this.signForm)
            let msg = ''
            signForm.rewards.sort(function(a, b) {
              return a.sign_day - b.sign_day
            })
            signForm.rewards.forEach((item, index) => {
              if (!item.sign_day) {
                msg = '请填写签到天数！'
              } else if (item.sign_day < 2) {
                msg = '连续签到天数至少2天起！'
              } else if (index && !item.coupon_switch && !item.point_switch) {
                msg = '请填写并选择优惠！'
              }
            })
            signForm.rewards.unshift({
              sign_day: 1,
              points: signForm.point,
              coupon_switch: 'CLOSE',
              point_switch: 'CLOSE'
            })
            if (msg) {
              this.$message.error(msg)
              return
            }
            signForm.start_date = signForm.timeRange[0] / 1000
            signForm.end_date = signForm.timeRange[1] / 1000
            delete signForm.timeRange
            delete signForm.point
            if (this.id) {
              // 修改
              API_Promotion.updateSignInActivity(this.id, signForm).then(res => {
                this.$message.success('修改成功')
                this.$router.push({ name: 'signIn' })
              })
            } else {
              // 新增
              API_Promotion.addSignInActive(signForm).then(res => {
                this.$message.success('保存成功')
                this.$router.push({ name: 'signIn' })
              })
            }
          }
        })
      },
      /** 删除阶梯Item */
      handlerDelete(index) {
        this.signForm.rewards.splice(index, 1)
      },
      /** 新增阶梯item */
      handlerAddRow() {
        this.signForm.rewards.push({
          coupon_id: '',
          coupon_switch: '',
          description: '',
          point_switch: '',
          points: '',
          sign_day: ''
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
.add-sign-in-wrap {
  .sign-in-container {
    background: #fff;
    margin-top: 20px;
    padding: 20px;
    display: flex;
    .bg-icon {
      width: 350px;
      height: 780px;
      margin: 0 30px
    }
    .goods-image{
      width:50px;
      height:50px;
    }
    .confirm-btn {
      text-align: center;
      padding-top: 10px;
      margin-top: 10px;
      border-top: 1px dashed #DCDFE6;
    }
    .form-box {
      width: 60%;
      font-size: 14px;
      font-weight: 700;
      color: #606266;
      padding: 0 30px;
      .btn-box {
        padding-left: 50px;
      }
      .text {
        width: 80px;
        text-align: center;
      }
      .el-input, .el-textarea {
        width: 300px;
      }
    }
    .item-border {
      border-bottom: 1px dashed #DCDFE6;
    }
    .sign-item {
      padding: 20px 0 20px 50px;
      display: flex;
      align-items: center;
      .rewards-item {
        display: flex;
        align-items: center;
        .el-select {
          width: 200px;
        }
        .el-input {
          width: 200px;
        }
        .right-item {
          margin-left: 20px;
          .gift {
            margin-bottom: 10px;
          }
        }
      }
      ::v-deep .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      ::v-deep .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
      }
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 80px;
        height: 80px;
        line-height: 80px;
        text-align: center;
      }
      .avatar {
        width: 80px;
        height: 80px;
        display: block;
      }

    }
    .point-box {
      padding: 10px 0 10px 0;
      border-bottom: 1px dashed #DCDFE6;
      .el-input {
        width: 200px;
      }
    }
  }
  .tips-info {
    font-size: 14px;
    background: #fff;
    color: #31708f;
    padding: 1px 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    li {
      line-height: 24px;
    }
  }
}
</style>
