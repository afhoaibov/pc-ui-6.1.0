<template>
  <el-form
    v-loading="loading"
    ref="skuForm"
    :model="skuForm"
    :rules="skuRules"
    size="small"
    class="sku-editor"
  >
    
    <div v-if="showSpecs && goodsInfo.source_type !== 'SUPPLIER'">
      <div v-if="showLabel" class="sku-editor-item">
        <span class="label-text">常用规格：</span>
        <div class="spec-list stage">
          <div class="spec-list-tip">
            <span class="tip-label">提示：</span>
            <div class="tip-content">
              选择规格后，可根据需要自定义该SKU规格信息
            </div>
          </div>
          <div id="spec-list-body" class="spec-list-body">
            <el-popover
              v-for="spec in specList"
              :key="spec.id"
              placement="bottom"
              trigger="click"
              popper-class="spec--popper"
              class="spec-stage"
            >
              <spec-values-popover :spec="spec" @handle-add="handleAddSpec"/>
              <el-button
                slot="reference"
                class="spec-stage-btn"
                :disabled="isSelectedSpec(spec, skuForm.selectedSpecs)"
              >
                {{ spec.spec_group_name }}
              </el-button>
            </el-popover>
            <el-popover
              v-if="showSpecAllBtn"
              slot="append"
              placement="bottom-start"
              trigger="click"
              popper-class="spec--popper"
              class="spec-stage-all"
            >
              <spec-popover
                :spec-list="specList"
                :selected="skuForm.selectedSpecs"
                @handle-add="spec => handleAddSpec(spec)"
              />
              <el-button slot="reference" type="text">全部</el-button>
            </el-popover>
          </div>
        </div>
      </div>
      <div class="sku-editor-item">
        <span v-if="showLabel" class="label-text">规格信息：</span>
        <div class="spec-list">
          <div class="spec-list-tip">
            <span class="tip-label">提示：</span>
            <div class="tip-content">
              可在输入框中输入自定义规格名，也可以选择已有规格
            </div>
          </div>
          <template v-for="(sp, sp_index) in skuForm.selectedSpecs">
            <el-form-item label="规格名：" class="spec-name">
              <div class="spec-input">
                <el-input
                  v-model="sp.spec_group_name"
                  @change="(e) => changeGroupName(e, sp_index)"
                  placeholder="新建规格"
                  style="width: 280px">
                  <el-popover
                    slot="append"
                    placement="bottom-start"
                    trigger="click"
                    popper-class="spec--popper"
                    class="spec-stage"
                  >
                    <spec-popover
                      :spec-list="specList"
                      :selected="skuForm.selectedSpecs"
                      @handle-add="spec => handleAddSpec(spec, sp_index)"
                    />
                    <el-button slot="reference" class="spec-stage-btn">选择规格</el-button>
                  </el-popover>
                </el-input>
                <el-checkbox
                  v-model="sp.__has_image"
                  label="规格图片"
                  @click.native.prevent="handleClickSpecImgCheckbox(sp, sp_index)"
                />
              </div>
              <div class="spec-opt">
                <el-button type="text" @click="handleSaveSpec(sp)">保存为常用</el-button>
                <div class="partition"/>
                <el-button type="text" @click="handleDeleteSpec(sp_index)" style="color: red">移除</el-button>
              </div>
            </el-form-item>
            <el-form-item label="规格值：" class="spec-values" :class="{'no-spec-val': sp.spec_values.length === 0}">
              <div v-for="(sv, sv_index) in sp.spec_values" :key="sv_index" class="spec-value-item">
                <div class="spec-value-btn">
                  <el-button class="sv-btn sv">{{ sv.spec_value_name }}</el-button>
                  <i class="el-icon-close" @click="handleDeleteSpecVal(sp_index, sv_index)"></i>
                  <i class="el-icon-edit" @click="handleEditSpecVal(sp_index, sv_index)"></i>
                </div>
                <el-upload
                  v-if="sp.__has_image"
                  accept="image/*"
                  list-type="picture-card"
                  :action="MixinUploadApi"
                  :headers="MixinAccessToken"
                  :file-list="sv.spec_value_image ? [{ url: sv.spec_value_image }] : undefined"
                  :on-remove="() => handleSpecValImgRemove(sp_index, sv_index)"
                  :limit="1"
                  @click.native="(event) => handleUploadPicture(event, { type: 'spec', sp_index, sv_index })"
                  class="spec-value-upload"
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </div>
              <el-button type="text" @click="handleAddSpecVal(sp_index)">添加规格值</el-button>
            </el-form-item>
          </template>
          <el-form-item label="">
            <el-button
              type="primary"
              @click="handleAddEmptySpec"
              :disabled="skuForm.selectedSpecs.length >= 4"
            >
              添加规格
            </el-button>
          </el-form-item>
          <div class="add-spec-tip">最多添加四个规格</div>
        </div>
      </div>
    </div>
    <div class="sku-editor-item">
      <span v-if="showLabel" class="label-text">SKU信息：</span>
      <el-table
        :data="skuForm.skuList"
        :span-method="computedTableSpan"
        :row-class-name="rowClassName"
        border
        class="sku-table"
      >
        <el-table-column
          v-for="spec in specTHeads"
          :label="spec.spec_group_name"
          :key="spec.spec_group_name"
          width="100"
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ getTableSpecValName(row, spec) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="80">
          <template v-slot:header="{ row }">
            <div>
              <span>图片</span>
              <el-tooltip effect="dark" placement="top">
                <i class="el-icon-warning" style="cursor: help"></i>
                <div slot="content">
                  在买家端展示的图片以此处的为准。<br/>
                  如无规格图片，则显示默认商品图片。
                </div>
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row, $index }">
            <el-upload
              :disabled="goodsInfo.source_type === 'SUPPLIER' || isDisabledSku(row)"
              accept="image/*"
              list-type="picture-card"
              :action="MixinUploadApi"
              :headers="MixinAccessToken"
              :file-list="showSkuImage(row)"
              :on-remove="() => handleSkuImgRemove($index)"
              :limit="1"
              @click.native="(event) => handleUploadPicture(event, {type: 'sku', sku_index: $index })"
              class="spec-value-upload"
              :class="{disabled: isDisabledSku(row)}"
            >
              <i class="el-icon-plus" v-if="goodsInfo.source_type !== 'SUPPLIER'"></i>
            </el-upload>
          </template>
        </el-table-column>
        <el-table-column v-for="item in params" :key="item.key" align="center">
          <template v-slot:header="{ row }">
            <div>
              <span>{{ item.name }}</span>
              <el-popover
                v-if="!!item.batch"
                v-model="item.show_batch"
                popper-class="sku-batch-popper"
                placement="top"
              >
                <el-form
                  size="mini"
                  label-width="80px"
                  label-position="right"
                  @submit.native.prevent
                >
                  <el-form-item v-if="item.batchForm.show_prefix" label="前缀字符">
                    <el-input
                      v-model="item.batchForm.prefix"
                      :maxlength="20"
                      style="width: 100px;"
                      placeholder="选填"
                    />
                  </el-form-item>
                  <el-form-item :label="item.batchForm.initial_value_label">
                    <el-input-number
                      v-if="item.batchForm.initial_value_type === 'Number'"
                      v-model="item.batchForm.initial_value"
                      :controls="false"
                      :max="item.batchForm.initial_value_max"
                      placeholder="选填"
                      style="width: 100px"
                    />
                    <el-input
                      v-else
                      v-model="item.batchForm.initial_value"
                      :maxlength="item.batchForm.initial_value_maxlength"
                      placeholder="选填"
                      style="width: 100px"
                    />
                  </el-form-item>
                  <el-form-item v-if="item.batchForm.step !== false" label="递增步长">
                    <el-input-number
                      v-model="item.batchForm.step"
                      :controls="false"
                      :max="item.batchForm.step_max"
                      style="width: 100px"
                      placeholder="选填"
                    />
                  </el-form-item>
                  <el-form-item v-if="item.batchForm.pad_zero !== false" label="补零位数">
                    <el-input-number
                      v-model="item.batchForm.pad_zero"
                      :controls="false"
                      :max="item.batchForm.pad_zero_max"
                      style="width: 100px"
                      placeholder="选填"
                    />
                  </el-form-item>
                </el-form>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="item.show_batch = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="handleBatchSetSkuParams(item)">确定</el-button>
                </div>
                <i slot="reference" class="el-icon-brush batch-btn"></i>
              </el-popover>
              <el-tooltip v-if="!!item.tip" effect="dark" :content="item.tip" placement="top">
                <i class="el-icon-warning" style="cursor: help"></i>
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row, $index }">
            <span v-if="item.readonly">{{ row[item.key] }}</span>
            <el-form-item
              v-if="!item.readonly"
              :prop="`skuList.${$index}.${item.key}`"
              :class="{'hide-message': !showFormMessage}"
            >
              <el-input-number
                v-if="item.type === 'Number'"
                v-model="row[item.key]"
                :max="item.max"
                :controls="false"
                :disabled="isDisabledSku(row) || item.disabled"
              />
              <el-input
                v-else
                v-model="row[item.key]"
                :disabled="isDisabledSku(row) || item.disabled"
                :maxlength="item.maxlength"
                :placeholder="item.placeholder || ''"
                style="text-align: center"
              />
            </el-form-item>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" width="75">
          <template v-slot="{ row }">
            <el-button
              v-if="isDisabledSku(row)"
              type="text"
              size="mini"
              style="color: green"
              @click="handleOptSku(row)"
            >启用</el-button>
            <el-button
              v-else
              type="text"
              size="mini"
              style="color: #E6A23C"
              @click="handleOptSku(row)"
            >禁用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <en-resource-picker
      :show.sync="showResourcePicker"
      :type="resourcePickerType"
      :upload-api="MixinUploadApi"
      :upload-headers="MixinAccessToken"
      :request="MixinRequest"
      :limit="1"
      @confirm="handlePictureChange"
    />
    
  </el-form>
