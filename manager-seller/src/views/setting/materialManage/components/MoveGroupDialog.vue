<template>
  <el-dialog
    :title="moveGroupTitle"
    :visible.sync="value"
    width="30%"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form inline class="dialog-form">
      <el-form-item prop="group_id" label="选择分组：">
        <el-cascader
          :options="groupListBySecond"
          :show-all-levels="false"
          ref="cascaderRef"
          placeholder="请选择分组"
          :value="group_id"
          :props="{ checkStrictly: true, value: 'group_id', label: 'group_name' }"
          @change="changeGroupingGroup"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitGroupingForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as API_PictureSpace from '@/api/pictureSpace.js'

export default({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    moveGroupTitle: {
      type: String
    },
    // 分组数据
    pictureGroup: {
      type: Array
    },
    defaultGroupId: {
      type: String
    }
  },
  data() {
    return {
      group_id: ''
    }
  },
  watch: {
    defaultGroupId: {
      handler(val) {
        this.group_id = val
      }, immediate: true
    }
  },
  computed: {
    groupListBySecond() {
      if (this.pictureGroup && this.pictureGroup.length) {
        return this.pictureGroup.filter(item => (item.group_id !== this.defaultGroupId))
      }
      return []
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },

    /** 分组选择切换 */
    changeGroupingGroup(val) {
      this.group_id = val[val.length - 1]
    },

    /** 分组选择 */
    submitGroupingForm() {
      if (!this.group_id) {
        return this.$message.error('请选择分组')
      }
      this.$emit('moveGroupingEvent', this.group_id)
    }
  }
})

</script>
<style lang="scss" scoped>
.dialog-form {
  ::v-deep .el-form-item__content {
    width: 70%;
  }
  ::v-deep .el-form-item {
    width: 100%;
  }
  ::v-deep .el-cascader {
    width: 100%;
  }
}
</style>
