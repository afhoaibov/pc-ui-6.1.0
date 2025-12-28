import Vue from 'vue'
import Router from 'vue-router'
import HomeView from '@/views/home'
const alias = require('ui-domain/alias')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: alias.decor ? `/${alias.decor}/` : undefined,
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '', name: 'home', component: HomeView },
  ]
})

export default router
