import router from './index'
import store from '../store'
import Storage from '../utils/storage'
import NProgress from 'nprogress'

const whiteList = ['/404', '/500']

router.beforeEach(async(to, from, next) => {
  if (store.state.app.site) {
    await store.dispatch('getCommonDataAction')
  }
  if (!whiteList.includes(to.path)) {
    const { site } = store.state.app
    if (site && site.siteon === 0) {
      // 说明站点已经关闭了
      next('/500')
      return
    }
    if (Storage.getItem('refresh_token') && !store.state.user.user) {
      await store.dispatch('user/getUserDataAction')
    }
  }
  const routes = to.matched
  const matchedComponents = []
  if (routes.length !== 0) {
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      const comDefault = route.components.default
      let component
      if (typeof comDefault === 'object') {
        component = comDefault
      } else if (typeof comDefault === 'function') {
        component = await comDefault()
      }
      component = component.default || component
      if (typeof component.head === 'function') {
        component.metaInfo = component.head
      }
      matchedComponents.push(component)
    }

    let middleware
    for (let i = 0; i < matchedComponents.length; i++) {
      const com = matchedComponents[i]
      if (com.middleware) {
        middleware = com.middleware
        break
      }
    }

    if (middleware === 'auth-user') {
      const { user } = store.state.user
      if (!user) {
        next(`/login?forward=${encodeURIComponent(to.fullPath)}`)
        return
      }
    }
  }
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})
