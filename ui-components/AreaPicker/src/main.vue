<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="area-picker__dialog"
    append-to-body
    width="700px"
    :before-close="handleCloseDialog"
  >
    <div class="area-picker__dialog-body">
      <div v-loading="loading" class="area-picker__dialog-content">
        <area-dropdown
          v-for="item in areaList"
          :key="item.__key"
          :area="item"
          :area-util="areaUtil"
          :child="false"
        />
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-checkbox
        v-model="allChecked"
        label="全选"
        :indeterminate="indeterminate"
        @click.native.stop
        @change="handleCheckAllChange"
      ></el-checkbox>
      <div class="dialog-footer__btn">
        <span v-if="deepLength.checked !== 0" class="area-picker__dialog--checked-num">
          已选择{{ deepLength.checked }}个区域
        </span>
        <el-button type="primary" :disabled="deepLength.checked === 0" @click="handleConfirm">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { api } from '~/ui-domain'
import AreaDropdown from './AreaDropdown'
import AreaUtil from './AreaUtil'
let area_key = 0
import request from '@/utils/request'

export default {
  name: 'EnAreaPicker',
  components: { AreaDropdown },
  props: {
    title: {
      type: String,
      required: false,
      default: '区域选择器'
    },
    show: {
      type: Boolean,
      required: false,
      default: false
    },
    api: {
      type: String,
      required: true
    },
    // 确认选择
    confirm: {
      type: Function,
      required: false
    },
    // 传入的默认选中id
    defaultIds: {
      type: Array,
      required: false,
      default: () => ([])
    },
    // 需要禁用的id集合
    disabledIds: {
      type: Array,
      required: false,
      default: () => ([])
    },
    // 需要排除的id集合
    excludeIds: {
      type: Array,
      required: false,
      default: () => ([])
    },
    // 最大选择个数
    limit: {
      type: Number,
      required: false,
      default: -1
    },
    // 配置选项
    props: {
      type: Object,
      required: false,
      default: () => ({
        id: 'id',
        name: 'name',
        children: 'children'
      })
    }
  },
  data() {
    return {
      params: {},
      dialogVisible: false,
      rawAreaList: [],
      areaList: [],
      loading: false,
      all_checked: false,
      areaUtil: new AreaUtil(this.props)
    }
  },
  watch: {
    show: {
      immediate: true,
      handler: function(newVal) {
        this.dialogVisible = newVal
        newVal && this.handleOpenDialog()
      }
    },
    params: {
      deep: true,
      handler: 'getAreaList'
    }
  },
  mounted() {
    this.getAreaList()
  },
  computed: {
    // API
    _api() {
      if (this.api) return this.api
      return api.base + '/regions/menus'
    },
    // 计算集合长度，包括全部和已选中长度
    deepLength() {
      return this.areaUtil.getChildrenLengthDeep(this.areaList)
    },
    // 计算全选按钮状态
    allChecked: {
      get() {
        let { all_checked } = this
        const { length, checked } = this.deepLength
        if (checked === 0) {
          all_checked = false
        } else {
          all_checked = length === checked
        }
        return all_checked
      },
      set(val) {
        this.$set(this, 'all_checked', val)
      }
    },
    // 计算全选按钮不确定状态
    indeterminate() {
      const { deepLength } = this
      if (deepLength.checked === 0) return false
      return deepLength.length !== deepLength.checked
    }
  },
  methods: {
    /**
     * 关闭Dialog
     */
    handleCloseDialog(done) {
      this.dialogVisible = false
      this.$emit('update:show', this.dialogVisible)
      this.$emit('closed')
      typeof done === 'function' && done()
    },
    /**
     * 打开了Dialog
     */
    async handleOpenDialog() {
      this.handleIdsChange()
    },
    /**
     * 获取页面分页
     * @returns {Promise<void>}
     */
    async getAreaList() {
      try {
        this.loading = true
        let areaList = await request({
          url: this._api,
          params: this.params,
          loading: false
        })
        areaList = this.areaUtil.setKeyNames(areaList)
        this.rawAreaList = this.areaUtil.cloneDeep(areaList)
        this.areaUtil.setRawAreaMap(this.rawAreaList)
      } finally {
        this.loading = false
      }
    },
    /**
     * 确认选择
     * @returns {Promise<void>}
     */
    async handleConfirm() {
      let result = this.areaUtil.getDeepCheckedItems(this.areaList)
      result.checked = this.areaUtil.resetKeyNames(result.checked)
      result.checkedTree = this.areaUtil.resetKeyNames(result.checkedTree)
      if (typeof this.confirm === 'function') {
        await this.confirm(result)
      }
      this.$emit('confirm', result)
      this.handleCloseDialog()
    },
    /**
     * 递归添加属性
     * @param array
     * @param disabled
     * @param checked
     * @returns {*}
     */
    addAreaProps(array, disabled, checked) {
      if (!array || array.length === 0) return
      return array.map(item => {
        if (item.__key === undefined) item.__key = area_key++
        item.checked = checked === undefined
          ? this.defaultIds.includes(String(item.id))
          : checked
        item.__indeterminate = false
        if (this.excludeIds.includes(String(item.id))) {
          item.__hidden = true
        }
        item.__disabled = disabled === undefined
          ? this.disabledIds.includes(String(item.id))
          : disabled
        if (this.areaUtil.hasChildren(item)) {
          item.children = this.addAreaProps(
            item.children,
            item.__disabled || undefined,
            item.checked || undefined
          )
        }
        return item
      }).map(item => {
        if (item.__hidden === undefined && this.areaUtil.hasChildren(item)) {
          const hl = item.children.filter(i => i.__hidden).length
          item.__hidden = item.children.length === hl
        }
        return item
      })
    },
    /**
     * 点击了全选
     * @param value
     * @param event
     */
    handleCheckAllChange(value, event) {
      this.areaUtil.setChildrenCheckboxDeep(this.areaList, event.target.checked)
    },
    /**
     * ids发生改变
     */
    handleIdsChange() {
      const areas = this.addAreaProps(this.areaUtil.cloneDeep(this.rawAreaList))
      this.areaList = this.removeHiddenAreas(areas)
    },
    removeHiddenAreas(array) {
      array = array.filter(item => !item.__hidden).map(item => {
        if (this.areaUtil.hasChildren(item)) {
          item.children = this.removeHiddenAreas(item.children)
        }
        return item
      })
      return array
    }
  }
}
</script>

<style lang="scss">
@use "./styles" as *;
</style>
