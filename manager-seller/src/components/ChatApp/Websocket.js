var ws
var tt
var lockReconnect = false
var messageHandler

var websocket = {
  init: function(url, handleMessageFunc, token) {
    var websocketUrl = url.replace('http://', 'ws://')
    websocketUrl = websocketUrl.replace('https://', 'wss://')
    if ('WebSocket' in window) {
      ws = new WebSocket(websocketUrl, [token])
      messageHandler = handleMessageFunc
    } else {
      console.log('您的浏览器不支持 WebSocket!')
      return
    }

    ws.onmessage = function(e) {
      heartCheck.start()
      if (e.data === '') {
        return
      }
      messageHandler(e.data)
    }

    ws.onclose = function() {
      reconnect(url)
    }

    ws.onopen = function() {
      heartCheck.start()
    }

    ws.onerror = function() {
      reconnect(url, token)
    }
  }
}

function reconnect(url) {
  if (lockReconnect) {
    return
  }
  lockReconnect = true
  tt && clearTimeout(tt)
  tt = setTimeout(function() {
    websocket.init(url, messageHandler, token)
    lockReconnect = false
  }, 4000)
}

/**
 * 心跳检测
 * @type {{serverTimeoutObj: null, timeoutObj: null, start: heartCheck.start, timeout: number}}
 */
var heartCheck = {
  timeout: 1000 * 60,
  timeoutObj: null,
  serverTimeoutObj: null,
  start: function() {
    var self = this
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(function() {
      ws.send('')
      self.serverTimeoutObj = setTimeout(function() {
        if (ws.readyState !== 1) {
          ws.close()
        }
      }, self.timeout)
    }, this.timeout)
  }
}

export default websocket
