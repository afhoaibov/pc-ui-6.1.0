<template>
  <el-dialog
    title="店铺选择器"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="shop-picker__dialog"
    append-to-body
    width="1000px"
    :before-close="handleCloseDialog"
  >
    <div class="shop-picker__dialog-body">
      <div class="shop-picker__dialog-search">
        <div class="item-search">
          <el-input
            v-model="params.keyword"
            placeholder="请输入关键字搜索"
            clearable
            prefix-icon="el-icon-search"
            class="inline-input"
          />
        </div>
      </div>
      <div class="shop-picker__dialog-content">
        <div class="shop-picker__dialog-list">
          <template v-if="shopList.length">
            <div
              v-for="(item, index) in shopList"
              :key="item['shop_id']"
              class="shop-picker__dialog-item"
              :class="{selected: isSelected(item)}"
            >
              <span class="shop-picker__dialog-item-icon-selected"></span>
              <div
                v-if="item['shop_logo']"
                class="shop-picker__dialog-item-image"
                :style="{backgroundImage: `url(${item['shop_logo']})`}"
              />
              <div v-else class="shop-picker__dialog-item-image-place" />
              <div class="shop-picker__dialog-item-other">
                <div class="shop-name">{{ item['shop_name'] }}</div>
              </div>
              <div class="shop-picker__dialog-item-mask">
                <a
                  v-if="buyerDomain"
                  :href="`${buyerDomain}/shop/${item['shop_id']}`"
                  target="_blank"
                  class="mask-view"
                  title="查看详情"
                ><i></i></a>
                <div class="mask-check" title="选择店铺" @click="handleClickItem(item, index)"><i></i></div>
              </div>
            </div>
          </template>
          <div v-else class="shop-picker__dialog-empty">{{ loading ? '数据加载中...' : '暂无数据...' }}</div>
          <el-button
            v-if="shopList.length > 0"
            type="primary"
            size="small"
            :loading="loading"
            @click="handleLoadMore"
            class="load-more"
          >加载更多</el-button>
        </div>
        <div ref="selected-list" class="shop-picker__dialog-list">
          <transition-group v-if="selected.length" name="slide-fade">
            <div
              v-for="item in selected"
              :key="item['shop_id']"
              class="shop-picker__dialog-item slide-fade-item selected"
            >
              <span class="shop-picker__dialog-item-icon-selected"></span>
              <div
                v-if="item['shop_logo']"
                class="shop-picker__dialog-item-image"
                :style="{backgroundImage: `url(${item['shop_logo']})`}"
              />
              <div v-else class="shop-picker__dialog-item-image-place" />
              <div class="shop-picker__dialog-item-other">
                <div class="shop-name">{{ item['shop_name'] }}</div>
              </div>
              <div class="shop-picker__dialog-item-mask">
                <a
                  v-if="buyerDomain"
                  :href="`${buyerDomain}/shop/${item['shop_id']}`"
                  target="_blank"
                  class="mask-view"
                  title="查看详情"
                ><i></i></a>
                <div class="mask-check" title="取消选择商品" @click="handleRemoveItem(item)"><i></i></div>
              </div>
            </div>
          </transition-group>
          <div v-else class="shop-picker__dialog-empty">未选择店铺...</div>
        </div>
      </div>
    </div>
    <div slot="footer" class="shop-picker__dialog-footer">
      <div class="shop-picker__dialog-footer-num">
        最多可选个数：<span sf-text-rule="decor_limit_1">{{ limit &lt; 1 ? '无限制' : limit }}</span>
        已选个数：<span>{{ selectedNum }}</span>
        还可选个数：<span  sf-text-rule="decor_limit_2">{{ limit &lt; 1 ? '无限制' : limit - selectedNum }}</span>
      </div>
      <span>
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EnShopPicker',
  props: {
    // 显示dialog
    show: {
      type: Boolean,
      default: false
    },
    // 获取店铺列表api
    api: {
      type: String,
      default: '/admin/shops'
    },
    // 最大可选个数
    limit: {
      type: Number,
      default: 0
    },
    // 请求方法
    request: {
      type: Function,
      required: true
    },
    // 买家端路径
    buyerDomain: {
      type: String,
      required: false,
      default: ''
    },
    // 确认方法
    confirm: {
      type: Function,
      required: false
    },
    // 关闭之前
    beforeClose: {
      type: Function,
      required: false
    }
  },
  data: function() {
    return {
      dialogVisible: false,
      params: {
        page_no: 1,
        page_size: 10,
        keyword: '',
				shop_type: 'NORMAL'
      },
      // 加载状态
      loading: false,
      // 商品列表
      shopList: [],
      // 已选列表
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
    'params.keyword': {
      deep: true,
      handler: 'handleKeywordChange'
    }
  },
  computed: {
    // 计算已选择个数
    selectedNum: function() {
      return this.selected.filter(function(item) {
        return !!item
      }).length
    }
  },
  methods: {
    /**
     * 关闭Dialog
     */
    handleCloseDialog(done) {
      if (typeof this.beforeClose === 'function' && this.beforeClose() === false) return
      this.dialogVisible = false
      this.$emit('update:show', this.dialogVisible)
      this.$emit('closed')
      typeof done === 'function' && done()
    },
    /**
     * 打开了Dialog
     */
    handleOpenDialog() {
      if (!this.shopList.length) this.getShopList()
    },
    /** 确认 */
    handleConfirm: async function() {
      const selected = JSON.parse(JSON.stringify(this.selected))
      if (typeof this.confirm === 'function') {
        await this.confirm(selected)
      }
      this.$emit('confirm',  selected)
      this.handleCloseDialog()
    },
    /** 加载更多 */
    handleLoadMore: function() {
      if (this.loading) return
      this.params.page_no += 1
      this.getShopList()
    },
    /** 点击商品【可能是选择也可能是取消】 */
    handleClickItem: function(item) {
      let _index = this.selected.findIndex(function(_item) {
        return _item['shop_id'] === item['shop_id']
      })
      if (_index !== -1) {
        this.selected.splice(_index, 1)
      } else {
        let limit = this.limit
        if (limit > 0 && this.selected.filter(function(item) {
          return !!item
        }).length >= limit) {
          this.$message.error('超过最大可选个数：' + this.limit)
          return
        }
        this.selected.push(item)
        this.scrollToBottom()
      }
    },
    /** 从已选商品中移除商品 */
    handleRemoveItem: function(item) {
      const index = this.selected.findIndex(_item => _item['shop_id'] === item['shop_id'])
      this.selected.splice(index, 1)
    },
    /** 已选择列表滚动到底部 */
    scrollToBottom: function() {
      let _this = this
      this.$nextTick(function() {
        let $sel = _this.$refs['selected-list']
        $sel.scrollTop = $sel.scrollHeight
      })
    },
    /** 计算是否已被选 */
    isSelected: function(item) {
      return this.selected.findIndex(function (_item) {
        return _item['shop_id'] === item['shop_id']
      }) !== -1
    },
    /**
     * 获取店铺列表
     * @returns {Promise<void>}
     */
    async getShopList() {
      try {
        this.loading = true
        const params = this.$$Foundation.cloneDeep(this.params)
        const res = await this.request({
          url: this.api,
          method: 'get',
          loading: false,
          params
        })
        if (params.page_no === 1) {
          this.shopList = res.data
        } else {
          this.shopList = this.shopList.concat(res.data)
        }
      } finally {
        this.loading = false
      }
    },
    /**
     * 关键词发生改变
     */
    handleKeywordChange() {
      this.params.page_no = 1
      this.getShopList()
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
  @use "./styles" as *;
</style>
<style type="text/scss" lang="scss">
  .params-ids-select-dropdown {
    display: none !important;
  }
</style>
