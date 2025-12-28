<template>
  <div id="app" class="container">
    <div v-if="error.statusCode === 404" class="error-404">
      <div class="error-left">
        <img src="../../assets/images/background-404.jpg" alt="">
      </div>
      <div class="error-right">
        <h1>糟糕！您访问的页面不见啦...</h1>
        <span class="error-title">可能是因为：</span>
        <p>网址有错误：<span class="error-message">请检查地址是否完整或存在多余字符</span></p>
        <p>网址已失效：<span class="error-message">可能页面已删除，活动已下线等</span></p>
        <span class="error-title" style="margin-top: 20px">您可以：</span>
        <div>
          <el-button type="danger" size="small" @click="$router.back()">返回上页</el-button>
          <el-button type="danger" size="small" @click="$router.push({ path: '/' })">去首页</el-button>
        </div>
      </div>
    </div>
    <div v-else-if="error.statusCode === 503" class="error-500">
      <div class="inner-error">
        <p>{{ error.message || '服务器出现错误...' }}</p>
      </div>
      <div class="inner-btns">
        <el-button size="small" @click="handleReload">刷新页面</el-button>
      </div>
    </div>
    <div v-else class="error-500">
      <div class="inner-error">
        <p v-if="site.siteon === 0">站点已关闭：{{ site.close_reson }}</p>
        <p v-else>{{ error.message || '服务器出现错误...' }}</p>
      </div>
      <div class="inner-btns">
        <el-button size="small" @click="$router.back()">返回上页</el-button>
        <el-button size="small" @click="handleReload">刷新页面</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'error',
  props: ['error'],
  methods: {
    /** 刷新网页 */
    handleReload() {
      this.$router.replace('/')
    }
  },
  computed: {
    site() {
      return this.$store.getters.site
    }
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/styles/color" as theme;

.container {
  background-color: #fff;
}

.error-404 {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 980px;
  margin: 0 auto;
  min-height: 500px;

  .error-left {
    width: 450px;
    height: 380px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .error-right {
    font-size: 14px;

    .error-title {
      display: inline-block;
      margin-bottom: 10px
    }

    .error-message {
      color: #ff5722
    }

    h1 {
      font-size: 26px;
      margin-bottom: 20px;
    }

    p {
      margin-bottom: 5px;
      margin-left: 30px;
    }

    ::v-deep .el-button {
      width: 90px
    }
  }
}

.error-500 {
  text-align: center;

  .inner-error {
    width: 500px;
    height: 350px;
    margin: 50px auto 20px;
    text-align: center;
    line-height: 200px;
    font-size: 18px;
    font-weight: 600;
    background: url("../../assets/images/backbround-500.png") no-repeat center;
  }

  .inner-btns {
    margin-bottom: 30px;

    ::v-deep .el-button {
      &:hover, &:focus, &:active {
        border-color: color.adjust($color: theme.$color-main, $lightness: 10%);
        color: color.adjust($color: theme.$color-main, $lightness: 10%);
        background-color: #fff;
      }

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
