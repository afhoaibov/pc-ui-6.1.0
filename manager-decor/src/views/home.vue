<template>
  <div class="app-container" :class="{'is-pc': $$IsPC}">
    <div class="app-header">
			<div class="dropdown-menu">
				<div class="current-text">{{currentLang.lang}}</div>
				<!-- <el-dropdown @command="dropdownCommand" v-if="langCodes.length">
					<span class="el-dropdown-link">
						{{currentLang.lang}}<i class="el-icon-arrow-down el-icon--right"></i>
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item
							v-for="item of langCodes"
							:key="item.id"
							:command="item"
						>
						{{ item.lang }}
						</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown> -->
			</div>
			<div>
				<el-button @click="is_preview = !is_preview">{{ is_preview ? '取消预览' : '预览' }}</el-button>
				<el-button type="primary" :disabled="is_preview" @click="handleSave">保存</el-button>
			</div>
    </div>
    <div class="app-body">
      <draggable
        v-if="modules.length > 0"
        class="label-box"
        v-bind="labelDragOption"
        :list="modules"
        :clone="handleClonePreview"
        filter=".disabled"
      >
        <template v-for="item in modules">
          <div
            v-if="item.label.show !== false"
            :key="item.name"
            @click="handleClickLabel(item)"
            :class="{ disabled: (item.label.limit !== -1 && computePreviewNum(item.name) >= item.label.limit) }"
          >
            <div class="item-label">
              <i class="icon-label" :style="{backgroundImage: `url(${item.label.icon})`}" />
              <p class="title-label">{{ item.label.title }}</p>
              <p class="limit-label">
                {{ computePreviewNum(item.name) }}/{{ item.label.limit === -1 ? '无限制' : item.label.limit }}
              </p>
            </div>
          </div>
        </template>
      </draggable>
      <div v-else class="label-box__empty">
        <img src="../assets/placeholder-module.png" alt="没有模块" class="label-box__empty-img" />
        <p class="label-box__empty-tip">没有模块...</p>
      </div>
      <div class="preview-box">
        <transition name="fade">
          <div v-show="is_preview" class="preview-mask"></div>
        </transition>
        <div class="preview-inner" :class="{'is-preview': is_preview}">
          <div v-if="$$IsMobile" class="preview-header" @click="handleClickPreviewHeader">
            <div class="title-preview">{{ $$AccessoriesData['page-params'].page_name }}</div>
          </div>
          <draggable
            v-model="previews"
            v-bind="previewDragOption"
            :disabled="is_preview"
            group="previews"
            class="preview-body"
            @add="handleDraggableAdd"
          >
            <div
              v-for="(item, index) in previews"
              :key="item.__key"
              @click="handleClickPreview(item, index)"
              class="item-preview"
              :class="{activated: activated === item.__key, hover: $store.state.hoverKey === item.__key}"
              @mouseenter="$store.dispatch('setPreviewItemHoverAction', item.__key)"
              @mouseleave="$store.dispatch('setPreviewItemHoverAction', '')"
            >
              <el-popover
                :placement="$$IsMobile ? 'right': 'top'"
                trigger="hover"
                :open-delay="$$IsMobile ? 0 : 300"
                :append-to-body="false"
              >
                <div class="item-preview__mask" slot="reference"></div>
                <div class="action-preview">
                  <el-button type="danger" size="mini" @click="handleDeletePreview(item, index)">删除</el-button>
                  <el-button size="mini" @click="handleCopyPreview(item, index)">复制</el-button>
                </div>
              </el-popover>
              <component
                :ref="`preview_${item.__key}`"
                :is="`${item.name}-preview`"
                :key="`preview-${item.__key}`"
                :preview="item"
                class="item-preview__inner"
              />
            </div>
          </draggable>
        </div>
        <div v-show="!is_preview" class="accessories-box">
          <div
            v-for="item in accessories"
            :key="item.name"
            class="item-accessory"
            @click="handleClickAccessory(item)"
            :class="{activated: $$ActivatedPreview.__key === item.__key}"
          >
            <i class="icon-accessory" :style="{backgroundImage: `url(${item.label.icon})`}"></i>
            <span>{{ item.label.title }}</span>
          </div>
        </div>
      </div>
      <div class="settings-box">
        <div v-if="$$ActivatedPreview" class="header-settings">
          <span>{{ $$ActivatedPreview.label.title }}</span>
        </div>
        <el-form v-if="$$ActivatedPreview" :model="$$FormData" @submit.native.prevent>
          <div v-for="item in activatedSettingItems" :key="item.__key">
            <el-form-item
              v-if="formItemShow(item)"
              :prop="item.__key"
              :class="{
                'has-space': item.space_line,
                'form-item__column': item.column
              }"
            >
              <component
                :is="`setting-${item.type}`"
                :key="$$ActivatedPreview.__key + '|' + item.__key"
                :config="item"
                :preview="$$ActivatedPreview"
              />
              <div v-if="item.space_line" class="form-item-line" />
            </el-form-item>
          </div>
          <component
            v-if="$$ActivatedPreview && $$ActivatedPreview.has_setting"
            :is="`${$$ActivatedPreview.name}-setting`"
            :key="`setting-${$$ActivatedPreview.__key}`"
            :preview="$$ActivatedPreview"
          />
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import draggable from 'vuedraggable'
import { getModules } from '@/utils/modules'
import * as API_pages from '@/api/pages'
import { Base64 } from 'js-base64'
import { getPaths } from '@/utils/foundation'
import { waitTokenData } from '@/utils/wait-token'
import * as API_Common from '@/api/common'

