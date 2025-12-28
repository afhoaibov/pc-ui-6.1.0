<template>
  <div class="container">
    <el-form :model="articleForm" :rules="articleRules" ref="articleForm" label-width="100px">
      <el-form-item label="文章名称" prop="article_name" style="width: 500px">
        <el-input v-model="articleForm.article_name"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="category_id">
        <el-cascader
          :options="articleCategoryTree"
          :props="{children: 'children',label: 'name',value: 'id'}"
          :show-all-levels="false"
          :value="defaultCascaderValue"
          @change="handleCascaderChange"
          change-on-select
        ></el-cascader>
      </el-form-item>
      <el-form-item label="文章排序" prop="sort">
        <el-input-number v-model="articleForm.sort" controls-position="right" :min="0" :max="99999"></el-input-number>
      </el-form-item>
      <!-- <el-form-item  label="文章排序2">
        <div>{{articleForm.content}}</div>
      </el-form-item> -->
      <el-form-item label="文章内容" prop="content">
        <en-rich-text-editor
          v-model="articleForm.content"
          :upload-api="MixinUploadApi"
          :upload-headers="MixinAccessToken"
          maxlength="9999"
        />
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="submitArticleForm">保存文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import * as API_Article from '@/api/article'

  export default {
    name: 'addArticle',
    data() {
      const checkCategory = (rule, value, callback) => {
        if (!value && value === 0) {
          callback(new Error('请选择文章分类！'))
        } else {
          callback()
        }
      }
      const { article_id, category } = this.$route.query
      return {
        // 如果是修改，则有值
        article_id,
        // 分类树
        articleCategoryTree: [],
        // 添加、修改文章 表单
        articleForm: {
          article_name: '',
          content: '',
          category_id: 0
        },
        // 添加、修改文章 表单规则
        articleRules: {
          article_name: [this.MixinRequired('请输入文章名称！')],
          category_id: [
            this.MixinRequired('请选择文章分类！'),
            { validator: checkCategory, trigger: 'blur' }
          ],
          content: [this.MixinRequired('请输入文章内容！')]
        },
        // 级联选择器默认值
        defaultCascaderValue: []
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'addArticle') return
          const { article_id } = newVal.query
          if (article_id) {
            this.Get_ArticleData()
          } else {
            this.articleForm = {
              article_name: '',
              content: '',
              category_id: 0
            }
            this.defaultCascaderValue = []
          }
        }
      }
    },
    mounted() {
      API_Article.getAritcleCategoryTree().then(response => {
        const rmEmptyChildren = (item) => {
          if (Array.isArray(item.children) && !item.children.length) {
            delete item.children
          }
        }
        this.articleCategoryTree = response.map(item => {
          rmEmptyChildren(item)
          if (item.children) {
            item.children.map(_item => {
              rmEmptyChildren(_item)
              return _item
            })
          }
          return item
        })
        if (this.article_id) this.Get_ArticleData()
      })
    },
    methods: {
      /** 当分类改变时 */
      handleCascaderChange(data) {
        this.articleForm.category_id = data[data.length - 1]
      },
      /** 添加、编辑文章 表单提交 */
      submitArticleForm() {
        this.$refs['articleForm'].validate(async(valid) => {
          if (!valid) return this.$message.error('表单填写有误，请核对！')
          const { article_id } = this
          if (article_id) {
            await API_Article.editArticle(article_id, this.articleForm)
          } else {
            await API_Article.addArticle(this.articleForm)
          }
          this.$message.success('保存成功！')
          this.$store.dispatch('delCurrentViews', {
            view: this.$route,
            $router: this.$router
          })
        })
      },
      /** 获取文章详情 */
      Get_ArticleData() {
        this.article_id = this.$route.query.article_id
        API_Article.getArticleDetail(this.article_id).then(response => {
          this.articleForm = response
          let classification = []
          const { category_id } = response
          this.articleCategoryTree.forEach(item => {
            if (item.id === category_id) {
              classification = [item.id]
            } else {
              item.children && item.children.forEach(_item => {
                if (_item.id === category_id) {
                  classification = [item.id, _item.id]
                }
              })
            }
          })
          this.defaultCascaderValue = classification
        })
      }
    }
  }
</script>

