<template>
  <div>
    <div class="inner-toolbar">
      <div style="min-width: 240px;">
        <el-button type="primary" @click="syncTemplateStatus">
          同步模板状态
          <el-tooltip placement="right" effect="light">
            <div slot="content">点击立即由第三方（阿里云等）同步审核状态</div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-button>
      </div>
      <div class="toolbar-search">
        <template v-if="params.template_type !== 'PROMOTE' && params.template_type !== 'CODE'">
          <span class="label-text">消息类型：</span>
          <el-select
            v-model="params.service_type"
            clearable placeholder="请选择"
            class="select-box"
            style="width: 180px;"
            @change="searchEvent">
            <el-option
              label="店铺"
              value="SHOP">
            </el-option>
            <el-option
              label="会员"
              value="MEMBER">
            </el-option>
            <el-option
              v-if="params.template_type === 'IN18N'"
              label="验证码"
              value="CODE">
            </el-option>
          </el-select>
        </template>
        <el-input
          style="width: 220px;"
          size="medium"
          v-model="params.template_name"
          clearable
          placeholder="请输入模板名称"></el-input>
        <el-button type="primary" class="search-btn" @click="searchEvent">查询</el-button>
      </div>
    </div>
    <el-tabs v-model="params.template_type" type="PROMOTE" @tab-click="changeTab">
      <el-tab-pane label="营销类" name="PROMOTE"></el-tab-pane>
      <el-tab-pane label="通知类" name="NOTIFICATION"></el-tab-pane>
      <el-tab-pane label="验证码类" name="CODE"></el-tab-pane>
      <el-tab-pane label="国际/港澳台" name="IN18N"></el-tab-pane>
    </el-tabs>

    <en-table-layout
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div
          class="toolbar-btns"
          v-if="params.template_type === 'PROMOTE'">
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="addTemplate">新增</el-button>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="template_name" label="模板名称"/>
        <el-table-column prop="sign_name" label="签名名称" v-if="params.template_type !== 'PROMOTE'" />
        <el-table-column prop="template_content" label="模板内容" />
        <el-table-column
          prop="service_type"
          label="消息类型"
          v-if="params.template_type !== 'CODE' && params.template_type !== 'PROMOTE'">
          <template slot-scope="scope">
            {{serviceType(scope.row.service_type)}}
          </template>
        </el-table-column>
        <el-table-column prop="template_status" label="审核状态">
          <template slot-scope="scope">
            {{tmpStatus(scope.row.template_status)}}
          </template>
        </el-table-column>
        <el-table-column prop="enable_status" label="启用状态">
          <template slot-scope="scope">
            {{ scope.row.enable_status === 'OPEN' ? '已开启' : '已关闭' }}
            <el-button type="text" @click="changeTemplateStatus(scope.row)">{{scope.row.enable_status === 'OPEN' ? '关闭' : '开启' }} </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="scope">
            <el-dropdown
              size="small"
              type="primary"
              trigger="click"
              @command="(command) => commandEvent(command, scope.row)">
            <el-button type="primary">
              新增审核<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="add">新增审核</el-dropdown-item>
                <el-dropdown-item command="record">审核记录</el-dropdown-item>
                <el-dropdown-item command="update" v-if="params.template_type !== 'PROMOTE'">切换签名</el-dropdown-item>
                <el-dropdown-item command="delete" v-if="params.template_type === 'PROMOTE'">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

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

    <!-- 更新签名 -->
    <el-dialog
      title="更新签名"
      :visible.sync="showSignDialog"
      width="550px"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <span class="label-text">短信签名：</span>
      <el-select
        clearable
        placeholder="请选择"
        v-model="updateSignRow.sign_id">
        <el-option
          v-for="item of signOptions"
          :key="item.id"
          :label="item.sign_name"
          :value="item.id">
        </el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSignDialog = false">取消</el-button>
        <el-button type="primary" @click="updateSmsTemplateSign">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审核记录弹窗 -->
    <el-dialog
      title="审核记录"
      :visible.sync="showRecordDialog"
      width="950px"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-table
        :data="recordTableData"
        style="width: 100%">
        <el-table-column
          prop="template_name"
          label="模板名称">
        </el-table-column>
        <el-table-column
          prop="template_content"
          label="模板内容">
        </el-table-column>
        <el-table-column
          prop="remark"
          label="场景说明">
        </el-table-column>
        <el-table-column
          prop="template_status"
          label="状态">
          <template slot-scope="scope">
            {{recordStatus(scope.row.template_status)}}
            <el-popover
              v-if="scope.row.template_status === 'rejected'"
              placement="top-start"
              title=""
              width="200"
              trigger="hover"
              :content="scope.row.reason">
              <el-button slot="reference" type="text">原因</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="时间"
          :formatter="MixinUnixToDate">
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showRecordDialog = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Message from '@/api/message'
  import * as API_SmsGateway from '@/api/smsGateway'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'MessageTemplate',
    props: {
      activeName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 列表参数
        params: {
          page_no: 1,
          page_size: 20,
          template_type: 'PROMOTE'
        },
        loading: false,
        tableData: {},
        // 当前开启的短信网关应用id
        pluginId: '',
        // 审核记录显隐
        showRecordDialog: false,
        // 审核记录数据
        recordTableData: [],
        // 更新签名弹窗显隐
        showSignDialog: false,
        // 签名选项
        signOptions: [],
        // 当前更新签名项
        updateSignRow: {}
      }
    },
    watch: {
      activeName: {
        handler(val) {
          if (val === 'template') {
            this.getSmsTemplateList()
          }
        }
      },
      $route: {
        handler(val) {
          if (val.name === 'textMessage') {
            this.getSmsTemplateList()
            this.getOpenSmsPlatforms()
            this.getPassSmsSignList()
          }
        },
        immediate: true
      }
    },
    computed: {
      // 消息类型
      serviceType() {
        return (type) => {
          switch (type) {
            case 'SHOP': return '店铺'
            case 'MEMBER': return '会员'
            case 'CODE': return '验证码'
            case 'PROMOTE': return '营销'
          }
        }
      },
      // 模版审核状态
      tmpStatus() {
        return (status) => {
          switch (status) {
            case 'WAIT_INIT': return '待初始化'
            case 'AUDITING': return '审核中'
            case 'PASS': return '审核通过'
            case 'NOT_PASS': return '审核未通过'
          }
        }
      },
      // 记录审核状态
      recordStatus() {
        return (status) => {
          switch (status) {
            case 'approving': return '审核中'
            case 'approved': return '审核通过'
            case 'rejected': return '审核未通过'
          }
        }
      }
    },
    methods: {
      /** 更新签名 */
      updateSmsTemplateSign() {
        const updateSignRow = this.updateSignRow
        API_Message.updateSmsTemplateSign({
          id: updateSignRow.id,
          sign_id: updateSignRow.sign_id
        }).then(res => {
          this.showSignDialog = false
          this.$message.success('更新成功成功！')
          this.getSmsTemplateList()
        })
      },
      /** 获取短信签名选项 */
      getPassSmsSignList() {
        API_Message.getPassSmsSignList().then(res => {
          this.signOptions = res
        })
      },

      /** 操作按钮触发 */
      commandEvent(command, row) {
        switch (command) {
          case 'add': this.handleEdit(row)
            break
          case 'record': this.getSmsTemplateRecord(row)
            break
          case 'update':
            this.showSignDialog = true
            this.updateSignRow = row
            break
          case 'delete': this.deleteSmsTemplate(row)
            break
        }
      },
      /** 获取模版审核记录 */
      getSmsTemplateRecord(row) {
        API_Message.getSmsTemplateRecord(row.id).then(res => {
          this.showRecordDialog = true
          this.recordTableData = res
        })
      },
      /** 切换模版开启状态 */
      changeTemplateStatus(row) {
        const params = {
          id: row.id,
          enable_status: row.enable_status === 'CLOSE' ? 'OPEN' : 'CLOSE'
        }
        API_Message.changeTemplateStatus(params).then(res => {
          this.$message.success(params.enable_status === 'OPEN' ? '开启成功！' : '关闭成功！')
          row.enable_status = params.enable_status
        })
      },

      /** 同步状态 */
      syncTemplateStatus() {
        API_Message.syncTemplateStatus(this.pluginId).then(res => {
          this.$message.success('同步成功！')
        })
      },

      /** 删除模版 */
      deleteSmsTemplate(row) {
        this.$confirm('删除成功后会同步至第三方平台请谨慎操作，确认要删除此模板?', '提示', { type: 'warning' }).then(() => {
          API_Message.deleteSmsTemplate(this.pluginId, row.id).then(res => {
            this.$message.success('删除成功！')
            this.getSmsTemplateList()
          })
        })
      },

      /** 切换模版类型 */
      changeTab() {
        this.params.service_type = ''
        this.params.page_no = 1
        this.getSmsTemplateList()
      },
      /** 新增模版 */
      addTemplate() {
        this.$router.push({
          name: 'addMessageTemplate',
          params: {
            templateType: this.params.template_type,
            pluginId: this.pluginId
          }
        })
      },
      /** 编辑签名 */
      handleEdit(row) {
        this.$router.push({
          name: 'addTemplateAudit',
          params: {
            pluginId: this.pluginId,
            id: row.id,
            templateType: this.params.template_type
          }})
      },
      /** 获取开启的短信网关 */
      getOpenSmsPlatforms() {
        API_SmsGateway.getOpenSmsPlatforms().then(res => {
          this.pluginId = res.plugin_id
        })
      },

      /** 搜索事件触发 */
      searchEvent() {
        this.params.page_no = 1
        this.getSmsTemplateList()
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getSmsTemplateList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getSmsTemplateList()
      },
      /** 获取模版列表 */
      getSmsTemplateList() {
        this.loading = true
        const params = cloneObj(this.params)
        if (params.template_type === 'PROMOTE' || params.template_type === 'CODE') {
          // 营销类、验证码类模版删除消息类型参数
          delete params.service_type
        }
        API_Message.getSmsTemplateList(params).then(res => {
          this.tableData = res
          this.loading = false
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
.inner-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
  .toolbar-search {
    display: flex;
    align-items: center;
    .select-box {
      width: 300px;
      margin-right: 20px;
    }
    .label-text {
      // width: 140px;
      color: #444;
      font-size: 14px;
    }
    .search-btn {
      margin-left: 10px;
      width: 100px;
    }
  }
}
  .container {
    background: #fff !important;
    ::v-deep .toolbar {
      height: auto !important;
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: center;
  }

</style>
