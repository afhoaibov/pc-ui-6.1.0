<template>
  <chat-app
    v-if="userInfo"
    :user="userInfo"
    :apis="MixinApi"
    :domains="MixinDomain"
    :request="request"
    type="buyer"
  />
</template>

<script>
import ChatApp from '../components/ChatApp/ChatApp'
import request from '../utils/request'
import Storage from '../utils/storage'

let user = {}
user = Storage.getItem('user')
user = user ? JSON.parse(user) : {}
export default {
  name: 'chat',
  layout: 'im',
  middleware: 'auth-user',
  components: { ChatApp },
  head() {
    return {
      title: `在线客服`
    }
  },
  data() {
    return {
      userInfo: {...user, name: user.nickname || user.name || user.uname}
    }
  },
  computed: {
    request() {
      return request
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
