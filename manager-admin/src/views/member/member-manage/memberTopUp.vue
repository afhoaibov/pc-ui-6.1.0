<template>
  <div class="container top-up-wrap">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <el-form-item label="用户名：">
        <span class="content">{{nickname}}</span>
      </el-form-item>
      <el-form-item label="预存款余额：">
        <span class="content">{{walletData.balance | unitPrice}}</span>
        <el-button
          size="small"
          type="primary"
          style="margin-left: 30px"
          @click="toTransactionRecord">
          查看充值记录
        </el-button>
      </el-form-item>
      <el-form-item label="充值金额：" prop="price">
        <el-input-number
          v-model="form.price"
          placeholder="请填写充值金额"
          :min="0.01"
          :max="99999999"
          :precision="2"
          :controls="false"
          style="width: 300px;"
        />
      </el-form-item>
      <el-form-item label="选择充值金额：">
        <div class="price-box-content">
          <div
            :class="['price-box-item', {'price-active': index === activeIndex}]"
            v-for="(item, index) in priceList"
            :key="index"
            @click="handlePriceItem(index)"
          >
            {{ MixinUnitOfCurrency }}{{ item }}
          </div>
        </div>
      </el-form-item>
    </el-form>

    <div class="btn-box">
      <el-button size="medium" type="primary" @click="handleConfirmChangeRecharge">充值</el-button>
    </div>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="memberTopUpEvent"/>
  </div>
</template>

<script>
import * as API_Member from '@/api/member'
import { mapGetters } from 'vuex'
import { RegExp } from '~/ui-utils'

export default {
  name: 'memberTopUp',
  data() {
    return {
      openI18n: process.env.I18N,
      // 用户id
      memberId: '',
      // 用户名
      nickname: '',
      form: {
        price: 100,
      },
      formRules: {
        price: [
          this.MixinRequired('请填写或选择充值金额！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.money.test(value)) {
                callback(new Error('请填写正确的充值金额！'))
              } else if (Number(value) <= 0) {
                callback(new Error('充值金额必须大于0！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      // 充值金额快捷选择
      priceList: [100, 200, 300, 500, 600, 800],
      // 用户余额数据
      walletData: {},
      activeIndex: 0
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (val.name !== 'memberTopUp') return
        const query = val.query
        this.memberId = query.memberId
        this.nickname = query.nickname
        this.activeIndex = 0
        this.form.price = 100
        this.getMembersWallet()
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['havePermission'])
  },
  methods: {
    /** 查看交易流水 */
    toTransactionRecord() {
      const havePermission = this.havePermission('rechargeList')
      if (havePermission) {
        this.$router.push({
          name: 'rechargeList',
          query: { name: this.nickname }
        })
      } else {
        this.$message.error('当前角色未开启预存款充值记录权限，请开启后查看！')
      }
    },
    handleConfirmChangeRecharge() {
      this.$refs['formRef'].validate(valid => {
        if (!valid) return
        this.$refs['authRef'].open()
      })
    },
    /** 充值提交 */
    memberTopUpEvent() {
      const { memberId, nickname } = this
      const params = {
        member_id: memberId,
        money: this.form.price,
        name: nickname
      }
      API_Member.memberTopUp(params).then(() => {
        this.$message.success('充值成功！')
        this.getMembersWallet()
      })
    },
    /** 快捷金额选中 */
    handlePriceItem(index) {
      this.activeIndex = index
      this.form.price = this.priceList[index]
    },
    /** 获取会员预存款余额 */
    getMembersWallet() {
      API_Member.getMembersWallet(this.memberId).then(res => {
        this.walletData = res
      })
    }
  }
}
</script>

<style lang="scss" type="text/scss" scoped>
.top-up-wrap {
  padding: 30px;
  .btn-box {
    width: 30%;
    text-align: center;
  }
}
.price-box-content {
  width: 30%;
  display: flex;
  flex-wrap: wrap;
  .price-active {
    border: 1px solid #ffc999;
    background: #fff5eb !important;
    &:hover {
      filter:brightness(1) !important;
    }
  }
  .price-box-item {
    width: 100px;
    height: 50px;
    background: #efefef;
    color: #606266;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px 10px 0;
    cursor: pointer;
    &:hover {
      filter:brightness(.8)
    }
  }
}
</style>
