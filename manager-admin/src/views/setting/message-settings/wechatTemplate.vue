<template>
  <div>
    <en-table-layout
      :toolbar="false"
      :tableData="tableData.data"
      :loading="loading"
    >
      <template slot="table-columns">
        <el-table-column prop="tmp_sn" label="编号" width="150"/>
        <el-table-column prop="template_id" label="模版ID"/>
        <el-table-column prop="tmp_name" label="模板标题"/>
        <el-table-column prop="tmp_sn" label="模板编号"/>
        <el-table-column prop="is_open" label="状态" :formatter="tplStatus" width="100"/>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.is_open === 1"
              size="mini"
              type="danger"
              @click="handleOpenAndStopWechatMessageTemplate(scope.row, 0)">停用
            </el-button>
            <el-button
              v-else
              size="mini"
              type="primary"
              @click="handleOpenAndStopWechatMessageTemplate(scope.row, 1)">启用
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleEditWechatMessageTemplate(scope.row)">编辑
            </el-button>
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
      title="修改消息模板"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="650px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="模板ID" prop="template_id">
          <el-input v-model="form.template_id" maxlength="100" clearable/>
        </el-form-item>
        <el-form-item label="标题" prop="tmp_name">
          <el-input v-model="form.tmp_name" maxlength="50" clearable/>
        </el-form-item>
        <el-form-item label="模板编号" prop="tmp_sn">
          <el-input v-model="form.tmp_sn" maxlength="50" clearable/>
        </el-form-item>
        <el-form-item label="详细内容" prop="tmp_details">
          <el-table :data="form.tmp_details" size="mini" border>
            <el-table-column prop="name" label="名称" align="center">
              <template slot-scope="{ row }">
                <el-input v-model="row.name" placeholder="请填写名称" class="tmp_details-input"/>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="值" align="center" width="220">
              <template slot="header">
                值
                <el-tooltip effect="dark" placement="top">
                  <template slot="content">
                    <span v-pre>如：{{thing16.DATA}}，只需填写thing16即可</span>
                  </template>
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </template>
              <template slot-scope="{ row }">
                <el-input v-model="row.value" placeholder="请填写值" class="tmp_details-input"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120">
              <template slot-scope="{ row, $index }">
                <el-button
                  v-if="form.tmp_details.length > 1"
                  type="text"
                  size="mini"
                  style="color: #f56c6c"
                  @click="handleDelTmpDetailItem($index)"
                >删除</el-button>
                <el-button
                  v-if="$index === form.tmp_details.length - 1 && form.tmp_details.length < 5"
                  type="text"
                  size="mini"
                  @click="handleAddTmpDetailItem"
                >添加</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTemplateForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Message from '@/api/message'

export default {
  name: 'wechatTemplate',
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
      // 订阅通知类型
      noticeType: '',
      dialogVisible: false,
      form: {
        tmp_name: '',
        template_id: '',
        tmp_sn: '',
        tmp_details: []
      },
      rules: {
        tmp_name: this.MixinRequired('请填写模板标题！'),
        template_id: this.MixinRequired('请填写模板ID！'),
        tmp_sn: this.MixinRequired('请填写模板编号！'),
        tmp_details: [
          this.MixinRequired('请填写详细内容！', 'change', 'array'),
          {
            validator: (rule, value, callback) => {
              if (!value) return callback()
              console.log('value: ', value)
              const empty = value.some(item => !item.name || !item.value)
              empty ? callback(new Error('请将表单填写完整！')) : callback()
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'wechatTemplate') return
        this.noticeType = newVal.params.notice_type
        this.GET_MessageTemplateList()
      }
    }
  },
  methods: {
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_MessageTemplateList()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_MessageTemplateList()
    },

    /** 销售状态格式化 */
    tplStatus(row) {
      return row.is_open === 1 ? '已启用' : '已停用'
    },

    /** 启用或停用微信订阅通知消息模版 */
    handleOpenAndStopWechatMessageTemplate(row, open) {
      this.$confirm(`确定要${open ? '启用' : '停用'}吗？`, '提示', { type: 'warning' }).then(() => {
        API_Message.openAndCloseWechatNoticeTemplate(row.template_id, open).then(() => {
          this.$message.success('操作成功')
          this.GET_MessageTemplateList()
        })
      }).catch(() => {
      })
    },

    /** 编辑微信订阅通知消息模版 */
    async handleEditWechatMessageTemplate(row) {
      const form = JSON.parse(JSON.stringify(row))
      if (form.tmp_details && form.tmp_details.indexOf('[') === 0) {
        form.tmp_details = JSON.parse(form.tmp_details)
      }
      if (!form.tmp_details || form.tmp_details.length === 0) {
        form.tmp_details = [{ name: '', value: '' }]
      }
      this.form = form
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.formRef.clearValidate()
      })
    },

    /** 添加微信订阅通知消息模版详细内容项 */
    handleAddTmpDetailItem() {
      this.form.tmp_details.push({ name: '', value: '' })
    },

    /** 删除微信订阅通知消息模版详细内容项 */
    handleDelTmpDetailItem(index) {
      this.form.tmp_details.splice(index, 1)
      this.$refs.formRef.validateField('tmp_details')
    },

    /** 提交编辑微信订阅通知消息模版表单 */
    submitTemplateForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return this.$message.error('表单填写有误，请核对！')
        const data = JSON.parse(JSON.stringify(this.form))
        if (data.tmp_details) {
          data.tmp_details = JSON.stringify(data.tmp_details)
        }
        await API_Message.updateWechatNoticeTemplate(data.id, data)
        this.$message.success('保存成功！')
        this.GET_MessageTemplateList()
        this.dialogVisible = false
      })
    },

    /** 获取微信订阅通知消息模板列表 */
    GET_MessageTemplateList() {
      this.loading = true
      API_Message.getWechatNoticeTemplateList(this.noticeType, this.params).then(response => {
        this.tableData = response
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tmp_details-input {
  ::v-deep .el-input__inner:not(:placeholder-shown) {
    border: 1px solid #DCDFE6 !important;
  }
}
</style>
