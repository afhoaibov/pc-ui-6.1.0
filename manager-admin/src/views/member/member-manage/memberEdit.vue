<template>
  <div class="member-edit">
    <el-tabs type="border-card">
      <el-tab-pane label="编辑会员">

        <el-form :model="editMemberForm" :rules="editMemberRules" ref="editForm" inline label-width="100px">
          <el-form-item label="密码" prop="password">
            <el-input v-model="editMemberForm.password" placeholder="不填则不更改" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editMemberForm.email" :maxlength="50"></el-input>
          </el-form-item>

          <el-form-item label="会员地区" class="form-item-region">
            <en-region-picker
              :api="MixinRegionApi"
              :default="defaultRegion"
              @changed="handleRegionChanged"
              @handleCountryChanged="handleCountryChanged"
            />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="editMemberForm.address" :maxlength="50"></el-input>
          </el-form-item>

          <el-form-item label="会员备注">
            <el-input placeholder="请输入会员备注" v-model="editMemberForm.remark" clearable></el-input>
          </el-form-item>

          <en-area-select
              :showType="1"
              ref="AreaSelect"
              :areaCode="areaCode"
              v-model="editMemberForm.mobile" />

          <el-form-item label="生日">
            <el-date-picker v-model="editMemberForm.birthday" type="date" :editable="false" value-format="timestamp"
              placeholder="选择生日" :picker-options="{ disabledDate(time) { return time.getTime() > Date.now() } }">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="会员等级">
            <span class="level-text">{{editMemberForm.level_name || '-'}}</span>
            <el-button type="success" plain @click="dialogVisible = true">修改等级</el-button>
          </el-form-item>
          <el-form-item label="性别" class="form-item-sex">
            <el-radio v-model="editMemberForm.sex" :label="1">男</el-radio>
            <el-radio v-model="editMemberForm.sex" :label="0">女</el-radio>
          </el-form-item>
          <el-form-item label="固定电话">
            <el-input v-model="editMemberForm.tel"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="submitEditMemberForm('editForm')" class="save">保存修改</el-button>
        <el-button type="primary" v-if="lockStatus" @click="handleUnLockStatus" class="save">解锁(账号已锁定)</el-button>
      </el-tab-pane>

      <el-tab-pane label="TA的订单">
        <member-list-order :member-id="member_id" />
      </el-tab-pane>
      <el-tab-pane label="消费积分">
        <el-form :model="editPointForm" ref="editPointForm" label-width="100px">
          <el-form-item label="当前消费积分">
            {{ editPointForm.currentPoint }}
          </el-form-item>
          <el-form-item label="调整消费积分">
            <el-input-number v-model="editPointForm.changedPoint" :max="99999999" class="myNumber"></el-input-number>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleSavePoint" class="save">保存修改</el-button>
      </el-tab-pane>
      <el-tab-pane label="TA的积分">
        <member-list-points :member-id="member_id" />
      </el-tab-pane>
      <el-tab-pane label="TA的咨询">
        <member-list-ask :member-id="member_id" />
      </el-tab-pane>
      <el-tab-pane label="TA的评论">
        <member-list-comments :member-id="member_id" />
      </el-tab-pane>
      <el-tab-pane label="TA的收货地址">
        <member-list-address :member-id="member_id" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%">
      <el-select v-model="levelId" placeholder="设置等级">
        <el-option
          v-for="item in levelList"
          :label="item.level_name"
          :value="item.id"
          :key="item.id"
        />
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMemberLevel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from '@/api/member'
import { RegExp, Foundation } from '~/ui-utils'
import MemberListAddress from '../components/MemberListAddress'
import MemberListComments from '../components/MemberListComments'
import MemberListAsk from '../components/MemberListAsk'
import MemberListOrder from '../components/MemberListOrder'
import MemberListPoints from '../components/MemberListPoints'

export default {
  name: 'memberEdit',
  components: {
    MemberListAddress,
    MemberListPoints,
    MemberListAsk,
    MemberListComments,
    MemberListOrder
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      member_id: this.$route.params.id,
      // 编辑会员 表单
      editMemberForm: {},
      // 编辑会员 表单规则
      editMemberRules: {
        password: [
          {
            validator: (rule, value, callback) => {
              if (value !== 0 && !value) {
                callback()
              } else if (!RegExp.password.test(value)) {
                callback(new Error('密码应为6-20位英文或数字！'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      // 地区id数组
      defaultRegion: null,
      // 编辑积分 表单
      editPointForm: {
        currentPoint: 0,
        changedPoint: 0
      },
      dialogVisible: false,
      // 锁点状态
      lockStatus: false,
      areaCode: '',
      levelList: [],
      levelId: ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'memberEdit') return
        this.member_id = newVal.params.id
        if (this.member_id) {
          this.editMemberForm = {}
          this.GET_MemberDetail()
          this.getMembersLevelList()
        }
      }
    }

  },
  methods: {
    handleRegionChanged(region) {
      this.editMemberForm.region = JSON.stringify(region)
    },
    handleCountryChanged(country) {
      this.areaCode = country.tel
    },
    /** 提交修改会员表单 */
    submitEditMemberForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const params = this.MixinClone(this.editMemberForm)
          params.birthday /= 1000
          params.mobile = this.$refs.AreaSelect.mobileValue
          API_Member.editMember(params.member_id, params).then(() => {
            this.$message.success('修改成功！')
          })
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 修改会员等级 */
    editMemberLevel(id) {
      API_Member.editMemberLevel(this.member_id, this.levelId).then(response => {
        this.$message.success('设置成功')
        this.dialogVisible = false
        this.GET_MemberDetail()
      })
    },
    /** 保存积分 */
    handleSavePoint() {
      const { changedPoint } = this.editPointForm
      API_Member.editMemberConsumPoint(this.member_id, changedPoint).then(() => {
        this.$message.success('修改成功！')
        this.editPointForm.currentPoint = changedPoint
      })
    },
    /** 获取等级列表 */
    getMembersLevelList() {
      API_Member.getMembersLevelList().then(response => {
        this.levelList = response
      })
    },
    /** 解除锁定状态 */
    handleUnLockStatus() {
      API_Member.editMembersUnLockStatus(this.member_id).then(() => {
        this.lockStatus = false
        this.$message.success('解锁成功！')
      })
    },
    /** 获取会员详情 */
    GET_MemberDetail() {
      API_Member.getMemberDetail(this.member_id).then(response => {
        response.birthday *= 1000
        this.editMemberForm = response
        this.editPointForm.currentPoint = response.consum_point
        this.editPointForm.changedPoint = response.consum_point
        this.defaultRegion = this.MixinGetRegionDefaultData(response)
        this.levelId = response.level_id
        this.GET_MembersLockStatus()
      })
    },
    /** 获取会员锁点状态 */
    GET_MembersLockStatus() {
      API_Member.getMembersLockStatus(this.member_id).then(response => {
        this.lockStatus = response
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.el-date-editor.el-input {
  width: 180px;
}

.member-edit ::v-deep .form-item-sex .el-form-item__content {
  width: 180px;
}

.form-item-region {
  display: inline-flex;
  align-items: center;
  height: 100%;
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}

.member-edit ::v-deep .el-form-item__error {
  min-width: 240px;
}

.member-edit ::v-deep .el-tabs__content {
  overflow: initial;
}

.member-edit ::v-deep .el-tab-pane .el-button.save {
  margin-left: 100px;
}

.myNumber {
  width: 160px;
}

</style>
