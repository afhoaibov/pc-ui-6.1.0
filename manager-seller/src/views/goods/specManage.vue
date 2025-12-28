<template>
  <div>
    <en-table-layout
      pagination
      ref="tableLayout"
      :tableData="tableData"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button type="primary" @click="addGoodsSpec">新增规格</el-button>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="spec_group_name" label="规格名称"/>
        <el-table-column label="规格值数量">
          <template slot-scope="scope">
            <span v-if="scope.row.spec_values">{{ scope.row.spec_values.length }}</span>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="规格值">
          <template slot-scope="scope">
            <span v-if="scope.row.spec_values">{{ formatSpecValues(scope.row) }}</span>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleEditSpec(scope.row)">编辑
            </el-button>
            <el-button
              type="danger"
              @click="handleDeleteSpec(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        slot="pagination"
        v-if="pageData"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="pageData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>
    <el-dialog
      :title="`${specForm.id ? '编辑' : '添加'}规格`"
      :visible.sync="show_form_dialog"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="500px"
    >
      <el-form
        ref="specForm"
        :model="specForm"
        :rules="specRules"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item label="规格名称：" :maxlength="10" required>
          <el-input v-model="specForm.spec_group_name" placeholder="请填写规格名称"/>
        </el-form-item>
        <el-form-item label="规格值：" required>
          <el-input
            v-model="spec_value_input"
            :maxlength="10"
            placeholder="回车或者点击按钮新建，不可重复"
            @keyup.native.enter="handleAddSpecValue"
          >
            <el-button slot="append" @click="handleAddSpecValue">新建</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="specForm.spec_values" label="">
          <el-tag
            v-for="(item, index) in specForm.spec_values"
            :key="item.spec_value_name"
            type="info"
            closable
            disable-transitions
            @close="handleRemoveSpecValue(index)"
            style="margin-right: 10px"
          >
            {{ item.spec_value_name }}
          </el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="show_form_dialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSpecForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Specs from '@/api/specs'

export default {
  data() {
    return {
      /** 列表loading状态 */
      loading: false,
      /** 列表参数 */
      params: {
        page_no: 1,
        page_size: 10
      },
      /** 列表数据 */
      tableData: [],
      /** 列表分页数据 */
      pageData: {},
      /** 显示表单弹窗 */
      show_form_dialog: false,
      /** 规格表单 */
      specForm: {
        spec_group_name: '',
        spec_values: []
      },
      /** 规格规则 */
      specRules: {},
      /** 规格值临时输入 */
      spec_value_input: ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'specManage') return
        this.GET_SpecList()
      }
    }
  },
  methods: {
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_SpecList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_SpecList()
    },
    // 获取商品规格列表
    async GET_SpecList() {
      this.loading = true
      try {
        const res = await API_Specs.getSpecList(this.params)
        this.tableData = res.data
        this.pageData = {
          page_no: res.page_no,
          page_size: res.page_size,
          data_total: res.data_total
        }
      } finally {
        this.loading = false
      }
    },
    // 添加规格
    addGoodsSpec() {
      this.specForm = { spec_group_name: '' }
      this.show_form_dialog = true
      this.$nextTick(() => {
        this.$refs['specForm'].resetFields()
      })
    },
    // 编辑规格
    handleEditSpec(item) {
      this.specForm = JSON.parse(JSON.stringify(item))
      this.show_form_dialog = true
      this.$nextTick(() => {
        this.$refs['specForm'].resetFields()
      })
    },
    // 删除规格
    async handleDeleteSpec(item) {
      await this.$confirm('删除规格不影响已使用商品，确认删除吗?', '提示', { type: 'warning' })
      await API_Specs.deleteSpec(item.id)
      this.$message.success('删除成功！')
      this.params.page_no = 1
      await this.GET_SpecList()
    },
    // 添加规格值
    handleAddSpecValue() {
      const value = this.spec_value_input
      if (!value) return this.$message.error('请输入规格值名称！')
      if (!this.specForm.spec_values) {
        this.$set(this.specForm, 'spec_values', [])
      }
      if (this.specForm.spec_values.some(item => item.spec_value_name === value)) {
        return this.$message.error('规格值重复！')
      }
      this.specForm.spec_values.push({
        spec_value_name: this.spec_value_input.trim()
      })
      this.spec_value_input = ''
    },
    // 移除规格值
    handleRemoveSpecValue(index) {
      this.specForm.spec_values.splice(index, 1)
    },
    // 规格值
    formatSpecValues(row) {
      const { spec_values } = row
      if (!spec_values || !Array.isArray(spec_values)) return ''
      return spec_values.map(item => item.spec_value_name).join('；')
    },
    // 提交规格表单
    async submitSpecForm() {
      const { id, spec_group_name } = this.specForm
      if (!id && !this.specForm.spec_values) {
        this.$message.error('请添加规格值！')
        return
      }
      if (!spec_group_name) return this.$message.error('请填写规格名称！')
      this.specForm.spec_group_name = spec_group_name.trim()
      if (id) {
        await API_Specs.updateSpec(id, this.specForm)
        this.$message.success('修改成功！')
      } else {
        await API_Specs.addSpec(this.specForm)
        this.$message.success('添加成功！')
      }
      this.params.page_no = 1
      this.show_form_dialog = false
      await this.GET_SpecList()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
