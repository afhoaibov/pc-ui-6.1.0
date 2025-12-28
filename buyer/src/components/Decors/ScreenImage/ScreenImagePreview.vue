<template>
  <div
    class="screen-image"
    :style="{
      '--bg-color': $$FormData.background_color,
      '--cont-color': $$FormData.content_color,
      backgroundImage: $$FormData.image_source ? `url(${$$FormData.image_source.src})` : '',
      padding: `${$$FormData.vertical_margin}px ${$$FormData.horizontal_margin}px`
    }"
  >
    <div class="screen-image__content">
      <div class="screen-image__content-title">{{ $$FormData.title }}</div>
      <div class="screen-image__content-subtitle">{{ $$FormData.subtitle }}</div>
    </div>
    <router-link
      :to="$$GetLinkValue($$FormData.btn_link)"
      class="screen-image__btn"
      :style="{ color: $$FormData.btn_text_color }"
    >
      {{ $$FormData.btn_text }}
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ScreenImagePreview'
}
</script>

<style scoped lang="scss">
.screen-image {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: var(--bg-color);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  &__content {
    display: flex;
    flex-direction: column;
    &-title {
      color: var(--cont-color);
      font-size: 36px;
      font-weight: bold;
      line-height: 40px;
    }
    &-subtitle {
      color: var(--cont-color);
      font-size: 16px;
      margin-top: 12px;
      line-height: 20px;
    }
  }
  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-color);
    font-size: 16px;
    font-weight: bold;
    height: 40px;
    min-width: 100px;
    width: fit-content;
    padding: 0 20px;
    border-radius: 24px;
    background-color: var(--cont-color);
    margin-top: 24px;
  }
}
</style>