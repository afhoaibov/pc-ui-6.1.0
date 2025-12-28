import i18n from '@/lang'

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  baseCurrency: state => state.app.baseCurrency,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  isRouterAlive: state => state.tagsView.isRouterAlive,
  user: state => state.user.user,
  shopInfo: state => state.user.shop,
  permission_routers: state => state.permission.routers,
  permission_chat: state => state.permission.permission_chat,
  addRouters: state => state.permission.addRouters,
  siteInfo: state => state.app.siteInfo,
  locales: state => state.app.locales,
  locale: state => state.app.locales.find(item => item.code === i18n.locale),
  havePermission(state) {
    return (name) => {
      if (state.permission.roleId === 0) {
        // 超管权限
        return true
      }
      return state.permission.rolesList.some(child => child === name)
    }
  },
  
}
export default getters
