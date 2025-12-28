<template>
  <div v-if="article" class="container">
    <div class="help-breadcrumb">
      <span>{{ categoryName }}</span>
      &gt;
      <a href="#"><span id="sLevel2">{{ article.article_name }}</span></a>
    </div>
    <div class="help-header">
      <h1>{{ article.article_name }}</h1>
      <h2>{{ article.modify_time | unixToDate }}</h2>
    </div>
    <div class="help-body">
      <div class="help-body-inner" v-html="article.content"></div>
    </div>
  </div>
</template>

<script>
import * as API_Article from '@/api/article'

export default {
  name: 'help-detail',
  head() {
    return {
      title: `${this.article.article_name}-${this.site.title}`
    }
  },
  data() {
    return {
      article: ''
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'help-detail') return
        this.getHelpDetail()
      }
    }
  },
  computed: {
    categoryName() {
      const { categories } = this.$parent
      const cate = categories.filter(item => item.id === this.article.category_id)[0]
      return cate.name
    }
  },
  methods: {
    async getHelpDetail() {
      const { id } = this.$route.params
      this.article = await API_Article.getArticleDetail(id)
    }
  }
}
</script>

<style lang="scss" scoped>
.help-breadcrumb {
  height: 39px;
  line-height: 39px;
  font-size: 14px;
  background: #eaeaea;
  padding-left: 13px;
}
.help-header {
  text-align: center;
  h1 {
    color: #3d3f3e;
    font: 600 16px/32px "microsoft yahei";
  }
  h2 {
    border-bottom: 1px solid #d2d2d2;
    color: #9a9a9a;
    font-weight: normal;
    font: 12px/20px Arial, Verdana, "宋体", "Lucida Grande", "Lucida Sans Unicode", Helvetica, sans-serif;
    padding: 5px 0 10px;
  }
}
.help-body {
  padding: 10px 20px;
  .help-body-inner {
    all: initial;
  }
}
</style>
