<template>
  <div id="apply-header" class="header-container">
    <div class="inner w">
      <div class="logo-box">
        <en-logo/>
        <h1>商家中心</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'apply-header'
}
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/color" as theme;
.header-container {
  border-bottom: 3px solid theme.$color-main;
}
.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 77px;
}
.logo-box {
  display: flex;
  align-items: center;
  h1 {
    font-size: 16px;
    margin-top: 15px;
    margin-left: 10px;
  }
  ::v-deep #logo {
    width: 180px;
    height: 45px;
  }
}
</style>
