<template>
  <el-skeleton style="width: 500px; padding: 0 30px;" animated :throttle="300">
    <template slot="template">
      <el-skeleton-item variant="rect" style="width: 50%; height: 20px;" />
      <el-skeleton-item variant="rect" style="width: 100%; height: 30px; margin-top: 10px" />
      <el-skeleton-item variant="rect" style="width: 50%; height: 20px; margin-top: 10px" />
      <el-skeleton-item variant="rect" style="width: 60%; height: 20px; margin-top: 10px" />
      <el-skeleton-item variant="rect" style="width: 60%; height: 30px; margin-top: 10px" />
      <el-skeleton-item variant="rect" style="width: 100%; height: 30px; margin-top: 16px" />
      <div style="display: flex; margin-top:15px;">
        <el-skeleton-item variant="button" style="width: 160px; height: 40px; " />
        <el-skeleton-item variant="button" style="width: 160px; height: 40px; margin-left: 20px; " />
      </div>
    </template>
  </el-skeleton>
</template>

<script>
export default {
  name: 'info-skeleton'
}
</script>
