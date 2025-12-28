<template>
  <div>
    <div class="distribution-content">
      <div class="table-box">
        <el-table :data="goodsList" >
          <el-table-column label="商品信息" align="center" width="520">
            <template slot-scope="scope">
              <div class="goods-info">
                <img :src="scope.row.small" alt="" class="goods-img">
                <div>
                  <p class="goods-name">{{scope.row.goods_name}}</p>
                  <p class="goods-price">
                    售价：<!-- {{scope.row.price | unitPrice}} --><en-price :price="scope.row.price" size="12" direction="row" />
                  </p>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="预计佣金" align="center">
            <template slot-scope="scope">
              <span class="distribution-price">
                <!-- {{ brokerage(scope.row.price, scope.row.ratio_lv1) | unitPrice }} -->
                <en-price :price="brokerage(scope.row.price, scope.row.ratio_lv1)" size="12" direction="row" />
              </span>
            </template>
          </el-table-column>
          <el-table-column label="分享商品" prop="number" align="center">
            <template slot-scope="scope">
              <el-button class="btn-item" size="small" @click="handleShareDialog(scope.row)">商品链接</el-button>
              <el-button class="btn-item" size="small" @click="handleShowPoster(scope.row)">生成海报</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-box" v-if="goodsList.length">
        <el-pagination
          @current-change="handleCurrentPageChange"
          :current-page.sync="params.page_no"
          :page-size="params.page_size"
          layout="total, prev, pager, next"
          :total="params.data_total">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="我的分享链接" :visible.sync="showShareDialog" width="35%">
      <div class="share-form">
        <p class="text">我的分享链接</p>
        <el-input v-model="shareUrl" size="mini"></el-input>
      </div>
      <div class="btn-box">
        <el-button
          type="primary"
          size="mini"
          v-clipboard:copy="shareUrl"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">复制到剪贴板</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="showPosterDialog" width="35%" class="poster-dialog">
      <div>
        <vue-canvas-poster :widthPixels="1000" :painting="painting" @success="success" @fail="fail"></vue-canvas-poster>
        <img :src="posterImg" style="width: 280px; height: 440px;"  />
        <div class="btn-box" @click="savePoster">点击保存</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Vue from 'vue'
import * as API_distribution from '@/api/distribution'
import VueClipboard from 'vue-clipboard2'
import { Dialog } from 'element-ui'
import vueCanvasPoster from 'vue-canvas-poster'
import * as API_Common from '@/api/common'

Vue.use(Dialog).use(VueClipboard).use(vueCanvasPoster)

export default {
  name: 'distributionGoods',
  head() {
    return {
      title: `分销商品-${this.site.title}`
    }
  },
  data() {
    return {
      open_i18n: process.env.I18N,
      // 商品列表
      goodsList: [],
      params: {
        page_no: 1,
        page_size: 10,
        data_total: 0
      },
      // 分享链接显隐
      showShareDialog: false,
      // 分享链接地址
      shareUrl: '',
      showPosterDialog: false,
      posterImg: '',
      painting: {
        width: '280px',
        height: '440px',
        borderRadius: '12px',
        background: '#fff',
        views: []
      }
    }
  },
  computed: {
    /** 预计佣金计算 */
    brokerage() {
      // 预计佣金为=商品价格 x 商品一级佣金比例
      return (price, ratio_lv1) => {
        return (price * (ratio_lv1 / 100)).toFixed(2)
      }
    }
  },
  mounted() {
    this.getDistributionGoods()
  },
  methods: {
    /** 复制成功 */
    onCopy(e) {
      this.$message.success('已复制')
    },
    success(src) {
      this.posterImg = src
    },
    fail(err) {
      alert(err)
    },

    /** 复制失败 */
    onError(e) {
      this.$message.error('无法复制文本')
    },
    /** 保存海报 */
    savePoster() {
      // 创建a标签
      let a = document.createElement('a')
      a.href = this.posterImg
      // 设置下载文件的名字
      a.download = '分销海报'
      // 点击事件
      a.click()
      this.$message.success('下载完成')
    },
    /** 分享海报 */
    async handleShowPoster(row) {
      if (row.small.indexOf('http://') !== -1) {
        // 解决图片跨域问题
        await API_Common.getBase64(row.small).then(base64 => {
          row.small = 'data:image/jpg;base64,' + base64
        })
        row.small = row.small.replace('http://', 'https://')
      }
      API_distribution.generateShortLink({ goods_id: row.goods_id}).then(response => {
        const _query = response.message.substring(response.message.indexOf('?'), response.message.length)
        this.painting.views = [
          {
            type: 'image',
            url: row.small,
            css: {
              top: '20px',
              left: '20px',
              right: '20px',
              width: '240px',
              height: '200px',
              mode: 'scaleToFill'
            }
          },
          {
            type: 'text',
            text: `${this.MixinUnitOfCurrency}${row.price}`,
            css: {
              maxLines: 1,
              top: '230px',
              left: '20px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#f42424'
            }
          },
          {
            type: 'text',
            text: row.goods_name,
            css: {
              width: '130px',
              maxLines: 3,
              top: '280px',
              left: '20px',
              fontSize: '14px',
              color: '#333'
            }
          },
          {
            type: 'qrcode',
            content: `${this.MixinDomain.buyer_wap}/goods-module/goods${_query}&goods_id=${row.goods_id}`,
            css: {
              top: '280px',
              right: '20px',
              color: '#000',
              width: '100px',
              height: '100px'
            }
          }
        ]
        this.showPosterDialog = true
      })
    },

    handleShareDialog(row) {
      API_distribution.generateShortLink({ goods_id: row.goods_id}).then(response => {
        const _query = response.message.substring(response.message.indexOf('?'), response.message.length)
        this.shareUrl = `${this.MixinDomain.buyer_pc}/goods/${row.goods_id}${_query}`
        this.showShareDialog = true
      })
    },
    handleCurrentPageChange(page) {
      this.params.page_no = page
      this.getDistributionGoods()
    },
    /** 获取团队列表 */
    getDistributionGoods() {
      API_distribution.getDistributionGoods(this.params).then(res => {
        this.goodsList = res.data
        this.params.data_total = res.data_total
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.distribution-content ::v-deep .el-table th.el-table__cell.is-leaf {
  border: none;
}
.distribution-content ::v-deep .el-table::before {
  background-color: #fff;
}
// TODO
.distribution-content ::v-deep .poster-dialog {
  .btn-box {
    margin-top: 20px;
    color: #fff;
    height: 40px;
    width: 280px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 600;
    background: #f42424;
    border-radius: 10px;
    cursor: pointer;
  }
  .el-dialog {
    background: rgba(0,0,0,.4);
    .el-dialog__body {
      display: flex;
      justify-content: center;
    }
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
    width: 80%;
  }
}
.btn-box {
  text-align: center;
  margin-top: 10px;
}
.distribution-content {
  border: 1px solid #e7e7e7;
  min-height: 600px;
  .table-box {
    // max-height: 530px;
    overflow: auto;
    .distribution-price {
      color: #4d37ff;
      font-size: 12px;
      font-weight: 500;
    }
    .btn-item {
      color: #fff;
      background-color: #4d37ff;
    }
    .goods-info {
      font-size: 12px;
      display: flex;
      text-align: left;
        .goods-img {
          width: 80px;
          height: 80px;
          margin-right: 10px;
        }
        .goods-name {
          color: #409EFF;
        }
        .goods-price {
          margin-top: 10px;
        }
    }
  }
  .pagination-box {
    text-align: right;
  }
}
</style>
