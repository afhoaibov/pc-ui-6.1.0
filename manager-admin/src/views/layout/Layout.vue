<template>
  <div class="app-wrapper" :class="classObj">
    <!-- <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"></div> -->
    <sidebar class="sidebar-container" :style="sidebarStyle"></sidebar>
    <div :class="[{'resize': sidebar.opened }]" title="收缩侧边栏">
      <div class="resize-inside"></div>
    </div>
    <div class="main-container">
      <navbar></navbar>
      <!-- <tags-view></tags-view> -->
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
  import { Navbar, Sidebar, AppMain, TagsView } from './components'
  import ResizeMixin from './mixin/ResizeHandler'
  export default {
    name: 'layout',
    components: {
      Navbar,
      Sidebar,
      AppMain,
      TagsView
    },
    mixins: [ResizeMixin],
    computed: {
      sidebar() {
        return this.$store.state.app.sidebar
      },
      device() {
        return this.$store.state.app.device
      },
      classObj() {
        return {
          hideSidebar: !this.sidebar.opened,
          withoutAnimation: this.sidebar.withoutAnimation,
          mobile: this.device === 'mobile'
        }
      },
      sidebarStyle() {
        if (this.sidebar.opened) {
          return { minWidth: this.openIn18 ? '225px' : '180px' }
        }
        return { width: '36px' }
      }
    },
    data: () => {
      return {
        openIn18: process.env.I18N
      }
    },
    mounted() {
      this.dragControllerDiv()
    },
    methods: {
      /** 拖动改变左右布局宽度 */
      dragControllerDiv() {
        if (!this.sidebar.opened) return
        const resize = document.getElementsByClassName('resize')
        const left = document.getElementsByClassName('sidebar-container')
        const main = document.getElementsByClassName('main-container')
        const wrap = document.getElementsByClassName('app-wrapper')
        for (let i = 0; i < resize.length; i++) {
          // 鼠标按下事件
          resize[i].onmousedown = function(e) {
            // 颜色改变提醒
            resize[i].style.borderColor = '#1881D2'
            const startX = e.clientX
            resize[i].left = resize[i].offsetLeft
            // 鼠标拖动事件
            document.onmousemove = function(e) {
              const endX = e.clientX
              let moveLen = resize[i].left + (endX - startX) // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
              let maxT = wrap[i].clientWidth - resize[i].offsetWidth // 容器宽度 - 左边区域的宽度 = 右边区域的宽度
              const defaultWidth = this.openIn18 ? 225 : 180
              if (moveLen < defaultWidth) moveLen = defaultWidth // 左边区域的最小宽度
              if (moveLen > maxT - 1000) moveLen = maxT - 1000 // 右边区域最小宽度
              console.log(moveLen)
              resize[i].style.left = moveLen // 设置左侧区域的宽度

              for (let j = 0; j < left.length; j++) {
                left[j].style.width = moveLen + 'px'
                main[j].style.width = 'calc(100% - ' + moveLen + 'px)'
              }
            }
            // 鼠标松开事件
            document.onmouseup = function(evt) {
              // 颜色恢复
              resize[i].style.borderColor = '#f2f5f7'
              document.onmousemove = null
              document.onmouseup = null
              resize[i].releaseCapture && resize[i].releaseCapture() // 调用ReleaseCapture()释放
            }
            resize[i].setCapture && resize[i].setCapture() // 该函数在属于当前线程的指定窗口里设置鼠标捕获
            return false
          }
        }
      },
      handleClickOutside() {
        // this.$store.dispatch('closeSideBar', { withoutAnimation: false })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @use "../../../src/styles/mixin.scss" as mixin;
  .app-wrapper {
    @include mixin.clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }
  .resize {
    cursor: col-resize;
    width: 8px;
    height: 100%;
    z-index: 99;
    position: relative;
    top: 60px;
    height: calc(100% - 60px);
    .resize-inside {
      height: 100%;
      border-left: 3px solid #f2f5f7;
      &:hover {
        border-color: #c5e8ff;

      }
    }
  }
</style>
