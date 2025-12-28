<template>
  <div>
    <div class="form-item__container boolean">
      <div class="form-item__left-col">
        <span class="form-item__label">{{ config.label }}</span>
        <span
          v-if="config.props && config.props.activeText && config.props.inactiveText"
          class="form-item__value"
        >
          {{ $$FormData[config.__key] ? config.props.activeText : config.props.inactiveText }}
        </span>
      </div>
      <div class="form-item__right-col">
        <el-checkbox
          v-model="$$FormData[config.__key]"
          :disabled="$$GetDisabled(config)"
        />
      </div>
    </div>
    <div v-if="$$FormData[config.__key] && !!config.option" class="form-item__options">
      <el-radio-group v-model="$$FormData[config.option.key]">
        <el-radio
          v-for="radio in config.option.options"
          :key="radio.value"
          :label="radio.value"
          :disabled="$$GetDisabled(radio)"
        >
          {{ radio.label }}
        </el-radio>
      </el-radio-group>
      <component
        v-if="config.option.custom_component_name"
        :is="config.option.custom_component_name"
        :key="$$ActivatedPreview.__key"
        :preview="$$ActivatedPreview"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Boolean'
}
</script>

<style lang="scss" scoped>

</style>
