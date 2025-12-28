<template>
  <el-dialog
    title="页面选择器"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="page-picker__dialog"
    append-to-body
    width="1000px"
    :before-close="handleCloseDialog"
  >
    <div class="page-picker__dialog-body">
      <div class="page-picker__dialog-content">
        <div class="page-picker__dialog-content-btn">
          <el-button icon="el-icon-plus" @click="handleCreate">新建</el-button>
          <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
        <el-table
          :data="pageData.data"
          v-loading="loading_page"
          border
          stripe
          class="page-picker__dialog-table"
          @row-click="handleClickItem"
        >
          <el-table-column width="55" align="center">
            <template v-slot:header>
              <span v-if="isRadio">单选</span>
              <el-checkbox v-else></el-checkbox>
            </template>
            <template slot-scope="{ row }">
              <component
                :is="isRadio ? 'el-radio' : 'el-checkbox'"
                :value="isSelected(row)"
                :label="true"
              />
            </template>
          </el-table-column>
          <el-table-column label="页面名称" prop="page_name"/>
          <el-table-column label="页面描述" prop="remark"/>
          <el-table-column label="创建日期" prop="create_time" align="center" width="150">
            <template slot-scope="{ row }">{{ row.create_time | timestampToDate }}</template>
          </el-table-column>
        </el-table>
        <div class="page-picker__dialog-page">
          <el-pagination
            @size-change="page_size => params.page_size = page_size"
            @current-change="page_no => params.page_no = page_no"
            :current-page="params.page_no"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="params.page_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageData['data_total']"
          >
          </el-pagination>
        </div>
      </div>
      <div class="page-picker__dialog-search">
        <el-input
          placeholder="输入关键字搜索"
          v-model="params.keyword"
          clearable
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCloseDialog">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'EnPagePicker',
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false
    },
    // 选择器类型【admin：平台管理，seller：商家中心，decor：装修中心】
    type: {
      type: String,
      required: true
    },
    // 请求方法
    request: {
      type: Function,
      required: true
    },
    api: {
      type: String,
      required: false
    },
    // 域名配置
    domain: {
      type: Object,
      required: true
    },
    // 确认选择
    confirm: {
      type: Function,
      required: false
    },
    // 传入的默认选中id
    defaultValue: {
      type: Array,
      required: false
    },
    // 最大选择个数
    limit: {
      type: Number,
      required: false,
      default: -1
    },
    // 客户端类型
    clientType: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      pageData: '',
      params: {
        page_size: 20,
        page_no: 1,
        client_type: '',
        keyword: '',
        publish_status: 'YES'
      },
      loading_page: false,
      selected: []
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
      handler: 'getPageList'
    }
  },
  computed: {
    // API
    _api() {
      if(this.api) return this.api
      if (this.type === 'decor') return `${this.$$DecorType}/pages`
      return `${this.type}/pages`
    },
    // radio
    isRadio() {
      return this.limit === 1
    }
  },
  filters: {
    /**
     * 时间戳转普通时间格式
     * @param unix
     * @param format
     * @returns {string|*}
     */
    timestampToDate: function (unix, format = 'YYYY-MM-DD') {
      if (!unix) return unix
      let _format = format || 'YYYY-MM-DD hh:mm:ss'
      let d = new Date(unix * 1000)
      let o = {
        'M+': d.getMonth() + 1,
        'D+': d.getDate(),
        'h+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds(),
        'q+': Math.floor((d.getMonth() + 3) / 3),
        S: d.getMilliseconds()
      }
      if (/(Y+)/.test(_format)) _format = _format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (let k in o) if (new RegExp('(' + k + ')').test(_format)) _format = _format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      return _format
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
    handleOpenDialog() {
      if (!this.pageData) this.getPageList()
    },
    /**
     * 获取页面分页
     * @returns {Promise<void>}
     */
    async getPageList() {
      try {
        this.loading_page = true
        this.params.client_type = (this.clientType || this.$$ClientType).toUpperCase()
        this.pageData = await this.request({
          url: this._api,
          params: this.params,
          loading: false
        })
      } finally {
        this.loading_page = false
      }
    },
    /**
     * 选择项目
     * @param item
     */
    handleClickItem(item) {
      if (this.isRadio) {
        this.selected = [item]
      } else {
        const index = this.selected.findIndex(_item => _item.id === item.id)
        if (index !== -1) {
          this.selected.splice(index, 1)
        } else {
          if (this.selected.length >= this.limit && this.limit !== -1) {
            return this.$message.error(`可选数量超过最大限制：${this.limit}个！`)
          }
          this.selected.push(item)
        }
      }
    },
    /**
     * 是否被选择
     * @param item
     * @returns {boolean}
     */
    isSelected(item) {
      return this.selected.findIndex(_item => _item.id === item.id) !== -1
    },
    /**
     * 确认选择
     */
    async handleConfirm() {
      const selected = this.selected.length ? this.selected : ''
      if (typeof this.confirm === 'function') {
        await this.confirm(selected)
      }
      this.$emit('confirm', selected)
      this.handleCloseDialog()
    },
    /**
     * 去新建一个页面
     */
    handleCreate() {
      let url = `${this.domain['decor']}`
      url += `?decor_type=${this.$$DecorType}`
      url += `&client_type=${(this.clientType || this.$$ClientType).toUpperCase()}`
      window.open(url)
    },
    /**
     * 刷新数据
     */
    handleRefresh() {
      this.getPageList()
    }
  }
}
</script>

<style lang="scss">
@use "./styles" as *;
</style>
