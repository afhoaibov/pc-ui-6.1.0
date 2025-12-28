<template>
  <div class="container">
    <ImportItem
      :uploadAction="MixinSkuImportApi"
      :importType="ImportModuleType.SkuImport"
      :uploadTemplateUrl="uploadTemplateUrl"
      />
  </div>
</template>

<script>
import ImportItem from '../components/ImportItem'

export default {
  name: 'skuImport',
  components: {
    ImportItem
  },
  data() {
    return {
      uploadTemplateUrl: '/import-tpl/sku.xlsx'
    }
  }
}
</script>
