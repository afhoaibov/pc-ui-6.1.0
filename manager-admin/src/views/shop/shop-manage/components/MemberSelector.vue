<template>
  <div class="member-selector">
    <el-dialog
      title="选择会员"
      :visible.sync="show"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="onClose">
    <div>
      <div class="search-title">
        搜索范围
        <el-input
          class="search-input"
          v-model="params.keyword"
          clearable
          placeholder="请输入关键字，例如：用户名或手机号"></el-input>
        <el-button size="mini" type="primary" @click="searchEvent">搜索</el-button>
      </div>
      <div class="member-content" v-if="memberList.length">
        <div :class="['member-item', {'active-item': activeMember.member_id === item.member_id}]"
          v-for="item of memberList"
          :key="item.member_id"
          @click="chooseMember(item)">
          <img :src="item.face" alt="" class="member-img">
          <div>
            <p class="uname">{{item.uname}}</p>
            <p class="mobile">{{item.mobile | formatMobile}}</p>
          </div>
        </div>
        <el-button
          v-if="dataTotal !== memberList.length"
          type="text"
          size="small"
          :loading="loading"
          @click="handleLoadMore"
          class="load-more"
        >加载更多</el-button>

      </div>
      <div class="btn-box">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="submitEvent">确定</el-button>
      </div>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from '@/api/member'

export default {
  name: 'shopAdd',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 会员列表
      memberList: [],
      // 数据总条数
      dataTotal: 0,
      show: false,
      params: {
        keyword: '',
        page_no: 1,
        page_size: 15,
        have_shop: 0, // 是否开通店铺
        status: 1 // 用户状态
      },
      loading: false,
      // 已选择会员
      activeMember: {}
    }
  },
  watch: {
    value(val) {
      this.show = val
      this.activeMember = {}
    }
  },
  mounted() {
    this.getMemberList()
  },
  methods: {
    /** 确定选中 */
    submitEvent() {
      this.$emit('submitEvent', this.activeMember)
    },
    /** 搜索 */
    searchEvent() {
      this.params.page_no = 1
      this.memberList = []
      this.getMemberList()
    },
    /** 会员选择 */
    chooseMember(item) {
      this.activeMember = item
    },
    /** 关闭弹窗 */
    onClose() {
      this.$emit('onClose')
    },

    /** 加载更多 */
    handleLoadMore() {
      if (this.dataTotal === this.memberList.length) return
      this.params.page_no++
      this.getMemberList()
    },

    /** 获取会员列表 */
    getMemberList() {
      this.loading = true
      API_Member.getMemberList(this.params).then(response => {
        this.memberList.push(...response.data)
        this.dataTotal = response.data_total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.member-selector ::v-deep .el-dialog__body {
  padding-top: 20px;
}
.search-title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #efefef;
  padding: 14px 0;
  .search-input {
    width: 300px;
    margin: 0 20px;
  }
}
.btn-box {
  text-align: center;
  margin-top: 20px;
}
.member-content {
  background: #f7f7f7;
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  height: 400px;
  overflow: auto;
  .load-more {
    width: 100%;
    text-align: center;
  }
  .active-item {
    border: 1px solid #409EFF !important;
    &:before {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      border: 17px solid #409EFF;
      border-top-color: transparent;
      border-left-color: transparent;
    }
    &:after {
      content: '';
      width: 5px;
      height: 12px;
      position: absolute;
      right: 6px;
      bottom: 6px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-left-color: transparent;
      transform: rotate(45deg);
    }
  }
  .member-item {
    display: flex;
    margin-right: 20px;
    margin-bottom: 20px;
    width: 30%;
    height: 80px;
    background: #fff;
    padding: 10px;
    cursor: pointer;
    border: 1px solid #fff;
    position: relative;
    &:hover {
      border: 1px solid #409EFF;
    }
    .el-icon-check {
      position: absolute;
      bottom: 0;
      right: 4px;
      font-size: 26px;
      font-weight: 600;
      color: #409EFF;
    }
    .uname {
      font-size: 13px;
      color: #333;
      margin: 0;
    }
    .mobile {
      font-size: 13px;
      color: #F56C6C;
    }
    .member-img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }
  }
}

</style>
