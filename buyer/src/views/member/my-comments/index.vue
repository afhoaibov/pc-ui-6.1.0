<template>
  <div id="my-comments">
    <div class="member-nav" v-if="$route.path !== '/member/my-comments/detail'">
      <ul class="member-nav-list">
        <li v-for="item in navList" :key="item.status">
	        <router-link v-if="item.status === 'WAIT_COMMENT'" :to="'/member/my-comments'">{{ item.title }}</router-link>
          <router-link v-else :to="'/member/my-comments?comments_status=' + item.status">{{ item.title }}</router-link>
        </li>
      </ul>
    </div>
    <wait-comment v-if="!$route.query.comments_status && !$route.query.comment_id"></wait-comment>
    <wait-chase v-if="$route.query.comments_status === 'WAIT_CHASE'"></wait-chase>
    <finished v-if="$route.query.comments_status === 'FINISHED'"></finished>
    <detail v-if="$route.path === '/member/my-comments/detail'"></detail>
  </div>
</template>

<script>
export default {
  name: 'my-comments',
  head() {
    return {
      title: `评论管理-${this.site.title}`
    }
  },
  data() {
    return {
      navList: [
        { title: '待评价订单', status: 'WAIT_COMMENT' },
        { title: '待追评', status: 'WAIT_CHASE' },
        { title: '已评价', status: 'FINISHED' }
      ]
    }
  },
  components: {
    'wait-comment': resolve => require(['./walt-comment.vue'], resolve),
    'wait-chase': resolve => require(['./wait-chase.vue'], resolve),
    'finished': resolve => require(['./finished.vue'], resolve),
    'detail': resolve => require(['./detail.vue'], resolve)
  }
}
</script>

<style lang="scss" scoped>

</style>
