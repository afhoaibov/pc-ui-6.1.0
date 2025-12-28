<template>
  <div id="shipping-address">
    <div class="member-nav">
      <ul class="member-nav-list">
        <li class="active">
          <router-link to="/member/shipping-address" style="color:#f42424;">收货地址</router-link>
        </li>
      </ul>
      <el-button size="mini" class="add-address-btn" @click="handleAddAddress($refs.addressForm)">添加地址</el-button>
    </div>
    <div class="address-list">
      <el-alert title="友情提示" type="warning" description="最多只能保存20个收货地址" close-text="我知道了" show-icon>
      </el-alert>
      <el-table :data="addressList" :header-cell-style="{ textAlign: 'center' }" cell-class-name="address-cell"
        style="width: 100%">
        <el-table-column prop="name" label="收货人" width="100" />
        <el-table-column label="所在地区" width="200" :formatter="areaFormatter" />
        <el-table-column prop="addr" label="详细地址" width="280" align="left" />
        <el-table-column prop="ship_address_name" label="地址别名" width="100" align="left" />
        <el-table-column prop="mobile" label="联系方式" width="120">
          <template slot-scope="scope">{{ scope.row.mobile | secrecyMobile }}</template>
        </el-table-column>
        <el-table-column label="默认" width="60">
          <template slot-scope="scope">{{ scope.row.def_addr ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleEaitAddress(scope.row, 2)">编辑</el-button>
            <el-button type="text" size="mini" class="delete-btn" @click="handleDeleteAddress(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <address-form-dialog
      ref="AddressFormDialog"
      :addressForm="addressForm"
      :regions="defaultRegion"
      @region-change="handleRegionChange"
    />
  </div>
</template>

<script>
import addressMixin from '@/utils/addressMixin'
import { AddressFormDialog } from '@/components'

export default {
  name: 'shipping-address',
  mixins: [addressMixin],
  components: { AddressFormDialog },
  head() {
    return {
      title: `收货地址-${this.site.title}`
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../assets/styles/color" as theme;

.add-address-btn {
  position: absolute;
  top: 0;
  right: 0;
}

.address-list {
  ::v-deep .el-alert {
    margin: 10px 0
  }

  ::v-deep .delete-btn {
    color: theme.$color-main
  }

  ::v-deep .address-cell {
    text-align: center;
  }
}

</style>
