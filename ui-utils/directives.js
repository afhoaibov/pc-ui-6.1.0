export default (Vue) => {
  /**
   * 限制输入框输入，并替换值
   * v-input.int 限制输入整数
   * v-input.zero 可以包含0
   * v-input.neg 可以包含负数
   * v-input.money 限制输入金额，最多两位小数
   */
  Vue.directive('input', {
    inserted(el, binding, vNode) {
      const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
      let isComposing = false
      input.addEventListener('compositionstart', () => {
        isComposing = true
      })
      input.addEventListener('compositionend', () => {
        isComposing = false
        input.dispatchEvent(new Event('input'))
      })
      let oldVal = input.value || ''
      const { int, zero, neg, money } = binding.modifiers
      const getNewVal = (val) => {
        if (!val) return val
        if (money) {
          let addNeg = neg && val.startsWith('-')
          val = val.replace(/-/g, '')
          if (val.startsWith('0') && !val.startsWith('0.')) {
            val = '0'
          }
          let newVal = val
            .replace(/[^\d.]/g, '')
            .replace(/^\./g, '0.')
            .replace(/(\.\d{2})\d+/g, '$1')
            .replace(/(\d*\.\d{0,2}).*/g, '$1')
          if (newVal === '0.00') {
            newVal = '0.0'
          }
          return addNeg ? `-${newVal}` : newVal
        }
        if (zero && int) {
          val = val.replace(/\D/g, '')
          if (!val) return val
          return parseInt(val).toString()
        }
        if (neg && int) {
          val = val.replace(/[^-\d]/g, '')
          const hasNe = val.startsWith('-')
          val = val.replace(/-/g, '')
          if (!val) return hasNe ? '-' : val
          if (val === '-0') return '-'
          val = parseInt(val).toString()
          return hasNe ? `-${val}` : val
        }
        if (int) {
          return val
            .replace(/\D/g, '')
            .replace(/^0+/g, '')
        }
        return oldVal
      }
      input.oninput = () => {
        if (isComposing) return
        const val = getNewVal(input.value || '')
        if (val === input.value) return
        oldVal = val
        if (vNode.componentInstance) {
          vNode.componentInstance.$emit('input', val)
        } else {
          input.value = val
          input.dispatchEvent(new Event('input'))
        }
      }
      input.onblur = () => {
        if (isComposing) return
        const val = getNewVal(input.value || '')
        let newVal = null
        if (['-', '-0', '-0.', '-0.0', '0.0'].includes(val)) {
          newVal = ''
        }
        if (newVal === null) return
        if (vNode.componentInstance) {
          vNode.componentInstance.$emit('input', newVal)
        } else {
          input.value = newVal
          input.dispatchEvent(new Event('input'))
        }
      }
    }
  })
}
