<template>
  <el-cascader
    :options="options"
    ref="item"
    change-on-select
    @change="handleItemChange"
    @active-item-change="handleActiveItemChange"
    :props="props"
    separator="/"
    size="small"
    clearable
    v-bind="$attrs"
  ></el-cascader>
</template>

<script>
  import request from '@/utils/request'

  export default {
    name: 'EnCategoryPicker',
    props: {
      /** api */
      api: {
        type: String,
        default: 'admin/goods/categories/@id/children'
      },
      /** 最大级数 */
      maxLevel: {
        type: Number,
        default: 4
      }
    },
    data: function () {
      return {
        options: [],
        props: {
          value: 'category_id',
          label: 'name',
          children: 'children',
          disabled: 'disabled'
        }
      }
    },
    mounted() {
      this.GET_CategoryData()
    },
    methods: {
      GET_CategoryData: function (category_ids) {
        if (!category_ids) category_ids = []
        let _this = this
        let _category_id = category_ids[category_ids.length - 1] || 0
        request({
          url: _this.api.replace('@id', _category_id),
          method: 'get',
          loading: false
        }).then(function (response) {
          if (!response || !response[0]) return
          if (_category_id !== 0) {
            _this.findRegios(category_ids, response)
            return
          }
          _this.options = response.map(function (item) {
            if (item.has_children) {
              item.children = [{
                name: '加载中...',
                disabled: true,
                category_id: -1
              }]
            }
            return item
          })
        })
      },

      /** 选中项发生改变 */
      handleItemChange: function (val) {
        // new RegExp('@id').test(this.api) && this.GET_CategoryData(val)
        this.$refs.item.dropDownVisible = false
        this.$emit('changed', this.findRegios(val))
      },

      /** 选择当前一级选项时触发 **/
      handleActiveItemChange: function (val) {
        new RegExp('@id').test(this.api)  && this.GET_CategoryData(val)
      },

      /** 找出对应的地区 */
      findRegios: function (category_ids, response) {
        let _this = this
        let _data = { children: _this.options }
        category_ids.forEach(function (item, index) {
          _data.children && _data.children.forEach(function (_item) {
            if (_item.category_id === category_ids[index]) {
              _data = _item
            }
          })
        })
        // 如果有传入地区数据，说明是在异步加载
        if (response) {
          _data.children = response.map(function (item) {
            if (category_ids.length + 1 < _this.maxLevel && item.has_children) {
              item.children = [{
                name: '加载中...',
                disabled: true,
                category_id: -1
              }]
            }
            return item
          })
        }
        return _data
      }
    }
  }
</script>
