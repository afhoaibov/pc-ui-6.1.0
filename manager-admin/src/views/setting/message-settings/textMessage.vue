<template>
  <div class="text-message-wrap">
    <el-tabs v-model="activeName" @tab-click="changeTab">
      <el-tab-pane label="发送任务" name="tasks">
        <message-tasks :activeName="activeName" @checkTaskRecord="checkTaskRecord" />
      </el-tab-pane>
      <el-tab-pane label="短信模板" name="template">
        <message-template :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="短信签名" name="signature">
        <message-sign :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="发送记录" name="record">
        <message-record  :activeName="activeName" :taskId="taskId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import MessageSign from './components/MessageSign'
  import MessageTemplate from './components/MessageTemplate'
  import MessageTasks from './components/MessageTasks'
  import MessageRecord from './components/MessageRecord'

  export default {
    name: 'textMessage',
    components: {
      MessageSign,
      MessageTemplate,
      MessageTasks,
      MessageRecord
    },
    data() {
      return {
        activeName: 'tasks',
        // 当前查询任务记录id
        taskId: ''
      }
    },
    methods: {
      /** 切换tab */
      changeTab() {
        // 置空发送记录任务id·
        this.taskId = ''
      },
      /** 查看某条任务发送记录 */
      checkTaskRecord(id) {
        this.activeName = 'record'
        this.taskId = id
      }

    }
  }
</script>
<style lang="scss">
.text-message-wrap {
  background: #fff;
  padding: 20px;
}
</style>
