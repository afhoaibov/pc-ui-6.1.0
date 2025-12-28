<template>
  <div class="interface-dictionary">
    <en-table-layout
      :table-data="tableData.data"
      :loading="loading"
      tips
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          请根据excel模板 <a :href="`${API.admin}/import-tpl/i18n-ui.xlsx`" target="_blank">[点击此处下载模板]</a> 填写信息，导入的excel大小限制为2M
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="addUILang">添加</el-button>
          <el-button size="mini" type="primary" @click="importDialogVisible = true">导入文件</el-button>
        </div>

        <div style="display: flex">
          <div class="search-box">
            <span class="label-text">类型：</span>
            <el-select
              v-model="params.ui_type"
              placeholder="请选择"
              @change="getInterfaceDictionary">
              <el-option label="全部" value=""/>
              <el-option label="界面" value="ui"/>
              <el-option label="菜单" value="router"/>
            </el-select>
          </div>

          <div class="search-box">
            <el-checkbox
              v-model="params.whether_like"
              :true-label="1"
              :false-label="0"
              @change="getInterfaceDictionary">模糊匹配</el-checkbox>
          </div>
          <div class="toolbar-search">
            <en-table-search @search="searchEvent" placeholder="请输入关键字"/>
          </div>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column
          prop="i18n_key"
          label="KEY" />
        <el-table-column
          v-for="item in tableHeader"
          :key="item.code"
          :prop="item.code"
          :label="item.lang" />

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.row)">编辑</el-button>
             <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 编辑弹窗 -->
    <add-interface-dialog
      :value="dialogData.show"
      :title="dialogData.title"
      :tableHeader="tableHeader"
      :defaultData="dialogData.defaultData"
      @close="closeDialog"
      @submitEvent="submitEdit" />

    <!-- 数据导入弹窗 -->
    <import-Dialog
      :value="importDialogVisible"
      :uploadAction="uploadAction"
      @close="importDialogVisible = false"
      @success="getInterfaceDictionary" />

  </div>
</template>

<script>
  import * as API_dictionary from '@/api/dictionary'
  import { cloneObj } from '@/utils/index'
  import AddInterfaceDialog from './components/AddInterfaceDialog'
  import ImportDialog from './components/ImportDialog'
  import { api as API } from '~/ui-domain'

  export default {
    name: 'interfaceDictionary',
    components: {
      AddInterfaceDialog,
      ImportDialog
    },
    data() {
      return {
        API,
        /** 列表loading状态 */
        loading: false,
        /** 列表数据 */
        tableData: {},
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10,
          whether_like: 0
        },
        /** 表头数据 */
        tableHeader: [],

        /** 弹窗config */
        dialogData: {
          show: false,
          title: '编辑',
          defaultData: null
        },
        importDialogVisible: false,
        uploadAction: `${API.admin}/admin/i18n/ui-dict/imports/ui`
      }
    },
    mounted() {
      this.getOpenLangCode()
    },
    methods: {
      addUILang() {
        this.dialogData.title = '新增'
        this.dialogData.show = true
        this.dialogData.defaultData = null
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getInterfaceDictionary()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getInterfaceDictionary()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.lang = data
        if (!data) delete this.params.lang
        this.getInterfaceDictionary()
      },

      /** 获取已开启的语言编码 */
      getOpenLangCode() {
        API_dictionary.getOpenLangCode().then(res => {
          this.tableHeader = res
          if (res.length) {
            this.getInterfaceDictionary()
          }
        })
      },

      /** 获取界面字典列表 */
      getInterfaceDictionary() {
        this.loading = true
        API_dictionary.getInterfaceDictionary(this.params).then(res => {
          this.loading = false
          this.tableData = res
        }).catch(() => {
          this.loading = false
        })
      },

      /** 关闭编辑弹窗 */
      closeDialog() {
        this.dialogData.show = false
      },

      /** 删除翻译字段 */
      handleDelete(row) {
        API_dictionary.deleteInterfaceDictionary({ key_id: row.key_id }).then(res => {
          this.$message.success('删除成功！')
          this.getInterfaceDictionary()
        })
      },

      /** 字典编辑 */
      handleEdit(row) {
        this.dialogData.title = '编辑'
        this.dialogData.show = true
        this.dialogData.defaultData = cloneObj(row)
      },

      /** 字典编辑表单提交 */
      async submitEdit(data) {
        const defaultData = this.dialogData.defaultData
        if (defaultData && defaultData.key_id) {
          // 当前为编辑
          await API_dictionary.updateInterfaceDictionary(defaultData.key_id, data)
        } else {
          await API_dictionary.addInterfaceDictionary(data)
        }
        this.closeDialog()
        this.$message.success('保存成功！')
        this.getInterfaceDictionary()
      }

    }
  }
</script>

<style scoped lang="scss">
.interface-dictionary ::v-deep .inner-toolbar {
  justify-content: space-between !important;
  .search-box {
    margin-right: 20px;
    display: flex;
    align-items: center;
    .label-text {
      font-size: 14px;
      color: #333;
    }
  }
}

</style>
