// 这个mixin是给全部设置项组件用的
// 在main.js里有引入和使用
export default {
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  methods: {
    /**
     * 获取是否禁用
     * @param item
     * @returns {boolean|*}
     */
    $$GetDisabled(item) {
      if (typeof item.disabled === 'function') {
        return item.disabled(this.$$FormData)
      }
      return item.disabled === true
    },
  }
}
