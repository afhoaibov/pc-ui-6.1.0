<template>
  <div
    class="screen-alert"
    :style="{
      '--bg-color': $$FormData.background_color,
      '--cont-color': $$FormData.content_color,
      padding: `${$$FormData.vertical_margin}px ${$$FormData.horizontal_margin}px`
    }"
  >
    <div class="screen-alert__content">
      <div class="screen-alert__content-title">{{ $$FormData.title }}</div>
      <div class="screen-alert__content-subtitle">{{ $$FormData.subtitle }}</div>
    </div>
    <router-link :to="$$GetLinkValue($$FormData.btn_link)" class="screen-alert__btn">
      {{ $$FormData.btn_text }}
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ScreenAlertPreview'
}
</script>

<style scoped lang="scss">
.screen-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  background-color: var(--bg-color);
  &__content {
    display: flex;
    flex-direction: column;
    &-title {
      color: var(--cont-color);
      font-size: 24px;
      font-weight: bold;
      line-height: 32px;
    }
    &-subtitle {
      color: var(--cont-color);
      font-size: 14px;
      margin-top: 4px;
      line-height: 20px;
    }
  }
  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-color);
    height: 40px;
    min-width: 100px;
    padding: 0 20px;
    border-radius: 24px;
    background-color: var(--cont-color);
  }
}
</style>
