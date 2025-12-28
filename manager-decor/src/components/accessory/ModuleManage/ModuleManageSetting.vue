<template>
  <div class="module-manage">
    <div v-if="previews.length" class="module-manage__list">
      <div class="module-manage__clear">
        <el-popconfirm
          confirm-button-text='确定'
          cancel-button-text='取消'
          icon="el-icon-info"
          icon-color="red"
          title="确定要清除所有模块吗？"
          @confirm="handleClearPreview"
        >
          <el-button type="text" slot="reference">清除模块</el-button>
        </el-popconfirm>
      </div>
      <draggable v-model="previews" v-bind="dragOption">
        <div
          v-for="item in previews"
          :key="item.__key"
          class="module-manage__item"
          :class="{hover: $store.state.hoverKey === item.__key}"
          @mouseenter="$store.dispatch('setPreviewItemHoverAction', item.__key)"
          @mouseleave="$store.dispatch('setPreviewItemHoverAction', '')"
        >
          <i class="ri-menu-line"></i>
          <div class="module-manage__item-name">{{ item.label.title }}</div>
          <el-popconfirm
            confirm-button-text='确定'
            cancel-button-text='取消'
            icon="el-icon-info"
            icon-color="red"
            title="确定要删除这个模块吗？"
            @confirm="handleDeletePreview(item)"
          >
            <i class="ri-delete-bin-5-line" slot="reference"></i>
          </el-popconfirm>
        </div>
      </draggable>
    </div>
    <div v-else class="module-manage__empty">
      <img src="@/assets/placeholder-module.png" alt="没有模块" class="module-manage__empty-img" />
      <p class="module-manage__empty-tip">没有模块...</p>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'ModuleManageSetting',
  components: { draggable },
  data() {
    return {
      dragOption: {
        animation: 200,
        disabled: false
      }
    }
  },
  methods: {
    /**
     * 删除预览项
     * @param item
     */
    handleDeletePreview(item) {
      const { previews } = this.$store.getters
      const index = previews.findIndex(_item => _item.__key === item.__key)
      if (index === -1) return
      this.$store.state.previews.splice(index, 1)
    },
    /**
     * 清除模块
     */
    handleClearPreview() {
      this.$store.dispatch('setPreviewsAction', [])
    }
  }
}
</script>

<style lang="scss" scoped>
.module-manage {
  padding: 12px 16px 0;
  &__clear {
    display: flex;
    justify-content: flex-end;
    margin: 6px 0;
  }
  &__item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0 10px;
    font-size: 14px;
    box-sizing: border-box;
    color: #323233;
    box-shadow: 0 0 4px 0 rgba(10,42,97,0.2);
    border-radius: 2px;
    user-select: none;
    cursor: move;
    border: 1px dashed transparent;
    &.hover {
      border-color: red;
    }
    & + .module-manage__item {
      margin-top: 15px;
    }
    i {
      font-size: 20px;
    }
    i:first-child {
      margin-right: 5px;
    }
    i:last-child {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
    &-name {
      flex: 1;
      justify-content: flex-start;
    }
  }
  &__empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 200px;
    height: calc(100vh - 56px - 73px);
    &-img {
      width: 150px;
      height: 150px;
    }
    &-tip {
      font-size: 12px;
      margin-top: 5px;
    }
  }
}
</style>
