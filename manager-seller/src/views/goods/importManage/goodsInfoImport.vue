<template>
  <div class="container">
    <ImportItem
      :uploadAction="MixinGoodsInfoImportApi"
      :importType="ImportModuleType.GoodsDetailImport"
      :uploadTemplateUrl="uploadTemplateUrl"
      :accept="'.zip'"
      :bigSize="10"
      :fileType="'zip'"
      />
  </div>
</template>

<script>
import ImportItem from '../components/ImportItem'

export default {
  name: 'goodsInfoImport',
  components: {
    ImportItem
  },
  data() {
    return {
      uploadTemplateUrl: `/import-tpl/detail.zip`
    }
  }
}
</script>
