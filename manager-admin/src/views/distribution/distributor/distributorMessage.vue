<template>
  <div class="distributor-message">
    <div class="inner-toolbar">
      <div class="toolbar-items">
        <span class="label">分销商名称：</span>
        <el-input v-model="name"  placeholder="请输入分销商名称" maxlength="50" clearable />
      </div>
      <div class="toolbar-items">
        <span class="label">动态时间：</span>
        <el-date-picker
          v-model="createTime"
          type="datetimerange"
          :picker-options="{ disabledDate (time) { return time.getTime() - 1 >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 - 1 }, shortcuts: MixinPickerShortcuts }"
          range-separator="-"
          align="center"
          :editable="false"
          unlink-panels
          value-format="timestamp"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </div>
      <el-button
        size="medium"
        type="primary"
        @click="onSearch"
        class="search-btn"
      >搜索</el-button>
    </div>
    <message-table :moreParams="params" />
  </div>
</template>

<script>
  import MessageTable from './components/MessageTable'

  export default {
    name: 'distributor-message',
    components: { MessageTable },
    data() {
      return {
        name: '',
        // 列表参数
        params: {},
        createTime: null
      }
    },

    methods: {

      /** 搜索事件触发 */
      onSearch() {
        const createTime = this.createTime
        const params = {
          name: this.name
        }

        if (createTime) {
          const getNumberOfSeconds = (time) => {
            return time / 1000
          }
          params.start_time = getNumberOfSeconds(createTime[0])
          params.end_time = getNumberOfSeconds(createTime[1])
        }
        this.params = params
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .distributor-message ::v-deep .el-date-editor--datetimerange .el-input__inner {
    width: auto;
  }
  .inner-toolbar {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 0 20px;
    .inner-box {
      display: flex;
      align-items: center;
    }
    .search-box {
      justify-content: space-between;
      .search-btn {
        width: 100px;
        margin: 20px;
      }
    }
    .btn-box {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin: 20px;
    }
    .toolbar-items {
      padding: 20px 0;
      margin-right: 30px;
      display: flex;
      align-items: center;
      .label {
        color: #333;
        font-size: 14px;
        White-space: nowrap;
      }
    }
  }
  .theme-color {
    color: #5441bc;
  }
  .state-color {
    color: #5eb359;
  }
  .state {
    font-weight: 500;
  }
</style>
