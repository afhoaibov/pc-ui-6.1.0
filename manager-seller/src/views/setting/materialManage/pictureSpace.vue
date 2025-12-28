<template>
  <div class="picture-container" :style="{height: maxHeight + 'px'}">
    <div class="picture-content">
      <div class="tree-box">
        <div class="tree-content">
          <div class="btn-content">
            <el-button size="small" @click="handleAddGroup" >添加分组</el-button>
            <el-button size="small" type="primary" @click="uploadPictures">上传</el-button>
          </div>

          <el-tree
           ref="treeRef"
           :data="pictureGroup"
            @node-click="handleNodeClick"
            highlight-current
            node-key="group_id"
            class="grouping-tree">
            <div class="custom-tree-node" slot-scope="{ node,data }">
            <span>{{ data.group_name }}</span>
            <div v-if="data.group_id !== '-1'" class="tree-btn">
              <i class="el-icon-edit" @click.stop="handleEditGroup(data)" />
              <i class="el-icon-delete" @click.stop="handleDeleteGrouping(data)" />
            </div>
          </div>
          </el-tree>
        </div>

        <!-- <div class="progress-box">
          <p class="text">{{keepTwoDecimal(shopInfo.used_storage_space / 1024)}}M/{{keepTwoDecimal(shopInfo.storage_capacity / 1024)}}M</p>
          <el-progress :percentage="percentage" :show-text="false"></el-progress>
        </div> -->
      </div>

      <div class="resource-content">
        <div class="album-content" ref="albumContent">
          <div class="album-items">
            <span class="album-name">{{ currentGroup.group_name}}</span>
            <el-checkbox v-model="checkAll">全选</el-checkbox>
            <span class="album-num-text"> 已选 {{selectCount}} 项</span>
          </div>
          <div class="album-picture" v-if="pictureList && pictureList.length">
            <el-popover
              v-for="item in pictureList"
              :key="item.id"
              placement="top"
              width="200"
              trigger="hover"
            >
              <div
                slot="reference"
                class="picture-item-base"
                :class="['picture-item-base', item.isSelected ? 'picture-item-check' : 'picture-item']"
              >
                <img
                  class="image-item"
                  :src="item.resource_url"
                  @click="checkOne(!item.isSelected, item)"/>
                <el-checkbox
                  class="picture-checkbox"
                  v-model="item.isSelected"
                  @change="checkOne(item.isSelected, item)">
                </el-checkbox>

                <div class="right-icon-box">
                  <div class="right-icon">
                    <i class="el-icon-more" />
                  </div>
                </div>
                <div class="opera-btn-list" >
                  <div class="btn-item" @click="handlerDownload(item)">
                    <i class="el-icon-download" />
                    下载
                  </div>
                  <div class="btn-item" @click="handleEditGrouping(item, 'copy')">
                    <i class="el-icon-document-copy" />
                    复制
                  </div>
                  <div class="btn-item" @click="handleEditGrouping(item, 'move')">
                    <i class="el-icon-rank" />
                    移动
                  </div>
                  <div class="btn-item" @click="handleDeletePicture(item.id)">
                    <i class="el-icon-delete" />
                    删除
                  </div>
                  <div class="btn-item" @click="editPictureName(item.id)">
                    <i class="el-icon-edit" />
                    重命名
                  </div>
                </div>
              </div>
              <div class="info-box">
                <p class="info-name">名称：{{item.resource_name}}</p>
                <p>大小：{{item.resource_storage}}KB</p>
                <p>上传时间：{{item.create_time, 'yyyy-MM-dd' | unixToDate}}</p>
              </div>
            </el-popover>
          </div>
          <div v-else class="no-album-picture">暂无数据</div>
        </div>

        <el-pagination
          v-if="pageData"
          style="text-align: right"
          @size-change="handlePageSizeChange"
          @current-change="handlePageCurrentChange"
          :current-page="pageData.page_no"
          :page-sizes="pageSizes"
          :page-size="pageData.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageData.data_total">
        </el-pagination>

        <div class="operation-btn-content" v-if="selectCount">
          <el-tooltip class="item" effect="dark" content="下载" placement="bottom">
            <i class="el-icon-download" @click="batchDownload" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="复制" placement="bottom">
            <i class="el-icon-document-copy" @click="batchEditGroup('copy')" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="移动" placement="bottom">
            <i class="el-icon-rank" @click="batchEditGroup('move')" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除" placement="bottom">
            <i class="el-icon-delete" @click="batchDeletePicture" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="取消" placement="bottom">
            <i class="el-icon-circle-close" @click="cancelSelected" />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!--上传图片-->
    <el-dialog width="620px" :visible.sync="isShowUpload" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="pictureForm" ref="pictureForm" :rules="pictureRules" label-width="110px">
        <el-form-item label="上传至分组：" prop="group_id">
          <el-cascader
            placeholder="请选择分组"
            ref="cascaderRef"
            v-model="pictureForm.group_id"
            :options="pictureGroup"
            :props="{ checkStrictly: true, value: 'group_id', label: 'group_name' }"
            @change="changePictureGroup" />
        </el-form-item>
        <el-form-item label="本地图片：" ref="image" prop="image_url">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            list-type="picture-card"
            multiple
            accept=".jpg,.jpeg,.png"
            :on-exceed="() => { $message.error('最多同时上传5张图片') }"
            :limit="5"
            :on-change="(file, fileList) => { pictureForm.image_url = fileList }"
            :on-remove="(file, fileList) => { pictureForm.image_url = fileList }"
            :on-success="uploadResourceSuccess"
            :before-upload="uploadPicturePreview"
            :file-list="fileList"
            :before-remove="handleBeforeRemove"
          >
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">请上传jpg、jpeg、png格式，建议分辨率不要超过800*800、大小不超3M的1:1正方形图片</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowUpload = false">取 消</el-button>
        <el-button type="primary" @click="submitPictureForm">确 定</el-button>
      </div>
    </el-dialog>

     <!--复制 & 移动 图片-->
     <move-group-dialog
      v-model="showGroupDialog.show"
      :moveGroupTitle="moveGroupTitle"
      :pictureGroup="pictureGroup"
      :defaultGroupId="showGroupDialog.group_id"
      @closeDialog="showGroupDialog.show = false"
      @moveGroupingEvent="moveGroupingEvent" />


    <!--添加 & 编辑 分组-->
    <add-group-dialog
      v-model="isShowAddGroup"
      :addGroupTitle="addGroupTitle"
      :groupType=groupType
      :pictureGroup="pictureGroup"
      :defaultGroupingForm="defaultGroupingForm"
      @submitAddGrouping="submitAddGrouping"
      @closeDialog="isShowAddGroup = false" />
  </div>
