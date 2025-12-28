import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enLocale from './en'
import zhLocale from './zh'
import * as API_Common from '@/api/common'
import { Loading } from 'element-ui'

Vue.use(VueI18n)

const urlParams = new URLSearchParams(window.location.search)
const lang = urlParams.get('lang') || 'zh-CN'

const i18n = new VueI18n({
  locale: lang,
  messages: {
    'en-US': { ...enLocale },
    'zh-CN': { ...zhLocale }
  }
})

// 加载异步语言包
export async function loadLanguageAsync() {
  if (!urlParams.get('lang')) {
    loadElementUILang()
    return Promise.resolve()
  }
  const loading = Loading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
    spinner: 'el-icon-loading'
  })
  loadElementUILang()
  try {
    const res = await API_Common.getLang(lang)
    i18n.mergeLocaleMessage(lang, formatSpecialChar(res))
    window.__$t_please_select__ = i18n.t('please_select')
  } finally {
    loading.close()
  }
}

// 加载ElementUI语言包
function loadElementUILang() {
  let eleLang
  try {
    eleLang = require(`element-ui/lib/locale/lang/${lang}`)
  } catch (e) {
    try {
      eleLang = require(`element-ui/lib/locale/lang/${lang.split('-')[0]}`)
    } catch (e) {
      //
    }
  }
  if (eleLang) {
    i18n.mergeLocaleMessage(lang, eleLang.default)
  }
}

// 处理特殊字符
function formatSpecialChar(obj) {
  const charsMap = {
    '&gt;': '>'
  }
  Object.keys(obj).forEach(ok => {
    if (typeof obj[ok] === 'object') {
      obj[ok] = formatSpecialChar(obj[ok])
    } else if (typeof obj[ok] === 'string') {
      Object.keys(charsMap).forEach(ck => {
        obj[ok] = obj[ok].replace(new RegExp(ck, 'g'), charsMap[ck])
      })
    }
  })
  return obj
}

export default i18n
