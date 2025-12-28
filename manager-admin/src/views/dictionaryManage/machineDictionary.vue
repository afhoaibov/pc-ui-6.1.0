<template>
  <div>
    <en-table-layout :toolbar="false" :tableData="tableData" :loading="loading">
      <template slot="table-columns">
        <el-table-column prop="name" label="平台名称" />
        <el-table-column label="启用状态">
          <template slot-scope="scope">
            {{ scope.row.open === 1 ? '已开启' : '已关闭' }}
            <el-button v-if="scope.row.open === 0" type="text"
              @click="handleOpenDictionaryGateway(scope.$index, scope.row)">开启</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary"
              @click="handleEditDictionaryGateway(scope.$index, scope.row)">编辑参数</el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
    <el-dialog title="编辑机器翻译平台参数" :visible.sync="dialogDictionaryVisible" width="500px" :modal-append-to-body="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="dictionaryForm" size="small" label-width="140px">
        <template v-for="(config, index) in dictionaryForm.config_items">
          <el-form-item :label="config.text" :key="config.name">
            <el-input v-model="config.value" clearable />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDictionaryVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDictionaryForm()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_dictionary from '@/api/dictionary'
export default {
  name: 'machineDictionary',
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
      /** 机器翻译平台 表单 */
      dictionaryForm: {
        open: 0
      },
      /** 机器翻译平台 表单 dailog */
      dialogDictionaryVisible: false
    }
  },
  mounted() {
    this.GET_MachineDictionary()
  },
  methods: {
    /** 修改机器翻译平台 */
    handleEditDictionaryGateway(index, row) {
      this.dictionaryForm = this.MixinClone(row)
      this.dialogDictionaryVisible = true
    },

    /** 开启机器翻译平台 */
    handleOpenDictionaryGateway(index, row) {
      API_dictionary.openDictionaryGatewayById(row.type).then(response => {
        this.$message.success('开启成功！')
        this.GET_MachineDictionary()
      })
    },

    /** 修改机器翻译平台参数 提交表单 */
    submitDictionaryForm() {
      const { type } = this.dictionaryForm
      API_dictionary.editDictionaryGateway(type, this.dictionaryForm.config_items).then(response => {
        this.dialogDictionaryVisible = false
        this.$message.success('修改成功！')
        this.GET_MachineDictionary()
      })
    },

    /** 获取机器翻译平台 */
    GET_MachineDictionary() {
      this.loading = true
      API_dictionary.getMachineDictionary(this.params).then(response => {
        let key = 0
        response.forEach(item => {
          response[key].config_items = JSON.parse(this.MixinClone(item.config))
          key++
        })
        this.tableData = response
        this.loading = false
      }).catch(() => { this.loading = false })
    }
  }
}
</script>