</template>

<script>
  import * as API_PictureSpace from '@/api/pictureSpace.js'
  import AddGroupDialog from './components/AddGroupDialog'
  import MoveGroupDialog from './components/MoveGroupDialog'
  import { cloneObj } from '@/utils/index'
  import Storage from '@/utils/storage'

  export default {
    components: {
      AddGroupDialog,
      MoveGroupDialog
    },
    data() {
      return {
        shopInfo: JSON.parse(Storage.getItem('seller_shop')),
        maxHeight: document.body.clientHeight - 150,
        /** 上传图片 表单校验**/
        pictureRules: {
          image_url: [
            {
              required: true,
              validator: (rule, value, callback) => {
                if (this.pictureForm.resource_list.length === 0) {
                  return callback(new Error('请上传素材'))
                } else {
                  callback()
                }
              }, trigger: 'change' }
          ],
          group_id: [{ required: true, pattern: /^\S.*$/gi, message: '请选择分组', trigger: 'blur' }]
        },
        params: {
          page_size: 30,
          page_no: 1,
          group_id: -1
        },
        pageSizes: [30, 60, 80, 100],
        // 图片资源暂存列表
        fileList: [],
        /** 分组数据 **/
        pictureGroup: [],
        /** 当前分组 **/
        currentGroup: {
          group_name: '未分组',
          group_id: -1
        },
        /** 列表页数据 **/
        pictureList: [],
        /** 列表分页数据 */
        pageData: {},
        /** 是否显示修改分组 dialog**/
        showGroupDialog: {
          show: false,
          instruct: ''
        },
        /** 是否显示上传图片 dialog**/
        isShowUpload: false,
        /** 是否添加分组 dialog**/
        isShowAddGroup: false,
        /** 修改图片分组表单 **/
        groupForm: {
          group_id: '',
          group_name: '',
          resource_ids: []
        },
        /** 上传图片表单 **/
        pictureForm: {
          group_id: '',
          image_url: [],
          resource_list: []
        },
        // 分组编辑数据
        defaultGroupingForm: {},
        /** 当前资源类型 **/
        groupType: 'IMAGE',
        addGroupTitle: '添加分组',
        moveGroupTitle: '移动到',
        headers: {
          Authorization: Storage.getItem('seller_access_token')
        }
      }
    },
    computed: {
      // 资源缓存百分比
      percentage() {
        const shopInfo = this.shopInfo
        return shopInfo.used_storage_space / shopInfo.storage_capacity * 100
      },
      selectCount() {
        const selectedList = this.pictureList.filter(item => item.isSelected)
        return selectedList.length
      },
      /** 全选 */
      checkAll: {
        get() {
          if (!this.pictureList.length) { return false }
          return this.pictureList.every(item => item.isSelected)
        },
        set() {
          if (this.pictureList.every(item => item.isSelected)) {
            this.pictureList.forEach(item => { item.isSelected = false })
          } else {
            this.pictureList.forEach(item => { item.isSelected = true })
          }
        }
      }
    },
    mounted() {
      const offsetWidth = this.$refs['albumContent'].offsetWidth
      // 获取刚好铺满容器分页数量
      const page_size = parseInt(parseInt(offsetWidth / 190) * 5)
      this.params.page_size = page_size
      this.pageSizes = [page_size, page_size * 2, page_size * 3, page_size * 4]
      this.GET_PictureGroup()
      this.GET_PictureList()
    },
    methods: {
      /** 取消选中 */
      cancelSelected() {
        this.pictureList.map(item => {
          item.isSelected = false
        })
      },

      handlerDownload(item) {
        this.$http({
          method: 'get',
          url: item.resource_url,
          headers: this.headers,
          responseType: 'blob'
        }).then((res) => {
          let url = window.URL.createObjectURL(res.data)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', item.resource_name)
          document.body.appendChild(link)
          link.click()
          // 删除添加的a链接
          let objLink = document.getElementById('downloadLink')
          document.body.removeChild(objLink)
        })
      },
      /** 资源选中 */
      checkOne(value, currentItem) {
        currentItem.isSelected = value
      },
      /** 分组改变 **/
      changePictureGroup(val) {
        if (!val.length) return
        this.pictureForm.group_id = val[val.length - 1]
      },

      /** 刷新店铺缓存数据 */
      refreshShopInfo() {
        this.$store.dispatch('getShopInfoAction').then(res => {
          this.shopInfo = res
        })
      },

      /** 添加分组 表单提交成功回调**/
      submitAddGrouping() {
        this.isShowAddGroup = false
        this.GET_PictureGroup()
      },
      /** 显示上传图片弹框 **/
      uploadPictures() {
        const group_id = this.currentGroup.group_id
        this.isShowUpload = true
        this.pictureForm.group_id = `${group_id}`
      },

      /** 上传图片表单提交**/
      submitPictureForm() {
        this.$refs['pictureForm'].validate((valid) => {
          if (valid) {
            let params = JSON.parse(JSON.stringify(this.pictureForm))
            let resource_list = params.resource_list.map(item => {
              item.group_type = this.groupType
              item.group_id = params.group_id
              return item
            })
            API_PictureSpace.uploadPicture(resource_list).then(() => {
              this.$message.success('上传成功！')
              this.isShowUpload = false
              this.pictureForm.resource_list = []
              this.pictureForm.image_url = []
              this.fileList = []
              this.$refs.cascaderRef.$refs.panel.clearCheckedNodes()
              this.GET_PictureList()
              this.GET_PictureGroup()
              this.refreshShopInfo()
            })
          } else {
            this.$message.error('表单填写有误，请核对！')
            return false
          }
        })
      },
      /** 编辑分组 */
      handleEditGroup(group) {
        this.addGroupTitle = '编辑分组'
        this.isShowAddGroup = true
        this.defaultGroupingForm = cloneObj(group)
      },
      /** 显示添加分组弹框 **/
      handleAddGroup() {
        this.isShowAddGroup = true
        this.defaultGroupingForm = {
          parent_id: this.currentGroup.group_id
        }
      },
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_PictureList()
      },
      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_PictureList()
      },

      /** 分组重命名 **/
      editGroupingName() {
        this.$prompt('', '修改分组名称', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (val) => {
            if (val.length > 10) {
              return '分组名称最多10个字符'
            }
            if (val.length < 2) {
              return '分组名称最少2个字符'
            }
            return true
          },
          inputPattern: /.+/,
          inputErrorMessage: '分组名称不能为空！'
        }).then(({ value }) => {
          API_PictureSpace.editGroup(this.currentGroup.group_id, { group_name: value }).then(() => {
            this.currentGroup.group_name = value
            this.GET_PictureGroup()
            this.$message.success('修改成功！')
          })
        }).catch(() => {})
      },

      /** 删除分组 **/
      handleDeleteGrouping(group) {
        this.$confirm(`确认删除此分组？<br/><span style="font-size: 12px; color: rgb(188, 188, 188);">注：仅删除分组，不删除图片，组内图片将自动归入未分组</span>`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }).then(() => {
          API_PictureSpace.deleteGroup(group.group_id).then(() => {
            this.GET_PictureGroup()
            this.handleNodeClick({ group_id: -1, group_name: '未分组' })
            this.$message.success('删除成功！')
            this.refreshShopInfo()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      /** 修改图片名称 **/
      editPictureName(id) {
        this.$prompt('', '修改图片名称', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^.{1,20}$/,
          inputErrorMessage: '限制输入1-20个字符',
          maxlength: 5
        }).then(({ value }) => {
          API_PictureSpace.editPicture(id, { resource_name: value }).then(() => {
            this.GET_PictureList()
            this.$message.success('修改成功！')
          })
        }).catch(() => {})
      },

      /** 批量下载图片 */
      batchDownload() {
        if (!this.pictureList.some(item => item.isSelected)) {
          return this.$message.error('请选择素材！')
        }
        this.pictureList.forEach(item => {
          if (item.isSelected) {
            this.handlerDownload(item)
          }
        })
      },

      /** 批量删除图片**/
      batchDeletePicture() {
        if (!this.pictureList.some(item => item.isSelected)) {
          return this.$message.error('请选择素材！')
        }
        const ids = this.pictureList.filter(item => item.isSelected).map(item => item.id)
        this.handleDeletePicture(ids)
      },

      /** 删除图片 **/
      handleDeletePicture(ids) {
        this.$confirm('确认删除此素材，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          API_PictureSpace.deletePicture({ ids: ids }).then(() => {
            this.GET_PictureList()
            this.GET_PictureGroup()
            this.refreshShopInfo()
            this.$message.success('删除成功！')
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },

      /** 显示批量分组弹框 **/
      batchEditGroup(type) {
        if (!this.pictureList.some(item => item.isSelected)) {
          return this.$message.error('请选择素材')
        }
        const pictureListSelected = this.pictureList.filter(item => item.isSelected)
        this.groupForm.resource_ids = pictureListSelected.map(item => item.id)
        this.moveGroupTitle = type === 'copy' ? '复制到' : '移动到'
        this.showGroupDialog = {
          show: true,
          instruct: type,
          group_id: ''
        }
      },
      /** 显示修改图片分组弹框 **/
      handleEditGrouping(item, type) {
        this.groupForm.resource_ids = [item.id]
        this.moveGroupTitle = type === 'copy' ? '复制到' : '移动到'
        this.showGroupDialog = {
          show: true,
          instruct: type,
          group_id: item.group_id
        }
      },
      /** 移动或复制至指定分组操作 */
      moveGroupingEvent(group_id) {
        this.groupForm.group_id = group_id
        const { instruct } = this.showGroupDialog
        if (instruct === 'move') {
          // 移动分组
          this.editPictureGroup()
        } else if (instruct === 'copy') {
          // 复制资源
          this.copyResource()
        }
      },

      /** 拷贝资源 */
      copyResource() {
        const groupForm = this.groupForm
        const group_id = groupForm.group_id
        delete groupForm.group_name
        delete groupForm.group_id
        API_PictureSpace.copyResource(group_id, groupForm).then(res => {
          this.showGroupDialog.show = false
          this.$message.success('复制成功！')
        })
      },

      /** 资源移动分组 */
      editPictureGroup() {
        API_PictureSpace.editPictureGroup(this.groupForm).then(() => {
          this.$message.success('修改成功！')
          this.showGroupDialog.show = false
          this.GET_PictureList()
        })
      },

      /** 获取图片分组 **/
      GET_PictureGroup() {
        // 递归判断列表，把最后的children设为undefined
        const getTreeData = (arr) => {
          arr.forEach(item => {
            if (item.children && item.children.length) {
              // children若不为空数组，则继续 递归调用 本方法
              getTreeData(item.children)
            } else {
              // children若为空数组，则将children设为undefined
              item.children = undefined
            }
          })
          return arr
        }
        API_PictureSpace.getPictureGroup({ group_type: this.groupType }).then(response => {
          this.pictureGroup = getTreeData(response)
          this.$nextTick(() => {
            this.$refs.treeRef.setCurrentKey('-1')
          })
        })
      },
      /** 获取图片列表 **/
      GET_PictureList() {
        this.params.group_type = this.groupType
        API_PictureSpace.getPictureList(this.params).then(response => {
          this.pictureList = response.data.map(item => {
            item.isSelected = false
            return item
          })
          this.pageData = {
            page_no: Number(response.page_no),
            page_size: Number(response.page_size),
            data_total: response.data_total
          }
        })
      },
      /** 筛选分组数据 **/
      handleNodeClick(data) {
        this.currentGroup = data
        this.params.group_id = data.group_id === 0 ? '' : data.group_id
        this.params.page_no = 1
        this.GET_PictureList()
      },

      /** 上传素材成功 **/
      uploadResourceSuccess(res, file) {
        let resource = {
          resource_name: file.name,
          resource_url: res.url,
          resource_storage: this.keepTwoDecimal(file.size / 1024)
        }
        this.setImageWidthAndHeight(file, resource)
        this.pictureForm.resource_list.push(resource)
      },

      /** 上传图片前校验 **/
      uploadPicturePreview(file) {
        if (file.size > 3 * 1024 * 1024) {
          this.$message.error('图片大小不能超过3MB')
          return false
        }
        return true
      },

      /** 删除图片 **/
      handleBeforeRemove(file) {
        this.pictureForm.resource_list = this.pictureForm.resource_list.filter(item => item.resource_url !== file.response.url)
      },

      /** 四舍五入保留2位小数 **/
      keepTwoDecimal(num) {
        let result = parseFloat(num)
        if (isNaN(result)) {
          return 0.0
        }
        result = Math.round(num * 100) / 100
        return result
      },
      /** 获取图片宽高 **/
      setImageWidthAndHeight(file, resource) {
        new Promise((resolve, reject) => {
          let img = new Image()
          img.onload = function() {
            resolve(img)
          }
          img.src = URL.createObjectURL(file.raw)
        }).then((res) => {
          resource.img_width = res.width
          resource.img_height = res.height
          resource.video_duration = 0
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .picture-container ::v-deep {
    .el-checkbox { padding-left: 8px; }
    .el-checkbox__label {
      font-size: 13px;
      line-height: 13px;
      color: #333;
      white-space: normal;
      word-break: break-all;
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      // line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .el-cascader { width: 100%;}
    .el-tree { color:#333; }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding-right: 8px;
    &:hover {
      .tree-btn {
        display:block;
      }
    }
    .tree-btn {
      display: none;
      .el-icon-edit {
        margin-right: 10px;
      }
    }
  }
  .picture-container {
    background-color: #fff;
    padding: 10px 10px 10px;
    .picture-content {
      width: 100%;
      height: 100%;
      display: flex;
      .tree-box {
        width: 280px;
        text-align: center;
        border-right: 1px solid #efefef;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        .tree-content {
          max-height: calc(100% - 60px);
          .btn-content {
            text-align: left;
          }
        }
        .progress-box {
          font-size: 14px;
          color: #333;
          text-align: left;
          margin-bottom: 10px;
          border-top: 1px solid #efefef;
          .text {
            margin-bottom: 10px;
          }
        }
        .grouping-tree {
          margin-top: 20px;
          border-top: 1px solid #efefef;
          padding-bottom: 20px;
          height: calc(100% - 50px);
          overflow: auto;
        }
      }
      .resource-content {
        padding: 0 0 50px 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        height: 100%;
        .operation-btn-content {
          width: 200px;
          height: 40px;
          background: rgba(0, 0, 0, .8);
          border-radius: 10px;
          position: absolute;
          bottom: 10px;
          left: 30%;
          color: #fff;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          i {
            cursor: pointer;
          }
        }
      }
      .album-content {
        height: 100%;
        .album-items {
          display: flex;
          align-items: flex-end;
          margin-bottom: 10px;
          .album-num-text {
            font-size: 13px;
            color: #333;
            font-weight: 500;
            margin-left: 10px;
          }
          ::v-deep .el-checkbox{
            display: flex;
            align-items: center;
          }
          .album-name {
            font-size: 14px;
            color: #000;
            padding:0 5px;
          }
          .album-btn {
            color: #1881D2;
            padding:0 5px;
            font-size: 14px;
          }
        }
        .album-picture {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          height: calc(100% - 100px);
          overflow: auto;
          ::v-deep .picture-item-check {
            border: 3px solid #409EFF !important;
            .image-item {
              transition: all .3s;
              transform: scale(0.9);
              border: 1px solid #fff;
              &:hover {
                border-color: #d7d7d7;
              }
            }
            .picture-checkbox {
              display: block !important;
            }
          }
          ::v-deep .picture-item {
            .image-item {
              transform: scale(1);
              transition: all .3s;
              border: 1px solid #fff;
            }
            &:hover {
              border: 1px solid #efefef;
              .picture-checkbox, .right-icon-box, .info-box {
                display: block;
              }
            }
          }
          ::v-deep .picture-item-base {
            width: 180px;
            height: 180px;
            margin: 0 10px 10px 0;
            position: relative;
            border: 1px solid #fff;
            cursor: pointer;

            .right-icon-box {
              display: none;
              position: absolute;
              top: 4px;
              right: 4px;
              width: 40px;
              height: 30px;
              &:hover {
                ~.info-box {
                  display: none !important;
                }
                + .opera-btn-list {
                  display: block;
                }
              }
              .right-icon {
                width: 30px;
                height: 18px;
                text-align: center;
                color: #fff;
                margin-left: 10px;
                border-radius: 4px;
                background: #C0C4CC;
              }
            }
            .opera-btn-list {
              display: none;
              position: absolute;
              border-radius: 2px;
              top: 24px;
              right: 8px;
              border: 1px solid #efefef;
              color: #333;
              font-size: 12px;
              background: #fff;
              width: 90px;
              &:hover {
                display: block;
                + .info-box {
                  display: none;
                }
              }
              .btn-item {
                padding: 4px 0 4px 10px;
                font-size: 12px;
                i {
                  width: 20px;
                  text-align: center;
                }
                &:hover {
                  background: rgb(217, 236, 255);
                  color: #409EFF;
                }
              }
            }
            .info-box {
              display: none;
              border: 1px solid #efefef;
              width: 160px;
              height: 110px;
              background: #fff;
              position: absolute;
              bottom: -100px;
              box-shadow: 0 0 4px 0 rgba(0, 0, 0, .1);
              left: 10px;
              font-size: 12px;
              color: #333;
              padding: 14px 14px 0px;
              z-index: 9999;
              .info-name {
                width: 100%;
                word-break:break-all;
                word-wrap:break-word;
              }
              p {
                margin: 0 0 8px;
              }
            }
            .picture-checkbox {
              display: none;
              position: absolute;
              top: 4px;
              left: -2px;
            }
            .image-item {
              width: 100%;
              height: 100%;
              display: block;
            }
          }
        }
        .no-album-picture {
          min-height: 400px;
          font-size: 16px;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

    }
  }

  .resource-count{
    color: #999999
  }

</style>
