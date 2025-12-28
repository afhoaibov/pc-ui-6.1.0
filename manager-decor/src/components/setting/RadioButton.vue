<template>
  <div class="form-item__container radio-button">
    <div class="form-item__left-col">
      <span class="form-item__label">{{ config.label }}</span>
      <span
        v-if="config.options[0].icon"
        class="form-item__value"
      >
        {{ $$GetOptionByValue($$FormData[config.__key], config.options).label }}
      </span>
    </div>
    <div class="form-item__right-col">
      <el-radio-group
        v-model="$$FormData[config.__key]"
        size="mini"
        :max="1"
        @change="handleOptionsChange(config, $event)"
      >
        <el-tooltip
          v-for="(radio, radio_index) in config.options"
          effect="dark"
          :key="radio.value"
          :disabled="radio.tooltip === false || !radio.tooltip"
          placement="top"
        >
          <div slot="content" v-html="radio.tooltip || radio.label"></div>
          <el-radio-button
            :label="radio.value"
            :disabled="$$GetDisabled(radio)"
            size="mini"
            :style="{
              flex: config.options.length > (config.maxlength || 6) ? `0 0 ${100 / (config.maxlength || 6)}%` : ''
            }"
            :class="[...radioButtonRadiusClass(radio_index, config.options.length, (config.maxlength || 6))]"
          >
            <i v-if="!!radio.icon" class="icon-radio" :class="radio.icon"></i>
            <span v-else class="text-radio">{{ radio.label }}</span>
          </el-radio-button>
        </el-tooltip>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
  methods: {
    /**
     * option
     * @param item
     * @param value
     */
    handleOptionsChange(item, value) {
      if (typeof item.optionsChange === 'function') {
        item.optionsChange(value, this.$$FormData)
      }
      const radio = item.options.filter(_item => _item.value === value)[0]
      if (!radio) return
      if (typeof radio.handleClick === 'function') {
        radio.handleClick(this.$$FormData)
      }
    },
    /**
     * 计算radioButton的四个圆角
     * @param index
     * @param length
     * @param maxlength
     * @returns {*[]}
     */
    radioButtonRadiusClass(index, length, maxlength = 6) {
      const row_num = maxlength
      const classes = []
      if (index === 0) classes.push('top-left')
      if (index === length - 1) classes.push('bottom-right')
      if (index === row_num - 1) classes.push('top-right')
      if (length < row_num && index === length - 1) classes.push('top-right')
      let last_first = 0
      if (length % row_num === 0) {
        last_first = length - row_num
      } else {
        last_first = Math.floor(length / row_num) * row_num
        if (index === last_first - 1) classes.push('bottom-right')
      }
      if (last_first === index) classes.push('bottom-left')
      return classes
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
