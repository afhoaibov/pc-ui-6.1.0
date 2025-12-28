<template>
  <div class="seckill">
    <p class="seckill__title">秒杀模块</p>
    <p class="seckill__subtitle">
      一般放在轮播图下方，此模块无须预览，提供占位即可。
    </p>
  </div>
</template>

<script>
export default {
  name: 'SeckillPreview'
}
</script>

<style lang="scss" scoped>
.seckill {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 275px;
  margin: 0 auto;
  background-color: #fff;
  overflow: hidden;
  &__title {
    font-size: 24px;
  }
  &__subtitle {
    font-size: 16px;
    color: #999999;
    margin-top: 10px;
  }
}
</style>
