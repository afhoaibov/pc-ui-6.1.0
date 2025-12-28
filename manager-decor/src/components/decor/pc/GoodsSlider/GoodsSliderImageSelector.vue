<template>
  <div>
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">左侧图片</div>
        <div class="header-setting__value">
        </div>
      </div>
      <div class="body-setting">
        <div class="body-setting__tip">
          请选择190x260或相同比例的图片
        </div>
        <image-link-editor
          v-model="headLink"
          :limit="1"
          :show-title="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsSliderImageSelector',
  computed: {
    headLink: {
      get() {
        const { headLink } = this.$$FormData
        return headLink ? [headLink] : []
      },
      set(newVal) {
        this.$$FormData.headLink = newVal[0]
      },
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
