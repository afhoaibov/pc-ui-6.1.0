<template>
  <div
    class="screen-carousel"
    :style="{
      '--v-padding': `${$$FormData.vertical_margin}px`,
      '--h-padding': `${$$FormData.horizontal_margin}px`
    }"
  >
    <div class="screen-carousel__title">{{ $$FormData.title }}</div>
    <div class="screen-carousel__links">
      <router-link
        v-for="item in $$FormData.links"
        :key="item.__key"
        :to="$$GetLinkValue(item.link)"
        class="screen-carousel__links-item"
      >
        <div class="screen-carousel__links-item-image" :class="{ empty: !item.image || !item.image.src }">
          <img
            v-if="item.image && item.image.src"
            :src="item.image.src"
            class="screen-carousel__links-item-img"
            alt=""
          />
        </div>
        <span class="screen-carousel__links-item-title" :class="{ empty: !item.title }">
          {{ item.title || '&nbsp;' }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScreenCarouselPreview'
}
</script>

<style scoped lang="scss">
.screen-carousel {
  display: flex;
  flex-direction: column;
  padding: var(--v-padding) var(--h-padding);
  &__title {
    color: #191919;
    font-size: 22px;
    font-weight: bold;
    line-height: 28px;
    margin-bottom: 24px;
  }
  &__links {
    display: flex;
    align-items: center;
    gap: 16px;
    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: calc((100% - 96px) / 7);
      &-image {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        border-radius: 9999px;
        overflow: hidden;
        &.empty {
          background-color: #F0F0F0;
        }
      }
      &-img {
        width: 100%;
        height: 100%;
      }
      &-title {
        color: #191919;
        font-size: 14px;
        font-weight: bold;
        margin-top: 12px;
        padding-bottom: 5px;
        border-bottom: 2px solid #0000;
      }
      &:hover .screen-carousel__links-item-title:not(.empty) {
        border-bottom-color: #191919;
      }
    }
  }
}
</style>