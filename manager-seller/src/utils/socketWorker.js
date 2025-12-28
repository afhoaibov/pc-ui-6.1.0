import Vue from 'vue'
import JSONBig from 'json-bigint'
import { api } from 'ui-domain'
import alias from 'ui-domain/alias'

function startWorker(accessToken, uuid) {
  let prefix = alias.seller || ''
  if (prefix && prefix.indexOf('/') !== 0) {
    prefix = `/${prefix}`
  }
  const worker = new SharedWorker(`${prefix}/static/js/worker.js`, 'shoptnt_seller')
  worker.port.addEventListener('message', function(e) {
    const data = JSONBig.parse(e.data.data)
    Vue.prototype.$eventCenter.emit(data.module_type, data.data)
  }, false)
  worker.port.postMessage({ cmd: 'open', url: api.seller + '/ws/shop', token: accessToken, uuid: uuid })
  worker.port.start()
  window.worker = worker
}

export default {
  startWorker
}
