<template>
  <div>
    <en-table-layout
      :tableData="tableData"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="addLevel">添加</el-button>
        </div>
        <div class="toolbar-search">
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column label="等级">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column prop="level_name" label="等级名称"/>
        <el-table-column prop="level_icon" label="等级图标">
          <template slot-scope="scope" >
            <img v-if="scope.row.level_icon" class="level-icon" :src="scope.row.level_icon" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="allocation_ratio" label="店铺分摊比例">
          <template slot-scope="scope" >
            {{scope.row.allocation_ratio}} %
          </template>
        </el-table-column>
        <el-table-column prop="benefit_ratio" label="消费折扣比例">
          <template slot-scope="scope" >
            {{scope.row.benefits[0].benefit_value}} %
          </template>
        </el-table-column>
<!--        <el-table-column prop="description" label="折扣说明">-->
<!--          <template slot-scope="scope" >-->
<!--            {{scope.row.description}}-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column prop="upgrade_conditions" label="升级规则说明">
          <template slot-scope="scope" >
            <span v-if="scope.row.upgrade_conditions && scope.row.upgrade_conditions.length > 0">
              当前等级最低积分为{{ scope.row.upgrade_conditions[0].condition_value_min }}，
              积分超过{{ scope.row.upgrade_conditions[0].condition_value_max }}升级为下一等级
            </span>
            <span v-else>无升级规则</span>
          </template>
        </el-table-column>
        <el-table-column label="是否默认" prop="is_default	">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.is_default"
							@change="changeDefault(scope.row.id)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              active-text="是"
              inactive-text="否"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.row.id)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%">
      <p>此操作将永久删除该等级，请谨慎操作</p>
      <span>该等级会员将转移至：</span>
      <el-select v-model="transfer_level_id" placeholder="设置等级">
        <el-option
          v-for="item in tableData"
          :label="item.level_name"
          :value="item.id"
          :key="item.id"
        />
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteMembersLevel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Member from '@/api/member'
  import { RegExp } from '~/ui-utils'

  export default {
    name: 'memberLevel',
    watch: {
      $route: {
        handler(val) {
          if (val.name === 'memberLevel') {
            this.getMembersLevelList()
          }
        },
        immediate: true
      }
    },
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表数据 */
        tableData: [],
        transfer_level_id: '',
        deleteId: '',
        dialogVisible: false
      }
    },

    methods: {
      handleEdit(id) {
        this.$router.push({ path: `/member/member-level-edit/${id}` })
      },
      /** 删除等级 */
      deleteMembersLevel() {
        if (!this.transfer_level_id) {
          this.$message.error('请选择转移等级！')
          return
        }
        API_Member.deleteMembersLevel(this.deleteId, {
          transfer_level_id: this.transfer_level_id
        }).then(res => {
          this.getMembersLevelList()
          this.$message.success('删除成功！')
          this.dialogVisible = false
        })
      },
      /** 删除 */
      handleDelete(id) {
        this.dialogVisible = true
        this.deleteId = id
      },
      addLevel() {
        this.$router.push({ name: 'memberLevelAdd' })
      },
      /** 设置为默认等级 */
      changeDefault(id) {
        API_Member.updateMembersLevelStatus(id).then(res => {
          this.$message.success('设置成功！')
          this.getMembersLevelList()
        })
      },

      /** 获取等级列表 */
      getMembersLevelList() {
        this.loading = true
        API_Member.getMembersLevelList().then(response => {
          this.loading = false
          this.tableData = response.map(item => {
            item.is_default = Number(item.is_default)
            return item
          })
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

.level-icon {
 width: 80px;
 height: 80px;
}

</style>
