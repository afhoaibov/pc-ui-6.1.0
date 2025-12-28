<template>
  <div class="clear-wrap">
    <div class="table-tips-wrap">
      <div class="tips-box">
        <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
        此操作将会清空除配置信息外的商城所有数据，一旦清空无法恢复，请谨慎操作！
      </div>
    </div>
    <div class="button-box">
      <el-button :disabled="isLoading" type="primary" @click="$refs['authRef'].open()">一键清除</el-button>
      <template v-if="isRequest">
        <p class="tips-text" v-if="isLoading">
          <i class="el-icon-loading"></i>
          数据清除中....
        </p>
        <p class="tips-text" v-else>
          <i class="el-icon-success" style="color: #67C23A; font-size: 18px;"></i>
          清除完成！
        </p>
      </template>
    </div>
    <!-- 身份验证 -->
    <authentication ref="authRef" @handlerVerifySuccess="cleanAllData"/>
  </div>
</template>

<script>
  import * as API_SystemSetting from '@/api/systemSetting'
  export default {
    name: 'clearingData',
    data() {
      return {
        isLoading: false,
        isRequest: false
      }
    },
    methods: {
      cleanAllData() {
        this.isLoading = true
        this.isRequest = true
        API_SystemSetting.cleanAllData().then(res => {
          this.isLoading = false
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
.clear-wrap {
  .button-box {
    padding: 10px 15px;
    display: flex;
    align-items: center;
    .tips-text {
      display: flex;
      margin-left: 20px;
      align-items: centers;
      font-size: 16px;
      color: #666;
      i {
        margin-right: 10px;
      }
    }
  }
}
</style>
