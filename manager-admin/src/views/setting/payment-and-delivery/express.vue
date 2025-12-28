<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleAddExpress">添加</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入公司名称" />
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="name" label="公司名称"/>
        <el-table-column prop="code" label="快递查询代码"/>
        <el-table-column prop="kdcode" label="菜鸟代码"/>
        <el-table-column label="电子面单" :formatter="waybillStatus"/>
        <el-table-column label="状态" :formatter="disabledStatus"/>
        <el-table-column label="操作" min-width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEditExpress(scope.$index, scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.disabled === 'OPEN'"
              size="mini"
              type="danger"
              @click="handleDisabledExpress(scope.$index, scope.row)">禁用</el-button>
            <el-button
              v-if="scope.row.disabled === 'CLOSE'"
              size="mini"
              type="success"
              @click="handleDisabledExpress(scope.$index, scope.row)">开启</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteExpress(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="tableData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.data_total">
      </el-pagination>
    </en-table-layout>
    <el-dialog
      title="物流公司"
      :visible.sync="dialogExpressVisible"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="expressForm" :rules="expressRules" ref="expressForm" label-width="120px">
        <el-form-item label="物流公司名称" prop="name">
          <el-input v-model="expressForm.name"></el-input>
        </el-form-item>
        <el-form-item label="快递查询代码" prop="code">
          <el-input v-model="expressForm.code"></el-input>
        </el-form-item>
        <el-form-item label="电子面单" prop="is_waybill">
          <el-radio-group v-model="expressForm.is_waybill">
            <el-radio :label="1">支持</el-radio>
            <el-radio :label="0">不支持</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜鸟物流代码" prop="kdcode" v-if="expressForm.is_waybill">
          <el-input v-model="expressForm.kdcode"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogExpressVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitExpressForm('expressForm')">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Express from '@/api/express'

  export default {
    name: 'expressSettings',
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
        /** 快递公司 表单 */
        expressForm: { },
        /** 快递公司 dialog */
        dialogExpressVisible: false
      }
    },
    computed: {
      /** 快递公司 表单规则 */
      expressRules() {
        let validate = {
          name: [this.MixinRequired('请输入物流公司名称！')],
          code: [this.MixinRequired('请输入快递查询代码！')],
          kdcode: [this.expressForm.is_waybill ? this.MixinRequired('请输入菜鸟物流代码！') : {}]
        }
        return validate
      }
    },
    mounted() {
      this.GET_ExpressList()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_ExpressList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_ExpressList()
      },

      /** 状态格式化 */
      disabledStatus(row, column, cellValue) {
        return row.disabled === 'OPEN' ? '已开启' : '已禁用'
      },

      /** 是否支持电子面单格式化 */
      waybillStatus(row, column, cellValue) {
        return row.is_waybill === 1 ? '支持' : '不支持'
      },

      /** 添加快递公司 */
      handleAddExpress() {
        this.expressForm = { is_waybill: 0, formItems: [] }
        this.dialogExpressVisible = true
        this.$nextTick(() => this.$refs.expressForm.clearValidate())
      },

      /** 编辑物流公司 */
      handleEditExpress(index, row) {
        const params = JSON.parse(JSON.stringify(row))
        if (typeof params.is_waybill !== 'number') {
          params.is_waybill = 0
        }

        this.expressForm = {
          name: params.name,
          code: params.code,
          is_waybill: params.is_waybill,
          kdcode: params.kdcode,
          id: params.id
        }

        this.dialogExpressVisible = true
        this.$nextTick(() => this.$refs.expressForm.clearValidate())
      },

      /** 快递公司 提交表单 */
      submitExpressForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            const { id } = this.expressForm
            let expressForm = JSON.parse(JSON.stringify(this.expressForm))
            if (!id) {
              API_Express.addExpress(expressForm).then(response => {
                this.dialogExpressVisible = false
                this.$message.success('添加成功！')
                this.GET_ExpressList()
              })
            } else {
              API_Express.editExpress(id, expressForm).then(response => {
                this.dialogExpressVisible = false
                this.$message.success('保存成功！')
                this.MixinSetTableData(this.tableData, 'id', id, response)
              })
            }
          } else {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        })
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          name: data
        }
        this.params.page_no = 1
        this.GET_ExpressList()
      },

      /** 删除物流公司 */
      handleDeleteExpress(index, row) {
        this.$confirm('确定要删除此物流公司吗？', '提示', { type: 'warning' }).then(() => {
          API_Express.deleteExpress(row.id).then(response => {
            this.$message.success('删除成功！')
            this.GET_ExpressList()
          })
        }).catch(() => {})
      },

      /** 开启或禁用物流公司 */
      handleDisabledExpress(index, row) {
        this.$confirm('确定要执行此操作吗？', '提示', { type: 'warning' }).then(() => {
          API_Express.openDisableExpress(row.id, row.disabled === 'OPEN' ? 'CLOSE' : 'OPEN').then(response => {
            this.$message.success('操作成功！')
            this.GET_ExpressList()
          })
        }).catch(() => {})
      },

      /** 获取物流公司列表 */
      GET_ExpressList() {
        this.loading = true
        API_Express.getExpressList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => {
          this.loading = false
        })
      }
    }
  }
</script>
