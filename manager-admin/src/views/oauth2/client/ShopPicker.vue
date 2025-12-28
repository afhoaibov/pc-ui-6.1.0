<template>
  <div style="display: inline-block">
    <el-select
      v-model="shop_id"
      :placeholder="placeholder"
      @change="handleShopChanged"
      style="width: 150px"
      filterable
      clearable
      :multiple="multiple"
      v-bind="$attrs"
    >
      <el-option
        v-for="item in shopList"
        :key="item.shop_id"
        :label="item.shop_name"
        :value="item.shop_id"/>
    </el-select>
  </div>
</template>

<script>
  import request from '@/utils/request'

  export default {
    name: 'OAuth2ClientShopPicker',
    props: {
      params: {
        type: Object,
        default: () => ({
          shop_type: 'NORMAL'
        })
      },
      multiple: {
        type: Boolean,
        default: false
      },
      api: {
        type: String,
        default: 'admin/shops/list'
      },
      defaultId: {
        type: Array,
        default: () => ([])
      }
    },
    data() {
      return {
        shop_id: '',
        shopList: []
      }
    },
    computed: {
      placeholder() {
        if (this.params.shop_type === 'SUPPLIER') {
          return '选择供应商'
        }
        return '选择商城'
      }
    },
    watch: {
      defaultId(val) {
        this.shop_id = val
      }
    },
    created() {
      request({
        url: this.api,
        method: 'get',
        params: this.params,
        loading: false
      }).then(response => {
        this.shopList = response
      })
    },
    methods: {
      handleShopChanged() {
        const shop_id = this.shop_id
        if (this.multiple) {
          this.$emit('changed', shop_id)
        } else {
          const shop = this.shopList.find(item => { return shop_id === item.shop_id })
          this.$emit('changed', shop)
        }
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

</style>
