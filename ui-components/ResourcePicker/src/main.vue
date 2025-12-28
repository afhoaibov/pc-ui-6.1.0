<template>
  <el-dialog
    title="素材中心"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="resource-picker__dialog"
    append-to-body
    width="1000px"
    :before-close="handleCloseDialog"
  >
    <div class="resource-picker__dialog-body">
      <el-tabs v-model="resource_type" type="card">
        <el-tab-pane label="图片素材" name="image" :disabled="type === 'video'"/>
        <el-tab-pane label="视频素材" name="video" :disabled="type === 'image'"/>
      </el-tabs>
      <div class="resource-picker__dialog-content">
        <div v-loading="loading_tree" class="resource-picker__dialog-content-left">
          <el-button @click="dialogUploadVisible = true">{{ resource_type_text }}</el-button>
          <div class="resource-picker__dialog-tree">
            <el-input v-model="filter_tree_text" size="mini" placeholder="输入关键字过滤分组" />
            <el-tree
              ref="tree"
              :data="resourceTree"
              :props="{label: 'group_name'}"
              :filter-node-method="filterTreeNode"
              :expand-on-click-node="false"
              default-expand-all
              @node-click="handleClickTreeNode"
            >
              <div class="resource-picker__dialog-tree-node" slot-scope="{ node, data }">
                <span>{{ node['label'] }}</span>
                <span>{{ data['resource_count'] }}</span>
              </div>
            </el-tree>
          </div>
        </div>
        <div v-loading="loading_resource" class="resource-picker__dialog-content-right">
          <div v-if="resourceData && resourceData.data.length" class="resource-picker__dialog-list">
            <div
              v-for="item in resourceData.data"
              :key="item.id"
              class="resource-picker__dialog-item"
              :class="{selected: isSelected(item)}"
              @click="handleClickResourceItem(item)"
            >
              <div
                v-if="resource_type === 'image'"
                class="resource-picker__dialog-item-img"
                :style="{backgroundImage: `url(${item['resource_url']})`}"
              />
              <video v-else :src="item['resource_url']" class="resource-picker__dialog-item-img" />
              <div class="resource-picker__dialog-item-info">
                <p class="resource-picker__dialog-item-name">{{ item['resource_name'] }}</p>
                <p class="resource-picker__dialog-item-size">{{ item['resource_storage'] }}KB</p>
                <p class="resource-picker__dialog-item-resolution">{{ item['img_width'] }}*{{ item['img_height'] }}</p>
                <p class="resource-picker__dialog-item-time">{{ item['create_time'] | timestampToDate }} 上传</p>
              </div>
              <!-- <div class="resource-picker__dialog-item-selected-icon">
                <i class="ri-check-fill icon-check"></i>
              </div> -->
              <!--<div class="resource-picker__dialog-item-delete" @click.stop="handleDeleteResource(item)">删除</div>-->
            </div>
          </div>
          <div v-else class="resource-picker__dialog-list resource-picker__dialog-list-empty">
            {{ loading_resource ? '数据加载中...' : '暂无数据...' }}
          </div>
          <div class="resource-picker__dialog-page">
            <el-pagination
              @size-change="size => params.page_size = size"
              @current-change="page => params.page_no = page"
              :current-page="params.page_no"
              :page-sizes="[15, 30, 50, 100]"
              :page-size="params.page_size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="resourceData['data_total']"
            />
          </div>
        </div>
      </div>
      <div class="resource-picker__dialog-search">
        <el-input
          placeholder="输入关键字搜索"
          v-model="params.resource_name"
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
    <el-dialog
      width="30%"
      :title="resource_type_text"
      :visible.sync="dialogUploadVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <div class="resource-picker__dialog-upload">
        <el-form v-model="uploadForm">
          <el-form-item label="素材分组">
            <el-cascader
              v-model="uploadForm.group_id"
              :options="resourceTree"
              :props="{
                label: 'group_name',
                value: 'group_id',
                checkStrictly: true
              }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="选择文件" class="resource-picker__dialog-upload-list">
            <el-upload
              ref="elUpload"
              :action="uploadApi"
							:headers="uploadHeaders"
              list-type="picture-card"
              :file-list="uploadForm.fileList"
              :on-success="handleUploadSuccess"
              :accept="uploadAccept"
              multiple
            >
              <i class="el-icon-plus"></i>
              <div slot="file" slot-scope="{file}" class="resource-picker__dialog-upload-slot">
                <video v-if="file.raw.type.indexOf('video') !== -1" class="el-upload-list__item-thumbnail" :src="file.url"/>
                <img v-else class="el-upload-list__item-thumbnail" :src="file.url" :alt="file.status">
                <label class="el-upload-list__item-status-label">
                  <i :class="{'el-icon-upload-success': true,'el-icon-check': true}"></i>
                </label>
                <el-progress
                  v-if="file.status === 'uploading'"
                  type="circle"
                  :stroke-width="6"
                  :percentage="parseInt(file.percentage, 10)">
                </el-progress>
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-delete" @click="handleUploadRemove(file)">
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUploadVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleUploadConfirm"
          :disabled="!uploadForm.fileList.length"
        >确 定</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
