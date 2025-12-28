<template>
  <div class="member-info-wrap" ref="memberInfoWrap">
    <div class="float-tab-content">
      <p
        :class="[{'active-tab' : floatTabIndex === index}, 'btn-item']"
        v-for="(item, index) of floatTab"
        :key="index"
        @click="changePosition(item, index)">{{item.name}}</p>
    </div>
    <el-row :gutter="0">
      <div class="d-header" ref="baseInfo">基本信息</div>
      <el-col :span="12" class="item">
        <p class="item-label">邮箱： </p>
        <span class="item-value">{{memberDetail.email}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">地区： </p>
        <span class="item-value">{{memberAddress}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">会员备注：</p>
        <span class="item-value">{{memberDetail.remark}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">手机：</p>
        <span class="item-value">
          <clipboard :text="memberDetail.mobile| formatMobile" />
        </span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">生日：</p>
        <span class="item-value" v-if="memberDetail.birthday && memberDetail.birthday!== '0'">{{memberDetail.birthday | unixToDate('yyyy-MM-dd')}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">性别：</p>
        <span class="item-value">{{memberDetail.sex === 1 ? '男' : '女'}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">详细地址：</p>
        <span class="item-value">{{memberDetail.address}}</span>
      </el-col>
      <el-col :span="12" class="item">
        <p class="item-label">固定电话：</p>
        <span class="item-value">{{memberDetail.tel}}</span>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="order">TA的订单</div>
      <el-col :span="24">
        <member-list-order :member-id="memberId" />
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="consumePoint">消费积分</div>
      <el-col :span="12" class="item">
        <p class="item-label">当前消费积分: </p>
        <span class="item-value">{{memberDetail.consum_point}}</span>
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="points">TA的积分</div>
      <el-col :span="24">
        <member-list-points :member-id="memberId" />
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="consult">TA的咨询</div>
      <el-col :span="24">
        <member-list-ask :member-id="memberId" :preview="true" />
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="components">TA的评论</div>
      <el-col :span="24">
        <member-list-comments :member-id="memberId" :preview="true" />
      </el-col>
    </el-row>

    <el-row :gutter="0">
      <div class="d-header" ref="address">TA的收货地址</div>
      <el-col :span="24">
        <member-list-address :member-id="memberId" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import * as API_Member from '@/api/member'
  import MemberListOrder from './MemberListOrder'
  import MemberListPoints from './MemberListPoints'
  import MemberListAsk from './MemberListAsk'
  import MemberListComments from './MemberListComments'
  import MemberListAddress from './MemberListAddress'

  export default {
    name: 'MemberPreview',
    components: {
      MemberListAddress,
      MemberListAsk,
      MemberListComments,
      MemberListOrder,
      MemberListPoints
    },
    props: {
      memberId: {
        type: String
      }
    },
    data() {
      return {
        /** 会员基础数据 */
        memberDetail: {},
        floatTab: [
          { name: '基本信息', type: 'baseInfo' },
          { name: '订单', type: 'order' },
          { name: '消费积分', type: 'consumePoint' },
          { name: '积分', type: 'points' },
          { name: '咨询', type: 'consult' },
          { name: '评论', type: 'components' },
          { name: '收货地址', type: 'address' }
        ],
        floatTabIndex: 0
      }
    },
    computed: {
      memberAddress() {
        const memberDetail = this.memberDetail
        if (memberDetail.province && memberDetail.city) {
          return `${memberDetail.province}${memberDetail.city}${memberDetail.county}`
        }
        return ''
      }
    },
    watch: {
      memberId: {
        handler(val) {
          if (val) {
            this.getMemberDetail(val)
          }
        },
        immediate: true
      }

    },
    methods: {
      /** 切换滑动距离 */
      changePosition(item, index) {
        if (index === this.floatTabIndex) return
        this.floatTabIndex = index
        this.$refs.memberInfoWrap.scroll({ top: item.top, behavior: 'smooth' })
      },
      /** 处理锚点跳转按钮 */
      handleFloatTab() {
        this.$refs.memberInfoWrap.scrollTop = 0
        this.$nextTick(() => {
          this.floatTab.map(item => {
            if (Array.isArray(this.$refs[`${item.type}`])) {
              const top = this.$refs[`${item.type}`][0].getBoundingClientRect().top - 60
              item.top = top > 0 ? top : 0
            } else {
              const top = this.$refs[`${item.type}`].getBoundingClientRect().top - 60
              item.top = top > 0 ? top : 0
            }
          })
        })
      },
      getMemberDetail(memberId) {
        API_Member.getMemberDetail(memberId).then(response => {
          this.memberDetail = response
          this.handleFloatTab()
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .member-info-wrap {
    height: 100%;
    padding-bottom: 30px;
    position: relative;
    overflow: auto;
    .float-tab-content {
      position: fixed;
      background: #fff;
      min-width: 72px;
      max-width: 100px;
      right: 45%;
      top: 0;
      border-radius: 0 0 0 4px;
      padding: 20px 10px;
      font-size: 14px;
      color: #7d8089;
      box-shadow: -2px 0 4px 0 rgba(0,0,0, .1);
      .active-tab {
        color: #000;
      }
      .btn-item{
        margin: 0;
        padding: 10px 0;
        margin-bottom: 10px;
        text-align: center;
        cursor: pointer;
      }
    }
    .d-header {
      padding: 10px 0 10px 20px;
      font-size: 14px;
      color: #333;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e1e8ed;
      margin-bottom: 20px;
      &h2 {
        font-size: 14px;
        font-weight: 400;
      }
    }
    .item {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      p {
        margin: 0;
      }

      .item-label {
        font-size: 15px;
        color: #333;
        margin-right: 20px;
      }
      .item-value {
        overflow: hidden;
        white-space: normal;
        word-break: break-all;
        font-size: 15px;
        color: #666;
      }

    }
  }
</style>
