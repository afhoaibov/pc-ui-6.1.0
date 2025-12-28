<template>
  <div
    v-html="$$FormData.content || default_content"
    class="rich-text"
    :class="{'rich-text__full-screen': $$FormData.full_screen}"
    :style="{
      backgroundColor: $$FormData.background_color
    }"
  ></div>
</template>

<script>
// TODO: 配置未完善
export default {
  name: 'RichTextPreview',
  data() {
    return {
      default_content: `<p style="text-align: center;"><strong>来下五子棋呀</strong></p><table width="291"><tbody><tr class="firstRow"><td width="11" valign="top" style="word-break: break-all;">                ⚪️<br/></td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top"></td><td valign="top" colspan="1" rowspan="1" width="null">                ⚪️</td><td valign="top" colspan="1" rowspan="1">                ⚫️</td></tr><tr><td width="11" valign="top"></td><td width="11" valign="top"></td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td valign="top" colspan="1" rowspan="1" width="null"></td><td valign="top" colspan="1" rowspan="1"></td></tr><tr><td width="11" valign="top"></td><td width="11" valign="top"></td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top" style="word-break: break-all;">                ⚪️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top"></td><td valign="top" colspan="1" rowspan="1" width="null">                ⚫️</td><td valign="top" colspan="1" rowspan="1"></td></tr><tr><td width="11" valign="top"></td><td width="11" valign="top"></td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top"></td><td width="11" valign="top"></td><td valign="top" colspan="1" rowspan="1" width="null"></td><td valign="top" colspan="1" rowspan="1">                ⚪️</td></tr><tr><td width="11" valign="top"></td><td width="11" valign="top"></td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top"></td><td width="11" valign="top"></td><td valign="top" colspan="1" rowspan="1" width="null"></td><td valign="top" colspan="1" rowspan="1"></td></tr><tr><td width="11" valign="top"></td><td width="11" valign="top"></td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚫️</td><td width="11" valign="top">                ⚪️</td><td width="11" valign="top"></td><td width="11" valign="top"></td><td valign="top" colspan="1" rowspan="1" width="null"></td><td valign="top" colspan="1" rowspan="1"></td></tr></tbody></table>`
    }
  }
}
</script>

<style lang="scss" scoped>
.rich-text {
  position: relative;
  box-sizing: border-box;
  padding: 20rpx 20rpx 0;
  overflow: hidden;
  color: #333;
  font-size: 32rpx;
  line-height: 1.5;
  text-align: left;
  word-wrap: break-word;
  &__full-screen {
    margin-top: 0;
    padding: 0;
  }
  ::v-deep img+br {
    display: block;
    padding: 8rpx 0;
    content: " "
  }
  ::v-deep p {
    margin: 0 0 1em
  }
  ::v-deep .Powered-by-XIUMI p {
    margin: 0
  }
  ::v-deep a {
    color: #07d
  }
  ::v-deep img {
    max-width: 100%!important;
    min-height: 2rpx;
    vertical-align: bottom;
    background: 0 0
  }
  ::v-deep img,
  ::v-deep ol {
    width: auto!important
  }
  ::v-deep blockquote {
    margin: 0 0 36rpx;
    padding: 0 0 0 30rpx;
    border-left: 10rpx solid #eee
  }
  ::v-deep em,
  ::v-deep i {
    font-style: italic
  }
  ::v-deep b,
  ::v-deep strong {
    font-weight: 700
  }
  ::v-deep .selectTdClass {
    background-color: #edf5fa!important
  }
  ::v-deep table.noBorderTable caption,
  ::v-deep table.noBorderTable td,
  ::v-deep table.noBorderTable th {
    border: 2rpx dashed #ddd!important
  }
  ::v-deep table {
    display: table;
    width: auto!important;
    margin: 0 auto 20rpx;
    border-collapse: collapse
  }
  ::v-deep td,
  ::v-deep th {
    padding: 10rpx 20rpx;
    border: 2rpx solid #ddd
  }
  ::v-deep caption {
    padding: 6rpx;
    text-align: center;
    border: 2rpx dashed #ddd;
    border-bottom: 0
  }
  ::v-deep th {
    background: #f7f7f7;
    border-top: 4rpx solid #bbb
  }
  ::v-deep td p {
    margin: 0;
    padding: 0
  }
  ::v-deep .ue-table-interlace-color-single {
    background-color: #fcfcfc
  }
  ::v-deep .ue-table-interlace-color-double {
    background-color: #f7faff
  }
  ::v-deep .bottom-floating-banner {
    position: fixed!important;
    bottom: 0
  }
  ::v-deep .list-paddingleft-2 {
    padding-left: 60rpx
  }
  ::v-deep .rich-text--fullscreen {
    margin-top: 0;
    padding: 0
  }
  ::v-deep .edui-faked-video {
    width: 100%
  }
}
</style>
