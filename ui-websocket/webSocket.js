import EventCenter from './eventCenter'
import JSONBig from 'json-bigint'

export default class Ws {
  constructor(url, token, protocols = '') {
    // 要连接的URL
    if (url.indexOf('https://') !== -1) {
      this.url = url.replace('https://', 'wss://')
    } else {  
      this.url = url.replace('http://', 'ws://')
    }
    // 一个协议字符串或一个协议字符串数组。
    this.protocols = protocols
    // WebSocket 实例
    this.ws = null
    // 是否在重连中
    this.isReconnectionLoading = false
    // 延时重连的 id
    this.timeId = null
    // 是否是用户手动关闭连接
    this.isCustomClose = false
    // 错误消息队列
    this.errorStack = []

    this.token = token
    // 消息管理中心
    this.eventCenter = new EventCenter()
    this.createWs()
  }

  createWs() {
    if (!this.token) return
    const url = `${this.url}?appType=Admin`
    if ('WebSocket' in window) {
      // 实例化
      this.ws = new WebSocket(url, [this.token])
      // 监听事件
      this.onopen()
      this.onerror()
      this.onclose()
      this.onmessage()
    } else {
      console.log('你的浏览器不支持 WebSocket')
    }
  }

  // 监听成功
  onopen() {
    this.ws.onopen = () => {
      console.log(this.ws, 'onopen')
      // 发送成功连接之前所发送失败的消息
      this.errorStack.forEach(message => {
        this.send(message)
      })
      this.errorStack = []
      this.isReconnectionLoading = false
    }
  }

  // 监听错误
  onerror() {
    this.ws.onerror = (err) => {
      console.log(err, 'onerror')
      this.reconnection()
      this.isReconnectionLoading = false
    }
  }

  // 监听关闭
  onclose() {
    this.ws.onclose = () => {
      // 用户手动关闭的不重连
      if (this.isCustomClose) return
      console.log('onclose')
      this.reconnection()
      this.isReconnectionLoading = false
    }
  }

  // 接收 WebSocket 消息
  async onmessage() {
    this.ws.onmessage = (event) => {
      try {
        const data = JSONBig.parse(event.data)
        console.log('onmessage>>>>', data)
        this.eventCenter.emit(data.module_type, data.data)
      } catch (error) {
        console.log(error, 'error')
      }
    }
  }

  // 重连
  reconnection() {
    // 防止重复
    if (this.isReconnectionLoading) return

    this.isReconnectionLoading = true
    clearTimeout(this.timeId)
    this.timeId = setTimeout(() => {
      this.createWs()
    }, 3000)
  }

  // 发送消息
  send(message) {
    // 连接失败时的处理
    if (this.ws.readyState !== 1) {
      this.errorStack.push(message)
      return
    }

    this.ws.send(message)
  }

  // 手动关闭
  close() {
    this.isCustomClose = true
    this.ws.close()
  }

  // 手动开启
  start() {
    this.isCustomClose = false
    this.reconnection()
  }

  // 订阅
  subscribe(eventName, cb) {
    this.eventCenter.on(eventName, cb)
  }

  // 取消订阅
  unsubscribe(eventName, cb) {
    this.eventCenter.off(eventName, cb)
  }

  // 销毁
  destroy() {
    this.close()
    this.ws = null
    this.errorStack = null
    this.eventCenter = null
  }
}
