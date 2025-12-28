export default {
  data() {
    return {
      // 朋友
      friend_timer: null,
      friends: [],
      // 订单
      orders: [],
      orderParams: {
        page_no: 1,
        page_size: 10,
        no_data: false,
        loading: false
      },
      // 商品浏览历史或者本店商品
      goodsList: [],
      goodsListParams: {
        page_no: 1,
        page_size: 10,
        no_data: false,
        loading: false
      },
      // 正在咨询的商品
      askGoods: '',
      // 聊天记录
      chatHistories: [],
      chatHistoryParams: {
        page_no: 1,
        page_size: 10,
        no_data: false,
        loading: false
      },
      new_message_timer: null
    }
  },
  mounted() {
    this.getFriends()
    this.getGoodsList()
    if (this.goods_id) {
      this.getGoodsDetail()
    }
  },
  watch: {
    receiver_id: {
      immediate: true,
      async handler(newVal) {
        if (!newVal) return
        this.orders = []
        this.orderParams.no_data = false
        this.orderParams.page_no = 1
        this.chatHistories = []
        this.chatHistoryParams.no_data = false
        this.chatHistoryParams.page_no = 1
        this.getOrders()
        await this.getNewMessage()
        setTimeout(() => {
          this.chatContentScrollTo()
        }, 1000)
      }
    }
  },
  methods: {
    /**
     * 获取好友列表
     */
    getFriends() {
      this.request({
        url: this.apis['seller'] + `/${this.type}/im/friends-list`,
        method: 'get',
        loading: false,
        needToken: true
      }).then(res => {
        const currentChat = res.filter(item => item['target_id'] === this.receiver_id)[0]
        if (currentChat) {
          currentChat.un_read_num = 0
        }
        this.friends = res
        if (!this.receiver_id) {
          this.receiver_id = res[0].target_id
        }
      })
    },
    /**
     * 获取订单列表
     */
    getOrders() {
      this.orderParams.loading = true
      const params = JSON.parse(JSON.stringify(this.orderParams))
      delete params.no_data
      delete params.loading
      let url = this.isSeller
        ? `${this.apis['seller']}/seller/trade/orders?member_id=${this.receiver_id}`
        : `${this.apis['buyer']}/trade/orders/im/${this.receiver_id}`
      this.request({
        url,
        method: 'get',
        loading: false,
        needToken: true,
        params
      }).then(res => {
        const data = res.data
        if (params.page_no === 1) {
          this.orders = data
        } else {
          this.orders.push(...data)
        }
        this.orderParams.no_data = data.length < params.page_size
      }).finally(() => {
        this.orderParams.loading = false
      })
    },

    /**
     * 创建对话
     * @returns {*}
     */
    createSession() {
      return this.request({
        url: this.apis['seller'] + `/${this.type}/im/session/${this.receiver_id}`,
        method: 'post',
        loading: false,
        needToken: true
      }).then(res => {
        this.getFriends()
      })
    },

    /**
     * 获取商品列表
     * 如果是商家端，获取店铺商品列表
     * 否则，获取会员商品浏览记录
     */
    getGoodsList() {
      this.goodsListParams.loading = true
      const params = JSON.parse(JSON.stringify(this.goodsListParams))
      if (this.search_goods_keyword) {
        params.goods_name = this.search_goods_keyword
      }
      delete params.no_data
      delete params.loading
      let url = this.isSeller
        ? `${this.apis['seller']}/seller/goods`
        : `${this.apis['buyer']}/members/history/list-page`
      this.request({
        url,
        method: 'get',
        loading: false,
        needToken: true,
        params
      }).then(res => {
        const data = []
        if (this.isSeller) {
          res.data.forEach(item => data.push({ ...item, goods_img: item.thumbnail }))
        } else {
          res.data.forEach(item => data.push(item))
        }
        if (params.page_no === 1) {
          this.goodsList = data
        } else {
          this.goodsList.push(...data)
        }
        this.goodsListParams.no_data = data.length < params.page_size
      }).finally(() => {
        this.goodsListParams.loading = false
      })
    },

    /**
     * 获取商品详情
     */
    getGoodsDetail() {
      if (!this.goods_id) return
      this.request({
        url: this.apis['buyer'] + `/goods/${this.goods_id}`,
        loading: false
      }).then(res => {
        this.askGoods = res
      })
    },

    /**
     * 获取聊天记录，用于加载更多
     */
    getChatHistory() {
      this.chatHistoryParams.loading = true
      const params = JSON.parse(JSON.stringify(this.chatHistoryParams))
      params.receiver_id = this.receiver_id
      delete params.no_data
      delete params.loading
      this.request({
        url: this.apis['seller'] + `/${this.type}/im/history`,
        method: 'get',
        loading: false,
        needToken: true,
        params
      }).then(res => {
        const data = res.data
        this.chatHistories.splice(0, 0, ...data)
        this.chatHistoryParams.no_data = data.length < params.page_size
      }).finally(() => {
        this.chatHistoryParams.loading = false
      })
    },

    /**
     * 发送消息
     * @param content
     * @param type
     * @returns {Promise<*>}
     */
    async sendMessage(content, type) {
      if (!this.receiver_id) return this.$message.error('请选择一个对话！')
      const data = {
        content,
        receiver_id: this.receiver_id
      }
      const res = await this.request({
        url: this.apis['seller'] + `/${this.type}/im/message/${type}`,
        method: 'post',
        loading: false,
        needToken: true,
        data
      })
      let msgId = res.msg_id.toString()
      if (!this.chatHistories.map(_item => _item['msg_id']).includes(msgId)) {
        this.chatHistories.push(res)
      }
      this.removeUnreadNum()
      this.chatContentScrollTo()
      return Promise.resolve(res)
    },
    /**
     * 移除未读消息
     * @returns {*}
     */
    removeUnreadNum() {
      return this.request({
        url: this.apis['seller'] + `/${this.type}/im/unread-num`,
        method: 'delete',
        loading: false,
        needToken: true,
        params: {
          sender_id: this.receiver_id
        }
      })
    },
    /**
     * 获取新消息，轮询
     * @returns {Promise<void>}
     */
    getNewMessage() {
      return new Promise(resolve => {
        this.request({
          url: this.apis['seller'] + `/${this.type}/im/history`,
          method: 'get',
          loading: false,
          needToken: true,
          params: { receiver_id: this.receiver_id }
        }).then(res => {
          let num = 0
          res.data.forEach(item => {
            if (!this.chatHistories.map(_item => _item['msg_id']).includes(item['msg_id'])) {
              this.chatHistories.push(item)
              num++
            }
          })
          if (num !== 0) {
            const $el = this.$refs['chat-content']
            if ($el.scrollHeight - $el.scrollTop === $el.offsetHeight) {
              this.chatContentScrollTo()
            } else {
              this.new_message_tip = true
            }
          }
        }).finally(() => {
          resolve()
        })
      })
    },
    /**
     * 文件上传
     * @param file
     */
    uploadFile(file) {
      return new Promise(resolve => {
        const formData = new FormData()
        formData.append('file', file)
        this.request({
          url: this.MixinUploadApi,
          method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data',
            ...this.MixinAccessToken
          },
          data: formData
        }).then(res => {
          resolve(res)
        })
      })
    },

    /**
     * 删除会话[移除好友]
     * @param id
     */
    deleteFriend(id) {
      return new Promise((resolve, reject) => {
        let url = this.apis['seller']
        url += this.isSeller ? '/seller/im/delete' : '/buyer/im/delete'
        const params = this.isSeller ? { member_id: id } : { shop_id: id }
        this.request({
          url,
          method: 'get',
          needToken: true,
          params
        }).then(resolve).catch(reject)
      })
    }
  }
}
