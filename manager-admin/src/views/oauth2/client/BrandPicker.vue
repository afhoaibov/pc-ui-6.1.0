<template>
  <div style="display: inline-block">
    <el-select
      v-model="brand_id"
      placeholder="选择品牌"
      @change="handleBrandChanged"
      style="width: 150px"
      filterable
      clearable
      :multiple="multiple"
      v-bind="$attrs"
    >
      <el-option
        v-for="item in brandList"
        :key="item.brand_id"
        :label="item.name"
        :value="item.brand_id"/>
    </el-select>
  </div>
</template>

<script>
  import request from '@/utils/request'

  export default {
    name: 'OAuth2ClientBrandPicker',
    props: {
      multiple: {
        type: Boolean,
        default: false
      },
      defaultBrandId: {
        type: Array,
        default: () => ([])
      },
      api: {
        type: String,
        default: 'admin/goods/brands/all'
      }
    },
    watch: {
      defaultBrandId(val) {
        this.brand_id = val
      }
    },
    data() {
      return {
        brand_id: '',
        brandList: []
      }
    },
    created() {
      request({
        url: this.api,
        method: 'get',
        loading: false
      }).then(response => {
        this.brandList = response
      })
    },
    methods: {
      handleBrandChanged() {
        this.$emit('changed', this.brand_id)
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

</style>
