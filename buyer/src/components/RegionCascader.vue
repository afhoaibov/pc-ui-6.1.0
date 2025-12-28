<template>
  <el-cascader
    v-model="ids"
    :props="props"
    size="small"
    separator="-"
    :popper-class="popperClass"
  ></el-cascader>
</template>

<script>
import Vue from 'vue'
import { Cascader } from 'element-ui'
import request, { Method } from '@/utils/request'

Vue.use(Cascader)

export default {
  name: 'EnRegionCascader',
  props: {
    value: Array,
    province: String,
    city: String,
    county: String,
    popperClass: String
  },
  data() {
    return {
      ids: [],
      props: {
        lazy: true,
        lazyLoad: async(node, resolve) => {
          const { data = {} } = node
          let id = data.region_id || 0
          const res = await request({
            url: this.MixinRegionApi.replace('@id', id),
            method: Method.GET,
            loading: false
          })
          const regions = res.map(item => ({
            label: item.local_name,
            value: item.local_name,
            region_id: item.id,
            leaf: item.region_grade > 2
          }))
          resolve(regions)
        }
      }
    }
  },
  model: { prop: 'value', event: 'update' },
  watch: {
    value: {
      deep: true,
      handler: function(newVal) {
        this.ids = newVal
      }
    },
    ids: {
      deep: true,
      handler: function(newVal) {
        this.$emit('update', newVal)
        this.$emit('update:province', newVal[0] || '')
        this.$emit('update:city', newVal[1] || '')
        this.$emit('update:county', newVal[2] || '')
      }
    }
  }
}
</script>
