<template>
  <div>
    <en-grade-editor
      ref="gradeEditor"
      type-text="分类"
      :api="categoryApi"
      :params-names="{id: 'category_id', text: 'name'}"
      :btns="itemBtns"
      :maxLevel="1"
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
          </el-form-item>
        </template>
        <!--上级分类-->
        <el-form-item v-if="catForm.parent_datas" label="上级分类" prop="parent_id">
          <el-select v-model="catForm.parent_id" placeholder="请选择上级分类">
            <el-option v-for="item in catForm.parent_datas" :label="item.name" :value="item.category_id" :key="item.category_id"/>
          </el-select>
        </el-form-item>
        <!--排序-->
        <el-form-item label="排序" prop="category_order">
          <el-input-number v-model="catForm.category_order" controls-position="right" :min="0" :max="99999"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCatVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCatForm('catForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Category from '@/api/category'

  export default {
    name: 'categoryList',
    data() {
      return {
        itemBtns: [
          { text: '编辑', onClick: this.handleEditCat },
          { text: '删除', onClick: this.handleDeleteCat, color: 'red' }
        ],
        // 添加、编辑分类 dialog
        dialogCatVisible: false,
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
          ]
        },
        /** 存储上传的图片*/
        fileList: [],
        categoryApi: 'admin/goods/categories/@id/children',
        /** 存储APP促销上传的图片*/
        promotionFileList: [],
        /** 是否为一级分类 **/
        category_root: false
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
        this.catForm.adv_image_link = ''
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
        this.catForm = {
          parent_id: parent ? parent.category_id : 0,
          parent_datas: parentArray,
          ...cat,
          category_name: cat.name,
          category_image: cat.image,
          isShow: cat.is_show,
          advImage: cat.adv_image,
          advImageLink: cat.adv_image_link
        }
        this.fileList = this.catForm.category_image ? [{ name: 'category_image', url: this.catForm.category_image }] : []
        this.promotionFileList = this.catForm.adv_image ? [{ name: 'adv_image', url: this.catForm.adv_image }] : []
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
              API_Category.editCategory(category_id, this.catForm).then(response => {
                this.$message.success('保存成功！')
                this.dialogCatVisible = false
                this.$refs[formName].resetFields()
                this.$refs['gradeEditor'].refresh('add')
              })
            }
          } else {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        })
      },

      /** 删除分类确认 */
      handleDeleteCat(cat) {
        this.$confirm('确定要删除这个分类吗？', '提示', { type: 'warning' }).then(() => {
          API_Category.deleteCategory(cat.category_id).then(() => {
            this.$message.success('删除成功！')
            this.$refs['gradeEditor'].refresh('delete')
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

</style>