export default {
  name: 'EnResourcePicker',
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false
    },
    // 素材类型
    type: {
      type: String,
      required: false,
      default: ''
    },
    // 请求方法
    request: {
      type: Function,
      required: true
    },
    api: {
      type: String,
      required: false,
      default: 'seller/shops/resource'
    },
    // 文件上传API
    uploadApi: {
      type: String,
      required: true
    },
		// 文件上传token
		uploadHeaders: {
			type: Object,
      required: true
		},
    // 分组树API
    treeApi: {
      type: String,
      required: false,
      default: 'seller/shops/resource-group/tree-list'
    },
    // 素材上传API
    resourceApi: {
      type: String,
      required: false,
      default: 'seller/shops/resource/batch'
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
    }
  },
  data() {
    return {
      dialogVisible: false,
      resource_type: this.type || 'image',
      resourceImageTree: [],
      resourceVideoTree: [],
      filter_tree_text: '',
      resourceData: '',
      params: {
        page_size: 15,
        page_no: 1,
        resource_name: '',
        group_id: '',
        group_type: this.type === 'video' ? 'VIDEO' : 'IMAGE'
      },
      loading_tree: false,
      loading_resource: false,
      selected: [],
      dialogUploadVisible: false,
      uploadForm: {
        group_id: [],
        fileList: []
      }
    }
  },
  watch: {
    show: {
      immediate: true,
      handler: function(newVal) {
        this.selected = []
        this.dialogVisible = newVal
        newVal && this.handleOpenDialog()
      }
    },
    type: {
      immediate: true,
      handler: function(newVal) {
        this.resource_type = newVal
      }
    },
    resource_type(newVal) {
      this.params.group_type = newVal.toUpperCase()
      this.params.resource_name = ''
      this.params.page_no = 1
      this.selected = []
      if (newVal === 'image' && !this.resourceImageTree.length) {
        this.initResourceTree('image')
      }
      if (newVal === 'video' && !this.resourceVideoTree.length) {
        this.initResourceTree('video')
      }
    },
    filter_tree_text(newVal) {
      this.$refs['tree'].filter(newVal)
    },
    params: {
      deep: true,
      handler: 'getResourceList'
    }
  },
  computed: {
    resource_type_text() {
      return this.resource_type === 'image' ? '上传图片' : '上传视频'
    },
    // 素材树
    resourceTree() {
      return this.resource_type === 'image'
        ? this.resourceImageTree
        : this.resourceVideoTree
    },
    // 上传文件类型
    uploadAccept() {
      if (this.resource_type === 'image') {
        return 'image/jpg,image/jpeg,image/png,image/webp,image/bmp,image/gif'
      } else {
        return 'video/mp4,video/mov,video/m4v,video/flv,video/x-flv,video/mkv,video/wmv,video/avi,video/rmvb,video/3gp'
      }
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
      if (!this.resourceTree.length) this.initResourceTree(this.resource_type)
      if (!this.resourceData) this.getResourceList()
    },
    /**
     * 初始化分组信息
     * @returns {Promise<void>}
     */
    async initResourceTree(type = 'image') {
      const tree_api = `${this.treeApi}?group_type=${type.toUpperCase()}`
      try {
        this.loading_tree = true
        let res = await this.request({ url: tree_api, method: 'get', loading: false })
        res.splice(0, 0, {
          children: [],
          create_time: '0',
          depth: 1,
          group_id: '',
          group_name: '全部素材',
          group_type: type.toUpperCase(),
          parent_id: '0',
          resource_count: ''
        })
        res = this.formatTreeChildren(res)
        if (type === 'image') {
          this.resourceImageTree = res
        } else {
          this.resourceVideoTree = res
        }
      } finally {
        this.loading_tree = false
      }
    },
    /**
     * 素材树过滤
     * @param value
     * @param data
     * @returns {boolean}
     */
    filterTreeNode(value, data) {
      if (!value) return true;
      return data['group_name'].indexOf(value) !== -1;
    },
    /**
     * 点击了分组树节点
     * @param data
     */
    handleClickTreeNode(data) {
      this.params.group_id = data['group_id']
    },
    /**
     * 获取素材分页
     * @returns {Promise<void>}
     */
    async getResourceList() {
      try {
        this.loading_resource = true
        this.resourceData = await this.request({
          url: this.api,
          params: this.params,
          loading: false
        })
      } finally {
        this.loading_resource = false
      }
    },
    /**
     * 点击素材项
     * @param item
     */
    handleClickResourceItem(item) {
      const { selected, limit } = this
      const index = selected.findIndex(_item => _item.id === item.id)
      if (index === -1) {
        if (limit !== -1 && selected.length >= limit) {
          this.selected = [JSON.parse(JSON.stringify(item))]
        } else {
          this.selected.push(JSON.parse(JSON.stringify(item)))
        }
      } else {
        this.selected.splice(index, 1)
      }
    },
    /**
     * 删除素材
     * @param item
     */
    async handleDeleteResource(item) {
      try {
        await this.$confirm(`确定要删除【${item.resource_name}】吗？`, {
          title: '提示',
          type: 'error'
        })
        const url = `${this.resourceApi}?ids=${item.id}`
        await this.request({ url: url, method: 'delete' })
        const index = this.selected.findIndex(_item => _item.id === item.id)
        if (index !== -1) {
          this.selected.splice(index, 1)
        }
        await this.getResourceList()
      } catch (e) {
        //
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
     * 处理树子节点
     * 如果children为空，设为undefined
     * @param children
     * @returns {*}
     */
    formatTreeChildren(children) {
      return children.map(item => {
        if (item.children && item.children.length) {
          item.children = this.formatTreeChildren(item.children)
        } else {
          item.children = undefined
        }
        return item
      })
    },
    /**
     * 文件上传成功
     * @param res
     * @param file
     * @param fileList
     */
    async handleUploadSuccess(res, file, fileList) {
      this.uploadForm.fileList = fileList
    },
    /**
     * 移除上传文件
     * @param file
     */
    handleUploadRemove(file) {
      this.$refs['elUpload']['handleRemove'](file)
      const index = this.uploadForm.fileList.findIndex(item => item.uid === file.uid)
      if (index === -1) return
      this.uploadForm.fileList.splice(index, 1)
    },
    /**
     * 确定上传素材
     */
    async handleUploadConfirm() {
      const { group_id, fileList } = this.uploadForm
      const formData = []
      for (let i = 0; i < fileList.length; i++) {
        const item = fileList[i]
        const { response, raw } = item
        try {
          const data = {
            group_id: group_id[group_id.length - 1] || -1,
            group_type: this.resource_type.toUpperCase(),
            resource_name: raw.name,
            // 电脑厂商一般以1000来计算，而不是1024
            resource_storage: parseFloat((item.size / 1000).toFixed(2)),
            resource_url: response.url || response.data.url,
            video_duration: 0
          }
          if (this.resource_type === 'image') {
            const image = await this.getImageInfo(item.url)
            data.img_width = image['naturalWidth']
            data.img_height = image['naturalHeight']
          } else {
            const video = await this.getVideoInfo(item.url)
            data.video_duration = video['duration']
            data.img_width = video['videoWidth']
            data.img_height = video['videoHeight']
          }
          formData.push(data)
        } catch (e) {
          // 有图片获取信息失败了
          console.log('有图片获取信息失败了: ', e)
        }
      }
      await this.request({
        url: this.resourceApi,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: formData
      })
      this.dialogUploadVisible = false
      this.uploadForm.group_id = []
      this.uploadForm.fileList = []
      this.params.resource_name = ''
      this.params.page_no = 1
      await this.getResourceList()
      await this.initResourceTree(this.resource_type)
    },
    /**
     * 获取图片信息
     * @param src
     * @returns {Promise<HTMLImageElement>}
     */
    getImageInfo(src) {
      return new Promise(resolve => {
        let image = new Image()
        image.src = src
        image.onload = () => {
          resolve(image)
          image = null
        }
      })
    },
    /**
     * 获取视频信息
     * @param src
     * @returns {Promise<HTMLVideoElement>}
     */
    getVideoInfo(src) {
      return new Promise(resolve => {
        let video = document.createElement('video')
        video.src = src
        video.preload = 'auto'
        video.onloadedmetadata = () => {
          console.log()
          resolve(video)
          video = null
        }
      })
    }
  },
  filters: {
    /**
     * 文件大小转换
     * @param value
     * @param si
     * @returns {string}
     */
    bytesUnit: function (value, si) {
      if (!value) return '0 kB'
      if (value) value *= 1024
      let thresh = si ? 1024 : 1000
      if (Math.abs(value) < thresh) {
        return value + ' B'
      }
      let units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      let u = -1
      do {
        value /= thresh
        ++u;
      } while (Math.abs(value) >= thresh && u < units.length - 1)
      return value.toFixed(1) + ' ' + units[u]
    },
    /**
     * 时间戳转普通时间格式
     * @param unix
     * @param format
     * @returns {string|*}
     */
    timestampToDate: function (unix, format = 'YYYY-MM-DD') {
      RegExp = window.RegExp
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
  }
}
</script>

<style lang="scss">
@use "./styles" as *;
</style>
