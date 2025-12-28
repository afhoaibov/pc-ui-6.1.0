const ports = []

var webSocket = null
onconnect = function(e) {
  var port = e.ports[0]
  ports.push(port)
  console.log('port 连接')

  port.addEventListener('message', function(e) {
    var data = e.data || {}
    switch (data.cmd) {
      case 'open':
        // 创建websocket
        if(webSocket == null) {
          webSocket = new Ws(data.url, data.token, data.uuid)
          console.log('connect websocket', data.url, data.token, data.uuid)
        }
        break
      case 'portClose':
        // 关闭当前端口（new SharedWorker 会默认开启端口）
        if (ports.indexOf(port) > -1) {
          ports.splice(ports.indexOf(port), 1)
        }
        break
      case 'WsClose':
        // 关闭websocket
        webSocket.close()
        webSocket = null
        break
      case 'close':
        // 关闭SharedWorker 通过self调用 SharedWorkerGlobalScope 的实例
        self.close()
        break
      default:
        break
    }
    // 设置不抛出状态值
    if (['open', 'portClose', 'WsClose', 'close'].indexOf(data.cmd) === -1) {
      // 循环端口触发通讯
      for (var i = 0; i < ports.length; i++) {
        ports[i].postMessage(e.data)
      }
    }
  })
  port.start()
}

class Ws {
  constructor(url, token, uuid, protocols = '') {
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

    this.uuid = uuid
    // 消息管理中心
    this.createWs()
  }

  createWs() {
    if (!this.token) return
    const url = `${this.url}?appType=shop&uuid=${this.uuid}`
    // 实例化
    this.ws = new WebSocket(url, [this.token])
    // 监听事件
    this.onopen()
    this.onerror()
    this.onclose()
    this.onmessage()
  }

  // 监听成功
  onopen() {
    this.ws.onopen = () => {
      // 发送成功连接之前所发送失败的消息
      this.errorStack.forEach(message => {
        this.send(message)
      })
      heartCheck.start()
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
      heartCheck.start()
      try {
        if (!event.data) {
          return
        }
        for (var i = 0; i < ports.length; i++) {
          ports[i].postMessage({ cmd: 'websocket_msg', data: event.data })
        }
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

  // 销毁
  destroy() {
    this.close()
    this.ws = null
    this.errorStack = null
    this.eventCenter = null
  }
}

/**
 * 心跳检测
 * @type {{timeoutObj: null, start: heartCheck.start, timeout: number}}
 */
var heartCheck = {
  timeout: 1000 * 20,
  timeoutObj: null,
  start: function() {
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.timeoutObj = setTimeout(function() {
      webSocket.send('')
    }, this.timeout)
  }
}
