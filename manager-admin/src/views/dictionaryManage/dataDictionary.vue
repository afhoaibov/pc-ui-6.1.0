<template>
  <div>
    <en-table-layout
      :table-data="tableData.data"
      :loading="loading"
      tips
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          请根据excel模板 <a :href="`${API.admin}/import-tpl/i18n-data.xlsx`" target="_blank">[点击此处下载模板]</a> 填写信息，导入的excel大小限制为2M
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="addDataLang">添加</el-button>
          <el-button size="mini" type="primary" @click="importDialogVisible = true">导入文件</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入关键字"/>
        </div>
      </div>

      <template slot="table-columns">
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
              @click="deleteDataDictionary(scope.row)">删除</el-button>
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
    <update-dialog
      v-model="dialogData.show"
      :title="dialogData.title"
      :tableHeader="tableHeader"
      :defaultData="dialogData.defaultData"
      @close="closeDialog"
      @submitEvent="submitEvent" />

    <!-- 数据导入弹窗 -->
    <import-Dialog
      :value="importDialogVisible"
      :uploadAction="uploadAction"
      @close="importDialogVisible = false"
      @success="getDataDictionaryList" />
  </div>
</template>

<script>
  import * as API_dictionary from '@/api/dictionary'
  import { cloneObj } from '@/utils/index'
  import UpdateDialog from './components/UpdateDialog'
  import ImportDialog from './components/ImportDialog'
  import Storage from '@/utils/storage'
  import { api as API } from '~/ui-domain'

  export default {
    name: 'dataDictionary',
    components: {
      UpdateDialog,
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
          page_size: 10
        },
        /** 表头数据 */
        tableHeader: [],
        /** 编辑弹窗config */
        dialogData: {
          show: false,
          title: '新增',
          defaultData: null
        },
        /** 导入弹窗显隐 */
        importDialogVisible: false,
        uploadAction: `${API.admin}/admin/i18n/data-dict/import`
      }
    },
    mounted() {
      this.getOpenLangCode()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getDataDictionaryList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getDataDictionaryList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params.page_no = 1
        this.params.lang = data
        if (!data) delete this.params.lang
        this.getDataDictionaryList()
      },

      /** 获取已开启的语言编码 */
      getOpenLangCode() {
        this.loading = true
        API_dictionary.getOpenLangCode().then(res => {
          this.tableHeader = res
          if (res.length) {
            this.getDataDictionaryList()
          }
        }).catch(() => {
          this.loading = false
        })
      },

      /** 获取数据字典列表 */
      getDataDictionaryList() {
        API_dictionary.getDataDictionaryList(this.params).then(res => {
          this.loading = false
          this.tableData = res
        }).catch(() => {
          this.loading = false
        })
      },

      /** 弹窗编辑回调 */
      submitEvent(list) {
        const dialogData = this.dialogData
        if (dialogData.defaultData) {
          this.submitEdit(list)
        } else {
          this.submitAdd(list)
        }
      },

      /** 新增字典提交 */
      submitAdd(list) {
        API_dictionary.addDataDictionary(list).then(res => {
          this.closeDialog()
          this.$message.success('添加成功！')
          this.getDataDictionaryList()
        })
      },

      /** 字典编辑表单提交 */
      submitEdit(list) {
        const defaultData = this.dialogData.defaultData
        API_dictionary.updateDataDictionary(defaultData.group_sn, list).then(res => {
          this.closeDialog()
          this.$message.success('保存成功！')
          this.getDataDictionaryList()
        })
      },

      /** 关闭编辑弹窗 */
      closeDialog() {
        this.dialogData.show = false
      },

      /** 新增字典 */
      addDataLang() {
        this.dialogData.title = '新增'
        this.dialogData.show = true
        this.dialogData.defaultData = null
      },

      /** 字典编辑 */
      handleEdit(row) {
        this.dialogData.show = true
        this.dialogData.title = '编辑'
        this.dialogData.defaultData = cloneObj(row)
      },

      /** 删除数据字典 */
      deleteDataDictionary(row) {
        API_dictionary.deleteDataDictionary(row.group_sn).then(res => {
          this.$message.success('删除成功！')
          this.getDataDictionaryList()
        })
      },

      /** 导入模板下载 */
      uploadTemplate() {
        this.$http({
          method: 'get',
          url: `${API.admin}/import-tpl/i18n-data.xlsx`,
          headers: this.MixinAccessToken,
          responseType: 'blob'
        }).then((res) => {
          let url = window.URL.createObjectURL(res.data)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', `数据字典导入模板.xlsx`)
          document.body.appendChild(link)
          link.click()
          // 删除添加的a链接
          let objLink = document.getElementById('downloadLink')
          document.body.removeChild(objLink)
        })
      }

    }
  }
</script>

<style scoped lang="scss">

</style>
