<template>
  <div style="display: inline-block">
    <el-select
      v-model="group_id"
      placeholder="请选择商品分组"
      @change="handleGroupChanged"
      style="width: 100%"
      filterable
      clearable
      :multiple="multiple"
      v-bind="$attrs"
    >
      <el-option
        v-for="item in groupList"
        :key="item.id"
        :label="item.name"
        :value="item.id"/>
    </el-select>
  </div>
</template>

<script>
  import request from '@/utils/request'

  export default {
    name: 'OAuth2ClientGoodsGroupPicker',
    props: {
      params: {
        type: Object,
        default: () => ({})
      },
      multiple: {
        type: Boolean,
        default: false
      },
      api: {
        type: String,
        default: 'admin/goods/goodsGroup'
      },
      defaultId: {
        type: Array,
        default: () => ([])
      }
    },
    data() {
      return {
        group_id: '',
        groupList: []
      }
    },
    watch: {
      defaultId: {
        immediate: true,
        handler(newVal) {
          this.group_id = newVal
        }
      }
    },
    created() {
      this.GetGroupList()
    },
    methods: {
      handleGroupChanged() {
        const group_id = this.group_id
        if (this.multiple) {
          this.$emit('changed', group_id)
        } else {
          const shop = this.groupList.find(item => { return group_id === item.group_id })
          this.$emit('changed', shop)
        }
      },
      GetGroupList() {
        request({
          url: this.api,
          method: 'get',
          params: this.params,
          loading: false
        }).then(response => {
          this.groupList = response.data
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

</style>