export default {
  name: 'home',
  components: { draggable },
  data() {
    return {
      modules: getModules(),
      labelDragOption: {
        sort: false,
        group: { name: 'previews', pull: 'clone', put: false },
      },
      previewDragOption: {
        animation: 200,
        group: 'previews',
        disabled: false
      },
      page_id: '',
      page_data: '',
      temp_key: '',
      // 预览？
      is_preview: false,
			// 支持的语言包 
			langCodes: [],
			currentLang: {}
    }
  },
  computed: {
    // 激活预览项的设置项目
    // 需要返回一个数组，再每个设置项加一个临时用的__key
    // __key实际上就是每个设置项的key
    activatedSettingItems() {
      if (!this.$$ActivatedPreview) return
      const { settings } = this.$$ActivatedPreview
      if (typeof settings !== 'object') return []
      return Object.keys(settings).map(item => ({
        __key: item,
        ...this.$$ActivatedPreview.settings[item]
      }))
    }
  },
  async mounted() {
    await waitTokenData()
    const page_id = this.$$Foundation.getURLSearchParma('id')
		const lang = this.$$Foundation.getURLSearchParma('lang')
    page_id && await this.getPageDetail(page_id)
    this.setPreviewActivatedAction(this.accessories[0].__key)
    if (typeof window === 'object') window.$$HomeRefs = this.$refs
		lang && this.getLangCodes(lang)
  },
  methods: {
    ...mapActions([
      'setPreviewItemAction',
      'removePreviewItemAction',
      'setPreviewActivatedAction',
      'setPreviewsAction',
      'setPageParamsAction',
			'setCurrentLang'
    ]),
		/** 保存语言模版切换 */
		dropdownCommand(command) {
			this.currentLang = command
			this.setCurrentLang(command)
		},
    /**
     * 点击Label
     * @param item
     * @param index
     */
    handleClickLabel(item, index) {
      const { limit, title } = item.label
      if (limit !== -1 && this.computePreviewNum(item.name) >= limit) {
        return this.$message.error(`【${title}】最大数量为：${limit}个！`)
      }
      /^[0-9]\d*$/.test(index) && (item['__index'] = index)
      this.setPreviewItemAction(item)
      const { previews } = this
      const _index = /^[0-9]\d*$/.test(index) ? index : previews.length - 1
      this.setPreviewActivatedAction(previews[_index].__key)
    },
    /**
     * 点击预览项
     * @param item
     */
    handleClickPreview(item) {
      if (this.is_preview) return
      this.setPreviewActivatedAction(item.__key)
    },
    /**
     * 删除预览项
     * @param item
     */
    handleDeletePreview(item) {
      this.removePreviewItemAction(item.__key)
    },
    /**
     * 复制预览项
     * @param item
     * @param index
     */
    handleCopyPreview(item, index) {
      this.handleClickLabel(item, index+1);
    },
    /**
     * 计算已有预览项个数
     * @param name
     * @returns {*}
     */
    computePreviewNum(name) {
      return this.previews.filter(item => item.name === name).length
    },
    /**
     * 自定义克隆
     * @param item
     * @returns {any}
     */
    handleClonePreview(item) {
      const { limit, title } = item.label
      if (limit !== -1 && this.computePreviewNum(item.name) >= limit) {
        return this.$message.error(`【${title}】最大数量为：${limit}个！`)
      }
      const _item = this.$$Foundation.cloneDeep(item)
      _item.__key = this.$$Foundation.uuid()
      this.temp_key = _item.__key
      return _item
    },
    /**
     * 表单项是否展示
     * @param item
     * @returns {boolean|*}
     */
    formItemShow(item) {
      if (typeof item.show === 'function') {
        return item.show(this.$$FormData)
      }
      return true
    },
    /**
     * 点击了附加项
     * @param item
     */
    handleClickAccessory(item) {
      this.setPreviewActivatedAction(item.__key)
    },
    /**
     * 点击了预览上方的Header
     */
    handleClickPreviewHeader() {
      this.setPreviewActivatedAction(this.accessories[0].__key)
    },
    /**
     * 保存页面
     */
    async handleSave() {
      const page_id =  this.$$Foundation.getURLSearchParma('id')
      if (page_id && page_id !== this.page_id) {
        return this.$$ErrorAndCloseWindow('数据错误！')
      }
      let previews = this.$$Foundation.cloneDeep(this.previews)
      if (!previews.length) return this.$message.error('未添加模块！')
      const pageParams = this.$$AccessoriesData['page-params']
      let data = {}
      // 页面标题
      data.page_name = pageParams.page_name
      // 页面描述
      data.remark = pageParams.page_desc
      // 页面数据
      previews = this.findGoodsPaths(previews)
      data.page_data = JSON.stringify(previews.map(item => {
        if (item.name === 'rich-text') {
          item.data.content = Base64.encode(item.data.content)
        }
        const res = { name: item.name, data: item.data }
        if (item.goodsPaths) {
          res.goodsPaths = item.goodsPaths
        }
        return res
      }))
      data.page_data = data.page_data.replace(/\n/g, '')
      data = this.$$Foundation.cloneDeep(data)
			data.language = this.currentLang.code
      if (this.page_id) {
        // 有page_id，说明要更新数据
        await API_pages.updatePage(this.page_id, data)
      } else {
        // 没有就新增一个
        const res = await API_pages.addPage(data)
        this.page_id = res.id
      }
      try {
        await this.$message.success('保存成功')
      } catch (e) {
        //
      }
    },
    /**
     * 获取页面详情
     * @param page_id
     */
    async getPageDetail(page_id) {
      const res = await API_pages.getPageDetail(page_id)
      if (!res || !res.id) return this.$$ErrorAndCloseWindow('没有这个页面数据！')
      let { id, page_name, remark, page_data } = res
      this.page_id = id
    
      const previews = []
      const modules = this.$$Foundation.cloneDeep(this.modules)
      page_data.forEach(item => {
        let module = modules.filter(_item => _item.name === item.name)[0]
        module = this.$$Foundation.cloneDeep(module)
        if (!module) return
        module['__key'] = this.$$Foundation.uuid()
        module['data'] = {...module.data, ...item.data}
        if (module.name === 'rich-text') {
          module.data.content = Base64.decode(module.data.content)
        }
        previews.push(module)
      })
      this.setPageParamsAction({ page_name, page_desc: remark })
      this.setPreviewsAction(previews)
      if (this.$$Foundation.getURLSearchParma('action') === 'preview') {
        this.is_preview = true
      }
    },
		/** 获取已开启的语言包 */
		getLangCodes(lang) {
			API_Common.getLangCodes().then(res => {
				this.langCodes = res
				this.currentLang = res.find((item) => item.code === lang)
				this.setCurrentLang(this.currentLang)
			})
		},
    /**
     * 有新的预览项添加进来
     */
    handleDraggableAdd() {
      this.setPreviewActivatedAction(this.temp_key)
    },
    /**
     * 查找有商品列表的路径
     * @param modules
     * @returns {*}
     */
    findGoodsPaths(modules) {
      modules.forEach(module => {
        const paths = findPaths(module)
        if (!paths.length) return
        module.goodsPaths = paths
      })

      function findPaths(json) {
        let goodsPaths = []
        let paths = getPaths(json).filter(item => item.indexOf('goodsList') !== -1)
        paths.forEach(item => {
          if (!item) return
          const path = item.split('goodsList')[0]
          if (goodsPaths.indexOf(`${path}goodsList`) === -1) {
            goodsPaths.push(path + 'goodsList')
          }
        })
        return goodsPaths
      }

      return modules
    }
  }
}
</script>

