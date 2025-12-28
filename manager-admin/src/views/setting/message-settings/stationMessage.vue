<template>
  <div class="container">
    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
        </div>
        <div class="toolbar-search">
          <span class="label-text">消息类型：</span>
          <el-select @change="searchEvent" v-model="params.service_type" clearable placeholder="请选择" class="select-box">
            <el-option
              label="店铺"
              value="SHOP">
            </el-option>
            <el-option
              label="会员"
              value="MEMBER">
            </el-option>
          </el-select>
          <el-input size="medium" v-model="params.template_name" clearable placeholder="请输入模板名称"></el-input>
          <el-button type="primary" class="search-btn" @click="searchEvent">查询</el-button>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="template_name" label="消息模板名称"/>
        <el-table-column prop="template_content" label="模板内容"/>
        <el-table-column prop="service_type" label="消息类型">
          <template slot-scope="scope">{{ scope.row.service_type === 'MEMBER' ? '会员' : '店铺' }}</template>
        </el-table-column>
        <el-table-column prop="enable_status" label="模板启用状态">
          <template slot-scope="scope">
            {{ scope.row.enable_status === 'OPEN' ? '已开启' : '已关闭' }}
            <el-button type="text" @click="changeEnableStatus(scope.row)">{{scope.row.enable_status === 'CLOSE' ? '开启' : '关闭'}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              v-if="!scope.row.status"
              @click="handleEdit(scope.row)">编辑</el-button>
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
      :title="dialogTitle"
      :visible.sync="showDialog"
      width="650px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="stationForm" :rules="stationFormRules" ref="stationForm" label-width="120px">
        <el-form-item label="站内信内容：" maxlength="100" prop="template_content">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3}"
            :maxlength="100"
            placeholder="请输入站内信内容"
            v-model="stationForm.template_content"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitEvent">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Message from '@/api/message'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'stationMessage',
    data() {
      return {
        // 列表loading状态
        loading: false,

        // 列表参数
        params: {
          page_no: 1,
          page_size: 20
        },
        // 列表数据
        tableData: {},
        stationForm: {},
        stationFormRules: {
          template_content: this.MixinRequired('请输入站内信内容！')
        },
        // 弹窗title
        dialogTitle: '编辑站内信模板',
        // 弹窗显隐
        showDialog: false
      }
    },
    mounted() {
      this.getNoticeTemplates()
    },
    methods: {
      /** 编辑模板 */
      handleEdit(row) {
        this.stationForm = cloneObj(row)
        this.showDialog = true
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getNoticeTemplates()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getNoticeTemplates()
      },
      /** 修改、新增提交 */
      submitEvent() {
        this.$refs.stationForm.validate((valid) => {
          if (valid) {
            const stationForm = this.stationForm
            if (stationForm.id) {
              API_Message.updateNoticeTemplates(stationForm).then(res => {
                this.$message.success('修改成功！')
                this.showDialog = false
                this.getNoticeTemplates()
              })
            }
          }
        })
      },

      /** 搜索事件触发 */
      searchEvent() {
        this.params.page_no = 1
        this.getNoticeTemplates()
      },
      /** 切换开启状态 */
      changeEnableStatus(row) {
        const params = {
          id: row.id,
          enable_status: row.enable_status === 'OPEN' ? 'CLOSE' : 'OPEN'
        }
        API_Message.changeNoticeStatus(params).then(res => {
          this.$message.success(params.enable_status === 'OPEN' ? '开启成功！' : '关闭成功！')
          this.getNoticeTemplates()
        })
      },

      /** 获取站内信模板列表 */
      getNoticeTemplates() {
        this.loading = true
        const { params } = this
        API_Message.getNoticeTemplates(params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .container {
    background: #fff !important;
    ::v-deep .toolbar {
      height: auto !important;
    }
    .inner-toolbar {
      margin-bottom: 20px;
      padding: 0;
    }
    .toolbar-search {
      display: flex;
      align-items: center;
      .select-box {
        width: 300px;
        margin-right: 20px;
      }
      .label-text {
        width: 140px;
        color: #444;
        font-size: 14px;
      }
      .search-btn {
        margin-left: 10px;
        width: 100px;
      }
    }
  }

</style>
