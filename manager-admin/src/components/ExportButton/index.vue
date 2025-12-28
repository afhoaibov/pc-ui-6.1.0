<template>
  <el-dropdown trigger="click" @command="dropdownEvent">
    <el-button size="small" type="primary" style="margin-left: 5px">
      {{ exportButtonText }}
      <i class="el-icon-caret-bottom el-icon-right"></i>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="derive">导出筛选结果</el-dropdown-item>
      <el-dropdown-item command="history">导出历史查看</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ExportButton',
  props: {
    buttonText: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['havePermission']),
    exportButtonText() {
      return this.buttonText || '导出Excel'
    }
  },
  methods: {
    /** 查看导出记录 */
    viewRecord() {
      // 检查是否有导出权限
      const havePermission = this.havePermission('deriveRecord')
      if (havePermission) {
        this.$router.push({
          name: 'deriveRecord'
        })
      } else {
        this.$message.error('当前角色未开启后台任务权限，请开启后查看！')
      }
    },

    /** 导出操作分发 */
    dropdownEvent(command) {
      if (command === 'derive') {
        // 导出操作
        this.$emit('exportEvent')
      } else {
        this.viewRecord()
      }
    }
  }
}
</script>
