
export class CaiNiaoPrinter {
  webSocket
  defaultPrinter
  getPrinterCallback
  openedCallBack
  printCallBack
  printQueue = []
  ip = 'localhost'
  port = 13528

  constructor(ip, port) {
    this.ip = ip
    this.port = port
    this.init()
  }

  doConnect() {
    this.webSocket = new WebSocket('ws://' + this.ip + ':' + this.port)
    // 打开Socket
    let that = this
    this.webSocket.onopen = function(event) {
      if (typeof this.openedCallBack === 'function') {
        this.openedCallBack(event)
      }

      // 监听消息
      that.webSocket.onmessage = function(event) {
        var data = JSON.parse(event.data)
        switch (data.cmd) {
          case 'getPrinters':
            if (typeof that.getPrinterCallback === 'function') {
              that.getPrinterCallback(data)
            }
            break
          case 'print':
            if (typeof that.printCallBack === 'function') {
              that.printCallBack(data)
            }
            break
        }
      }
      // 监听Socket的关闭
      that.webSocket.onclose = function(event) {

      }
    }
  }

  /**
   *
   * 获取请求的UUID，指定长度和进制,如
   * getUUID(8, 2) //"01001010" 8 character (base=2)
   * getUUID(8, 10) // "47473046" 8 character ID (base=10)
   * getUUID(8, 16) // "098F4D35"。 8 character ID (base=16)
   */
  getUUID(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    var uuid = []
    var i
    radix = radix || chars.length
    if (len) {
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
      var r
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
      uuid[14] = '4'
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16
          uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
        }
      }
    }
    return uuid.join('')
  }

  /**
   * 构造request对象
   */
  getRequestObject(cmd) {
    var request = {}
    request.requestID = this.getUUID(8, 16)
    request.version = '1.0'
    request.cmd = cmd
    return request
  }

  /**
   * 获取自定义区数据以及模板URL
   */
  getCustomAreaData(templateUrl) {
    var ret = {}
    ret.templateURL = templateUrl
    var test = {}
    test.customer_data = ''
    ret.data = test
    return ret
  }

  /**
   * 打印电子面单
   * printData 电子面单数据对象
   * wayBillNum 快递单号
   * templateUrl  模板地址
   */
  doPrint = function(printData, wayBillNum, templateUrl) {
    var request = this.getRequestObject('print')
    request.task = {}
    request.task.taskID = this.getUUID(8, 10)
    request.task.preview = false
    request.task.printer = this.defaultPrinter

    var documents = []
    var doc = {}
    doc.documentID = wayBillNum
    var content = []
    var waybillJson = JSON.parse(printData)
    var customAreaData = this.getCustomAreaData('http://cloudprint.cainiao.com/template/customArea/9012100/4')
    content.push(waybillJson, customAreaData)
    doc.contents = content
    documents.push(doc)

    request.task.documents = documents
    if (this.webSocket.readyState === 1) {
      this.webSocket.send(JSON.stringify(request))
    } else {
      this.printQueue.push(JSON.stringify(request))
    }
  }

  doPrintQueue = function(requestString) {
    if (this.webSocket.readyState === 1) {
      this.webSocket.send(requestString)
    }
  }

  getDefaultPrinter() {
    var request = this.getRequestObject('getPrinters')
    this.getPrinterCallback = function(data) {
      if (!this.defaultPrinter) {
        this.defaultPrinter = data.defaultPrinter
      }
      if (this.printQueue.length > 0) {
        var wayBillRequestString = this.printQueue.pop()
        this.doPrintQueue(wayBillRequestString)
      }
    }
    this.webSocket.send(JSON.stringify(request))
  }

  init = function() {
    this.openedCallBack = function(event) {
      this.getDefaultPrinter()
    }
    this.doConnect()
  }

  getCurrentPrinter = function() {
    return this.defaultPrinter
  }

  setCallBack(cb) {
    this.printCallBack = cb
  }
}
