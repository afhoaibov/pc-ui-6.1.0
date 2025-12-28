<template>
  <div>
    <ImportItem
      :uploadAction="MixinSpuImportApi"
      :importType="ImportModuleType.SpuImport"
    >
    <div slot="customizeTips">
      <p>
        <i class="el-icon-info" style="color: #ffc999; margin-right: 10px; font-size: 14px;" />
        请根据excel模板 实物商品模板：<a :href="`${MixinApi.seller}${this.spuTemplateUrl}`">[点击此处下载模板]</a>，虚拟商品模板：<a :href="`${MixinApi.seller}${this.virtualTemplateUrl}`">[点击此处下载模板]</a>填写信息，导入的excel大小限制为2M</p>
      <p  class="tips">
        其中“类目编码”请 <a href="javascript::" @click="downLoadCodeTable">[点击此处下载]</a>您店铺经营类目的编码表格
      </p>
    </div>
    </ImportItem>
  </div>
</template>
<script>

import ImportItem from '../components/ImportItem'
import { api } from '~/ui-domain'
import Storage from '@/utils/storage'

export default {
  name: 'spuImport',
  components: {
    ImportItem
  },
  data() {
    return {
      // 普通商品模版
      spuTemplateUrl: `/import-tpl/spu.xlsx`,
      // 虚拟商品模版
      virtualTemplateUrl: '/import-tpl/spu-virtual.xlsx',
      uploadCodeUrl: `/seller/goods/export/categories`,
      // 上传token
      headers: {
        Authorization: Storage.getItem('seller_access_token')
      }
    }
  },
  methods: {
    /** 类目表格下载 */
    downLoadCodeTable() {
      this.$http({
        method: 'get',
        url: `${api.seller}${this.uploadCodeUrl}`,
        headers: this.headers,
        responseType: 'blob' }).then((res) => {
        let url = window.URL.createObjectURL(res.data)
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('id', 'downloadLink')

        link.setAttribute('download', `类目编码`)
        document.body.appendChild(link)
        link.click()

        // 删除添加的a链接
        let objLink = document.getElementById('downloadLink')
        document.body.removeChild(objLink)
      })
    }
  }
}
</script>
<style scoped>
.tips {
  margin: 10px 0 10px 30px;
}
</style>
