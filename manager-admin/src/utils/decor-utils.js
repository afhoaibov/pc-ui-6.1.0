import Storage from '@/utils/storage'
import jwt_decode from 'jwt-decode'

const sendKeys = [
  'admin_uid',
  'admin_uuid',
  'admin_user',
  'admin_access_token',
  'admin_refresh_token'
]

export default {
  data() {
    return {
      sendStatus: 'init',
      syncTimer: null
    }
  },
  methods: {
    syncToDecor(win) {
      this.sendStatus = 'init'
      this.sendToDecor(win)
      window.addEventListener('message', this.checkSyncStatus, false)
    },
    sendToDecor(win) {
      const data = this.makeSyncData()
      if (this.sendStatus === 'success') return
      win.postMessage(data, this.MixinDomain.decor)
      clearTimeout(this.syncTimer)
      this.syncTimer = setTimeout(() => {
        this.sendToDecor(win)
      }, 200)
    },
    checkSyncStatus(event) {
      if (event.origin !== this.MixinDomain.decor) return
      if (event.data === 'decorReceived') {
        this.sendStatus = 'success'
      }
    },
    makeSyncData() {
      const data = {}
      sendKeys.forEach(key => {
        data[key] = Storage.getItem(key)
      })
      data.type = 'SYNC_DECOR'
      return data
    }
  },
  destroyed() {
    clearTimeout(this.syncTimer)
    window.removeEventListener('message', this.checkSyncStatus)
  }
}

/**
 * 接收装修端发送过来的Token数据
 */
export function receiveDecorToken() {
  window.addEventListener('message', (event) => {
    // if (event.origin !== domain.decor) return
    const { data } = event
    if (typeof data.type !== 'string' || data.type !== 'SYNC_DECOR_TOKEN') return
    const accessExpires = new Date(jwt_decode(data.accessToken).exp * 1000)
    Storage.setItem('admin_access_token', data.accessToken, { expires: accessExpires })
    const refreshExpires = new Date(jwt_decode(data.refreshToken).exp * 1000)
    Storage.setItem('admin_refresh_token', data.refreshToken, { expires: refreshExpires })
  })
}
