<template>
  <div class="tags-view-container">
    <el-dropdown trigger="hover" @command="dropdownEvent">
      <i class="el-icon-arrow-down dropdown-btn"></i>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="refresh">刷新</el-dropdown-item>
        <el-dropdown-item command="closeOthers">关闭其它</el-dropdown-item>
        <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <scroll-pane class='tags-view-wrapper' ref='scrollPane'>
      <router-link ref='tag' class="tags-view-item" :class="isActive(tag)?'active':''" v-for="tag in Array.from(visitedViews)"
                   :to="tag" :key="tag.path" @contextmenu.prevent.native="openMenu(tag,$event)">
        {{ generateFormatTitle(tag) }}
        <span v-if="tag.name !== 'dashboard'" class='el-icon-close' @click.prevent.stop='closeSelectedTag(tag)'></span>
      </router-link>
    </scroll-pane>

    <!-- <ul class='contextmenu' v-show="visible" :style="{left:left+'px',top:top+'px'}">
      <li @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其它</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul> -->
  </div>
</template>

<script>
  import ScrollPane from '@/components/ScrollPane'
  import { generateTitle } from '@/utils/i18n'

  export default {
    components: { ScrollPane },
    data() {
      return {
        visible: false,
        top: 0,
        left: 0,
        selectedTag: {}
      }
    },
    computed: {
      visitedViews() {
        return this.$store.state.tagsView.visitedViews
      }
    },
    watch: {
      $route(value) {
        this.selectedTag = value
        this.addViewTags()
        this.moveToCurrentTag()
      },
      visible(value) {
        if (value) {
          document.body.addEventListener('click', this.closeMenu)
        } else {
          document.body.removeEventListener('click', this.closeMenu)
        }
      }
    },
    mounted() {
      this.addViewTags()
    },
    methods: {
      generateTitle, // generateTitle by vue-i18n
      generateFormatTitle(tag) {
        if (tag.name === 'tagAdd') { // 添加标签商品
          return `${this.generateTitle(tag.title)} - ${tag.query.tag_name}`
        }
        if (tag.name === 'groupBuyGoods') { // 编辑/新增团购活动
          return `${tag.query.group_name}${this.generateTitle(tag.title)}`
        }
        if (tag.name === 'assemble') { // 编辑/新增拼团活动
          return tag.params.promotion_id ? `编辑${this.generateTitle(tag.title)}` : `新增${this.generateTitle(tag.title)}`
        }
        return this.generateTitle(tag.title)
      },
      /** 快捷操作分发 */
      dropdownEvent(command) {
        if (command === 'closeOthers') {
          this.closeOthersTags()
        } else if (command === 'closeAll') {
          this.closeAllTags()
        } else {
          this.$store.dispatch('reloadViews')
        }
      },
      generateRoute() {
        if (this.$route.name) {
          return this.$route
        }
        return false
      },
      isActive(route) {
        return route.path === this.$route.path// || route.name === this.$route.name
      },
      addViewTags() {
        const route = this.generateRoute()
        if (!route) {
          return false
        }
        this.$store.dispatch('addVisitedViews', route)
      },
      moveToCurrentTag() {
        const tags = this.$refs.tag
        this.$nextTick(() => {
          for (const tag of tags) {
            if (tag.to.path === this.$route.path) {
              this.$refs.scrollPane.moveToTarget(tag.$el)
              break
            }
          }
        })
      },
      closeSelectedTag(view) {
        this.$store.dispatch('delVisitedViews', view).then((views) => {
          if (this.isActive(view)) {
            const latestView = views.slice(-1)[0]
            if (latestView) {
              this.$router.push(latestView)
            } else {
              this.$router.push('/')
            }
          }
        })
      },
      closeOthersTags() {
        this.$router.push(this.selectedTag)
        this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
          this.moveToCurrentTag()
        })
      },
      closeAllTags() {
        this.$store.dispatch('delAllViews')
        this.$router.push('/')
      },
      openMenu(tag, e) {
        this.visible = true
        this.selectedTag = tag
        this.left = e.clientX
        this.top = e.clientY
      },
      closeMenu() {
        this.visible = false
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .tags-view-container {
    width: 100%;
    display: flex;
    align-items: center;
    background: #fff;
    .dropdown-btn {
      margin: 0 20px;
      width: 20px;
      height: 30px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      cursor: pointer;
      &:hover {
        filter: brightness(1.1);
        transform: rotate(180deg);
        transition: .15s;
      }
      .el-icon-arrow-down {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
      .tags-view-wrapper {
        width: calc(100% - 120px);
        height: 44px;
        .tags-view-item {
          display: inline-block;
          position: relative;
          height: 36px;
          line-height: 36px;
          border: 1px solid #E4E7ED;
          color: #595252;
          background: #fff;
          padding: 0 8px;
          font-size: 12px;
          margin-left: 5px;
          margin-top: 4px;
          border-radius: 3px;
          font-weight: 500;
          &:first-of-type {
            margin-left: 15px;
          }
          &:hover {
            background-color: #fff;
            color: #409EFF;
            border-color: #409EFF;
          }
          &.active {
            background-color: #FF715F;
            color: #fff;
            border-color: #FF715F;
            .el-icon-close {
              color: #fff;
            }
            &::before {
              content: '';
              background: #fff;
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              position: relative;
              margin-right: 2px;
            }
          }
        }
      }
      .contextmenu {
        margin: 0;
        background: #fff;
        z-index: 999;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #333;
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
        li {
          margin: 0;
          padding: 7px 16px;
          cursor: pointer;
          &:hover {
            background: #eee;
          }
        }
      }
      .tags-view-item {
        padding: 0 10px;
        min-width: 80px;
        border-radius: 4px;
        text-align: center;
        user-select: none;
        .el-icon-close {
          width: 16px;
          height: 16px;
          vertical-align: 2px;
          border-radius: 50%;
          text-align: center;
          transition: all .3s cubic-bezier(.645, .045, .355, 1);
          transform-origin: 100% 50%;
          &:before {
            transform: scale(.6);
            display: inline-block;
            vertical-align: -3px;
          }
          &:hover {
            background-color: #b4bccc;
            color: #fff;
          }
        }
      }
    }
</style>
