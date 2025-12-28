<template>
  <chat-app
    v-if="userInfo.name"
    :user="userInfo"
    :apis="MixinApi"
    :request="MixinRequest"
    :domains="MixinDomain"
    type="admin"
  />
  <div v-else class="no-login">
    请先<a :href="`/login?forward=${$route.fullPath}`" class="login-btn">登录</a>
  </div>
</template>

<script>
import ChatApp from '@/components/ChatApp/ChatApp'
import Storage from '@/utils/storage'
let user = Storage.getItem('admin_user')
user = user ? JSON.parse(user) : {}
export default {
  name: 'chat',
  components: { ChatApp },
  data() {
    return {
      userInfo: {
        face: user.face,
        name: '平台'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.no-login {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  .login-btn {
    color: #1E50A2;
  }
}
</style>
