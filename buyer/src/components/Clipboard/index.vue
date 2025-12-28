<template>
   <span
    class="clipboard"
    v-clipboard:copy="text"
    v-clipboard:success="onSuccess">
    <span v-if="!buttonCopy">{{text}}</span>
    <i v-if="!copySuccess" class="el-icon-document-copy"></i>
    <i v-else class="el-icon-check"></i>
  </span>

</template>

<script>
import VueClipboard from 'vue-clipboard2'
import Vue from 'vue'

Vue.use(VueClipboard)

export default {
  name: 'Clipboard',
  props: {
    text: {
      type: String
    },
    buttonCopy: {
      type: Boolean
    }
  },
  data() {
    return {
      copySuccess: false
    }
  },
  methods: {
    onSuccess() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 1000)
    }

  }
}
</script>

<style lang="scss" scoped>
.clipboard {
  cursor: pointer;
  color: #666;
  font-size: 13px;
  &:hover {
    color: #409EFF !important;
  }
}
</style>
