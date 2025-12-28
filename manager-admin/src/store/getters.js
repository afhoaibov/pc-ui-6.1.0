import i18n from '@/lang'

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  baseCurrency: state => state.app.baseCurrency,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  isRouterAlive: state => state.tagsView.isRouterAlive,
  user: state => state.user.user,
  permission_routers: state => state.permission.routers,
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
  permission_chat: state => state.permission.permission_chat
}
export default getters
