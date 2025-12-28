<template>
  <el-skeleton style="width:100%" animated :throttle="500">
    <template slot="template">
      <el-skeleton-item variant="image" style="width:1210px;height:500px;"/>
      <div style="display:flex;margin-top:20px">
        <el-skeleton-item variant="rect" style="width:600px;height:340px"/>
        <el-skeleton-item variant="rect" style="width:600px;height:340px;margin-left: 10px"/>
      </div>
      <div style="display:flex;margin-top:20px">
        <el-skeleton-item variant="rect" style="width:295px;height:340px"/>
        <el-skeleton-item variant="rect" style="width:295px;height:340px;margin-left: 10px"/>
        <el-skeleton-item variant="rect" style="width:295px;height:340px;margin-left: 10px"/>
        <el-skeleton-item variant="rect" style="width:295px;height:340px;margin-left: 10px"/>
      </div>
      <div style="display:flex;margin-top:20px">
        <el-skeleton-item variant="rect" style="width:1210px;height:260px"/>
      </div>
    </template>
  </el-skeleton>
</template>

<script>
export default {
  name: 'index-skeleton'
}
</script>

<style lang="scss" scoped>

</style>
