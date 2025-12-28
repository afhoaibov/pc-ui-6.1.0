<template>
  <div class="country-code">
    <en-table-layout
      :table-data="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入语言"/>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="lang"  label="语言" />
        <el-table-column prop="code"  label="编码" />
        <el-table-column prop="enable"  label="状态">
          <template slot-scope="scope">
            <span>{{enableStatus(scope.row.enable)}}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="{row}">
            <el-button
              v-if="row.enable && row.enable !== 3"
              size="mini"
              type="danger"
              :disabled="row.enable === 2"
              @click="changeStatus(row)">禁用</el-button>
            <el-button
              v-else
              size="mini"
              type="success"
              @click="changeStatus(row)">开启</el-button>
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
  </div>
</template>

<script>
    import * as API_dictionary from '@/api/dictionary'

    export default {
      name: 'countryCode',
      data() {
        return {
          /** 列表loading状态 */
          loading: false,
          /** 列表数据 */
          tableData: {},
          /** 列表参数 */
          params: {
            page_no: 1,
            page_size: 10
          }
        }
      },
      computed: {
        enableStatus() {
          return (enable) => {
            enable = Number(enable)
            switch (enable) {
              case 0:
                return '已禁用'
              case 1:
                return '已开启'
              case 2:
                return '翻译中'
              case 3:
                return '翻译失败'
            }
          }
        }
      },
      mounted() {
        this.getCountryCodeList()
      },
      methods: {
        /** 分页大小发生改变 */
        handlePageSizeChange(size) {
          this.params.page_size = size
          this.getCountryCodeList()
        },

        /** 分页页数发生改变 */
        handlePageCurrentChange(page) {
          this.params.page_no = page
          this.getCountryCodeList()
        },

        /** 搜索事件触发 */
        searchEvent(data) {
          this.params.page_no = 1
          this.params.lang = data
          if (!data) delete this.params.lang
          this.getCountryCodeList()
        },

        /** 获取界面字典列表 */
        getCountryCodeList() {
          this.loading = true
          API_dictionary.getCountryCodeList(this.params).then(res => {
            this.loading = false
            this.tableData = res
          }).catch(() => {
            this.loading = false
          })
        },

        /** 状态切换 */
        changeStatus(row) {
          // enable 是否开启 1-是 0-否
          const params = {
            id: row.id,
            enable: row.enable === 1 ? 0 : 1
          }
          const message = `${params.enable ? '确定要执行此开启吗？' : '确定要执行此禁用吗？'}`
          this.$confirm(message, '提示', { type: 'warning' }).then(() => {
            API_dictionary.updateCodeStatus(row.id, params).then(res => {
              this.$message.success('操作成功！')
              this.getCountryCodeList()
            })
          }).catch(() => {})
        }
      }
    }
</script>

<style scoped lang="scss">
.country-code ::v-deep .inner-toolbar {
  justify-content: flex-end !important;
}

</style>
