<template>
  <div class="container">
    <div class="title">基本信息</div>
    <div class="shop-add-wrap">
      <el-form
        :model="addShopForm"
        :rules="addMemberRules"
        ref="addShopForm"
        label-width="100px">
        <el-form-item label="店铺名称：" prop="shopName">
          <el-input
            v-model="addShopForm.shopName"
            :maxlength="20"
            placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="选择会员：" prop="uname">
          <el-tag
            closable
            @close="closeTag"
            v-if="addShopForm.uname">{{addShopForm.uname}}</el-tag>
          <template v-else>
            <el-button size="mini" type="primary" @click="showMemberSelector = true">选择会员</el-button>
            <el-button size="mini" type="primary" @click="showAddMemberDialog = true">新增会员</el-button>
          </template>
        </el-form-item>
      </el-form>
    </div>
    <div class="btn-box">
      <el-button type="primary" @click="addShopSubmitEvent">保存</el-button>
    </div>
    <!-- 会员选择器 -->
    <member-selector
      v-model="showMemberSelector"
      @onClose="showMemberSelector = false"
      @submitEvent="memberSelectorEvent" />

    <!-- 新增会员弹窗 -->
    <add-member-dialog
      :value="showAddMemberDialog"
      @onClose="showAddMemberDialog = false"
      @addMemberEvent="addMemberEvent" />
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import MemberSelector from './components/MemberSelector'
import AddMemberDialog from '@/components/AddMemberDialog'

export default {
  name: 'shopAdd',
  components: {
    MemberSelector,
    AddMemberDialog
  },
  data() {
    return {
      addShopForm: {},
      addMemberRules: {
        shopName: this.MixinRequired('请输入店铺名称！'),
        uname: this.MixinRequired('请选择或新增会员！')
      },
      // 会员选择器显隐
      showMemberSelector: false,
      // 新增会员弹窗显隐
      showAddMemberDialog: false
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'shopEdit') return
      }
    }
  },
  methods: {
    /** 新增店铺提交 */
    addShopSubmitEvent() {
      const { addShopForm } = this
      const params = {
        shop_name: addShopForm.shopName,
        member_name: addShopForm.uname,
        member_id: addShopForm.member_id
      }
      this.$refs.addShopForm.validate((valid) => {
        if (valid) {
          API_Shop.addShopBase(params).then(res => {
            this.$message.success('添加成功！')
            this.$store.dispatch('delCurrentViews', {
              view: this.$route,
              $router: this.$router
            })
            this.$router.push({ name: 'shopList' })
          })
        }
      })
    },

    /** 新增会员回调 */
    addMemberEvent(member) {
      this.$set(this.addShopForm, 'uname', member.uname)
      this.$set(this.addShopForm, 'member_id', member.member_id)
      this.$refs.addShopForm.validateField('uname')
      this.showAddMemberDialog = false
    },
    closeTag() {
      this.$set(this.addShopForm, 'uname', '')
      this.$set(this.addShopForm, 'member_id', '')
      this.$refs.addShopForm.validateField('uname')
    },
    /** 会员选择回调  */
    memberSelectorEvent(item) {
      this.showMemberSelector = false
      this.$set(this.addShopForm, 'uname', item.uname)
      this.$set(this.addShopForm, 'member_id', item.member_id)
      this.$refs.addShopForm.validateField('uname')
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.shop-add-wrap {
  padding: 30px;
  width: 30%;
}
.title {
  padding: 10px;
  color: #333;
  border-bottom: 1px solid #efefef;
}
.btn-box {
  padding: 10px;
  border-top: 1px solid #efefef;
  text-align: center;
}
</style>
