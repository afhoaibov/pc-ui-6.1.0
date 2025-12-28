<template>
  <div v-if="$$FormData.blockList.length" class="magic-cube-setting">
    <div class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">选择列数</div>
        <div class="header-setting__value">
          <el-select v-model="rowNum">
            <el-option label="两列" :value="2"/>
            <el-option label="四列" :value="4"/>
          </el-select>
        </div>
      </div>
      <div class="body-setting">
        <div class="body-setting__tip">
          选择对应的列，进行详细设置
        </div>
        <div class="block-list">
          <div
            v-for="(item, index) in $$FormData.blockList"
            :key="index"
            class="block-item"
            :style="{
              width: 348 / $$FormData.blockList.length + 'px'
            }"
            :class="{active: current === index}"
            @click="current = index"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>
    <div class="item-setting">
      <!-- 选择列类型 -->
      <div class="header-setting">
        <div class="header-setting__label">选择列类型</div>
        <div class="header-setting__value">
          <el-select v-model="$$FormData.blockList[current].type" @change="handleTypeChange">
            <el-option
              v-for="item in blockTypeOptions"
              :key="item.value"
              :disabled="item.row_num !== rowNum"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <!-- 选择显示类型 -->
      <div v-if="curShowTypeOptions" class="header-setting">
        <div class="header-setting__label">选择显示类型</div>
        <div class="header-setting__value">
          <el-select v-model="curBlock.show_type" @change="handleShowTypeChange">
            <el-option
              v-for="item in curShowTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div v-if="curBlock.type === 'special-offer' || curBlock.show_type === 'tab'" class="header-setting tab">
        <div class="header-setting__label">选项卡</div>
        <div class="header-setting__value">
          <el-tag
            v-for="(tab, t_index) in curBlock.tabList"
            :key="t_index"
            closable
            effect="plain"
            :disable-transitions="false"
            :type="cur_tab_index === t_index ? 'danger' : ''"
            @close="handleEditTab(tab, t_index)"
            @click="handleClickTab(tab, t_index)"
          >{{ tab.name }}
          </el-tag>
          <template>
            <el-input
              class="input-new-tab"
              v-if="show_tab_input"
              v-model="tab_input_value"
              ref="tabInput"
              size="small"
              maxlength="2"
              @keyup.enter.native="handleInputTabConfirm"
              @blur="handleInputTabConfirm"
            >
            </el-input>
            <el-button
              v-else-if="curBlock.tabList.length < (curBlock.type === 'goods' ? 4 : 5)"
              class="button-new-tab" size="mini"
              @click="showTabInput"
            >+ 新选项
            </el-button>
          </template>
        </div>
      </div>
      <div v-if="curBlock" class="body-setting" :class="curBlock.type">
        <div v-if="curBlock.type === 'goods' || curBlock.type === 'special-offer'" class="goods">
          <div class="goods-setting-selector">
            <span v-if="curBlock.show_type === 'tab'" class="goods-title">选择一个选项卡添加商品(建议添加三个)</span>
            <span v-if="curBlock.type === 'special-offer'" class="goods-title">选择一个选项卡添加商品(建议添加五个)</span>
            <span v-else class="goods-title">添加商品(建议添加三个以上)</span>
            <draggable
              v-if="Array.isArray(curGoodsList)"
              v-bind="{sort: true}"
              :list="curGoodsList"
              prevent-on-filter
              animation="200"
              filter=".ignore-drag"
              class="goods-list"
            >
              <transition-group>
                <div v-for="item in curGoodsList" :key="item.goods_id" class="item-goods">
                  <img :src="item.goods_image" :alt="item.goods_name" class="goods-img"/>
                  <i class="ri-close-circle-fill del-icon" @click="handleDeleteGoods(item)"></i>
                </div>
                <div class="item-goods add ignore-drag" key="add-goods" @click="handleAddGoods">
                  <i class="ri-add-line"></i>
                </div>
              </transition-group>
            </draggable>
            <en-goods-picker
              v-if="Array.isArray(curGoodsList)"
							:lang="currentLang.code"
              :type="$$DecorType"
              :show="show_goods_picker"
              :default-data="curGoodsList.map(item => item.goods_id)"
              :limit="goods_picker_limit"
              @confirm="handleGoodsPickerConfirm"
              @close="show_goods_picker = false"
            />
          </div>
        </div>
        <div v-if="curBlock.type === 'shop'" class="shop">
          <div class="goods-setting-selector">
            <span class="goods-title">添加店铺(建议添加两个)</span>
            <draggable
              v-if="Array.isArray(curBlock.shopList)"
              v-bind="{sort: true}"
              :list="curBlock.shopList"
              prevent-on-filter
              animation="200"
              filter=".ignore-drag"
              class="goods-list"
            >
              <transition-group>
                <div v-for="item in curBlock.shopList" :key="item['shop_id']" class="item-goods">
                  <img :src="item['shop_logo']" :alt="item['shop_name']" class="goods-img"/>
                  <i class="ri-close-circle-fill del-icon" @click="handleDeleteShop(item)"></i>
                </div>
                <div class="item-goods add ignore-drag" key="add-goods" @click="handleAddShop">
                  <i class="ri-add-line"></i>
                </div>
              </transition-group>
            </draggable>
            <en-shop-picker
              :show.sync="show_shop_picker"
              :buyer-domain="$$Domain['buyer_pc']"
              :request="$$Request"
              :limit="2"
              @confirm="handleShopPickerConfirm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义标题 -->
    <div v-if="curBlock.type" class="item-setting">
      <div class="header-setting">
        <div class="header-setting__label">自定义标题</div>
        <div class="header-setting__value">
          <el-input v-model="curBlock.title" placeholder="请输入标题" maxlength="6"/>
        </div>
      </div>
      <div class="header-setting">
        <div class="header-setting__label">标题链接</div>
        <div class="header-setting__value">
          <link-selector v-model="curBlock.title_link" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import { decorType } from '@/utils/decor-types'