<style lang="scss" scoped>
$label-width: 160px + 24px;
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #F7F8F7;
  &.is-pc {
    .preview-box {
      .preview-inner {
        width: 1210px;
        &.is-preview {
          margin-left: -605px;
        }
        ::v-deep .action-preview {
          flex-direction: row;
          width: 120px;
          .el-button + .el-button {
            margin-left: 10px;
            margin-top: 0;
          }
        }
      }
    }
  }
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 56px;
    padding-right: 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #ebedf0;
    box-sizing: border-box;
		.dropdown-menu {
			// cursor: pointer;
			margin-left: 50px;
			.current-text {
				color: #606266;
				font-size: 14px;
			}
		}
  }
  .app-body {
    display: flex;
  }
  .label-box {
    flex-shrink: 0;
    width: $label-width;
    padding: 20px 12px;
    height: calc(100vh - 56px);
    background-color: #ffffff;
    box-sizing: border-box;
    text-align: center;
    .item-label {
      float: left;
    }
    &::after {
      clear: both;
    }
  }
  .label-box__empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: $label-width;
    background-color: #ffffff;
    &-img {
      width: 100px;
    }
    &-tip {
      font-size: 12px;
      margin-top: 5px;
    }
  }
  .preview-box {
    flex: 1;
    min-width: 880px;
    position: relative;
    height: calc(100vh - 56px - 20px);
    padding-top: 70px;
    padding-bottom: 20px;
    overflow-x: hidden;
    overflow-y: scroll;
    box-sizing: border-box;
    ::v-deep .el-popover {
      min-width: auto;
      cursor: auto;
    }
    ::v-deep .action-preview {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 60px;
      .el-button + .el-button {
        margin-left: 0;
        margin-top: 10px;
      }
    }
    .preview-mask {
      position: fixed;
      z-index: 10000;
      top: 56px;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0,0,0,0.8);
    }
    .preview-inner {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 375px;
      margin: 0 auto;
      box-shadow: 0 0 14px 0 rgba(0,0,0,.1);
      &.is-preview {
        position: fixed;
        z-index: 10001;
        top: 100px;
        left: 50%;
        margin-left: -187.5px;
        max-height: calc(100vh - 100px - 100px);
        .preview-body::-webkit-scrollbar {
          display: none;
        }
        .item-preview {
          cursor: auto;
          .item-preview__mask {
            display: none;
          }
        }
        .preview-body {
          overflow: hidden auto;
        }
      }
    }
    .preview-header {
      width: 375px;
      height: 64px;
      background-image: url('../assets/app-header.png');
      background-position: center;
      background-size: cover;
      .title-preview {
        width: 180px;
        margin: 0 auto;
        height: 44px;
        line-height: 44px;
        text-align: center;
        padding-top: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }
    }
    .preview-body {
      width: 100%;
      min-height: 606px;
      background-color: #ffffff;
    }
  }
  .settings-box {
    flex-shrink: 0;
    width: 380px;
    height: calc(100vh - 56px);
    .header-settings {
      position: relative;
      background-color: #ffffff;
      padding: 24px 16px;
      border-bottom: 1px solid #f2f4f6;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 24px;
      color: #323233;
      text-align: left;
    }
  }
}
.label-box {
  .item-label {
    width: 50%;
    height: 100px;
    background-color: #ffffff;
    font-weight: 400;
    transition: background-color ease .2s;
    overflow: hidden;
    .icon-label {
      position: relative;
      left: 0;
      display: inline-block;
      width: 32px;
      height: 32px;
      margin-top: 8px;
      background-size: 100%;
      background-position: 0 0;
      color: #7D7D80;
      filter: drop-shadow(#ffffff 80px 0);
    }
    .title-label, .limit-label {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
    }
    .title-label {
      color: #323233;
    }
    .limit-label {
      color: #7d7e80;
    }
  }
  :not(.disabled) .item-label:hover {
    color: #ffffff;
    background-color: #155bd4;
    border-radius: 4px;
    font-weight: bold;
    cursor: move;
    user-select: none;
    .icon-label,
    .title-label,
    .limit-label {
      color: #ffffff;
    }
    .icon-label {
      left: -80px;
      background-position: 0 32px;
    }
  }
  .disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}
.preview-body {
  .item-preview {
    position: relative;
    cursor: pointer;
    &.activated .item-preview__mask {
      border: 1px solid #155bd4 !important;
    }
    &.hover .item-preview__mask {
      border: 1px dashed red;
    }
    .item-preview__mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 2;
      box-sizing: border-box;
      cursor: move;
      &:hover {
        border: 1px dashed #155bd4;
      }
    }
    .item-preview__inner {
      position: relative;
      z-index: 1;
    }
  }
}
.settings-box {
  background-color: #ffffff;
  max-height: 100vh;
  overflow: hidden auto;
  ::v-deep .el-form {
    box-sizing: border-box;
    .el-form-item {
      margin-bottom: 0;
      &.form-item__column {
        .form-item__container {
          flex-direction: column;
          align-items: flex-start;
        }
        .form-item__right-col {
          margin-top: 10px;
          justify-content: flex-start;
        }
        .el-radio-group {
          justify-content: flex-start;
        }
        .el-radio-button {
          flex: 1;
          min-width: 50px;
          margin-top: -1px;
        }
      }
    }
    .form-item__container {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 12px 16px;
      box-sizing: border-box;
      line-height: normal;
      &.form-item__container-column {
        flex-direction: column;
        align-items: flex-start;
        margin-top: 10px;
        .form-item__right-col {
          margin-top: 10px;
        }
      }
    }
    .form-item__custom {
      line-height: normal;
      box-sizing: border-box;
    }
    .form-item__options {
      background-color: #f7f8fa;
      padding: 12px 16px;
      box-sizing: border-box;
    }
    .form-item__left-col,
    .form-item__right-col {
      display: flex;
      align-items: center;
    }
    .form-item__right-col {
      flex: 1;
      justify-content: flex-end;
      width: 100%;
      .el-input {
        max-width: 100%;
      }
      &.slider {
        .el-slider {
          width: 100%;
        }
      }
    }
    .form-item__label {
      margin-right: 16px;
      font-size: 14px;
      color: #969799;
      line-height: 18px;
      white-space: nowrap;
    }
    .form-item__value {
      font-size: 14px;
      font-weight: 500;
      color: #323233;
      line-height: 18px;
      margin-right: 16px;
    }
    .radio-button .el-radio-group {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .form-item__options .el-radio {
      margin-right: 19px;
      margin-bottom: 10px;
    }
    .el-radio-button {
      position: relative;
      overflow: hidden;
      box-shadow: none !important;
      cursor: pointer;
      border-radius: 0;
      z-index: 1;
      margin-left: -1px;
      &:nth-child(6n + 1) {
        margin-left: 0;
      }
      &.top-left .el-radio-button__inner {
        border-top-left-radius: 2px;
      }
      &.top-right .el-radio-button__inner {
        border-top-right-radius: 2px;
      }
      &.bottom-left .el-radio-button__inner {
        border-bottom-left-radius: 2px;
      }
      &.bottom-right .el-radio-button__inner {
        border-bottom-right-radius: 2px;
      }
      .el-radio-button__inner {
        transition: none;
        padding: 5px 14px;
        border-radius: 0;
      }
    }
    .el-radio-button__inner {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 32px;
      border-left: 1px solid #DCDFE6;
    }
    .is-active {
      z-index: 3;
      &::after {
        border-color: #155bd4;
      }
      .icon-radio,
      .text-radio {
        color: #155bd4;
      }
      .el-radio-button__inner {
        color: #ffffff;
        background-color: #e0edff;
        box-shadow: none;
        border-left: 1px solid #155bd4;
      }
    }
    .icon-radio {
      display: block;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      font-size: 20px;
      color: #979797;
      box-sizing: border-box;
    }
  }
  ::v-deep .form-item-line {
    height: 1px;
    padding: 12px 16px;
    background-clip: content-box;
    background-color: #ebedf0;
  }
  ::v-deep .el-button + .el-color-picker {
    margin-left: 12px;
  }
  ::v-deep .el-color-picker__trigger {
    width: 80px;
    .el-color-picker__icon {
      display: none;
    }
  }
}
.accessories-box {
  position: fixed;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  top: 143px;
  right: 405px;
  min-height: 100px;
  .item-accessory {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 94px;
    height: 32px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.1);
    background-color: #ffffff;
    word-break: break-all;
    padding: 0 6px;
    & + .item-accessory {
      margin-top: 12px;
    }
    &.activated {
      background-color: #155bd4;
      color: #ffffff;
      .icon-accessory {
        background-position: 0 11px;
      }
    }
    .icon-accessory {
      display: inline-block;
      background-position: 0 -1px;
      background-size: cover;
      width: 12px;
      height: 12px;
      vertical-align: middle;
      margin-right: 7px;
    }
  }
}
</style>
