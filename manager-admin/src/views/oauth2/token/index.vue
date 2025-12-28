<template>
  <div>
    <en-table-layout :tableData="tableData.data" :loading="loading" @selection-change="handleSelectionChange">
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="danger" icon="el-icon-delete" :disabled="multipleSelection.length === 0"
            v-if="checkPermission(['oauth2Token:delete'])" @click="handleDelete">删除</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入客户端id" @advancedSearch="advancedSearchEvent">
          </en-table-search>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="client_id" label="客户端id" />
        <el-table-column prop="access_token" label="访问令牌" />
        <el-table-column prop="expires_time" label="过期时间">
          <template slot-scope="scope">{{ scope.row.expires_time | unixToDate }}</template>
        </el-table-column>
      </template>

      <el-pagination v-if="tableData" slot="pagination" @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange" :current-page="tableData.page_no" :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size" layout="total, sizes, prev, pager, next, jumper" :total="tableData.data_total">
      </el-pagination>
    </en-table-layout>
  </div>
</template>

<script>
import * as API_OAuth2Token from '@/api/oauth2Token'
export default {
  name: 'oauth2Token',
  data() {
    return {
      // 列表loading状态
      loading: false,
      // 列表参数
      params: {
        page_no: 1,
        page_size: 10
      },
      // 列表数据
      tableData: '',
      advancedForm: {

      },
      multipleSelection: []
    }
  },
  watch: {
  },
  mounted() {
    this.GET_List()
  },
  methods: {
    /** 高级搜索事件触发 */
    advancedSearchEvent() {
      this.params = {
        ...this.params,
        ...this.advancedForm
      }
      this.params.page_no = 1
      this.GET_List()
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_List()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_List()
    },

    /** 多选改变 */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    /** 删除 */
    handleDelete() {
      const accessTokens = this.multipleSelection.map(item => item.access_token)
      this.$confirm('确定要删除吗？', '提示', { type: 'warning' }).then(() => {
        API_OAuth2Token.del(accessTokens).then(() => {
          this.$message.success('删除成功！')
          this.GET_List()
        })
      }).catch(() => { })
    },

    /** 搜索事件触发 */
    searchEvent(data) {
      this.params = {
        ...this.params,
        client_id: data
      }
      this.params.page_no = 1
      this.GET_List()
    },

    /** 查询分页列表 */
    GET_List() {
      this.loading = true
      API_OAuth2Token.getList(this.params).then(response => {
        this.loading = false
        this.tableData = response
      }).catch(() => { this.loading = false })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>

</style>
