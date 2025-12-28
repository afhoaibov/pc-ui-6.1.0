<template>
  <div style="background-color: #fff;">
    <div class="content-goods-sku">
      <el-form :model="goodsInfo">
        <!--商品信息-->
        <div class="base-info-item goods-info">
          <h4>商品信息</h4>
          <div class="goods-info">
            <el-form-item label="商品名称：" class="goods-name-width">
              <span>{{ goodsInfo.goods_name }}</span>
            </el-form-item>
            <el-form-item label="商品图片：">
              <div
                v-for="gallery in goodsInfo.goods_gallery_list"
                :key="gallery.img_id"
                class="goods-image-list"
              >
                <img :src="gallery.thumbnail" alt="">
              </div>
            </el-form-item>
          </div>
        </div>
        <!--商品规格-->
        <div class="base-info-item" v-if="goodsInfo">
          <h4>商品规格</h4>
          <div>
            <el-form-item label="" label-width="120px" style="width: 90%;text-align: left;">
              <sku-editor
                ref="skuEditor"
                :goods-id="goodsId"
                :extended-params="skuEditorExtendedParams"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <div class="footer">
      <el-button type="primary" style="padding: 12px 40px;font-size: 15px;" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script>
import * as API_goods from '@/api/goods'
import { SkuEditor } from '@/components'
import { RegExp } from '~/ui-utils'

export default {
  name: 'goodsSku',
  components: {
    [SkuEditor.name]: SkuEditor
  },
  data() {
    return {
      goodsId: '',
      goodsInfo: {}
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'goodsSku') return
        this.goodsId = newVal.params.goodsid
        this.GET_GoodData()
      }
    }
  },
  computed: {
    skuEditorExtendedParams() {
      if (!this.goodsInfo.point_disable) return []
      return [
        {
          key: 'exchange_point',
          name: '积分',
          value: 0,
          type: 'Number',
          required: true,
          reg: RegExp.money,
          batch: true
        }
      ]
    }
  },
  methods: {
    // 保存
    async handleSave() {
      try {
        await this.$refs.skuEditor.submit()
        this.$message.success('保存成功！')
        setTimeout(() => {
          this.$store.dispatch('delCurrentViews', {
            view: this.$route,
            $router: this.$router
          })
          this.$router.push({ name: 'goodsList' })
        }, 1000)
      } catch (e) {
        //
      }
    },
    // 获取商品详情信息
    async GET_GoodData() {
      try {
        const res = await API_goods.getGoodData(this.goodsId)
        if (Array.isArray(res.goods_gallery_list)) {
          res.goods_gallery_list = res.goods_gallery_list.filter(item => (!item.gallery_type || item.gallery_type === 'GOODS'))
        }
        this.goodsInfo = res
      } catch (e) {
        //
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.content-goods-sku {
  border-bottom: 1px solid #dcdfe6;
  div.base-info-item > div {
    margin-left: 5%
  }
  div.base-info-item {
    h4 {
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }
    .el-form-item {
      width: 50%;
      display: flex;
      .goods-image-list {
        width: 148px;
        height: 148px;
        overflow: hidden;
        margin: 0 8px 8px 0;
        border-radius: 6px;
        border: 1px solid #c0ccda;
        box-sizing: border-box;
        display: inline-block;
        cursor: pointer;
        img {
          width: 148px;
          height: 148px;
        }
      }
    }
    .goods-info .el-form-item:before {
      content: "*";
      color: red;
      line-height: 2.4;
      margin: 0 5px;
    }
    ::v-deep .el-form-item__content {
      flex: 1;
      margin-left: 0 !important;
    }
  }
}
.footer {
  padding: 20px 0;
  text-align: center;
}
</style>
