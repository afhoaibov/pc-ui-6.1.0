<template>
  <div class="derive-wrap">
    <div class="search-content">
      <en-table-search
        @search="searchEvent"
        @advancedSearch="advancedSearchEvent"
        advanced
        placeholder="请输入请求人姓名"
        :advancedWidth="500"
      >
        <template slot="advanced-content">
          <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
            <el-form-item label="筛选条件">
              <el-input size="medium" v-model="advancedForm.param" clearable></el-input>
            </el-form-item>
            <el-form-item label="报表类型">
              <el-select clearable v-model="advancedForm.module_type" placeholder="请选择">
                <el-option
                  v-for="item of ModuleType"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select clearable v-model="advancedForm.status" placeholder="请选择">
                <el-option
                  label="进行中"
                  value="processing">
                </el-option>
                <el-option
                  label="已完成"
                  value="success">
                </el-option>
                <el-option
                  label="异常"
                  value="error">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="导出时间">
              <el-date-picker
                style="width: 100%"
                v-model="advancedForm.register_time_range"
                type="datetimerange"
                :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
                range-separator="-"
                align="right"
                :editable="false"
                unlink-panels
                value-format="timestamp"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
          </el-form>
        </template>
      </en-table-search>
      <el-button
        size="mini"
        type="primary"
        icon="el-icon-refresh"
        style="margin-left: 10px;"
        @click="refreshEvent"
        ></el-button>
    </div>
    <div class="record-list">
      <div class="empty-box" v-if="recordList.data && !recordList.data.length">暂无数据</div>
      <el-row class="record-item" v-for="item in recordList.data" :key="item.task_id">
        <div class="item-left">
          <p>导出时间：{{item.created_time | unixToDate}}</p>
          <p>状态：<span :class="[item.status, 'status-text']">{{ statusText(item.status) }}</span></p>
          <p>筛选条件：{{ paramText(item.param) }}</p>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-download"
            :disabled="item.status !== 'success'"
            >
            <span v-if="item.status !== 'success'">下载</span>
            <a v-else :href="item.task_result" :download="item.task_name">下载</a>
          </el-button>

        </div>
        <div class="item-right">
          <p>报表类型：{{moduleTypeText(item.module_type)}}</p>
          <p>请求人：{{item.username}}</p>
        </div>
      </el-row>

      <div class="pagination-box">
        <el-pagination
          @size-change="handlePageSizeChange"
          @current-change="handlePageCurrentChange"
          :current-page="recordList.page_no"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="recordList.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="recordList.data_total">
        </el-pagination>
      </div>
    </div>
  </div>

</template>

