<template>
  <div class="container">
    <ImportItem
      :uploadAction="MixinParamImportApi"
      :importType="'ParameterImport'"
      :uploadTemplateUrl="uploadTemplateUrl"
      />
  </div>
</template>

<script>
import ImportItem from '../components/ImportItem'

export default {
  name: 'parameterImport',
  components: {
    ImportItem
  },
  data() {
    return {
      uploadTemplateUrl: `/import-tpl/parameter.xlsx`
    }
  }
}
</script>
