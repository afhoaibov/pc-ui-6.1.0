<template>
  <div>
    <en-table-layout
      :tableData="cainiaoTemplateTableData"
      :loading="loading">
      <template slot="table-columns">
        <!--物流公司-->
        <el-table-column prop="logistics_company_do.name" label="物流公司"/>
        <!--公司状态-->
        <el-table-column label="电子面单模板">
          <template slot-scope="scope">
            <el-select v-model="scope.row.template_url" size="medium" clearable placeholder="请选择面单模板" style="width: 100%;">
              <el-option
                v-for="item in scope.row.template_list"
                :key="item.url"
                :label="item.name"
                :value="item.url">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="saveLogisticsTemplate(scope.row)">保存
            </el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
  </div>
</template>
<script>

import * as API_logistics from '@/api/expressCompany'

export default {
  name: 'CainiaoTemplate',
  data() {
    return {
      loading: false,
      /** 菜鸟电子面单模板的物流公司 */
      cainiaoTemplateTableData: []
    }
  },
  created() {
    this.GET_logisticsCainiaoTemplateList()
  },
  methods: {
    saveLogisticsTemplate(row) {
      const param = {
        template_url: row.template_url
      }
      API_logistics.saveLogisticsCainiaoTemplate(row.logistics_company_do.id, param).then(() => {
        this.$message.success('保存电子面单模板成功')
      })
    },
    /** 获取菜鸟电子面单模板物流公司信息*/
    GET_logisticsCainiaoTemplateList() {
      this.loading = true
      API_logistics.getLogisticsCainiaoTemplateList({}).then(response => {
        this.loading = false
        this.cainiaoTemplateTableData = response
      })
    }
  }
}

</script>
<style lang="scss" scoped>
</style>