<script>
  import * as API_Task from '@/api/task'
  import Storage from '@/utils/storage'
  import { Foundation } from '~/ui-utils'
  // 导出类型常量
  const ModuleType = [
    { value: 'ManagerOrderExport', name: '订单导出' },
    { value: 'ManagerDepositLogExport', name: '消费记录导出' },
    { value: 'ManagerRechargeExport', name: '充值记录导出' },
    { value: 'ManagerGoodsExport', name: '商品导出' },
    { value: 'ManagerWithdrawExport', name: '提现申请导出' },
    { value: 'PayLogExport', name: '收款单导出' },
    { value: 'ManagerAfterSaleRefundExport', name: '退款单导出' },
    { value: 'ManagerAfterSaleExport', name: '售后服务单导出' },
    { value: 'ManagerBillExport', name: '结算单导出' }
  ]

  export default {
    name: 'deriveRecord',
    data() {
      return {
        ModuleType,
        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 5,
          operate_type: 'EXPORT'
        },
        /** 高级搜索数据 */
        advancedForm: {
          register_time_range: ''
        },
        recordList: {},
        headers: {
          Authorization: Storage.getItem('admin_access_token')
        }
      }
    },
    computed: {
      /** 筛选条件 */
      paramText() {
        return (param) => {
          let text = ''
          const paramList = JSON.parse(param)
          if (paramList && paramList.length) {
            paramList.forEach(val => {
              let value = val.value
              if (val.fieldName === 'startTime' || val.fieldName === 'endTime') {
                value = Foundation.unixToDate(val.value, 'yyyy-MM-dd hh:mm:ss')
              }
              text += `${text ? '，' : ''}${val.fieldDesc}: ${value}`
            })
          } else {
            text = '无'
          }
          return text
        }
      },
      /** 导出状态 */
      statusText() {
        return (status) => {
          switch (status) {
            case 'processing':
              return '进行中'
            case 'success':
              return '已完成'
            case 'error':
              return '异常'
          }
        }
      },
      /** 报表类型 */
      moduleTypeText() {
        return (type) => {
          const typeItem = ModuleType.find(item => { return item.value === type })
          if (typeItem) {
            return typeItem.name
          }
          return ''
        }
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'deriveRecord') return
          this.getDeriveTaskRecord()
        }
      }
    },

    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.getDeriveTaskRecord()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.getDeriveTaskRecord()
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params = {
          page_no: 1,
          page_size: 10,
          username: keyword
        }
        this.getDeriveTaskRecord()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent(keyword) {
        const advancedForm = this.advancedForm
        const { register_time_range } = advancedForm
        this.params['username'] = keyword
        Object.keys(advancedForm).forEach(key => {
          if (advancedForm[key] !== undefined && key !== 'register_time_range') {
            this.params[key] = advancedForm[key]
          }
        })
        if (register_time_range && register_time_range.length === 2) {
          this.params.start_time = register_time_range[0] / 1000
          this.params.end_time = register_time_range[1] / 1000
        } else {
          delete this.params.start_time
          delete this.params.end_time
        }
        this.params.page_no = 1

        this.getDeriveTaskRecord()
      },

      /** 下载 */
      // downloadEvent(item) {
      //   this.$http({
      //     method: 'get',
      //     url: item.task_result,
      //     headers: this.headers,
      //     responseType: 'blob'
      //   }).then((res) => {
      //     let url = window.URL.createObjectURL(res.data)
      //     let link = document.createElement('a')
      //     link.style.display = 'none'
      //     link.href = url
      //     link.setAttribute('id', 'downloadLink')
      //     link.setAttribute('download', `${item.task_name}.xlsx`)
      //     document.body.appendChild(link)
      //     link.click()
      //     // 删除添加的a链接
      //     let objLink = document.getElementById('downloadLink')
      //     document.body.removeChild(objLink)
      //   })
      // },

      /** 刷新 */
      refreshEvent() {
        this.getDeriveTaskRecord()
      },

      /** 获取导出记录列表 */
      getDeriveTaskRecord() {
        const params = this.params
        API_Task.geTaskRecord(params).then(res => {
          this.recordList = res
        })
      }
    }
  }
</script>
<style scoped lang="scss">
.derive-wrap {
  .search-content {
    background: #fff;
    padding: 20px;
    display: flex;
    justify-content: flex-end;
  }
  .pagination-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .record-list {
    background: #fff;
    padding: 10px 20px;
    margin-top: 10px;
    .empty-box {
      width: 100%;
      text-align: center;
      color: #909399;
      font-size: 14px;
      margin-top: 30px;
    }
    .record-item {
      border: 1px solid #e6ebf5;
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      color: #555;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      position: relative;
      box-shadow: 0 0 8px 0 #e6ebf5;
      margin-bottom: 20px;
      .status-text {
        font-weight: 600;
      }
      .success {
        color: #67C23A;
      }
      .error {
        color: #F56C6C;
      }
      .processing {
        color: #409EFF;
      }
      .close-icon {
        font-size: 22px;
        color: #555;
        position: absolute;
        right: 20px;
        top: 10px;
      }
      .item-left, .item-right {
        width: 50%;
      }
      p {
        margin-top: 0;
        margin-bottom: 10px;
        line-height: 22px;
      }
    }
  }


}
</style>
