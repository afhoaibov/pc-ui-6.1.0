<template>
  <div class="chat-app" @click="dismissAnyShow">
    <div class="chat-container">
      <div class="left-chat">
        <div class="user-info">
          <div class="face-user">
            <div class="img-face-user" :style="{backgroundImage: `url(${user.face || defaultFace})`}"></div>
            <div class="info-user">
              <div class="name-user ellipsis">{{ user.name }}</div>
            </div>
          </div>
          <div class="search-user">
            <input v-model="search_keyword" placeholder="搜索最近联系人" class="search-input-user">
          </div>
        </div>
        <div class="friend-list">
          <div
            v-for="item in showFriends"
            :key="item['target_id']"
            class="friend-item"
            :class="{active: receiver_id === item['target_id']}"
            @click="handleClickFriend(item)"
          >
            <div  class="face-friend" :style="{backgroundImage: `url(${item.avatar || defaultFace})`}"></div>
            <div class="name-friend ellipsis">{{ item.name }}</div>
            <div v-if="item['un_read_num'] > 0" class="unread-friend">{{ item['un_read_num'] }}</div>
            <div class="icon-delete" @click.stop="handleDeleteFriend(item)"></div>
          </div>
        </div>
      </div>
      <div class="right-chat">
        <div class="head-right">
          <div v-if="currentChat" class="wrapper-head">
            <div class="face-head" :style="{backgroundImage: `url(${currentChat.avatar || defaultFace})`}"></div>
            <div class="info-head">
              <p class="name-info-head">
                {{ currentChat.name }}
              </p>
              <p class="desc-info-head"></p>
            </div>
          </div>
        </div>
        <div class="body-right">
          <div class="chat-right">
            <div ref="chat-content" class="list-chat">
              <div v-if="chatHistoryParams.loading" class="load-more no-data">正在加载数据...</div>
              <div v-else-if="currentChat" class="load-more" :class="{'no-data': chatHistoryParams.no_data}" @click="handleLoadMoreHistory">
                {{ chatHistoryParams.no_data ? '没有聊天记录了' : '点击加载更多' }}
              </div>
              <div v-else class="load-more no-data">请在左侧选择一个对话</div>
              <chat-message-item
                v-for="item in chatHistories"
                :key="item['msg_id']"
                :message="item"
                :sender="user"
                :receiver="currentChat"
                :get-emoji-path="getEmojiPath"
                :click-message="handleClickMessage"
                :unix-to-date="unixToDate"
                :preview-image="handlePreviewImage"
              />
            </div>
            <div v-if="new_message_tip" class="scroll-tip" @click="chatContentScrollTo">
              <i class="scroll-tip-icon"></i>
              <span>有新的消息</span>
            </div>
            <div class="input-chat">
              <div class="toolbar-input-chat">
                <div class="btn-toolbar emoji" @click.stop="show_emoji_box = true"></div>
                <div class="btn-toolbar image" @click="handleClickTool('image')">
                  <input
                    type="file"
                    id="image-upload-input"
                    class="btn-toolbar-input"
                    accept="image/jpg,image/jpeg,image/png,image/webp,image/bmp,image/gif"
                    @change="handleToolbarFileChange"
                  >
                </div>
                <div class="btn-toolbar video" @click="handleClickTool('video')">
                  <input
                    type="file"
                    id="video-upload-input"
                    class="btn-toolbar-input"
                    accept="video/mp4,video/flv"
                    @change="handleToolbarFileChange"
                  >
                </div>
              </div>
              <div class="textarea-chat" @keydown.enter="handleSendContent">
                <p id="textarea-input" contenteditable="true" class="textarea-input"></p>
              </div>
              <div class="send-chat">
                <div class="send-btn">
                  <div class="btn-send" @click="handleSendContent(1)">发送</div>
                  <i class="send-btn-arrow" @click.stop="show_enter_key_picker = true"></i>
                  <ul v-show="show_enter_key_picker" class="send-keys">
                    <li class="send-key" :class="{active: enter_key === 1}" @click="enter_key = 1">按Enter发送</li>
                    <li class="send-key" :class="{active: enter_key === 2}" @click="enter_key = 2">按Ctrl+Enter发送</li>
                  </ul>
                </div>
              </div>
              <div class="emoji-chat">
                <chat-app-emoji v-show="show_emoji_box" @select="handleEmojiSelect" />
              </div>
            </div>
          </div>
          <div class="actions-right">
            <div class="tabs-actions">
              <div class="tab-actions ellipsis" :class="{active: current_tab === 0}" @click="current_tab = 0">
                {{ currentAskGoods ? '正在咨询' : (isSeller ? '店铺商品' : '浏览历史') }}
              </div>
              <div class="tab-actions ellipsis" :class="{active: current_tab === 1}" @click="current_tab = 1">
                {{ isSeller ? '会员订单' : '我的订单' }}
              </div>
            </div>
            <div class="content-actions">
              <div v-show="current_tab === 0" class="history-actions" :class="{'is-seller': isSeller}">
                <div v-if="isSeller" class="search-goods">
                  <input v-model="search_goods_keyword" class="search-goods-input" placeholder="输入商品名称查询"/>
                </div>
                <div v-if="currentAskGoods" class="history-goods">
                  <a :href="`${domains['buyer_pc']}/goods/${currentAskGoods['goods_id']}`" target="_blank" class="history-goods-link">
                    <img :src="currentAskGoods['thumbnail']" alt="" class="history-goods-image">
                    <span class="history-goods-name">{{ currentAskGoods['goods_name'] }}</span>
                  </a>
                  <div class="send-btn" @click="sendMessage(currentAskGoods['goods_id'], 'GOODS')">发送</div>
                </div>
                <div v-if="currentAskGoods" class="tab-actions active">浏览历史</div>
                <div v-for="item in goodsList" :key="item['goods_id']" class="history-goods">
                  <a :href="`${domains['buyer_pc']}/goods/${item['goods_id']}`" target="_blank" class="history-goods-link">
                    <img :src="item['goods_img']" alt="" class="history-goods-image">
                    <span class="history-goods-name">{{ item['goods_name'] }}</span>
                  </a>
                  <div class="send-btn" @click="sendMessage(item['goods_id'], 'GOODS')">发送</div>
                </div>
                <div
                  class="tip-load-more"
                  :class="{disabled: goodsListParams.loading || goodsListParams.no_data}"
                  @click="handleLoadMoreGoods"
                >
                  <span v-if="goodsListParams.loading">加载中...</span>
                  <span v-else-if="goodsListParams.no_data">没有更多了...</span>
                  <span v-else>加载更多</span>
                </div>
              </div>
              <div v-show="current_tab === 1" class="orders-actions">
                <div v-for="item in orders" :key="item['order_id']" class="item-order">
                  <div class="title-order">
                    <span class="id-order">订单号：{{ item.sn }}</span>
                    <span class="status-order send-btn" @click="sendMessage(item['sn'], 'ORDER')">发送</span>
                  </div>
                  <ul class="products-order" @click="handleClickOrder(item)">
                    <li v-for="sku in item.sku_list" :key="sku['sku_id']" class="item-products">
                      <div class="image-product">
                        <img :src="sku['goods_image']" alt="" class="img-product">
                      </div>
                      <div class="info-product">
                        <p :title="sku['name']" class="name-product">{{ sku['name'] }}</p>
                        <div class="status-order">{{ item['order_status_text'] }}</div>
                      </div>
                    </li>
                  </ul>
                  <div class="other-order">
                    <p class="price-order">
                      <span>订单金额：</span>
                      <span class="price">{{ item['order_amount'] | unitPrice }}</span>
                    </p>
                    <div>
                      <span class="date-order">{{ unixToDate(item.create_time) }}</span>
                    </div>
                  </div>
                </div>
                <div
                  class="tip-load-more"
                  :class="{disabled: orderParams.loading || orderParams.no_data || !receiver_id}"
                  @click="handleLoadMoreOrder"
                >
                  <span v-if="orderParams.loading">加载中...</span>
                  <span v-else-if="orderParams.no_data">没有更多了...</span>
                  <span v-else>{{ receiver_id ? '加载更多' : '请在左侧选择一个对话' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <viewer ref="viewer" :images="viewerImages" style="display: none">
      <img v-for="src in viewerImages" :src="src" :key="src" alt="" />
    </viewer>
    <audio :src="message_mp3" id="chatAudio" style="z-index: 9999999; display: none; margin-left: 600px"/>
  </div>
</template>

<script>
import apiMixin from './apiMixin'
import emojiMixin from './emojiMixin'
import ChatAppEmoji from './ChatAppEmoji'
import ChatMessageItem from './ChatMessageItem'
import { MessageBox } from 'element-ui'
import websocket from './Websocket'
import JSONBig from 'json-bigint'
import Storage from '@/utils/storage'
import messageMp3 from './message.mp3'

export default {
  name: 'ChatApp',
  components: { ChatAppEmoji, ChatMessageItem },
  props: {
    user: {
      type: Object,
      required: true
    },
    apis: {
      type: Object,
      required: true
    },
    domains: {
      type: Object,
      required: true
    },
    request: {
      type: Function,
      required: true
    },
    // 聊天类型
    type: {
      type: String,
      required: true
    }
  },
  mixins: [apiMixin, emojiMixin],
  data() {
    return {
      receiver_id: '',
      goods_id: '',
      search_keyword: '',
      current_chat: '',
      current_tab: 0,
      show_emoji_box: false,
      show_enter_key_picker: false,
      enter_key: 1,
      new_message_tip: false,
      viewerImages: [],
      defaultFace: require('./icon-noface.jpg'),
      search_goods_keyword: '',
      message_mp3: messageMp3,
      play_audio: Storage.getItem('seller_play_audio')
    }
  },
  computed: {
    // 正在聊天对象
    currentChat() {
      const friend = this.friends.filter(item => item['target_id'] === this.receiver_id)[0]
      return friend || ''
    },
    // 正在咨询的商品
    currentAskGoods() {
      if (this.$route.query.shop_id !== this.receiver_id) return ''
      return this.askGoods
    },
    // 输入框节点
    contentEl() {
      return document.getElementById('textarea-input')
    },
    // 展示的朋友列表【经过搜索关键字过滤】
    showFriends() {
      const { search_keyword, friends } = this
      if (!search_keyword.trim()) return friends
      return friends.filter(item => item.name.indexOf(search_keyword) !== -1)
    },
    // 是否为商家端
    isSeller() {
      return this.type === 'seller'
    }
  },
  async created() {
    const { shop_id, goods_id } = this.$route.query
    this.receiver_id = shop_id
    this.goods_id = goods_id
    if (this.$eventCenter) {
      this.$eventCenter.on('IM', this.handleWebsocketMessage)
    }
    if (this.receiver_id) {
      this.createSession()
    }
  },
  watch: {
    search_goods_keyword: 'handleSearchGoods'
  },
  mounted() {
    if (!document) return
    this.$refs['chat-content'].addEventListener('scroll', this.chatBoxScrollListener)
    this.initPasteScreenshot()
    if (this.play_audio !== 0) {
      this.showAudioConfirmDialog()
    }
  },
  methods: {
    /**
     * 处理websocket消息
     * @param msg
     */
    handleWebsocketMessage(msg) {
      // 收到新消息
      if (msg.type === 'msg') {
        if (this.play_audio !== 0 && msg.payload && !msg.payload.is_self) {
          const chatAudio = document.getElementById('chatAudio')
          try {
            chatAudio.pause()
            chatAudio.currentTime = 0
            chatAudio.play()
          } catch (e) {
            //
          }
        }
        let senderId = msg.sender_id.toString()
        let newReceiverId = msg.receiver_id.toString()
        if (senderId !== this.receiver_id && newReceiverId !== this.receiver_id) {
          var chatIndex = -1
          const chat = this.friends.filter((item, index, arr) => {
            if (item['target_id'] === senderId) {
              chatIndex = index
              return item
            }
          })[0]
          if (chat) {
            chat.un_read_num += 1
            // 将会话置为第一个
            this.friends.splice(chatIndex, 1)
            this.friends.unshift(chat)
          } else {
            // 未找到会话
            this.getFriends()
          }
          return
        }

        let num = 0
        let item = msg.payload
        let msgId = item.msg_id.toString()
        if (!this.chatHistories.map(_item => _item['msg_id']).includes(msgId)) {
          item.msg_id = msgId
          this.chatHistories.push(item)
          num++
        }
        if (num !== 0) {
          const $el = this.$refs['chat-content']
          if ($el.scrollHeight - $el.scrollTop < $el.offsetHeight + 5) {
            this.chatContentScrollTo()
          } else {
            this.new_message_tip = true
          }
          this.removeUnreadNum()
        }
        return
      }
      // 会话内容变化
      if (msg.type === 'friend') {
        this.getFriends()
        return
      }
    },
    /**
     * 移除会话[删除好友]
     * @param item
     */
    handleDeleteFriend(item) {
      this.$confirm('确认要删除此联系人?', '提示', { type: 'warning' }).then(() => {
        const id = item['target_id']
        this.deleteFriend(id).then(() => {
          if (this.receiver_id === id) {
            this.receiver_id = ''
            this.chatHistories = []
          }
          this.getFriends()
        })
      })
    },
    /**
     * 选择好友
     * @param item
     */
    handleClickFriend(item) {
      this.receiver_id = item['target_id']
      this.current_tab = 0
      this.removeUnreadNum()
      this.currentChat.un_read_num = 0
      this.chatContentScrollTo()
    },
    /**
     * 发送消息
     */
    handleSendContent(event) {
      if (!this.receiver_id) return
      if (event !== 1) {
        if (this.enter_key === 1) {
          event.preventDefault()
        } else {
          if (!event.ctrlKey) return
        }
      }

      if (!this.contentEl.innerHTML.trim()) return
      const emojiEls = this.contentEl.querySelectorAll('.emoji-img')
      emojiEls.forEach(item => (item.src = ''))
      const content = this.contentEl.innerHTML
      this.sendMessage(content.trim(), 'TEXT')
      this.$nextTick(() => {
        this.contentEl.innerHTML = ''
      })
    },
    /**
     * 选择emoji
     * @param item
     */
    handleEmojiSelect(item) {
      this.contentEl.innerHTML += `<img src="${this.getEmojiPath(item)}" alt="${item}" class="emoji-img">`
      this.show_emoji_box = false
    },
    /**
     * 隐藏所有框框
     */
    dismissAnyShow() {
      this.show_emoji_box = false
      this.show_enter_key_picker = false
    },
    /**
     * 聊天窗口滚动到底部
     */
    chatContentScrollTo(offset) {
      this.$nextTick(() => {
        const $content = this.$refs['chat-content']
        $content.scrollTop = typeof offset !== 'number' ? $content.scrollHeight : offset
        this.new_message_tip = false
      })
    },
    /**
     * 加载更多聊天记录
     */
    async handleLoadMoreHistory() {
      if (this.chatHistoryParams.loading || this.chatHistoryParams.no_data) return
      this.chatHistoryParams.page_no += 1
      this.getChatHistory()
    },
    /**
     * 聊天区域滚动监听
     * @param event
     */
    chatBoxScrollListener(event) {
      const $el = event.target
      if ($el.scrollHeight - $el.scrollTop === $el.offsetHeight) {
        this.new_message_tip = false
      }
    },
    /**
     * 选择图片或视频
     * @param type
     */
    handleClickTool(type) {
      if (type === 'audio-text') {
        this.showAudioConfirmDialog()
        return
      }
      if (!this.receiver_id) {
        return
      }
      document.getElementById(`${type}-upload-input`).click()
    },
    /**
     * 文件发生改变
     * @param event
     */
    async handleToolbarFileChange(event) {
      const { files } = event.target
      const file = files[0]
      if (!file) return
      const type = /image\//.test(file.type) ? 'IMAGES' : 'VIDEO'
      const res = await this.uploadFile(file)
      await this.sendMessage(res.url, type)
    },
    /**
     * 点了消息
     * @param message
     */
    handleClickMessage(message) {
      if (message.type === 'ORDER') {
        this.handleClickOrder(message)
      } else if (message.type === 'GOODS') {
        window.open(this.domains['buyer_pc'] + `/goods/${message['goods_id']}`)
      }
    },
    /**
     * 查看订单详情
     */
    handleClickOrder(item) {
      const { order_sn, sn } = item
      let url = this.isSeller
        ? this.$router.resolve(`/order/detail/${order_sn || sn}`).href
        : `/member/my-order/detail?order_sn=${order_sn || sn}`
      window.open(url)
    },
    /**
     * 加载更多商品
     */
    handleLoadMoreGoods() {
      if (this.goodsListParams.no_data) return
      this.goodsListParams.page_no += 1
      this.getGoodsList()
    },
    /**
     * 加载更多订单
     */
    handleLoadMoreOrder() {
      if (this.orderParams.no_data || !this.receiver_id) return
      this.orderParams.page_no += 1
      this.getOrders()
    },
    /**
     * 格式化日期
     * @param unix
     * @param format
     * @returns {string}
     */
    unixToDate(unix, format) {
      let _format = format || 'yyyy-MM-dd hh:mm:ss'
      const d = new Date(unix * 1000)
      const o = {
        'M+': d.getMonth() + 1,
        'd+': d.getDate(),
        'h+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds(),
        'q+': Math.floor((d.getMonth() + 3) / 3),
        S: d.getMilliseconds()
      }
      if (/(y+)/.test(_format)) _format = _format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (const k in o) if (new RegExp('(' + k + ')').test(_format)) _format = _format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      return _format
    },
    /**
     * 素材选择器确认选择
     * @param items
     */
    handleResourcePickerConfirm(items) {
      if (items.length) {
        const type = this.resource_picker_type === 'image' ? 'IMAGES' : 'VIDEO'
        this.sendMessage(items[0]['resource_url'], type)
      }
    },
    /**
     * 预览图片
     * @param message
     */
    handlePreviewImage(message) {
      this.viewerImages = [message.url]
      this.$refs['viewer']['$viewer']['show']()
    },
    /**
     * 初始化粘贴板监听
     */
    initPasteScreenshot() {
      this.contentEl.addEventListener('paste', async(event) => {
        let paste = (event.clipboardData || window.clipboardData)
        if (paste.files.length !== 0) {
          const file = paste.files[0]
          if (file.type.indexOf('image/') === -1) return
          event.preventDefault()
          if (!this.receiver_id) {
            return this.$message.error('请选择一个对话！')
          }
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (e) => {
            const h = this.$createElement
            const src = e.target.result
            console.log(this)
            MessageBox({
              title: '是否发送图片？',
              message: h('img',
                {
                  style: { 'max-width': '390px', 'max-height': '390px' },
                  attrs: { src }
                }
              ),
              showCancelButton: true,
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(async() => {
              const res = await this.uploadFile(file)
              await this.sendMessage(res.url, 'IMAGES')
            })
          }
        }
      })
    },
    handleSearchGoods() {
      this.goodsListParams.no_data = false
      this.goodsListParams.page_no = 1
      this.getGoodsList()
    },
    /**
     * 显示消息通知确认弹框
     */
    showAudioConfirmDialog() {
      this.$msgbox.confirm(
        '因浏览器限制，如需要使用声音提示，每次进入聊天界面，您需要点击下面确认按钮授权使用系统声音。\n如您不需要使用声音提醒，则点击下方的“不提示声音”按钮，本提示将不在弹出。',
        {
          type: 'warning',
          center: true,
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          confirmButtonText: '使用声音提示',
          cancelButtonText: '不提示声音',
          callback: (res) => {
            if (res === 'cancel') {
              this.play_audio = 0
              Storage.setItem('seller_play_audio', 0)
            } else {
              this.play_audio = 1
              Storage.setItem('seller_play_audio', 1)
            }
          }
        }
      )
    }
  },
  beforeDestroy() {
    if (!document) return
    this.$refs['chat-content'].removeEventListener('scroll', this.chatBoxScrollListener)
  }
}
</script>

<style lang="scss" scoped>
@use "./styles" as *;
</style>
