<template>
  <div v-if="!item.hidden && item.children" class="menu-wrapper">
    <router-link
      v-if="hasOneShowingChild(item.children, item) && !onlyOneChild.children && !item.alwaysShow"
      :to="resolvePath(onlyOneChild.path)"
    >
      <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
        <svg-icon v-if="onlyOneChild.meta&&onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon"></svg-icon>
        <el-tooltip
          v-if="onlyOneChild.meta && onlyOneChild.meta.title"
          slot="title"
          effect="dark"
          :content="generateTitle(onlyOneChild.meta.title)"
          :disabled="generateTitle(onlyOneChild.meta.title).length < 6"
          placement="right"
        >
          <span>{{ generateTitle(onlyOneChild.meta.title) }}</span>
        </el-tooltip>
      </el-menu-item>
    </router-link>
    <el-submenu v-else :index="item.name || item.path">
      <template slot="title">
        <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
        <el-tooltip
          v-if="item.meta && item.meta.title"
          slot="title"
          effect="dark"
          :content="generateTitle(item.meta.title)"
          :disabled="generateTitle(item.meta.title).length < 6"
          placement="right"
        >
          <span>{{ generateTitle(item.meta.title) }}</span>
        </el-tooltip>
      </template>
      <template v-for="child in item.children" v-if="!child.hidden">
        <sidebar-item
          v-if="child.children && child.children.length > 0"
          :key="child.path"
          is-nest
          class="nest-menu"
          :item="child"
          :base-path="resolvePath(child.path)"
        />
        <router-link v-else :to="resolvePath(child.path)" :key="child.name">
          <el-menu-item :index="resolvePath(child.path)">
            <svg-icon v-if="child.meta && child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
            <el-tooltip
              v-if="child.meta && child.meta.title"
              slot="title"
              effect="dark"
              :content="generateTitle(child.meta.title)"
              :disabled="generateTitle(child.meta.title).length < 6"
              placement="right"
            >
              <span class="item-child">{{ generateTitle(child.meta.title) }}</span>
            </el-tooltip>
          </el-menu-item>
        </router-link>
      </template>
    </el-submenu>
  </div>
</template>

<script>
  import path from 'path'
  import { generateTitle } from '@/utils/i18n'

  export default {
    name: 'SidebarItem',
    props: {
      // route object
      item: {
        type: Object,
        required: true
      },
      isNest: {
        type: Boolean,
        default: false
      },
      basePath: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        onlyOneChild: null
      }
    },
    methods: {
      hasOneShowingChild(children, item) {
        const showingChildren = children.filter(item => {
          if (item.hidden) {
            return false
          } else {
            // temp set(will be used if only has one showing child )
            this.onlyOneChild = item
            return true
          }
        })
        if (showingChildren.length === 1) {
          if (item.redirect === 'dashboard' || item.name === 'dashboard') {
            return true
          } else {
            return false
          }
        }
        return false
      },
      resolvePath(...paths) {
        return path.resolve(this.basePath, ...paths)
      },
      generateTitle
    }
  }
</script>

<style scoped>
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 50px);
    display: inline-block;
  }
  .item-child {
    width: 100% !important;
  }
</style>
