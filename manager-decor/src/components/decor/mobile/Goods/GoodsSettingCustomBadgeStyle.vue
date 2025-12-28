<template>
  <div v-if="showComponent" class="custom-upload">
    <div>
      <image-selector v-model="badgeImage" />
      <p v-if="!$$FormData.goods_badge_style" class="tip-error">请上传角标图片</p>
    </div>
    <p class="tip-upload">推荐使用100x100像素的.png图片</p>
  </div>
</template>

<script>
export default {
  name: 'GoodsSettingCustomBadgeStyle',
  data() {
    return {
      badgeImage: ''
    }
  },
  watch: {
    badgeImage: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (!newVal || !newVal.src) return
        this.$$FormData.goods_badge_style = newVal.src
      }
    }
  },
  computed: {
    /**
     * 是否显示组件
     * 如果不属于['new', 'hot', 'NEW', 'TOP']中的任何一种，就显示
     * @returns {boolean}
     */
    showComponent() {
      return !['new', 'hot', 'NEW', 'HOT'].includes(this.$$FormData.goods_badge_style)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-upload {
  display: flex;
  align-items: flex-end;
  margin-top: 12px;
  line-height: normal;
  .upload-box,
  .custom-img {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    overflow: hidden;
    color: #155bd4;
    font-size: 20px;
    border: 1px solid #e5e5e5;
    background-color: #f2f4f6;
    cursor: pointer;
    .label-box {
      font-size: 12px;
      margin: 0;
      margin-top: 4px;
    }
  }
  .tip-error {
    margin-top: 5px;
    font-size: 12px;
    color: #d40000;
  }
  .tip-upload {
    color: #969799;
    margin-left: 10px;
    font-size: 12px;
  }
  .custom-img {
    position: relative;
    cursor: auto;
    .img-upload {
      width: 100%;
      height: 100%;
    }
    .change-btn {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      line-height: 20px;
      text-align: center;
      font-size: 12px;
      color: #ffffff;
      background-color: rgba(0,0,0,.5);
      cursor: pointer;
    }
  }
}
</style>
