import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Storage from '@/utils/storage'
import store from '@/store'
import enLocale from './en'
import zhLocale from './zh'
import * as API_Common from '@/api/common'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: process.env.I18N
    ? (Storage.getItem('sellerLanguage') || 'zh-CN')
    : 'zh-CN',
  messages: {
    'en-US': { ...enLocale },
    'zh-CN': { ...zhLocale }
  }
})

// 加载异步语言包
export async function loadLanguageAsync() {
  let lang = i18n.locale
  if (!process.env.I18N) {
    loadElementUILang(lang)
    return Promise.resolve()
  }
  try {
    const res = await API_Common.getLangCodes()
    if (!Array.isArray(res) || !res.length) return Promise.resolve()
    await store.dispatch('setLocalesAction', res)
    // 如果没找到当前语言，设置第一个语言为默认语言
    if (!res.find(item => item.code === i18n.locale)) {
      lang = res[0].code
      i18n.locale = lang
      Storage.setItem('sellerLanguage', lang)
    }
    loadElementUILang(lang)
  } catch (e) {
    //
  }
  try {
    const res = await API_Common.getLang(lang)
    i18n.mergeLocaleMessage(lang, formatSpecialChar(res))
    window.__$t_please_select__ = i18n.t('please_select')
  } catch (e) {
    //
  }
}

// 加载ElementUI语言包
function loadElementUILang(lang) {
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
