<template>
  <div>
    <div class="toolbar-box">
      <el-button type="primary" @click="handleOpenImportDialog('cate')">导入分类</el-button>
      <div class="tips-box">
        <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
        请根据excel模板 <a :href="`${API.admin}/import-tpl/category.xlsx`" target="_blank">[点击此处下载模板]</a> 填写信息，导入的excel大小限制为2M
      </div>
    </div>
    <div class="toolbar-box">
      <el-button type="primary" @click="handleOpenImportDialog('params')">导入分类参数</el-button>
      <div class="tips-box">
        <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
        请根据excel模板 <a :href="`${API.admin}/import-tpl/category-params.xlsx`" target="_blank">[点击此处下载模板]</a> 填写信息，导入的excel大小限制为2M
      </div>
    </div>
    <en-grade-editor
      ref="gradeEditor"
      type-text="分类"
      :api="categoryApi"
      :params-names="{ id: 'category_id', text: 'name' }"
      :btns="itemBtns"
      :maxLevel="3"
      @add-click="handleAddCat"
    />
    <!--添加、编辑分类dialog-->
    <el-dialog
      :title="catForm.category_id ? '编辑分类' : '添加分类'"
      width="500px"
      :visible.sync="dialogCatVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="catForm" :rules="catRules" ref="catForm" label-width="100px">
        <!--分类名称-->
        <el-form-item label="分类名称" prop="category_name">
          <el-input v-model="catForm.category_name"></el-input>
        </el-form-item>
        <el-form-item label="是否显示" prop="is_show">
          <el-radio v-model="catForm.is_show" label="YES">是</el-radio>
          <el-radio v-model="catForm.is_show" label="NO">否</el-radio>
        </el-form-item>
        <!--分类图片-->
        <el-form-item label="分类图片" prop="cat_img">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            list-type="picture"
            :on-success="uploadSuccess"
            :on-remove="delGiftImg"
            :file-list="fileList"
            :multiple="false"
            :limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <span slot="tip" class="el-upload__tip">&nbsp;建议上传jpg/png文件，且不超过1MB</span>
          </el-upload>
        </el-form-item>
        <template v-if="category_root">
          <el-form-item label="App促销图片" prop="cat_img">
            <el-upload
              :action="MixinUploadApi"
              :headers="MixinAccessToken"
              list-type="picture"
              :on-success="uploadPromotionSuccess"
              :on-remove="delPromotionImg"
              :file-list="promotionFileList"
              :multiple="false"
              :limit="1"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <span slot="tip" class="el-upload__tip">&nbsp;建议上传jpg/png文件，且不超过1MB</span>
            </el-upload>
          </el-form-item>
          <el-form-item label="App促销图片链接">
            <el-input v-model="catForm.adv_image_link"></el-input>
            <span style="font-size: 12px">注：小程序不支持链接跳转</span>
          </el-form-item>
        </template>
        <!--上级分类-->
        <el-form-item v-if="catForm.parent_datas" label="上级分类" prop="parent_id">
          <el-select v-model="catForm.parent_id" placeholder="请选择上级分类">
            <el-option
              v-for="item in catForm.parent_datas"
              :label="item.name"
              :value="item.category_id"
              :key="item.category_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="自定义编码" prop="custom_sn">
          <el-input v-model="catForm.custom_sn" maxlength="50"></el-input>
          <span style="font-size: 12px">注：供商家批量导入商品，填写Excel类目编码使用</span>
        </el-form-item>
        <!--排序-->
        <el-form-item label="排序" prop="category_order">
          <el-input-number
            v-model="catForm.category_order"
            controls-position="right"
            :min="0"
            :max="99999"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCatVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCatForm('catForm')">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑关联品牌dialog-->
    <el-dialog
      title="关联品牌"
      width="500px"
      :visible.sync="dialogBrandVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="brandForm" :rules="brandRules" ref="brandForm">
        <el-form-item label="已关联品牌">
          <div class="had-relation-brand-content">
            <div class="item" v-for="(item,index) in brandForm.selectedBrandList" :key="item.id">
              <span class="brand-name">{{item.text}}</span>
              <i class="el-icon-error" @click="deleteBrand(item,index)"></i>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="关联新品牌" style="marginTop:30px">
          <el-autocomplete
            ref="autocompleteSearch"
            class="inline-input"
            v-model="keyword"
            :fetch-suggestions="querySearch"
            placeholder="请输入要关联的品牌名称"
            :trigger-on-focus="false"
            @select="handleSelect"
            style="width:290px"
          >
            <template slot-scope="{ item }">
              <div :class="['search-list-item',item.checked ? 'checked' : '']">
                <div class="name">{{item.text}}</div>
                <i class="el-icon-check" v-if="item.checked"></i>
              </div>
            </template>
          </el-autocomplete>
          <el-button plain @click="btnSearch()">搜 索</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogBrandVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitBrandForm('brandForm')">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分类数据导入弹窗 -->
    <import-Dialog
      :value="importDialogVisible"
      :importType="importType"
      :uploadAction="importUploadAction"
      @close="importDialogVisible = false"
      @success="handleImportCateSuccess"
    />
  </div>
