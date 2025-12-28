<template>
  <div id="footer">
    <span class="clr"></span>
    <div class="help-center-footer">
      <div class="w" v-if="categories">
        <dl v-if="index < 5" v-for="(cate, index) in categories" :key="index" :class="`fore${++index}`">
          <dt>{{ cate.name }}</dt>
          <dd v-for="article in cate.articles" :key="article.article_id">
            <router-link :to="`/help/${article.article_id}`" target="_blank">{{ article.article_name }}</router-link>
          </dd>
        </dl>
        <span class="clr"></span>
      </div>
    </div>
    <div class="link-footer">
      <div class="w">
        <router-link to="/">首页</router-link>
        |
        <router-link to="/member">会员中心</router-link>
        <a v-if="user.have_shop" :href="MixinDomain.seller" target="_blank">| 我的店铺</a>
        <router-link v-else to="/shop/apply/">| 商家入驻</router-link>
        | <router-link to="/help/100" target="_blank">关于网站</router-link>
        | <router-link to="/help/98" target="_blank">关于我们</router-link>
        | <router-link to="/help/99" target="_blank">联系我们</router-link>
        <a href="https://www.shoptnt.cn" title="JAVA B2B2C网店系统" target="_blank">| 网店系统</a>
        <a :href="url" title="友情链接" target="_blank">| 友情链接</a>
      </div>
    </div>
    <div class="link-footer">
      <div class="w">
        备案号：{{ record }}
      </div>
    </div>
  </div>
</template>

<script>
import * as API_Article from '@/api/article'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EnFooter',
  data() {
    return {
      categories: [],
      url: '',
      record: ''
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  async mounted() {
    const { children } = await API_Article.getArticleCategory('HELP')
    if (this.site.link && !this.site.link.startsWith('http')) {
      this.url = `http://${this.site.link}`
    } else {
      this.url = this.site.link
    }
    this.record = this.site.record
    this.categories = children ? children.reverse() : []
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
@use "../assets/styles/color" as theme;
/* Footer */
#footer {
  background-color: #f5f6f5;
  a {
    color: #666
  }
  a:hover {
    color: theme.$color-main
  }
  .help-center-footer {
    border-bottom: solid 1px #eaeaea;
    padding: 20px 0;
    dl {
      box-sizing: border-box;
      width: 20%;
      float: left;
      padding-left: 65px;
      line-height: 22px;
    }
    dt {
      padding-bottom: 6px;
      font-weight: 700;
      font-size: 14px;
      color: #777;
      height: 22px;
    }
    dd {
      font-size: 12px;
      color: #666;
      height: 22px;
      overflow: hidden;
    }
  }
  .link-footer {
    text-align: center;
    height: 40px;
    line-height: 40px;
  }
}
</style>