import { mapGetters } from 'vuex'

export default {
  name: 'MagicCubeSetting',
  components: { Draggable },
  data() {
    return {
      current: 0,
      show_goods_picker: false,
      cur_tab_index: 0,
      show_shop_picker: false,
      show_tab_input: false,
      tab_input_value: '',
      typeOptions: [
        { label: '每日特价', value: 'special-offer', row_num: 2 },
        {
          label: '商品', value: 'goods', row_num: 4, showTypeOptions: [
            { label: '轮播缩放', value: 'slider' },
            { label: '选项卡', value: 'tab' },
          ]
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['currentLang']),
    blockTypeOptions() {
      return this.typeOptions.filter(item => item.row_num === this.rowNum)
    },
    // 当前操作的block
    curBlock() {
      return this.$$FormData.blockList[this.current]
    },
    // 当前操作的商品列表
    curGoodsList: {
      get() {
        const { type, show_type, goodsList, tabList } = this.curBlock
        if (show_type === 'slider') return goodsList;
        if (!tabList.length) return ''
        if (type === 'special-offer' || show_type === 'tab') return tabList[this.cur_tab_index] ? tabList[this.cur_tab_index].goodsList : []
        return ''
      },
      set(newVal) {
        const { type, show_type } = this.curBlock
        if (show_type === 'slider') {
          this.curBlock.goodsList = newVal
        }
        if (type === 'special-offer' || show_type === 'tab') {
          this.$set(this.curBlock.tabList[this.cur_tab_index], 'goodsList', newVal)
        }
      }
    },
    // 当前操作的block的显示类型选项
    curShowTypeOptions() {
      const { type } = this.curBlock
      if (!type) return null
      const types = this.typeOptions.filter(item => item.value === type)
      return types[0] ? types[0]['showTypeOptions'] : null
    },
    rowNum: {
      get() {
        return this.$$FormData.blockList.length
      },
      set(newVal) {
        this.$$FormData.blockList = this.makeEmptyBlocks(newVal)
        this.current = 0
      }
    },
    // 商品选择器最大可选个数
    goods_picker_limit() {
      const { type, show_type } = this.curBlock
      if (type === 'special-offer') return 5
      if (show_type === 'tab') return 3
      return -1
    }
  },
  mounted() {
    const { blockList } = this.$$FormData
    if (blockList.length === 0) {
      this.$$FormData.blockList = this.makeEmptyBlocks(2)
    }
    if (decorType === 'admin') {
      this.typeOptions.push({ label: '店铺', value: 'shop', row_num: 4 })
    }
  },
  methods: {
    // 制作空block
    makeEmptyBlocks(num) {
      return [...new Array(num)].map(() => ({
        type: '',
        show_type: '',
        title: '',
        title_link: '',
        goodsList: [],
        tabList: [],
        shopList: []
      }))
    },
    /**
     * 商品选择器确认
     * @param items
     */
    handleGoodsPickerConfirm(items) {
      this.curGoodsList = this.$$Foundation.cloneDeep(items)
    },
    /**
     * 删除商品
     * @param item
     */
    handleDeleteGoods(item) {
      const index = this.curGoodsList.findIndex(_item => _item.goods_id === item.goods_id)
      this.curGoodsList.splice(index, 1)
    },
    /**
     * 添加商品
     */
    handleAddGoods() {
      this.show_goods_picker = true
    },
    /**
     * block类型发生改变
     * @param type
     */
    handleTypeChange(type) {
      const typeOption = this.blockTypeOptions.filter(item => item.value === type)[0]
      this.curBlock.title = typeOption.label
      if (typeOption.showTypeOptions) {
        this.curBlock.show_type = typeOption.showTypeOptions[0].value
      }
      if (type === 'shop') this.curBlock.shopList = []
      if (type === 'special-offer') this.curBlock.tabList = ['美食', '手机', '化妆'].map(item => ({name: item, goodsList: []}))
    },
    /**
     * block显示类型发生改变
     * @param show_type
     */
    handleShowTypeChange(show_type) {
      if (show_type === 'slider') this.curBlock.goodsList = []
      if (show_type === 'tab') this.curBlock.tabList = ['一', '二', '三', '四'].map(item => ({
        name: `选项卡${item}`,
        goodsList: []
      }))
      if (show_type === 'shop') this.curBlock.shopList = []
    },
    /**
     * 编辑选项卡
     * @param tab
     * @param index
     */
    async handleEditTab(tab, index) {
      this.$prompt('输入选项卡名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '删除',
        cancelButtonClass: 'el-button--danger',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValue: tab.name,
        inputPlaceholder: '输入选项卡名称',
        distinguishCancelAndClose: true,
        inputValidator: (val) => val.length > 0 && val.length <= 4,
        inputErrorMessage: '请输入1~4个字符'
      }).then(res => {
        tab.name = res.value
      }).catch(err => {
        if (err !== 'cancel') return
        this.curBlock.tabList.splice(index, 1)
        this.cur_tab_index = 0
      })
    },
    /**
     * 点击了选项卡
     * @param tab
     * @param index
     */
    handleClickTab(tab, index) {
      this.cur_tab_index = index
      if (!window.$$HomeRefs) return
      const previewRef = window.$$HomeRefs[`preview_${this.activated}`][0]
      if (!previewRef) return
      previewRef.tabsIndex[this.current] = index;
    },
    /**
     * 选项卡输入完成
     */
    handleInputTabConfirm() {
      this.show_tab_input = false
      if (!this.tab_input_value) return
      this.curBlock.tabList.push({
        name: this.tab_input_value,
        goodsList: []
      })
      this.tab_input_value = ''
    },
    /**
     * 显示选项卡输入框
     */
    showTabInput() {
      this.show_tab_input = true
      this.$nextTick(() => {
        this.$refs['tabInput'].$refs.input.focus()
      })
    },
    /**
     * 删除店铺
     * @param item
     */
    handleDeleteShop(item) {
      const index = this.curBlock.shopList.findIndex(_item => _item['shop_id'] === item['shop_id'])
      this.curBlock.shopList.splice(index, 1)
    },
    /**
     * 添加店铺
     */
    handleAddShop() {
      this.show_shop_picker = true
    },
    handleShopPickerConfirm(items) {
      this.curBlock.shopList = this.$$Foundation.cloneDeep(items)
    }
  }
}
</script>

<style lang="scss" scoped>
.body-setting {
  &.goods,
  &.shop,
  &.special-offer {
    padding: 0;
  }
}

.magic-cube-setting {
  .block-list {
    clear: both;
    overflow: hidden;

    .block-item {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      float: left;
      height: 98px;
      border: 1px solid #e5e5e5;
      box-sizing: border-box;
      cursor: pointer;
      font-size: 12px;
      color: #666666;

      &:not(:first-child) {
        margin-left: -1px;
      }

      &.active {
        background-color: #e0edff;
        border-color: #155bd4;
        z-index: 3;
      }
    }
  }
}

.goods-setting-selector {
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: #ffffff;

  .goods-title {
    width: 100%;
    height: 30px;
    font-size: 14px;
    color: #969799;
    line-height: 18px;
    white-space: nowrap;
  }

  .goods-list {
    padding: 12px 16px;
    background-color: #f7f8fa;
    box-sizing: border-box;

    & > span {
      display: flex;
      flex-wrap: wrap;
    }

    .item-goods {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      padding: 0;
      margin: 5px 10px 5px 0;
      border: none;
      box-shadow: 0 0 4px 0 rgba(10, 42, 97, 0.2);
      color: #155bd4;
      font-size: 14px;
      background-color: #ffffff;
      border-radius: 2px;
      cursor: move;

      &.add {
        cursor: pointer;
      }

      &:hover {
        .del-icon {
          display: block;
        }

        &:not(.add)::after {
          display: block;
        }
      }

      &::after {
        display: none;
        content: "";
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid #155bd4;
        border-radius: 2px;
        z-index: 1;
        pointer-events: none;
      }

      .goods-img {
        display: block;
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
      }

      .del-icon {
        display: none;
        position: absolute;
        z-index: 2;
        top: -10px;
        right: -10px;
        border-radius: 50%;
        color: #bbbbbb;
        font-size: 20px;
        background-color: #ffffff;
        line-height: normal;
        cursor: pointer;
      }
    }
  }
}

.header-setting.tab {
  ::v-deep .el-tag + .input-new-tab,
  ::v-deep .el-tag + .button--new-tab {
    margin-left: 5px;
  }
  ::v-deep .input-new-tab {
    width: 80px;
    margin-bottom: 5px;
    .el-input__inner {
      height: 24px;
      line-height: 24px;
    }
  }

  ::v-deep .button-new-tab {
    padding: 5px 10px;
    margin-left: 5px;
    margin-bottom: 5px;
  }

  ::v-deep .el-tag {
    overflow: hidden;
    margin-bottom: 5px;
    cursor: pointer;
    padding: 0 6px;
    & + .el-tag {
      margin-left: 5px;
    }
    &:nth-child(2n) {
      margin-left: 4px;
    }
    .el-icon-close::before {
      content: "\e78c";
    }
  }
}

</style>