</template>

<script>
import * as API_Category from '@/api/category'
import { cloneObj } from '@/utils/index'
import { api as API } from 'ui-domain'
import AddInterfaceDialog from '../../dictionaryManage/components/AddInterfaceDialog'
import ImportDialog from '@/views/dictionaryManage/components/ImportDialog.vue'

export default {
  name: 'categoryList',
  components: { ImportDialog, AddInterfaceDialog },
  data() {
    return {
      API,
      itemBtns: [
        { text: '参数', onClick: this.handleEditParams },
        { text: '品牌', onClick: this.handleEditBrand },
        { text: '编辑', onClick: this.handleEditCat },
        { text: '删除', onClick: this.handleDeleteCat, color: 'red' }
      ],
      // 添加、编辑分类 dialog
      dialogCatVisible: false,
      // 编辑关联品牌 dialog
      dialogBrandVisible: false,
      // 添加、编辑分类 表单
      catForm: {
        is_show: 'YES'
      },
      // 添加、编辑分类 表单规则
      catRules: {
        category_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        is_show: [
          { required: true, message: '请选择是否显示', trigger: 'blur' }
        ],
        custom_sn: [
          { required: true, message: '请填写自定义编码', trigger: 'blur' }
        ]
      },
      // 编辑关联品牌 表单
      brandForm: {
        brandTitle: '关联品牌',
        category_id: null,
        selectedBrandList: [],
        brandList: []
      },
      // 编辑关联品牌 表单规则
      brandRules: {},
      /** 存储上传的图片*/
      fileList: [],
      categoryApi: 'admin/goods/categories/@id/children',
      /** 存储APP促销上传的图片*/
      promotionFileList: [],
      /** 是否为一级分类 **/
      category_root: false,
      keyword: '',
      cb: null,
      category_id: null,
      restaurants: [],
      importType: 'cate',
      importDialogVisible: false
    }
  },
  computed: {
    importUploadAction() {
      return this.importType === 'cate'
        ? `${API.admin}/admin/goods/categories/import`
        : `${API.admin}/admin/goods/imports/param`
    }
  },
  methods: {
    /** 上传app促销图片 */
    uploadPromotionSuccess(res) {
      this.$set(this.catForm, 'adv_image', res.url)
    },
    /** 删除app促销图片之后 */
    delPromotionImg() {
      this.promotionFileList = []
      this.catForm.adv_image = ''
    },
    uploadSuccess(res) {
      this.$set(this.catForm, 'category_image', res.url)
    },
    /** 图片移除之后 */
    delGiftImg() {
      this.fileList = []
      this.catForm.category_image = ''
    },
    /** 添加分类 */
    handleAddCat(level, parent, parentArray) {
      this.category_root = !parent
      this.catForm = {
        parent_id: parent ? parent.category_id : 0,
        parent_datas: parentArray,
        category_order: 0,
        is_show: 'YES'
      }
      this.promotionFileList = []
      this.fileList = []
      this.dialogCatVisible = true
    },

    /** 编辑分类 */
    handleEditCat(cat, parent, parentArray) {
      this.category_root = !parent
      console.log(cat)
      const catForm = cloneObj(cat)
      catForm.parent_idm = parent ? parent.category_id : 0
      catForm.parent_datas = parentArray
      catForm.category_name = cat.name
      catForm.category_image = cat.image
      catForm.isShow = cat.is_show
      catForm.advImage = cat.adv_image
      catForm.advImageLink = cat.adv_image_link
      this.fileList = catForm.category_image
        ? [{ name: 'category_image', url: catForm.category_image }]
        : []
      this.promotionFileList = catForm.adv_image
        ? [{ name: 'adv_image', url: catForm.adv_image }]
        : []
      this.catForm = catForm
      this.dialogCatVisible = true
    },

    /** 添加、编辑分类 表单提交 */
    submitCatForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const { category_id } = this.catForm
          if (!category_id) {
            API_Category.addCategory(this.catForm).then(() => {
              this.dialogCatVisible = false
              this.$message.success('保存成功！')
              this.$refs[formName].resetFields()
              this.$refs['gradeEditor'].refresh('add')
            })
          } else {
            API_Category.editCategory(category_id, this.catForm).then(
              (response) => {
                this.$message.success('保存成功！')
                this.dialogCatVisible = false
                this.$refs[formName].resetFields()
                this.$refs['gradeEditor'].refresh('add')
              }
            )
          }
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },

    /** 编辑分类参数 */
    handleEditParams(cat) {
      this.$router.push({
        name: 'categoryParams',
        params: { id: cat.category_id }
      })
    },
    /** 编辑关联品牌 */
    handleEditBrand(cat) {
      this.category_id = cat.category_id
      API_Category.getBrandByCategoryId(cat.category_id).then((response) => {
        this.brandForm = {
          ...this.brandForm,
          category_id: cat.category_id,
          brandList: response,
          selectedBrandList: response
        }
        this.dialogBrandVisible = true
      })
    },

    /** 编辑关联品牌 表单提交 */
    submitBrandForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let list = []
          this.brandForm.selectedBrandList.forEach((v) => {
            list.push(v.id)
          })

          API_Category.editCategoryBrand(this.brandForm.category_id, { choose_brands: list }).then(
            (response) => {
              this.dialogBrandVisible = false
              this.$message.success('保存成功！')
            }
          )
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 删除分类确认 */
    handleDeleteCat(cat) {
      this.$confirm('确定要删除这个分类吗？', '提示', { type: 'warning' })
        .then(() => {
          API_Category.deleteCategory(cat.category_id).then(() => {
            this.$message.success('删除成功！')
            this.$refs['gradeEditor'].refresh('delete')
          })
        })
        .catch(() => {})
    },
    // 新关联品牌的选中数据
    handleSelect(item) {
      if (this.brandForm.selectedBrandList.length === 0) {
        this.brandForm.brandList.push(item)
      } else {
        let flag = true
        this.brandForm.selectedBrandList.forEach((v, i) => {
          if (v.id === item.id) {
            flag = false
          }
        })
        if (flag) {
          this.brandForm.brandList.push(item)
        }
      }
    },
    // 点击搜索后
    btnSearch() {
      if (this.keyword === '') {
        this.$message.error('品牌不能为空')
      } else {
        API_Category.BrandSearch(this.category_id, { brand_name: this.keyword })
          .then((res) => {
            this.querySearch(null, this.cb, 'btnSearch', res || [])
          })
          .catch(() => {})
      }
    },
    // 编辑关联品牌  搜索品牌接口
    querySearch(queryString, cb, type, list) {
      let restaurants = list || []
      this.cb = cb
      // 模拟接口数据 , 换成调用接口
      restaurants.forEach((item, index) => {
        item.value = item.text
        item.checked = false
        // 已关联品牌 selectedBrandList
        if (this.brandForm.selectedBrandList.length > 0) {
          this.brandForm.selectedBrandList.forEach((item_2, index_2) => {
            if (item.id === item_2.id) {
              item.checked = true
            }
          })
        }
      })
      this.restaurants = [...restaurants]
      // 调用 callback 返回建议列表的数据
      if (type && type === 'btnSearch') {
        this.$refs.autocompleteSearch.focus()
        cb(restaurants)
      } else {
        cb([])
      }
    },
    deleteBrand(item, index) {
      this.brandForm.brandList.splice(index, 1)
      this.brandForm.selectedBrandList.forEach((v, i) => {
        if (item.id === v.id) {
          v.checked = false
        }
      })
    },
    handleOpenImportDialog(type) {
      this.importType = type
      this.importDialogVisible = true
    },
    handleImportCateSuccess() {
      this.$alert('导入成功，请刷新页面查看结果。', '提示', {
        type: 'success',
        showCancelButton: true,
        cancelButtonText: '关闭',
        confirmButtonText: '立即刷新',
        callback: (action) => {
          if (action === 'confirm') {
            window.location.reload()
          } else {
            this.importDialogVisible = false
          }
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.had-relation-brand-content {
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  height: 100px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid;
  .item {
    height: 20px;
    line-height: 20px;
    margin-right: 3px;
    margin-bottom: 4px;
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 4px;
    font-size: 12px;
    color: #909399;
    .brand-name {
      background-color: #f4f4f5;
      border-color: #e9e9eb;
      padding: 0px 5px;
      line-height: 19px;
    }
    .el-icon-error {
      cursor: pointer;
      margin-right: 2px;
      &:hover {
        color: #c0c4cc;
      }
    }
  }
}
.search-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 34px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &.checked {
    cursor: no-drop;
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    flex-shrink: 0;
    margin-right: 20px;
  }
}
.toolbar-box {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 10px;
  .tips-box {
    display: flex;
    align-items: center;
    min-height: 35px;
    padding: 10px;
    font-size: 14px;
    margin-left: 10px;
    background-color: #fef0da;
    border-radius: 4px;
    a {
      color: #0d58ef;
    }
  }
}
</style>
