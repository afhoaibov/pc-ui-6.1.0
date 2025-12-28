<template>
  <el-cascader
    :options="options"
    :change-on-select="!customProps.multiple"
    @change="handleItemChange"
    :props="{...props, ...customProps}"
    separator="/"
    size="small"
    v-model="category_ids"
    v-bind="$attrs"
  ></el-cascader>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'OAuth2ClientCategoryPicker',
  props: {
    /** api */
    api: {
      type: String,
      default: 'admin/goods/categories/0/all-children'
    },
    /** 最大级数 */
    maxLevel: {
      type: Number,
      default: 4
    },
    customProps: {
      type: Object,
      default: () => ({})
    },
    defaultCateId: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      options: [],
      props: {
        value: 'category_id',
        label: 'name',
        children: 'children',
        disabled: 'disabled'
      },
      category_ids: []
    }
  },
  watch: {
    defaultCateId(val) {
      this.handlerCheckCate()
    }
  },
  mounted() {
    this.GET_CategoryData()
  },
  methods: {
    /** 默认已选数据处理 */
    handlerCheckCate() {
      const category_ids = this.defaultCateId
      let prevCascader = []
      if (category_ids && category_ids.length) {
        prevCascader = category_ids.filter(item => !!item).map(item => +item)
      }
      function next(params, prev) {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          if (item.children) {
            next(item.children, [...prev, item])
          } else {
            if (prevCascader.includes(+item.category_id)) {
              prevCascader = prevCascader.map(key => {
                if (+key === +item.category_id) {
                  let result = prev.map(item => item.category_id)
                  return [...result, item.category_id]
                } else {
                  return key
                }
              })
            } else {
              i === params.length - 1 && (prev = [])
            }
          }
        }
      }
      next(this.options, [])
      this.category_ids = prevCascader
    },
    /** 获取分类数据 */
    GET_CategoryData() {
      request({
        url: this.api,
        method: 'get',
        loading: false
      }).then(response => {
        if (!response || !response[0]) return
        function next(params) {
          for (let i = 0; i < params.length; i++) {
            const item = params[i]
            if (item.children) {
              if (Array.isArray(item.children) && item.children.length) {
                next(item.children)
              } else {
                item.children = null
              }
            } else {
              item.children = null
            }
          }
        }
        next(response)
        this.options = response
        if (this.defaultCateId.length) {
          this.handlerCheckCate()
        }
      })
    },

    /** 选中项发生改变 */
    handleItemChange(val) {
      if (this.customProps.multiple) {
        this.$emit('changed', val)
      } else {
        const cateItem = this.findRegios(val)
        this.$emit('changed', cateItem)
      }
    },

    /** 找出对应的地区 */
    findRegios(category_ids, response) {
      let _data = { children: this.options }
      category_ids.forEach((item, index) => {
        _data.children && _data.children.forEach(_item => {
          if (_item.category_id === category_ids[index]) {
            _data = _item
          }
        })
      })
      // 如果有传入地区数据，说明是在异步加载
      if (response) {
        _data.children = response.map(item => {
          if (category_ids.length + 1 < this.maxLevel && item.has_children) {
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
<style lang="scss" scoped>
</style>
