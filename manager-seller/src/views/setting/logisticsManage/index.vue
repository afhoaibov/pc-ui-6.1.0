<template>
  <div class="logistics-manage">
    <el-tabs v-model="activeName" @tab-click="handleToggleClick">
      <el-tab-pane label="快递模板" name="express">
        <express-template
          v-if="activeName === 'express'"
          @addOrEditTemplate="handlerAddOrEditTemplate"
        />
      </el-tab-pane>
      <el-tab-pane :label="tplOperaName" name="add" :disabled="!!editTmpId">
        <add-template :editTmpId="editTmpId" @addTemplate="addTemplateEvent"/>
      </el-tab-pane>
      <el-tab-pane label="物流公司" name="logistics">
        <logistics v-if="activeName === 'logistics'" />
      </el-tab-pane>
      <el-tab-pane label="菜鸟电子面单" name="cainiao">
        <cn-express-config />
      </el-tab-pane>
      <el-tab-pane label="菜鸟电子面单模板" name="cainiaoTemplate">
        <cainiao-template v-if="activeName === 'cainiaoTemplate'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import ExpressTemplate from './components/ExpressTemplate'
import AddTemplate from './components/AddTemplate'
import Logistics from './components/Logistics'
import CnExpressConfig from './components/CnExpressConfig'
import CainiaoTemplate from './components/CainiaoTemplate'

export default {
  name: 'logisticsManage',
  components: {
    ExpressTemplate,
    AddTemplate,
    Logistics,
    CnExpressConfig,
    CainiaoTemplate
  },
  data() {
    return {
      // 当前选中面板
      activeName: 'express',
      tplOperaName: '新增模板',
      // 当前编辑模版
      editTmpId: ''
    }
  },
  methods: {
    /** 新增编辑提交成功回调 */
    addTemplateEvent() {
      this.activeName = 'express'
      this.tplOperaName = '新增模板'
      this.editTmpId = ''
    },
    /** 新增或编辑操作触发 */
    handlerAddOrEditTemplate(id = null) {
      this.activeName = 'add'
      if (id) {
        this.tplOperaName = '编辑模板'
        this.editTmpId = id
      }
    },
    /** 切换tab */
    handleToggleClick() {
      this.tplOperaName = '新增模板'
      this.editTmpId = ''
    }
  }
}

</script>

<style lang="scss" scoped>
.logistics-manage ::v-deep .el-tabs__item {
  .is-disabled {
    color: inherit;
  }
}
</style>
