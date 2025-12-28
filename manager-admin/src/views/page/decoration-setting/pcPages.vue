<template>
  <div class="container">
    <en-table-layout
      :stripe="false"
      :tips="true"
      :tableData="tableData.data"
      :loading="loading"
      @selection-change="array => selected = array"
    >
      <div class="table-tips-wrap" slot="tips">
        <div class="tips-box">
          <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
          新建、编辑微页面后请手动刷新下页面或者点下刷新按钮
        </div>
      </div>
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" @click="handleAddPage">新建微页面</el-button>
          <el-button size="mini" type="primary" :disabled="selected.length !== 1" @click="handleSetIndex">设为商城首页</el-button>
          <el-button size="mini" type="primary" icon="el-icon-refresh" @click="GET_MiniPages">刷新</el-button>
          <el-button size="mini" type="danger" :disabled="!selected.length" @click="handleDeletePage">批量删除</el-button>
        </div>
        <div class="toolbar-search">
          <el-select v-model="params.publish_status" clearable placeholder="选择发布状态">
            <el-option label="已发布" value="YES"></el-option>
            <el-option label="未发布" value="NO"></el-option>
          </el-select>
          <el-input
            v-model="params.keyword"
            prefix-icon="el-icon-search"
            placeholder="输入关键字搜索"
            style="margin-left: 10px"
          />
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="page_name" label="页面名称" align="left">
          <div slot-scope="{ row }" class="page-name-cell">
            <span v-if="row.publish_status === 'NO'">{{ row.page_name }}</span>
            <a v-else :href="getMiniPageLink(row)" target="_blank" class="page-link">{{ row.page_name }}</a>
            <el-popconfirm
              v-if="row.is_index === 'YES'"
              :title="`要取消设置为商城首页吗？`"
              placement="bottom"
              @confirm="handleSetIndex(row)"
            >
              <i class="icon-is-index" slot="reference"></i>
            </el-popconfirm>
          </div>
        </el-table-column>
        <el-table-column prop="publish_status" label="发布状态" width="200">
          <template slot-scope="{ row }">
            <el-popconfirm
              :title="`要切换为${row.publish_status === 'NO' ? '已发布' : '未发布'}状态吗？`"
              placement="left"
              @confirm="handleChangePublishStatus(row)"
            >
              <el-button :disabled="row.is_index === 'YES'" type="text" slot="reference">
                {{ row.publish_status === 'YES' ? '已发布' : '未发布' }}
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
        <el-table-column prop="publish_status" label="创建时间" width="200">
          <template slot-scope="{ row }">
            {{ row.create_time | unixToDate }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="页面描述" align="left"/>
        <el-table-column prop="is_index" label="首页">
          <template slot-scope="{ row }">
            {{ row.is_index === 'NO' ? '否' : '是' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="left">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.publish_status === 'YES'"
              size="mini"
              type="text"
              @click="handlePromotionPage(row)"
            >推广</el-button>
            <el-button size="mini" type="text" @click="handleToDecor(row, 'preview')">预览</el-button>
            <el-button size="mini" type="text" @click="handleToDecor(row, 'edit')">编辑</el-button>
            <el-button size="mini" type="text" @click="handleCopyPage(row)">复制</el-button>
            <el-popconfirm
              title="确定要删除这个页面吗？"
              icon="el-icon-info"
              icon-color="red"
              placement="left"
              @confirm="handleDeletePage(row)"
              class="delete-btn"
            >
              <el-button size="mini" type="text" slot="reference">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </template>

      <el-pagination
        v-if="tableData"
        slot="pagination"
        @size-change="page_size => params.page_size = page_size"
        @current-change="page_no => params.page_no = page_no"
        :current-page="params.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="params.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.data_total">
      </el-pagination>
    </en-table-layout>
    <el-dialog
      title="页面推广"
      :visible.sync="show_page_promotion"
      center
      width="30%"
    >
      <div class="promotion-dialog">
        <!-- <qrcode-vue
          :value="promotion_link"
          :size="200"
          level="H">
        </qrcode-vue> -->
        <el-input :value="promotion_link" class="promotion-dialog__input">
          <el-button
            type="primary"
            slot="append"
            v-clipboard:copy="promotion_link"
            v-clipboard:success="() => $message.success('复制成功')"
          >复制</el-button>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Floor from '@/api/floor'
import QrcodeVue from 'qrcode.vue'
import decorUtils from '@/utils/decor-utils'

export default {
  name: 'pcPages',
  components: { QrcodeVue },
  mixins: [decorUtils],
  data() {
    return {
      /** 列表loading状态 */
      loading: false,

      /** 列表参数 */
      params: {
        page_no: 1,
        page_size: 20,
        client_type: 'PC',
        keyword: '',
        publish_status: ''
      },

      /** 列表数据 */
      tableData: '',

      /** 被选择的数据 */
      selected: [],

      /** 显示页面推广弹窗 */
      show_page_promotion: false,
      /** 推广的页面链接 */
      promotion_link: '',
      /** 是否开启了国际化 */
      open_i18n: process.env.I18N
    }
  },
  watch: {
    'params.page_no': 'GET_MiniPages',
    'params.page_size': 'GET_MiniPages',
    'params.keyword': 'GET_MiniPages',
    'params.publish_status': 'GET_MiniPages'
  },
  computed: {
    /** 装修服务地址 */
    decor_url() {
      let url = this.MixinDomain.decor + '?decor_type=admin&client_type=pc'
      if (this.open_i18n) url += `&lang=${this.$i18n.locale}`
      return url
    }
  },
  mounted() {
    this.GET_MiniPages()
  },
  methods: {
    /** 添加页面 */
    handleAddPage() {
      const win = window.open(this.decor_url)
      this.syncToDecor(win)
    },

    /** 编辑装修中心 */
    handleToDecor(row, action = 'edit') {
      const win = window.open(this.decor_url + `&id=${row.id}&action=${action}`)
      this.syncToDecor(win)
    },

    /** 复制页面 */
    async handleCopyPage(row) {
      let id = row.id
      if (!id) {
        if (this.selected.length === 0) return this.$message.error('请选择一个页面！')
      }
      API_Floor.copyMiniPages(id).then(() => {
        this.$message.success('复制成功！')
        this.GET_MiniPages()
      })
    },

    /** 删除页面 */
    async handleDeletePage(row) {
      let id = row.id
      if (!id) {
        if (this.selected.length === 0) return this.$message.error('请至少选择一个页面！')
        await this.$confirm('确定要删除这些页面吗？')
        id = this.selected.map(item => item.id).join(',')
      }
      API_Floor.deleteMiniPages(id).then(() => {
        this.$message.success('删除成功！')
        this.GET_MiniPages()
      })
    },

    /** 获取微页面列表 */
    GET_MiniPages() {
      this.loading = true
      API_Floor.getMiniPages(this.params).then(response => {
        this.tableData = response
        this.selected = []
      }).finally(() => { this.loading = false })
    },

    /**
     * 改变发布状态
     * @param row
     */
    async handleChangePublishStatus(row) {
      await API_Floor.changeMiniPagePublishStatus(row.id)
      this.GET_MiniPages()
    },

    /**
     * 设为首页状态
     * @param row
     */
    async handleSetIndex(row) {
      if (!row || !row.id) {
        const { selected } = this
        if (selected.length === 0) return this.$message.error('请选择一个页面！')
        if (selected.length > 1) return this.$message.error('只能设置一个页面为首页！')
        if (selected[0].is_index === 'YES') return this.$message.error('该页面已经是商城首页了！')
        row = selected[0]
      }
      try {
        if (row['is_index'] === 'NO') {
          await this.$confirm('要将这个页面设置为商城首页吗？')
        }
        await API_Floor.setMiniPageIndex(row.id)
        this.GET_MiniPages()
      } catch (e) {
        //
      }
    },
    /**
     * 推广页面
     * @param row
     */
    handlePromotionPage(row) {
      this.promotion_link = this.getMiniPageLink(row)
      this.show_page_promotion = true
    },
    /**
     * 获取微页面链接
     * @param page
     * @returns {string}
     */
    getMiniPageLink(page) {
      let url = this.MixinDomain['buyer_pc']
      if (page.is_index === 'NO') {
        url += `/mini-page?id=${page.id}`
      }
      return url
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar-search {
  display: flex;
}
.page-name-cell {
  display: flex;
  align-items: center;
  line-height: normal;
  .page-link {
    color: #155bd4;
  }
  .icon-is-index {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    cursor: pointer;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAAAoUlEQVQ4EWN87q3p/Zfp31KG/wz8DKQARoaPzP+Yohmf+Kp/IFkzzCKgISzomoXrZzJwmNjDlKDQP84cZHjbmI4QA7qaBcGDsECan/pqoAuD+dKbb2CIM2GIkCgwagADA8VhgBGNoEjAFl24IgerAbB0wCKvBtb35+EtMI3NYOp7AZRcsdkEcsKP0wfALkEmKM5MTKAsyQDMVcimEsWGZmcAXLEu6W8GHXUAAAAASUVORK5CYII=');
  }
}
.delete-btn {
  margin-left: 10px;
}
.promotion-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__input {
    margin-top: 10px;
    width: 350px;
  }
}
</style>
