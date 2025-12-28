<template>
  <div id="bread-nav">
    <div class="bread-nav-container w">
      <span class="left-nav">
        <router-link to="/">首页</router-link>
        &gt;
        <router-link v-if="goods.category_id" :to="'/goods?category=' + goods.category_id">{{ goods.category_name }}</router-link>
        <router-link v-else :to="'/goods?keyword=' + goods.category_name">{{ goods.category_name }}</router-link>
        &gt;
        <a href="javascript:;">{{ goods.goods_name || goods.name }}</a>
      </span>

      <div class="right-box">
        <span class="shop-name">
          {{goods.seller_name}}
        </span>
        <span class="shop-name icon-box" @click="MixinOpenIm(shopBaseInfo, { goods_id: goods.goods_id })">
          <i class="iconfont el-icon-service"></i>
          联系客服
        </span>

        <a href="javascript:" :class="['collect-goods-btn', collected && 'collected']" @click="handleCollectionGoods">
          <span style="margin-left: 20px;">{{ collected ? '已收藏' : '收藏' }}</span>
        </a>
        <div class="share-btn-box" @click="shareGoods">
          <img src="@/assets/images/share.png" class="share-icon" alt="">
          <span>分享</span>
        </div>
      </div>
    </div>
    <el-dialog title="分享我的链接" :visible.sync="isShowQRCode" width="35%">
      <qrcode-vue :value="config.value" :size="config.size" level="H" style="text-align: center"></qrcode-vue>
      <div class="share-form">
        <p class="text">我的分享链接</p>
        <el-input v-model="config.value_pc" size="mini"></el-input>
      </div>
      <div class="btn-box">
        <el-button
          type="primary"
          size="mini"
          v-clipboard:copy="config.value_pc"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">复制到剪贴板</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  import Storage from '@/utils/storage'
  import * as API_distribution from '@/api/distribution'
  import QrcodeVue from 'qrcode.vue'

  export default {
    name: 'bread-nav',
    components: { QrcodeVue },
    props: ['goods', 'canView', 'shopBaseInfo'],
    data() {
      return {
        // 商品是否已被收藏
        collected: false,
        /** 是否显示二维码弹框 */
        isShowQRCode: false,
        config: {
          // wap端地址
          value: '',
          size: 200,
          // PC 端地址
          value_pc: ''
        }
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(val) {
          if (val.name === 'goodsDetail') {
            // 如果用户已登录，加载收藏状态
            if (Storage.getItem('refresh_token')) {
              const { goods_id } = this.goods
              API_Members.getGoodsIsCollect(goods_id).then(response => {
                this.collected = response.message
              })
            }
          }
        }
      }
    },
    methods: {
      /** 收藏商品 */
      handleCollectionGoods() {
        if (!Storage.getItem('refresh_token')) {
          this.$message.error('您还未登录，不能收藏商品！')
          return false
        }
        const { goods_id } = this.goods
        if (this.collected) {
          API_Members.deleteGoodsCollection(goods_id).then(() => {
            this.$message.success('取消收藏成功！')
            this.collected = false
          })
        } else {
          API_Members.collectionGoods(goods_id).then(() => {
            this.$message.success('收藏成功！')
            this.collected = true
          })
        }
      },
      /** 复制成功 */
      onCopy(e) {
        this.$message.success('已复制')
      },

      /** 复制失败 */
      onError(e) {
        this.$message.error('无法复制文本')
      },
      /** 商品分享 */
      shareGoods() {
        /** 登录校验 */
        const { user } = this.$store.getters
        // 如果没有登录，跳转到登录页
        if (!user) {
          this.$router.push({ path: `/login?forward=${this.$route.fullPath}` })
        } else {
          API_distribution.generateShortLink({ goods_id: this.goods.goods_id}).then(response => {
            this.isShowQRCode = true
            const goodsId = this.$route.params.id || this.$route.query.goodsId
            const _query = response.message.substring(response.message.indexOf('?'), response.message.length)
            console.log(this.MixinDomain)
            this.config.value = `${this.MixinDomain.buyer_wap}/goods-module/goods${_query}&goods_id=${goodsId}`
            this.config.value_pc = `${this.MixinDomain.buyer_pc}/goods/${goodsId}${_query}`
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .share-btn-box {
    height: 30px;
    display: flex;
    align-items: center;
    margin-left: 10px;
    font-size: 12px;
    cursor: pointer;
    .share-icon {
      width: 22px;
      margin-right: 6px;
    }
  }
  .share-form {
    margin-top: 10px;
    display: flex;
    .text {
      width: 100px;
      line-height: 28px;
      margin: 0;
    }
    ::v-deep .el-input {
      width: 70%;
    }
  }
  .btn-box {
    text-align: center;
    margin-top: 10px;
  }
  .collect-goods-btn {
    font-size: 12px;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABrElEQVQ4T62TP0hcQRCHf7P7zk64BITEPliJtQQMCJaJpLjCRu723u6BMYgpgmArmkaCkCI7U5xw5StsgoJaXGMn6ZLiSJr8wSbkVeHgMLfhyT05L4cIuuWPmW/Yb2cJtzx0y35cARhjJrTWNQAPlVKJ934vG2CtLQF4DiAAOBCRRj74EuCcyxrjEAIT0ZcQwisAPwFERPSIiHa73W4EYJ2I9pl5KYNcAJxzkwAkTdPHSZL8zenW2n0iOmfmZ3lmjBnXWn9USs167z/ngOUQwqiIbPU7qdVqU51O53e9Xv/en8dxvEFEP0TkfQ54EUK4JyIbN5Fqrd0G8E1Edi4A1Wr1vtb6JE3TqSRJOtdBSqXSSLFY/EREM8x81i9xNbPPzK+vAzjn3gL4yszvLiX2Gsg5dxRC2BaRg2EQa60BsCAic/89YxYYY0a11odKqZfe+9MBcYtKqZV2uz3TaDT+DAVkYblcflAoFD4AWBOR4yyL43heKbUJ4Akz/+oHD13lSqUyFkVRBjnpFU8T0dPB5kEHV67ds/2GiLqtVmut2WyeD/Nyt5/pJks0WPMPjeaXEW5C95kAAAAASUVORK5CYII=");
    background-repeat: no-repeat;
    &.collected {
      font-size: 12px;
      background-repeat: no-repeat;
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABd0lEQVQ4T6WSPUvDcBDGn2uVxjRpQVqngqXJomBnaUEcHBXBTfFbuCouOjn7CURw081BN18KgksHoZg/aSeHikvTSrXJSVMT+pJKgzfey4977h7CP4P651nXYy1gkZjlGSEeCWCvzpnMbEuS5mXghQyj7eV9gKVpeyA6BhBzi8xlcpz9KebX72j0FMAqiCJg/gRwqAhx0m1zAVYut4NI5DxATRvMNojk4Rozb6tCXLiAhq6XCFgOcw5mLqlCFDxAnYBUKADwrhpGuidB025AtBYKwHynCrHSA+j6LoCzMABiPogLceR/oaFpV0S0OQmEmSuKEHkCvnwAp9NKM5F4AFH+LwgDH9O2XZBMs+K/sd8sliTdE7AQBGHAItsuKqZZHjGSl2ho2hwBtyBaGnApUI/a9rpsmk/9+QEr+5ukUqqVTF4TUfHXlc/U6WzEa7W34c0CAa6TdT3WZL4E4MSF2OoeLEjWWIALyWYlVKvOuOGRI07ywuGeH8P8iBFSzfHsAAAAAElFTkSuQmCC");
    }
  }
  .bread-nav-container {
    display: flex;
    justify-content: space-between;
    padding: 30px 0;
    color: #333333;
    font-weight: 400;
    .right-box {
      display: flex;
      align-items: center;
      .shop-name {
        margin-right: 20px;
        color: #666;
      }
      .icon-box {
        cursor: pointer;
        .iconfont {
          font-size: 16px;
          font-weight: 600;
          color: #409EFF;
        }
      }
    }
  }
  .left-nav {
    a:last-child {
      font-family: serif;
    }
  }
</style>
