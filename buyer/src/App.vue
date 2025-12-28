<template>
  <div v-if="!($route.path === '/' && !$route.name)">
    <layout-full v-if="layout === 'full'"/>
    <layout-im v-else-if="layout === 'im'"/>
    <layout-default v-else/>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    LayoutDefault: () => import('./layouts/default'),
    LayoutFull: () => import('./layouts/full'),
    LayoutIm: () => import('./layouts/im')
  },
  computed: {
    layout() {
      let layout = 'default'
      const routes = this.$route.matched
      if (routes.length === 0) return layout
      const matchedComponents = []
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i]
        let component = route.components.default
        component = component.default || component
        matchedComponents.push(component)
      }

      for (let i = 0; i < matchedComponents.length; i++) {
        const com = matchedComponents[i]
        if (com.layout) {
          layout = com.layout
          break
        }
      }
      return layout
    }
  }
}
</script>
<style lang="scss">
body .el-table th.gutter {
  display: table-cell !important;
}

#wrapper {
  min-height: calc(100vh - 31px - 219px)
}
</style>
