<template>
  <el-skeleton animated>
    <template slot="template">
      <el-skeleton-item variant="p" style="width: 14%; height: 20px; margin-bottom: 15px;" />
      <div class="ckt-content">
        <div class="ckt-item">
          <el-skeleton-item variant="p" style="width: 14%; height: 20px;" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 20px; margin: 20px 0;" />
        </div>
        <div class="ckt-item" style="margin: 20px 0;">
          <el-skeleton-item variant="p" style="width: 14%; height: 20px;" />
          <div style="margin: 20px 0;">
            <el-skeleton-item variant="button" style="width: 100px; height: 24px; " />
            <el-skeleton-item variant="button" style="width: 100px; height: 24px; margin-left: 10px;" />
          </div>
        </div>
        <div class="ckt-item" style="margin: 20px 0;">
          <el-skeleton-item variant="p" style="width: 14%; height: 20px;" />
          <div style="margin: 20px 0; ">
            <el-skeleton-item variant="rect" style="width: 100%; height: 30px; " />
            <el-skeleton-item variant="rect" style="width: 100%; height: 30px; margin: 20px 0;" />
          </div>
        </div>
        <div class="ckt-item" style="margin: 20px 0;">
          <el-skeleton-item variant="p" style="width: 14%; height: 20px;" />
          <div style="margin: 20px 0;">
            <el-skeleton-item variant="button" style="width: 100px; height: 24px; " />
            <el-skeleton-item variant="button" style="width: 100px; height: 24px; margin-left: 10px;" />
            <el-skeleton-item variant="button" style="width: 100px; height: 24px; margin-left: 10px;" />
          </div>
        </div>
        <div class="ckt-total" style="display: flex; flex-direction: column; align-items: flex-end;">
          <el-skeleton-item variant="p" style="width: 20%; height: 20px;" />
          <el-skeleton-item variant="p" style="width: 20%; height: 20px; margin-top: 20px;" />
          <el-skeleton-item variant="p" style="width: 100%; height: 40px; margin-top: 20px;" />
          <el-skeleton-item variant="button" style="width: 130px; height: 40px; margin-top: 20px;" />
        </div>
      </div>
    </template>
  </el-skeleton>
</template>

<script>
export default {
  name: 'checkout-skeleton'
}
</script>