</template>

<script>
import * as Helper from './helper'
import SpecPopover from './SpecPopover'
import SpecValuesPopover from './SpecValuesPopover'

export default {
  name: 'SkuEditor',
  components: {
    SpecPopover,
    SpecValuesPopover
  },
  props: {
    // 商品ID
    goodsId: {
      type: [String, Number],
      required: true
    },
    // 扩展参数
    extendedParams: {
      type: Array,
      required: false,
      default: () => ([])
    },
    // 显示表单错误信息
    showFormMessage: {
      type: Boolean,
      required: false,
      default: false
    },
    // 是否显示Label
    showLabel: {
      type: Boolean,
      required: false,
      default: true
    },
    // 是否显示规格
    showSpecs: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      goodsInfo: '',
      skuForm: {
        selectedSpecs: [],
        skuList: []
      },
      specList: [],
      showSpecAllBtn: false,
      rawSkuList: [],
      tableSpanArray: [],
      params: [],
      // 资源选择弹窗显隐
      showResourcePicker: false,
      // 资源选择类型
      resourcePickerType: 'image',
      uploadData: {},
      // 禁用的sku，里面存的是规格值组合
      excludeSkus: [],
      
    }
  },
  watch: {
    extendedParams: 'makeParams',
    
  },
  computed: {
    skuRules() {
      return Helper.computedSkuRules(this.skuForm, this.params, this.excludeSkus)
    },
    specTHeads() {
      return this.skuForm.selectedSpecs.filter(item => {
        const { spec_values } = item
        if (!Array.isArray(spec_values)) return false
        return spec_values.length !== 0
      })
    },
    
  },
  async mounted() {
    await this.getGoodsInfo()
    this.makeParams()
    this.init()
    window.addEventListener('resize', this.specListIsOverflow)
  },
  destroyed() {
    window.removeEventListener('resize', this.specListIsOverflow)
  },
  methods: {
    // 获取商品信息
    async getGoodsInfo() {
      this.loading = true
      try {
        // 获取商品信息
        this.goodsInfo = await Helper.getGoodsInfo(this.goodsId)
        
        // 获取规格列表，商品SKU列表
        await Promise.all([this.getSpecList(), this.getSkuList()])
      } finally {
        this.loading = false
      }
    },
    // 初始化数据
    async init() {
      // 初始化商品SKU中已选择的规格信息
      this.skuForm.selectedSpecs = Helper.initSelectedSpecs(this.rawSkuList)
      this.makeSkuList(true)
      // 计算表格合并二维数组
      this.tableSpanArray = Helper.makeTableSpans(this.skuForm.skuList, this.specTHeads)
    },
    // 获取规格列表
    async getSpecList() {
      this.specList = await Helper.getSpecList()
      this.$nextTick(() => {
        this.specListIsOverflow()
      })
    },
    // 获取商品sku信息
    async getSkuList() {
      let skuList = await Helper.getGoodsSkus(this.goodsId)
      if (!Array.isArray(skuList)) skuList = []
      skuList = skuList.sort((a, b) => a.sku_sort - b.sku_sort)
      // #ifndef sbc
      if (skuList.length === 1) {
        const specList = skuList[0].spec_list || []
        if (!Array.isArray(specList) || specList.length === 0) {
          skuList = []
        }
      }
      // #endif
      this.rawSkuList = Helper.cloneJson(skuList)
    },
    // 计算参数
    makeParams() {
      this.params = Helper.mergeParams(this.extendedParams)
    },
    makeSkuList(init = false) {
      if (init) {
        this.skuForm.skuList = Helper.cloneJson(this.rawSkuList)
      }
      const skus = Helper.makeSkus(this.skuForm, this.params)
      this.skuForm.skuList = skus
      if (!init) return
      skus.forEach(sku => {
        if (!sku.sn) this.excludeSkus.push(sku.__spec_value_keys)
      })
    },
    // 常用规格显示是否超出最大宽度
    specListIsOverflow() {
      this.showSpecAllBtn = Helper.showSpecListAllBtn(this.specList)
    },
    // 添加空规格
    handleAddEmptySpec() {
      this.skuForm.selectedSpecs.push({
        __sp_key: Helper.makeUUID(),
        spec_group_name: '',
        spec_values: []
      })
    },
    // 添加规格
    handleAddSpec(spec, sp_index) {
      spec.__sp_key = spec.__sp_key || Helper.makeUUID()
      if (sp_index !== undefined) {
        this.$set(this.skuForm.selectedSpecs, sp_index, spec)
      } else {
        this.skuForm.selectedSpecs.push(spec)
      }
      this.makeSkuList()
      this.tableSpanArray = Helper.makeTableSpans(this.skuForm.skuList, this.specTHeads)
    },
    // 添加规格值
    async handleAddSpecVal(sp_index) {
      const { selectedSpecs } = this.skuForm
      const { __sp_key, spec_group_name, spec_values } = selectedSpecs[sp_index]
      if (!spec_group_name) return this.$message.error('请先填写规格名称！')
      const res = await this.$prompt('', {
        title: '添加规格值',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '10个字符以内',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValidator: (value) => {
          if (!value) return '请填写规格值！'
          if (value.trim().length > 10) return '规格值长度不能大于10个字符！'
          if (spec_values.some(item => item.spec_value_name === value.trim())) {
            return '规格值重复！'
          }
          return true
        }
      })
      let spec_val = {
        __sp_key: __sp_key,
        __sv_key: Helper.makeUUID(),
        spec_group_name,
        spec_value_name: res.value.trim()
      }
      const find_sv = Helper.findSpecVal(this.specList, spec_val)
      if (find_sv) {
        spec_val = { ...spec_val, ...find_sv }
      }
      selectedSpecs[sp_index].spec_values.push(spec_val)
      this.makeSkuList()
      this.tableSpanArray = Helper.makeTableSpans(this.skuForm.skuList, this.specTHeads)
    },
    /** 修改规格名称 */
    changeGroupName(e, sp_index) {
      const spec_values = this.skuForm.selectedSpecs[sp_index].spec_values.map(item => {
        item.spec_group_name = e
        return item
      })
      this.$set(this.skuForm.selectedSpecs[sp_index], 'spec_values', spec_values)
      this.makeSkuList()
    },
    // 编辑规格值
    async handleEditSpecVal(sp_index, sv_index) {
      let def_sp = this.skuForm.selectedSpecs[sp_index]

      let def_sv = def_sp.spec_values[sv_index]
      const res = await this.$prompt('', {
        title: '修改规格值',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '10个字符以内',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValue: def_sv.spec_value_name,
        inputValidator: (value) => {
          if (!value) return '请填写规格值！'
          if (value.length > 10) return '规格值长度不能大于10个字符！'
          return true
        }
      })
      const value = res.value.trim()
      const sv_key = Helper.makeUUID()
      let sv = {
        ...def_sv,
        __sv_key: sv_key,
        spec_group_id: def_sp.spec_group_id,
        spec_group_sn: def_sp.id ? def_sp.__sp_key : '',
        spec_value_name: value
      }
      const find_sv = Helper.findSpecVal(this.specList, sv)
      if (find_sv) sv = { ...sv, ...find_sv }
      this.$set(this.skuForm.selectedSpecs[sp_index].spec_values, sv_index, sv)
      this.makeSkuList()
    },
    // 保存为常用规格
    async handleSaveSpec(spec) {
      try {
        await Helper.saveSpec(spec, this.specList)
        this.$message.success('保存成功！')
        await this.getSpecList()
      } catch (e) {
        this.$message.error(e)
      }
    },
    // 移除规格
    async handleDeleteSpec(sp_index) {
      const spec = this.skuForm.selectedSpecs[sp_index]
      let msg = '确定要移除这个规格吗?'
      let has_spec = false
      if (Array.isArray(spec.spec_values)) {
        has_spec = spec.spec_values.filter(sv => sv.id).length !== 0
      }
      if (has_spec) msg = '移除后规格维度将发生改变，会导致已有规格数据丢失！确定要移除吗？'
      try {
        await this.$confirm(msg, '提示', { type: has_spec ? 'error' : 'warning' })
        this.skuForm.selectedSpecs.splice(sp_index, 1)
        this.makeSkuList()
        this.tableSpanArray = Helper.makeTableSpans(this.skuForm.skuList, this.specTHeads)
      } catch (e) {
        //
      }
    },
    // 移除规格值
    async handleDeleteSpecVal(sp_index, sv_index) {
      const spec_values = this.skuForm.selectedSpecs[sp_index].spec_values
      let msg = '确定要移除这个规格值吗?'
      let last_spc_val = false
      if (spec_values.length === 1) {
        last_spc_val = true
        msg = '最后一个规格值移除后规格维度将发生改变，会导致已有规格数据丢失！确定要移除吗？'
      }
      try {
        await this.$confirm(msg, '提示', { type: last_spc_val ? 'error' : 'warning' })
        this.skuForm.selectedSpecs[sp_index].spec_values.splice(sv_index, 1)
        this.makeSkuList()
        this.tableSpanArray = Helper.makeTableSpans(this.skuForm.skuList, this.specTHeads)
      } catch (e) {
        //
      }
    },
    // 是否启用规格图片
    handleClickSpecImgCheckbox(spec, sp_index) {
      const has_img = spec.__has_image
      const { selectedSpecs } = this.skuForm
      selectedSpecs.forEach(item => {
        item.__has_image = false
      })
      selectedSpecs[sp_index].__has_image = !has_img
      this.skuForm.selectedSpecs = selectedSpecs

      // 修改关联sku规格图片
      const spec_val = selectedSpecs[sp_index]
      this.skuForm.skuList.forEach(sku => {
        sku.spec_list.forEach(sv => {
          if (sv.__sp_key === spec_val.__sp_key) {
            this.$set(sku, 'sku_image', sv.spec_value_image)
          }
        })
      })
      this.$forceUpdate()
    },

    /** 图片选择 */
    handleUploadPicture(event, uploadData) {
      if (event.target.tagName !== 'INPUT') return
      event.cancelBubble = true
      event.stopPropagation()
      event.preventDefault()
      this.uploadData = uploadData
      this.resourcePickerType = 'image'
      this.showResourcePicker = true
    },

    /** 商品图片发生改变 */
    handlePictureChange(fileList) {
      const uploadData = this.uploadData
      let image = ''
      if (fileList.length) {
        image = fileList[0].resource_url
      }
      if (uploadData.type === 'spec') {
        // 规格值图片
        const spec_val = this.skuForm.selectedSpecs[uploadData.sp_index].spec_values[uploadData.sv_index]
        this.$set(spec_val, 'spec_value_image', image)
        // 添加关联sku规格图片
        const skus = Helper.findSkusBySpecVal(spec_val, this.skuForm.skuList)
        skus.forEach(sku => {
          this.$set(sku, 'sku_image', image)
          const sv = sku.spec_list.find(item => item.__sv_key === spec_val.__sv_key)
          if (!sv) return
          this.$set(sv, 'spec_value_image', image)
        })
      } else {
        // sku图片
        this.$set(this.skuForm.skuList[uploadData.sku_index], 'sku_image', image)
      }
    },
    // 移除规格值图片
    handleSpecValImgRemove(sp_index, sv_index) {
      const spec_val = this.skuForm.selectedSpecs[sp_index].spec_values[sv_index]
      this.$set(spec_val, 'spec_value_image', '')
      // 移除关联sku的规格图片
      const skus = Helper.findSkusBySpecVal(spec_val, this.skuForm.skuList)
      skus.forEach(sku => {
        this.$set(sku, 'sku_image', '')
        const sv = sku.spec_list.find(item => item.__sv_key === spec_val.__sv_key)
        if (!sv) return
        this.$set(sv, 'spec_value_image', '')
      })
    },
    // 移除sku图片
    handleSkuImgRemove(sku_index) {
      const sku = this.skuForm.skuList[sku_index]
      sku.sku_image = ''
      this.$set(this.skuForm.skuList, sku_index, sku)
    },
    // 禁用/启用sku
    async handleOptSku(row) {
      if (!this.isDisabledSku(row)) {
        await this.$confirm('确定要禁用这个sku吗，禁用后该sku后，在保存时该sku数据将丢失？', '提示', { type: 'warning' })
        this.excludeSkus.push(row.__spec_value_keys)
      } else {
        const index = this.excludeSkus.findIndex(item => item === row.__spec_value_keys)
        if (index === -1) return
        this.excludeSkus.splice(index, 1)
      }
    },
    isDisabledSku(row) {
      return this.excludeSkus.includes(row.__spec_value_keys)
    },
    rowClassName({ row }) {
      return this.isDisabledSku(row) ? 'hide' : ''
    },
    // 批量设置SKU参数
    async handleBatchSetSkuParams(param) {
      await this.$confirm('当前操作会覆盖已有值，确定吗？', '提示', { type: 'warning' })
      let { prefix, show_prefix, step, initial_value, pad_zero } = Helper.cloneJson(param.batchForm)
      this.skuForm.skuList.forEach(sku => {
        let val = ''
        if (show_prefix && prefix) val += prefix
        if (step !== false && step) initial_value += step
        if (pad_zero !== false && pad_zero > 1) {
          val += String(initial_value).padStart(pad_zero, '0')
        } else {
          val += initial_value
        }
        this.$set(sku, param.key, val || '')
      })
    },
    showSkuImage: Helper.showSkuImage,
    isSelectedSpec: Helper.isSelectedSpec,
    formatterSpecText: Helper.formatterSpecText,
    getTableSpecValName: Helper.getTableSpecValName,
    computedTableSpan(params) {
      return Helper.computedTableSpan(params, this.tableSpanArray)
    },
    // 保存
    async submit() {
      try {
        await this.$refs.skuForm.validate()
      } catch (e) {
        this.$message.error('表单填写有误，请核对带有红色边框的表单项！')
        return Promise.reject('')
      }
      const skus = Helper.cloneJson(this.skuForm.skuList).filter(item => !this.excludeSkus.includes(item.__spec_value_keys))
      const changed = Helper.specIsChanged(skus, this.rawSkuList)
      if (changed) {
        await this.$confirm(
          '因规格的维度发生变化，会导致之前的SKU组合不存在，这会使相应的SKU参加的促销失效，确认要这么操作吗？',
          '提示',
          { type: 'warning' }
        )
      }
      const params = { goodsId: this.goodsId, skus }
      
      await Helper.saveGoodsSkus(params)
    },
    
  }
}
</script>
<style src="./styles.scss" lang="scss" scoped>
</style>
<style lang="scss">
.sku-batch-popper {
  .el-form-item {
    margin-bottom: 5px !important;
    .el-input__inner {
      text-align: center;
    }
    .el-form-item__label {
      font-size: 12px;
    }
  }
}
.spec--popper {
  padding: 0;
}
</style>
