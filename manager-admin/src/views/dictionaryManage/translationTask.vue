<template>
  <div>
    <en-table-layout
      :table-data="tableData"
      :loading="loading"
      tips
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <ul>
            <li>在这里您可以通过创建某个模块的翻译任务，来批量翻译数据</li>
            <li>翻译数据可能花费较长时间，您可以点击下方的“查看翻译任务”按钮来查看翻译进度</li>
          </ul>
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary"  @click="viewTransLationTask">查看翻译任务</el-button>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="name"  label="任务类型" />

        <el-table-column label="操作">
          <template slot-scope="{row}">
            <el-button
              size="mini"
              type="success"
              @click="createTask(row)">创建任务</el-button>
          </template>
        </el-table-column>
      </template>
    </en-table-layout>
  </div>
</template>

<script>
    import * as API_dictionary from '@/api/dictionary'
    import { mapGetters } from 'vuex'

    export default {
      name: 'translationTask',
      data() {
        return {
          /** 列表loading状态 */
          loading: false,
          /** 列表数据 */
          tableData: []
        }
      },
      computed: {
        ...mapGetters(['havePermission'])
      },
      mounted() {
        this.getTranslationTaskList()
      },
      methods: {
        /** 创建任务触发 */
        createTask(row) {
          this.$confirm('批量翻译任务需要花费较长时间，确定创建吗?', '提示', { type: '' }).then(() => {
            this.createTranslationTask(row)
          })
        },

        /** 创建任务提交 */
        createTranslationTask(row) {
          API_dictionary.createTranslationTask(row.id).then(res => {
            this.$confirm('批量任务创建成功，可能需要花费一些时间，请稍后在后台任务中查看！', '任务创建', {
              confirmButtonText: '查看进度',
              cancelButtonText: '关闭'
            }).then(() => {
              this.viewTransLationTask()
            }).catch((err) => {
              console.log(err)
            })
          }).catch(() => {
            this.$message.error('任务创建失败，请联系管理员')
          })
        },

        /** 查看翻译任务 */
        viewTransLationTask() {
          // 检查是否有导出权限
          const havePermission = this.havePermission('translationRecord')
          if (havePermission) {
            this.$router.push({
              name: 'translationRecord'
            })
          } else {
            this.$message.error('当前角色未开启后台任务权限，请开启后查看！')
          }
        },

        /** 获取可翻译任务列表 */
        getTranslationTaskList() {
          this.loading = true
          API_dictionary.getTranslationTaskList().then(res => {
            this.loading = false
            this.tableData = res
          }).catch(() => {
            this.loading = false
          })
        }
      }
    }
</script>

<style scoped lang="scss">

</style>
