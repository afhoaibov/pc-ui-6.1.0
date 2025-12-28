<template>
  <el-dialog
    title="选择您的位置"
    :visible.sync="visible"
    :before-close="handleClose"
    width="35%"
    class="region-picker-dialog"
  >
    <span>运输选项和费用会基于您所在的位置而有所差异</span>
    <en-region-picker
      ref="regionPickerRef"
      :api="MixinRegionApi"
      @changed="handleShipAreaChange"
      style="display: inline-block; margin-top: 30px;"
    />

    <span slot="footer" class="dialog-footer">
      <el-button type="danger" @click="handleConfirm" round size="mini">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Dialog } from 'element-ui'

Vue.use(Dialog)
export default {
  name: 'EnRegionPickerDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      object: null
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        // this.object = null
      }
    }
  },
  methods: {
    handleShipAreaChange(object) {
      this.object = object
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      this.$emit('confirm', this.object)
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
// TODO
.region-picker-dialog ::v-deep {
  .app-address {
    z-index: 1;
  }
  .area-tip {
    color: #666;
    margin-left: 10px;
  }
}
</style>
