export default {
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  computed: {
    $$FormData() {
      return this.formData
    },
    $$Domain() {
      return this.MixinDomain
    },
    $$IsDecor() {
      return false
    },
    $$GetBuyerPCDomain() {
      if (this.$$IsDecor) return this.$$Domain['buyer_pc']
      return this.$router.resolve('/').href
    }
  },
  methods: {
    /**
     * 获取连接值
     * @param link
     */
    $$GetLinkValue(link) {
      let href = this.$$IsDecor ? this.$$Domain['buyer_pc'] : ''
      link = typeof link.type === 'string' ? link : link.link
      switch (link.type) {
        case 'mini-page':
          href += `/mini-page?id=${link.value}`; break
        case 'shop-home':
          href += `/shop/${link.value}`; break
        case 'user-center':
          href += '/member'; break
        case 'goods':
          link.value ? href += `/shop/goods-list?shop_id=${link.value}` : href += '/goods'; break
        case 'part-goods':
          href += `/goods/${link.value}`; break
        case 'cart':
          href += '/cart'; break
        case 'category':
          href += '/goods'; break
        case 'coupons':
          href += '/coupons'; break
        case 'seckill':
          href += '/seckill'; break
        case 'points-mall':
					href += '/points-mall'; break
        case 'custom':
          return link.value
      }
      return this.$router.resolve(href).href
    }
  }
}
