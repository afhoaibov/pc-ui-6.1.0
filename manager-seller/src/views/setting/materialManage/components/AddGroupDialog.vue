<template>
  <el-dialog
    width="500px"
    :title="addGroupTitle"
    :visible.sync="value"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form :model="addGroupingForm" ref="addGroupingForm" :rules="addGroupingRules" label-width="110px">
      <el-form-item label="分组名称：" prop="group_name">
        <el-input v-model="addGroupingForm.group_name" placeholder="请输入分组名称"></el-input>
      </el-form-item>
      <el-form-item label="上级分组：">
        <el-cascader
          clearable
          ref="cascaderRef"
          placeholder="请选择分组"
          :options="groupListBySecond"
          v-model="addGroupingForm.parent_id"
          :props="{
            checkStrictly: true,
            value: 'group_id',
            label: 'group_name'
          }"
          @change="changeAddGroup" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitAddGroupingForm">确 定</el-button>
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
    addGroupTitle: {
      type: String
    },
    // 分组数据
    pictureGroup: {
      type: Array
    },
    // 分组类型 VIDEO- 视频 IMAGE -图片
    groupType: {
      type: String,
      required: true
    },
    defaultGroupingForm: {
      type: Object
    }
  },
  data() {
    return {
      addGroupingForm: {
        parent_id: '',
        group_name: '',
        group_type: ''
      },
      /** 添加分组 表单校验**/
      addGroupingRules: {
        group_name: [
          { required: true, message: '请输入分组名称！', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }]
      }
    }
  },
  watch: {
    defaultGroupingForm: {
      handler(val) {
        if (Object.keys(val).length) {
          this.addGroupingForm = val
        } else {
          this.addGroupingForm = {
            parent_id: '',
            group_name: '',
            group_type: ''
          }
        }
      },
      immediate: true
    }
  },
  computed: {
    groupListBySecond() {
      if (this.pictureGroup && this.pictureGroup.length) {
        return this.pictureGroup.filter(item => (item.group_id !== '-1' && item.depth <= 2 && item.group_id !== this.addGroupingForm.group_id))
      }
      return []
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    /** 父分组选择切换 */
    changeAddGroup(val) {
      if (!val.length) return
      this.addGroupingForm.parent_id = val[val.length - 1]
    },
    /** 添加分组 */
    addPictureGroup(group) {
      API_PictureSpace.addPictureGroup(group).then(() => {
        this.$message.success('添加成功！')
        this.successEvent()
      })
    },
    /** 编辑分组 */
    editGroup(group) {
      API_PictureSpace.editGroup(group.group_id, group).then(() => {
        this.$message.success('修改成功！')
        this.successEvent()
      })
    },

    /** 添加修改成功后回调 */
    successEvent() {
      this.$refs.cascaderRef.$refs.panel.clearCheckedNodes()
      this.$emit('submitAddGrouping')
    },

    submitAddGroupingForm() {
      this.$refs['addGroupingForm'].validate((valid) => {
        if (valid) {
          let group = this.addGroupingForm
          const params = {
            group_type: this.groupType,
            group_id: group.group_id,
            group_name: group.group_name,
            parent_id: group.parent_id
          }
          if (!params.parent_id || params.parent_id === -1 || !params.parent_id.length) {
            params.parent_id = 0
          }
          if (params.group_id) {
            // 编辑操作
            this.editGroup(params)
          } else {
            // 新增
            this.addPictureGroup(params)
          }
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    }
  }
})

</script>
<style lang="scss" scoped>
</style>
