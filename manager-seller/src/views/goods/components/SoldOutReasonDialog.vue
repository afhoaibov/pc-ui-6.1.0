<template>
  <el-dialog
    title="下架原因"
    :visible.sync="show"
    width="650px"
    :modal="true"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-input
      type="textarea"
      :rows="2"
      placeholder="请输入下架原因，200字符以内，可不填写"
      :maxlength="200"
      v-model="underReason">
    </el-input>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConform">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'SoldOutReasonDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      underReason: '',
      show: false
    }
  },
  watch: {
    value(newVal) {
      this.show = newVal
    }
  },
  methods: {
    handleClose() {
      this.$emit('handleClose')
      this.show = false
      this.underReason = ''
    },
    handleConform() {
      const underReason = this.underReason
      this.$emit('handleConform', underReason)
      this.show = false
      this.underReason = ''
    }
  }
}
</script>

<style type="text/scss" lang="scss"  scoped>


</style>
