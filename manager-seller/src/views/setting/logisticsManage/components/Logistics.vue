<template>
  <div>
    <en-table-layout
      :tableData="logisticsTableData"
      :loading="loading">
      <template slot="table-columns">
        <!--物流公司-->
        <el-table-column prop="logistics_company_do.name" label="物流公司"/>
        <!--公司状态-->
        <el-table-column label="公司状态">
          <template slot-scope="scope">
            <span v-if="!scope.row.open">未选择</span>
            <span v-if="scope.row.open" class="company-choosed">已选择</span>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              type="success"
              v-if="!scope.row.open"
              :disabled="scope.row.logistics_company_do.disabled === 'CLOSE'"
              @click="handleLogisticsSwitch(scope.row)">开启
            </el-button>
            <el-button
              type="danger"
              v-if="scope.row.open"
              @click="handleLogisticsSwitch(scope.row)">关闭
            </el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
  </div>
</template>
<script>

import * as API_logistics from '@/api/expressCompany'

export default ({
  name: 'Logistics',
  data() {
    return {
      loading: false,
      /** 物流公司列表数据 */
      logisticsTableData: []
    }
  },
  created() {
    this.GET_logisticsList()
  },
  methods: {
    /** 物流公司信息开启 /关闭 */
    handleLogisticsSwitch(row) {
      let _ctip = ''
      if (row.open) {
        _ctip = '确定要关闭吗'
      } else {
        _ctip = '确定要开启吗'
      }
      this.$confirm(_ctip, '确认信息').then(() => {
        row.open ? this.closeLogistics(row) : this.openLogistics(row)
      })
    },
    /** 执行关闭  */
    closeLogistics(row) {
      API_logistics.closeExpressPower(row.logistics_company_do.id, {}).then(() => {
        this.$message.success('关闭成功')
        this.GET_logisticsList()
      })
    },

    /** 执行开启 */
    openLogistics(row) {
      API_logistics.openExpressPower(row.logistics_company_do.id, {}).then(() => {
        this.$message.success('开启成功')
        this.GET_logisticsList()
      })
    },

    /** 获取物流公司信息*/
    GET_logisticsList() {
      this.loading = true
      API_logistics.getExpressCompanyList({}).then(response => {
        this.loading = false
        this.logisticsTableData = response
      })
    }
  }
})

</script>
<style lang="scss" scoped>
</style>
