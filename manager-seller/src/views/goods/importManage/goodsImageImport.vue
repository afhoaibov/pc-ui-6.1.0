<template>
  <div class="container">
    <ImportItem
      :uploadAction="MixinImageImportApi"
      :importType="ImportModuleType.GalleryImport"
      :accept="'.zip'"
      :bigSize="10"
      :fileType="'zip'"
    >
      <template slot="customizeTips">
        <p><i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />请根据模板导入图片压缩包，导入的zip大小限制为10M</p>
        <p><i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />spu图片导入模板:<a :href="`${MixinApi.seller}${this.uploadSpuTemplateUrl}`">[点击此处下载spu模板]</a></p>
        <p><i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />sku图片导入模板：<a :href="`${MixinApi.seller}${this.uploadSkuTemplateUrl}`">[点击此处下载sku模板]</a></p>
        <p><i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />注：sku图片导入时，只能在sku编码目录下添加图片，其他路径下无效</p>
      </template>
    </ImportItem>
  </div>
</template>

<script>
import ImportItem from '../components/ImportItem'

export default {
  name: 'goodsImageImport',
  components: {
    ImportItem
  },
  data() {
    return {
      uploadSpuTemplateUrl: `/import-tpl/spuDemo.zip`,
      uploadSkuTemplateUrl: `/import-tpl/skuDemo.zip`
    }
  }
}
</script>
