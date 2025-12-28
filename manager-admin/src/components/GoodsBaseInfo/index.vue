<template>
  <div v-loading="loading" class="goods-info-wrap">
    <div class="float-tab-content">
      <p :class="[{ 'active-tab': floatTabIndex === index }, 'btn-item']" v-for="(item, index) of floatTab" :key="index"
        @click="changePosition(item, index)">{{ item.name }}</p>
    </div>
    <div class="content-box" ref="goodsInfoWrap">
      <el-row :gutter="0">
        <el-col :span="24">
          <div class="d-header" ref="baseInfo">基本信息</div>
          <div class="d-content">
            <div class="item">
              <span class="item-label">商品分类：</span>
              <span class="item-value" v-html="goodsDetail.category_name"></span>
            </div>
            <div class="item">
              <span class="item-label">店铺分组：</span>
              <span class="item-value">{{ goodsGroup }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品品牌：</span>
              <span class="item-value">{{ brand }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品类型：</span>
              <span class="item-value">{{ goodsDetail.goods_type == 'VIRTUAL' ? '虚拟商品' : '普通商品' }}</span>
            </div>
            <div class="item" v-if="goodsDetail.goods_type == 'VIRTUAL'">
              <span class="item-label">虚拟商品失效天数：</span>
              <span class="item-value">{{ goodsDetail.expired_date }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="24">
          <div class="d-header" ref="goodsInfo">商品信息</div>
          <div class="d-content">
            <div class="item">
              <span class="item-label">商品名称：</span>
              <span class="item-value">{{ goodsDetail.goods_name }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品编号：</span>
              <span class="item-value">
                <clipboard :text="goodsDetail.sn" />
              </span>
            </div>
            <div class="item">
              <span class="item-label">市场价格：</span>
              <span class="item-value">{{ goodsDetail.mktprice }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品价格：</span>
              <span class="item-value">{{ goodsDetail.price }}</span>
            </div>
            <div class="item">
              <span class="item-label">成本价格：</span>
              <span class="item-value">{{ goodsDetail.cost }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品重量：</span>
              <span class="item-value">{{ goodsDetail.weight }}kg</span>
            </div>
            <div class="item">
              <span class="item-label">积分兑换：</span>
              <span class="item-value">{{ goodsDetail.point_disable ? '是' : '否' }}</span>
            </div>
            <div class="item" v-if="goodsDetail.point_disable">
              <span class="item-label">兑换所需积分：</span>
              <span class="item-value">{{ goodsDetail.exchange_point }}</span>
            </div>
            <div class="item">
              <span class="item-label">商品图片：</span>
              <div class="image-box">
                <img class="goods-image" :src="item.original" alt="" v-for="item in goodsDetail.goods_gallery_list">
              </div>
            </div>
            <div class="item">
              <span class="item-label">商品视频：</span>
              <video :src="goodsDetail.goods_video" v-if="goodsDetail.goods_video" class="video-avatar" :autoplay="false"
                controls>
                您的浏览器不支持视频播放
              </video>
              <span v-else class="item-value">未上传商品视频</span>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="24">
          <div class="d-header" ref="logistics">物流/其他</div>
          <div class="d-content">
            <div class="item">
              <span class="item-label">运费模板：</span>
              <span class="item-value" v-if="selectTemplate">{{ selectTemplate.name }}</span>
            </div>
            <!-- 运费模板详情 -->
            <el-table border v-if="selectTemplate.items && selectTemplate.items.length && Number(goodsDetail.template_id)"
              :header-cell-style="rowClass" :data="selectTemplate.items" style="width: 80%; margin-left: 120px;">
              <!--计费区域-->
              <el-table-column label="计费区域" align="left">
                <template slot-scope="scope">
                  <div>
                    <span v-for="(item, index) in scope.row.regions" :key="index">
                      <span style="color: #333;"> {{ item.name }}
                        <span v-if="++index !== scope.row.regions.length">、</span>
                      </span>
                      <span v-if="item.children" style="color: #777;">
                        <span style="color: #aaa;">(</span>
                        <span v-for="(child, _index) in item.children" style="color: #aaa;" :key="_index">
                          {{ child.name }}<span v-if="++_index !== item.children.length">,</span>
                        </span>
                        <span style="color: #aaa;">)</span>
                      </span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!--首重（kg）-->
              <el-table-column prop="first_company" :label="selectTemplate.type === 1 ? '首重（kg）' : '首件（个）'" />
              <el-table-column label="运费">
                <template slot-scope="scope">
                  <span>{{ scope.row.first_price | unitPrice }}</span>
                </template>
              </el-table-column>
              <!--续重（kg）-->
              <el-table-column prop="continued_company" :label="selectTemplate.type === 1 ? '续重（kg）' : '续件（个）'" />
              <el-table-column label="续费">
                <template slot-scope="scope">
                  <span>{{ scope.row.continued_price | unitPrice }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="0" v-for="item in goodsParams" :key="item.param_id">
        <el-col :span="24">
          <div class="d-header" :ref="`params${item.group_id}`">{{ item.group_name }}</div>
          <div class="d-content">
            <div class="item" v-for="child in item.params">
              <span class="item-label">{{ child.param_name }}：</span>
              <span class="item-value">{{ child.param_value }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="24">
          <div class="d-header" ref="detail">商品详情</div>
          <div class="d-content">
            <div class="item">
              <span class="item-label">商品描述：</span>
              <div class="item-value" v-html="goodsDetail.intro"></div>
            </div>
            <div class="item">
              <span class="item-label">移动端描述：</span>
              <div class="item-value mobile-intro" v-if="goodsDetail.intro_list && goodsDetail.intro_list.length">
                <template v-for="item in goodsDetail.intro_list">
                  <p v-if="item.type === 'text'">{{item.content}}</p>
                  <img class="goods-image" v-if="item.type === 'image'" :src="item.content" alt="" />
                  <video class="goods-image" controls="controls" v-if="item.type === 'video'" :src="item.content" alt="" />
                </template>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="translation-btn">
      <el-dropdown size="medium" trigger="click" @command="dropdownEvent">
        <el-button type="primary">
          <i class="el-icon-arrow-up el-icon--left"></i>
          管理
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="soldOut">{{ goodsDetail.market_enable === 0 ? '上架' : '下架' }}商品</el-dropdown-item>
          <el-dropdown-item>
            <a :href="`${MixinBuyerDomain}/goods/${goodsDetail.goods_id}`" target="_blank">浏览商品</a>
          </el-dropdown-item>
          <el-dropdown-item command="retranslation" v-if="open_i18n">重新翻译</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

  </div>
</template>

<script>
import * as API_goods from '@/api/goods'
import * as API_Category from '@/api/category'
import * as API_dictionary from '@/api/dictionary'

export default {
  name: 'GoodsBaseInfo',
  props: {
    goodsId: {
      type: String,
      default: ''
    },
    sellerId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      // 商品详情数据
      goodsDetail: {},
      // 商品分组
      goodsGroup: '',
      // 品牌
      brand: '',
      // 运费模板
      selectTemplate: {},
      goodsParams: [],
      floatTab: [],
      floatTabIndex: 0,
      open_i18n: process.env.I18N
    }
  },
  watch: {
    goodsId: {
      handler(value) {
        this.loading = true
        this.floatTabIndex = 0
        if (value) {
          this.floatTab = [
            { name: '基本信息', type: 'baseInfo' },
            { name: '商品信息', type: 'goodsInfo' },
            { name: '物流/其他', type: 'logistics' },
            { name: '商品详情', type: 'detail' }
          ]
          this.getGoodsDetail()
        }
      },
      immediate: true
    }
  },
  filters: {
    secrecyMobile(mobile) {
      mobile = String(mobile)
      if (!/\d{11}/.test(mobile)) {
        return mobile
      }
      return mobile
    }
  },

  methods: {
    /** 管理操作 */
    dropdownEvent(command) {
      if (command === 'soldOut') {
        this.handleOperateGoods()
      } else if (command === 'retranslation') {
        this.handleRetranslation()
      }
    },

    /** 重新翻译商品 */
    handleRetranslation() {
      API_dictionary.retranslateGoods({ goods_id: this.goodsDetail.goods_id }).then(res => {
        this.$message.success('重新翻译操作成功！')
      })
    },

    /** 上下架处理 */
    handleOperateGoods() {
      const { market_enable, goods_id } = this.goodsDetail
      if (market_enable === 0) {
        this.$confirm('确定要上架这个商品吗？', '提示', { type: 'warning' }).then(() => {
          API_goods.goodsBatchUp(goods_id).then(response => {
            this.goodsDetail.market_enable = 1
            this.$message.success('上架商品成功！')
          })
        }).catch(() => { })
      } else {
        this.$prompt('请输入下架原因, 200字符以内', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (val) => {
            if (val.length > 200) {
              return '下架原因最多200个字符'
            }
            return true
          },
          inputPattern: /.+/,
          inputErrorMessage: '请填写下架原因！'
        }).then(({ value }) => {
          API_goods.goodsBatchUnder(goods_id, { reason: value }).then(() => {
            this.goodsDetail.market_enable = 0
            this.$message.success('下架商品成功！')
          })
        }).catch(() => { })
      }
    },
    /** 切换滑动距离 */
    changePosition(item, index) {
      if (index === this.floatTabIndex) return
      this.floatTabIndex = index
      this.$refs.goodsInfoWrap.scroll({ top: item.top, behavior: 'smooth' })
    },
    rowClass({ rowIndex }) {
      if (rowIndex === 0) {
        return { background: '#ededed', textAlign: 'center' }
      }
    },

    /** 查询商品详情 */
    getGoodsDetail() {
      API_goods.getGoodsDetail(this.goodsId).then(res => {
        this.loading = false
        this.goodsDetail = res
        if (res.shop_cat_id) {
          this.getGoodsCategoryList()
        }
        if (res.brand_id) {
          this.getGoodsBrandList()
        }
        if (Number(res.template_id)) {
          this.getTplList()
        } else {
          this.selectTemplate = {
            name: '包邮'
          }
        }
        this.getEditGoodsParams()
      }).catch(() => {
        this.loading = false
      })
    },
    /** 获取店铺分组数据 */
    getGoodsCategoryList() {
      API_goods.getGoodsCategoryList(this.sellerId).then(res => {
        let goodsGroup = ''
        res.forEach(item => {
          if (item.shop_cat_id === this.goodsDetail.shop_cat_id) {
            goodsGroup = item.shop_cat_name
            return
          }
          item.children && item.children.forEach(child => {
            if (child.shop_cat_id === this.goodsDetail.shop_cat_id) {
              goodsGroup = `${item.shop_cat_name}/${child.shop_cat_name}`
              return
            }
          })
        })
        this.goodsGroup = goodsGroup
      })
    },
    /** 查询商品品牌列表 */
    getGoodsBrandList() {
      const goodsDetail = this.goodsDetail
      API_Category.getBrandByCategoryId(goodsDetail.category_id).then(response => {
        const item = response.find(item => { return goodsDetail.brand_id === item.id })
        this.brand = item ? item.text : ''
      })
    },
    /** 获取运费模板数据 */
    getTplList() {
      API_goods.getTplList(this.goodsDetail.template_id).then(res => {
        this.selectTemplate = res
      })
    },
    /** 处理锚点跳转按钮 */
    handleFloatTab() {
      const data = []
      this.goodsParams.forEach(item => {
        data.push({
          name: item.group_name,
          type: `params${item.group_id}`
        })
      })
      this.floatTab.splice(3, 0, ...data)
      this.$refs.goodsInfoWrap.scrollTop = 0
      this.$nextTick(() => {
        this.floatTab.map(item => {
          if (Array.isArray(this.$refs[`${item.type}`])) {
            const top = this.$refs[`${item.type}`][0].getBoundingClientRect().top - 60
            item.top = top > 0 ? top : 0
          } else {
            const top = this.$refs[`${item.type}`].getBoundingClientRect().top - 60
            item.top = top > 0 ? top : 0
          }
        })
      })
    },
    /** 商品参数获取 */
    getEditGoodsParams() {
      API_goods.getEditGoodsParams(this.goodsDetail.category_id, this.goodsId).then(res => {
        this.goodsParams = res
        this.handleFloatTab()
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.goods-info-wrap {
  // padding-bottom: 30px;
  position: relative;
  height: 100%;

  .content-box {
    height: calc(100% - 72px);
    overflow: auto;
  }

  .translation-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    padding: 20px;
    // margin-top: 30px;
    background: #F5F7FA;
  }

  .float-tab-content {
    position: fixed;
    background: #fff;
    min-width: 72px;
    max-width: 100px;
    right: 45%;
    top: 0;
    border-radius: 0 0 0 4px;
    padding: 20px 10px;
    font-size: 14px;
    color: #7d8089;
    box-shadow: -2px 0 4px 0 rgba(0, 0, 0, .1);

    .active-tab {
      color: #000;
    }

    .btn-item {
      margin: 0;
      padding: 10px 0;
      margin-bottom: 10px;
      text-align: center;
      cursor: pointer;
    }
  }
}

.d-header {
  padding: 10px 0 10px 20px;
  font-size: 14px;
  color: #333;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e1e8ed;

  &h2 {
    font-size: 14px;
    font-weight: 400;
  }
}

.item {
  width: 100%;
  position: relative;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding: 16px 0 16px 20px;
  line-height: 24px;
  white-space: nowrap;

  & .item-label {
    float: left;
    margin-right: 20px;
    font-size: 14px;
    color: #999;
  }

  & .item-value {
    overflow: hidden;
    white-space: normal;
    word-break: break-all;
    font-size: 14px;
    color: #666;

    ::v-deep img {
      width: 100%;
    }
  }
}

.video-avatar {
  width: 80%;
}

.mobile-intro {
  border: 1px solid #efefef;
  width: 50%;
  min-height: 600px;
  padding: 20px;

  .goods-image {
    max-width: 80%;
  }
}

.image-box {
  display: flex;
  flex-wrap: wrap;

  .goods-image {
    width: 180px;
    height: 180px;
    margin: 0 10px 10px 0;
  }
}
</style>

