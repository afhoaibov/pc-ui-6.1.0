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

function reconnect(url, token) {
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
 * @type {{timeoutObj: null, start: heartCheck.start, timeout: number}}
 */
var heartCheck = {
  timeout: 1000 * 20,
  timeoutObj: null,
  start: function() {
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.timeoutObj = setTimeout(function() {
      ws.send('')
    }, this.timeout)
  }
}

export default websocket
