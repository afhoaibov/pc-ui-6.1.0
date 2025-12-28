<template>
  <div class="container member-list">
    <en-table-layout :tableData="tableData.data" :loading="loading" :showDrawer="showDrawer" :drawerTitle="drawerTitle"
      @closeDrawer="showDrawer = false">
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleAddMember">添加</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" @advancedSearch="advancedSearchEvent" advanced placeholder="请输入会员名或手机号"
            :advancedWidth="500">
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                <el-form-item label="用户名">
                  <el-input size="medium" v-model="advancedForm.uname" clearable></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input size="medium" v-model="advancedForm.mobile" clearable></el-input>
                </el-form-item>
                <el-form-item label="电子邮箱">
                  <el-input size="medium" v-model="advancedForm.email" clearable></el-input>
                </el-form-item>
                <el-form-item label="会员性别">
                  <el-radio-group v-model="advancedForm.sex">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="0">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="注册时间区间">
                  <el-date-picker
                    style="width: 100%"
                    v-model="advancedForm.register_time_range"
                    type="datetimerange"
                    :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
                    range-separator="-"
                    align="right"
                    :editable="false"
                    unlink-panels
                    value-format="timestamp"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="uname" label="用户名">
          <template slot-scope="scope">
            <span class="drawer-text" @click="handlePreView(scope.row)">{{ scope.row.uname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" width="120">
          <template slot-scope="scope">
            <clipboard v-if="scope.row.mobile" :text="scope.row.mobile | formatMobile" />
            <span v-else> - </span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮箱" />
        <el-table-column label="注册时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column label="上次登录时间">
          <template slot-scope="scope">
            <span v-if="scope.row.last_login">
              {{ scope.row.last_login | unixToDate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="login_count" label="登录次数" />
        <el-table-column prop="sex" label="性别" :formatter="formatterSex" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">{{ scope.row.status ? '正常' : '已休眠' }}</template>
        </el-table-column>

        <el-table-column label="操作" width="260">
          <template slot-scope="scope">
            <el-dropdown
              size="medium"
              type="primary"
              trigger="click"
              @command="(command) => commandEvent(command, scope.row)">
            <el-button type="primary">
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="recover" v-if="!scope.row.status">恢复</el-dropdown-item>
                <el-dropdown-item command="topUp">充值</el-dropdown-item>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="forbidden">禁用</el-dropdown-item>
                <el-dropdown-item command="message">消息</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </template>

      <el-pagination v-if="tableData" slot="pagination" @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange" :current-page="tableData.page_no" :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size" layout="total, sizes, prev, pager, next, jumper" :total="tableData.data_total">
      </el-pagination>
      <!-- 侧边预览 -->
      <member-preview slot="drawer" :memberId="currentRow.member_id" />
    </en-table-layout>

    <!-- 新增会员弹窗 -->
    <add-member-dialog
      :value="dialogAddMemberVisible"
      @onClose="dialogAddMemberVisible = false"
      @addMemberEvent="addMemberEvent" />
  </div>
</template>

<script>
import * as API_Member from '@/api/member'
import MemberPreview from '../components/MemberPreview'
import AddMemberDialog from '@/components/AddMemberDialog'

export default {
  name: 'memberList',
  components: {
    MemberPreview,
    AddMemberDialog
  },
  data() {
    return {
      /** 列表loading状态 */
      loading: false,

      /** 列表参数 */
      params: {
        page_no: 1,
        page_size: 20
      },

      /** 列表数据 */
      tableData: '',

      /** 高级搜索数据 */
      advancedForm: {},

      /** 添加会员 dialog */
      dialogAddMemberVisible: false,

      // 侧边预览显隐
      showDrawer: false,
      // 当前预览会员数据
      currentRow: {},
      areaCode: ''
    }
  },
  computed: {
    drawerTitle() {
      if (this.currentRow.member_id) {
        return this.currentRow.uname
      }
      return ''
    }
  },
  mounted() {
    this.GET_MemberList()
  },
  methods: {
    /** 国家选择切换 */
    countryChange(e) {
      this.areaCode = e.tel
    },
    /** 显示预览 */
    handlePreView(row) {
      this.showDrawer = true
      this.currentRow = row
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_MemberList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_MemberList()
    },
    /** 操作分发 */
    commandEvent(command, row) {
      switch (command) {
        case 'recover':
          this.handleEditMemberStatus(row)
          return
        case 'topUp':
          this.handlerTopUp(row)
          return
        case 'edit':
          this.$router.push({ path: `/member/edit/${row.member_id}` })
          return
        case 'forbidden':
          this.handleDeleteMember(row)
          return
        case 'message':
          this.handleOpenChat(row)
          return
      }
    },

    /** 恢复已休眠的会员 */
    handleEditMemberStatus(row) {
      API_Member.editMembersStatus(row.member_id).then(() => {
        this.$message.success('恢复成功！')
        this.GET_MemberList()
      })
    },

    /** 充值 */
    handlerTopUp(row) {
      this.$router.push({
        name: 'memberTopUp',
        query: {
          memberId: row.member_id,
          nickname: row.uname
        }
      })
    },

    handleDeleteMember(row) {
      this.$confirm('确定要禁用这个会员吗？', '提示', { type: 'warning' }).then(() => {
        API_Member.deleteMember(row.member_id).then(() => {
          this.$message.success('禁用成功！')
          this.GET_MemberList()
        })
      }).catch(() => { })
    },

    /** 性别格式化 */
    formatterSex(row, column, cellValue) {
      return row.sex === 1 ? '男' : '女'
    },

    /** 添加会员 */
    handleAddMember() {
      this.dialogAddMemberVisible = true
    },

    /** 添加会员回调 */
    addMemberEvent() {
      this.dialogAddMemberVisible = false
      this.GET_MemberList()
    },

    /** 搜索事件触发 */
    searchEvent(keyword) {
      this.params.keyword = keyword
      Object.keys(this.advancedForm).forEach(key => delete this.params[key])
      this.params.page_no = 1
      this.GET_MemberList()
    },

    /** 高级搜索事件触发 */
    advancedSearchEvent() {
      const { advancedForm } = this
      const { register_time_range, sex } = advancedForm
      Object.keys(this.advancedForm).forEach(key => {
        if (advancedForm[key] !== undefined) {
          this.params[key] = advancedForm[key]
        }
      })
      if (register_time_range && register_time_range.length === 2) {
        this.params.start_time = register_time_range[0] / 1000
        this.params.end_time = register_time_range[1] / 1000
      } else {
        delete this.params.start_time
        delete this.params.end_time
      }
      delete this.params.register_time_range
      delete this.params.keyword
      if (sex === -1) delete this.params.sex
      this.params.page_no = 1
      this.GET_MemberList()
    },

    /** 获取会员列表 */
    GET_MemberList() {
      this.loading = true
      const { params } = this
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) {
          delete params[key]
        }
      })
      API_Member.getMemberList(params).then(response => {
        this.loading = false
        this.tableData = response
        this.tableData.data.forEach(item => {
          if (item.mobile == null) {
            item.mobile = ''
          }
        })
      }).catch(() => { this.loading = false })
    },

    /** 打开im窗口 */
    handleOpenChat(row) {
      let routeUrl = this.$router.resolve({
        path: '/chat',
        query: { member_id: row.member_id }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.show-pwd {
  position: absolute;
  top: 0;
  right: 10px;
  cursor: pointer;
}

.drawer-text {
  color: #006BB4;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.el-date-editor.el-input {
  width: 180px;
}

.member-list ::v-deep .form-item-sex .el-form-item__content {
  width: 180px;
}

.member-list ::v-deep .form-item-region .el-form-item__content {
  min-width: 180px;
}

.member-list ::v-deep .el-form-item--mini.el-form-item,
.member-list ::v-deep .el-form-item--small.el-form-item {
  margin-bottom: 30px;
}

</style>
