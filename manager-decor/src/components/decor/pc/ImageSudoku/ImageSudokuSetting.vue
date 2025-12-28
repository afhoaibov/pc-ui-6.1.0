<template>
  <div v-if="$$FormData.columnList.length" class="image-sudoku-setting">
    <div class="item-setting">
      <div class="body-setting">
        <div class="body-setting__tip">
          选择对应的列，进行详细设置
        </div>
        <div class="block-list">
          <div
            v-for="(item, index) in $$FormData.columnList"
            :key="index"
            class="block-item"
            :style="{
              width: 348 / $$FormData.columnList.length + 'px'
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
          <el-select v-model="curColumn.type" @change="handleTypeChange">
            <el-option label="单图" :value="1"/>
            <el-option label="双图" :value="2"/>
          </el-select>
        </div>
      </div>
      <div v-for="(block, index) in curColumn.blockList" :key="index" class="body-setting">
        <div class="body-setting__tip">
          <span v-if="curColumn.type === 2" style="color:red;">区块{{ index + 1 }}：</span>
           建议选择{{ curColumn.type === 2 ? '100x100' : '295x370' }}分辨率或同等比例的图片
        </div>
        <image-link-editor
          v-if="curColumn.type === 2"
          v-model="block.head"
          :multiple="false"
          :show-image="false"
          title-placeholder="建议不超过4个字"
          show-sub-title
          sub-title-placeholder="建议不超过10个字"
        />
        <div v-if="curColumn.type === 2" style="height:10px"/>
        <image-link-editor
          v-model="block.images"
          :limit="curColumn.type"
          :show-title="false"
          add-text="添加图片"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSudokuSetting',
  data() {
    return {
      current: 0,
    }
  },
  computed: {
    curColumn() {
      return this.$$FormData.columnList[this.current]
    }
  },
  mounted() {
    const { columnList } = this.$$FormData
    if (columnList.length === 0) {
      this.$$FormData.columnList = this.makeEmptyColumns()
    }
  },
  methods: {
    /**
     * 制作空列
     * @param num
     * @returns {{blockList, type: number}[]}
     */
    makeEmptyColumns(num = 4) {
      return [...new Array(num)].map((_, index) => {
        const num = index > 1 ? 2 : 1
        return {
          type: num,
          blockList: [...new Array(num)].map(() => this.handleMakeBlock(num))
        }
      })
    },
    /**
     * 列类型发生变化
     * @param type
     */
    handleTypeChange(type) {
      if (this.curColumn) {
        this.curColumn.blockList = [...new Array(type)].map(() => this.handleMakeBlock(type))
      }
    },
    /**
     * 制作空块
     */
    handleMakeBlock(num) {
      return {
        head: {
          link: '',
          title: '',
          sub_title: ''
        },
        images: [...new Array(num)].map(() => ({
          __key: this.$$Foundation.uuid(),
          link: '',
          image: ''
        }))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.image-sudoku-setting {
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
</style>
