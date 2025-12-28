<template>
   <el-select :value="areaLabel_n" @change="selectChanged">
    <el-input class="search" v-model="keywords" />
    <el-option
      v-for="(item, index) in filterCodes"
      :key="index" :label="'+' + `${item.tel}`"
      :value="index">
      <div class="areal-item">
        <img class="flag" :src="'data:image/png;base64,' + `${item.flag}`" alt="">
        {{ item.name }}
        <span class="mt" v-if="item.mt">({{ item.mt }})</span>
        <span class="code">+{{ item.tel }}</span>
      </div>
    </el-option>
    <el-option label="-------------------------------暂无更多-------------------------------" value="0" disabled></el-option>
  </el-select>
</template>
<script>
import Vue from 'vue'
import { Select, Option, Input } from 'element-ui'

Vue.use(Select).use(Option).use(Input)

export default {
  name: 'SelectItem',
  props: ['areaLabel_n', 'areaCodesList'],
  data() {
    return {
      // 区号本地检索
      keywords: ''
    }
  },
  computed: {
    filterCodes() {
      const keywords = this.keywords
      return this.areaCodesList.filter((item) => {
        if (item.name.indexOf(keywords) > -1 || item.tel.indexOf(keywords) > -1) {
          return item
        }
      })
    }
  },
  methods: {
    selectChanged(e) {
      const countryInfo = this.filterCodes[e]
      this.$emit('selectChanged', countryInfo)
    }
  }
}
</script>
<style type="text/scss" lang="scss" scoped>
.areal-item {
  display: flex;
  align-items: center;

  .flag {
    width: 20px;
    margin-right: 10px;
  }

  .code {
    margin-left: 8px;
    font-size: 13px;
    color: #999;
  }

  .mt {
    margin-left: 4px;
  }
}

.search {
  display: block;
  width: 95%;
  margin: 5px auto;
}
</style>
