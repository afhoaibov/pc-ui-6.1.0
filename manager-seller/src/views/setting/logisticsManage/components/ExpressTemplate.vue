<template>
  <div class="express-template-wrap">
    <div style="margin-bottom: 10px;">
      <el-button type="primary" @click="handleAddMould">新增模板</el-button>
    </div>
    <el-collapse v-for="(item, index) in tableData" :key="index">
      <el-collapse-item>
        <template slot="title">
          <div class="colla-title">
            <span>{{ item.name }}</span>
            <div>
              <el-button type="text" plain @click.stop="handleEditMould(item)">编辑</el-button>
              <el-button type="text" plain @click.stop="handleDeleteMould(item)" v-if="!item.is_default">删除</el-button>
            </div>
          </div>
        </template>
        <en-table-layout
          :stripe="false"
          border
          :tableData="item.items"
          :loading="loading">
          <template slot="table-columns">
            <!--计费区域-->
            <el-table-column label="计费区域" align="left">
              <template slot-scope="scope">
                <div>
                  <span v-for="(item, index) in scope.row.regions">
                    <span style="color: #333;"> {{ item.name }}
                      <span v-if="++index !== scope.row.regions.length">、</span>
                    </span>
                    <span v-if="item.children" style="color: #777;">
                      <span style="color: #aaa;">(</span>
                      <span v-for="(child, _index) in item.children" style="color: #aaa;">
                        {{ child.name }}<span v-if="++_index !== item.children.length">,</span>
                      </span>
                      <span style="color: #aaa;">)</span>
                    </span>
                  </span>
                </div>
              </template>
            </el-table-column>
            <!--首重（kg）-->
            <el-table-column prop="first_company" :label="item.type === 1 ? '首重（kg）': '首件（个）'" />
            <el-table-column label="运费">
              <template slot-scope="scope">
                <span>{{ scope.row.first_price | unitPrice }}</span>
              </template>
            </el-table-column>
            <!--续重（kg）-->
            <el-table-column prop="continued_company" :label="item.type === 1 ? '续重（kg）': '续件（个）'"/>
            <el-table-column label="续费">
              <template slot-scope="scope">
                <span>{{ scope.row.continued_price | unitPrice }}</span>
              </template>
            </el-table-column>
          </template>
        </en-table-layout>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>

import * as API_express from '@/api/expressMould'

export default {
  name: 'ExpressTemplate',
  data() {
    return {
      loading: false,
      // 快递模板列表参数
      params: {},
      // 快递模板列表数据
      tableData: []
    }
  },
  created() {
    this.GET_ExpressMould()
  },
  methods: {
    /** 获取快递模板列表信息 */
    GET_ExpressMould() {
      this.loading = true
      API_express.getTplList().then(response => {
        this.loading = false
        this.tableData = response
      })
    },
    /** 新增模板 */
    handleAddMould() {
      this.$emit('addOrEditTemplate')
    },
    /** 编辑模版 */
    handleEditMould(item) {
      this.$emit('addOrEditTemplate', item.id)
    },
    /** 删除模版 */
    handleDeleteMould(row) {
      const _id = row.id
      this.$confirm('确定要删除模板么?', '确认信息', { type: 'warning' })
        .then(() => {
          API_express.deleteExpressMould(_id).then(() => {
            this.GET_ExpressMould()
            this.$message.success('删除成功')
          })
        })
    }
  }
}

</script>
<style lang="scss" scoped>
.express-template-wrap {
  background: #fff;
  padding: 20px;
  ::v-deep .el-button.is-plain, .el-button.is-plain:hover {
    border: none;
    background: none;
  }
  ::v-deep .el-collapse {
    border-bottom: none;
    .el-collapse-item__header {
      background-color: transparent;
    }
    .el-collapse-item{
      margin-bottom: 10px;
      background-color: #f6f6f6;
    }
    .el-collapse-item__wrap {
      border-bottom: 0;
    }
  }
  .colla-title {
    width: 100%;
    padding: 0 15px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    background-color: #f6f6f6;
  }
}

</style>
