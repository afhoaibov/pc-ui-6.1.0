<template>
  <div v-loading="loading" class="add-template-wrap">
    <el-form
      :model="mouldForm"
      status-icon
      :rules="rules"
      ref="mouldForm"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="模板名称:" prop="name" id="tplName">
        <el-input v-model="mouldForm.name" :maxlength="15" @change="()=> { mouldForm.name = mouldForm.name.trim() }"/>
      </el-form-item>
      <el-form-item label="计费方式:" prop="type" v-if="!mouldForm.template_id">
        <el-radio-group v-model="mouldForm.type" >
          <el-radio :label="2">按件数计费</el-radio>
          <el-radio :label="1">按重量计费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="计费方式:" v-if="mouldForm.template_id">
        <div style="color: #909399;font-size: 13px;">{{ mouldForm.type | typeStatus }}</div>
      </el-form-item>
      <el-form-item label="计费区域:" prop="items">
        <el-table
          :data="mouldForm.items"
          style="width: 80%"
          border
        >
          <el-table-column label="计费区域" align="left">
            <template slot-scope="scope">
              <span v-html="getRowAreaNames(scope.row.area)"></span>
            </template>
          </el-table-column>
          <el-table-column :label="mouldForm.type === 1 ? '首重（kg）': '首件（个）'" prop="id" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.first_company" @blur="intFirstCompany(scope.row)"/>
            </template>
          </el-table-column>
          <el-table-column label="运费" prop="name" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.first_price" @blur="intMoney(scope.row, 'first_price')" ></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="mouldForm.type === 1 ? '续重（kg）': '续件（个）'" prop="desc" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.continued_company" @blur="intContinuedCompany(scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="续费" prop="desc" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.continued_price" @blur="intMoney(scope.row, 'continued_price')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="text" plain @click="editTollAreaRow(scope.row, scope.$index)">编辑</el-button>
              <el-button type="text" plain @click="delTollAreaRow(scope.$index)" style="color: red">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item prop="area">
        <el-button type="text" plain @click="chooseTollAreas">指定计费区域和运费</el-button>
      </el-form-item>
      <el-form-item label="免运费区域:">
        <el-table
          :data="mouldForm.free_items"
          style="width: 80%"
          border
        >
          <el-table-column label="免运费区域" align="left">
            <template slot-scope="scope">
              <span v-html="getRowAreaNames(scope.row.area)"></span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="text" plain @click="editFreeAreaRow(scope.row, scope.$index)">编辑</el-button>
              <el-button type="text" plain @click="delFreeAreaRow(scope.$index)" style="color: red">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item prop="area">
        <el-button type="text" plain @click="chooseFreeAreas">指定免运费区域</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSaveMould">保存模板</el-button>
      </el-form-item>
    </el-form>

    <!--计费、免运费区域-->
    <en-area-picker
      :title="isFree ? '选择免运费区域' : '选择计费区域'"
      :show.sync="showAreaDialog"
      :api="MixinApi.base + '/base/regions/depth/3'"
      :request="MixinRequest"
      :defaultIds="defaultIds"
      :excludeIds="excludeIds"
      :props="{ name: 'local_name' }"
      @confirm="handleConfirm"
    />
  </div>
</template>
<script>
import * as API_express from '@/api/expressMould'
import { RegExp } from '~/ui-utils'

export default {
  name: 'AddTemplate',
  props: {
    editTmpId: {
      type: String
    },
  },
  data() {
    return {
      // 地区选择器是否打开
      showAreaDialog: false,
      // 是否是免运费模式 默认是计费模式(false) 免运费模式(true)
      isFree: false,
      // 正在编辑的row
      editRow: '',
      editRowIndex: -1,
      // 模板表单信息
      mouldForm: {
        template_id: '',
        name: '',
        type: 1,
        items: [],
        free_items: []
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { max: 15, message: '模板名称最多15个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模板类型', trigger: 'change' }
        ],
        items: [{ required: true, message: '请选择计费区域', trigger: 'blur' }]
      },
      // 加载中
      loading: false
    }
  },
  watch: {
    editTmpId: {
      handler: 'initData',
      immediate: true
    }
  },
  filters: {
    typeStatus(type) {
      return type === 1 ? '重量算运费' : type === 2 ? '计件算运费' : '体积算运费'
    }
  },
  computed: {
    // 计算默认地区集合
    // 就是正在编辑的row的regions
    defaultIds() {
      if (!this.editRow) return []
      return Array.isArray(this.editRow.regions)
        ? this.editRow.regions.map(String)
        : []
    },
    // 计算排除地区集合
    // 如果没有正在编辑的row，就排除所有已选择的地区
    // 如果有正在编辑的row，要把正在编辑的row里选择的地区移除掉
    excludeIds() {
      const { mouldForm, editRow } = this
      let _excludeIds = []
      mouldForm.items.forEach(item => _excludeIds.push(...item.regions))
      mouldForm.free_items.forEach(item => _excludeIds.push(...item.regions))
      _excludeIds = _excludeIds.map(String)
      _excludeIds = Array.from(new Set(_excludeIds))
      if (editRow) {
        editRow.regions.forEach(item => {
          const index = _excludeIds.indexOf(String(item))
          if (index !== -1) _excludeIds.splice(index, 1)
        })
      }
      return _excludeIds
    }
  },
  methods: {
    // 初始化数据
    initData() {
      this.mouldForm = {
        template_id: '',
        name: '',
        type: 1,
        items: [],
        free_items: []
      }
      if (this.editTmpId) {
        this.getTemplateInfo(this.editTmpId)
      }
    },
    // 地区选择器回调
    handleConfirm(data) {
      const regions = data.checked.map(item => item.id)
      const areas = data.checkedTree
      if (this.editRowIndex !== -1) {
        const item = {
          ...this.editRow,
          regions: regions,
          area: areas
        }
        this.$set(this.isFree ? this.mouldForm.free_items : this.mouldForm.items, this.editRowIndex, item)
      } else {
        const item = {
          first_company: 1,
          first_price: 0,
          continued_company: 1,
          continued_price: 0,
          regions: regions,
          area: areas
        }
        this.isFree ? this.mouldForm.free_items.push(item) : this.mouldForm.items.push(item)
      }
      this.$forceUpdate()
      this.$refs.mouldForm.validateField('items')
      this.editRow = null
      this.editRowIndex = -1
    },
    // 过滤first_company
    intFirstCompany(row) {
      if (!RegExp.integer.test(row.first_company)) {
        row.first_company = 1
      }
    },
    // 过滤continued_company
    intContinuedCompany(row) {
      if (!RegExp.integer.test(row.continued_company)) {
        row.continued_company = 1
      }
    },
    // 过滤金额
    intMoney(row, price) {
      if (!RegExp.money.test(row[price])) {
        row[price] = 0.00
      } else {
        row[price] = Number.parseFloat(row[price]).toFixed(2)
      }
    },
    // 编辑收费区域
    editTollAreaRow(row, index) {
      this.editRow = row
      this.editRowIndex = index
      this.isFree = false
      this.$nextTick(() => {
        this.showAreaDialog = true
      })
    },
    // 删除收费区域
    async delTollAreaRow(index) {
      await this.$confirm('确定删除?', '提示', { type: 'warning' })
      this.mouldForm.items.splice(index, 1)
    },
    // 编辑免费区域
    editFreeAreaRow(row, index) {
      this.editRow = row
      this.editRowIndex = index
      this.isFree = true
      this.$nextTick(() => {
        this.showAreaDialog = true
      })
    },
    // 删除免费区域
    async delFreeAreaRow(index) {
      await this.$confirm('确定删除?', '提示', { type: 'warning' })
      this.mouldForm.free_items.splice(index, 1)
    },
    // 选择收费区域
    chooseTollAreas() {
      this.isFree = false
      this.editRow = null
      this.editRowIndex = -1
      this.showAreaDialog = true
    },
    // 选择免费区域
    chooseFreeAreas() {
      this.isFree = true
      this.editRow = null
      this.editRowIndex = -1
      this.showAreaDialog = true
    },
    // 获取编辑模版详情
    async getTemplateInfo(id) {
      try {
        this.loading = true
        const res = await API_express.getSimpleTpl(id)
        const items = res.items.map(item => {
          const area = typeof item.area === 'string' ? JSON.parse(item.area) : item.area
          item.area = this.restoreAreasJson(area)
          return item
        })
        res.items = items.filter(item => item.first_price > 0)
        res.items.forEach(item => {
          item.regions = this.getRegionIdsByItemArea(item.area)
        })
        res.free_items = items.filter(item => item.first_price <= 0)
        res.free_items.forEach(item => {
          item.regions = this.getRegionIdsByItemArea(item.area)
        })
        res.template_id = res.id
        this.mouldForm = res
      } finally {
        this.loading = false
      }
    },
    // 还原地区Object数据到Array
    restoreAreasJson(area) {
      if (typeof area !== 'object') return []
      const areas = []
      Object.keys(area).forEach(key => {
        area[key].checked = area[key].selected_all
        if (area[key].children) {
          area[key].children = this.restoreAreasJson(area[key].children)
        }
        areas.push(area[key])
      })
      return areas
    },
    // 从地区数据获取id集合
    getRegionIdsByItemArea(area) {
      if (!area || !Array.isArray(area)) return []
      const regions = []
      area.forEach(item => {
        if (item.children && typeof item.children === 'object') {
          if (item.selected_all) {
            regions.push(item.id)
          }
          regions.push(...this.getRegionIdsByItemArea(item.children))
        } else {
          regions.push(item.id)
        }
      })
      return regions
    },
    // 保存模板
    handleSaveMould() {
      this.$refs.mouldForm.validate(async valid => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.mouldForm))
          form.items.forEach(item => {
            delete item.regions
            item.area = JSON.stringify(this.makeAreasJson(item.area))
          })
          form.free_items.forEach(item => {
            delete item.regions
            item.area = JSON.stringify(this.makeAreasJson(item.area))
          })
          const { template_id } = form
          if (template_id) {
            await API_express.saveExpressMould(template_id, form)
          } else {
            await API_express.addExpressMould(form)
          }
          this.$message.success('保存成功！')
          this.mouldForm = {
            template_id: '',
            name: '',
            type: 1,
            items: [],
            free_items: []
          }
          this.$emit('addTemplate')
        }
      })
    },
    // 序列化地区Json
    makeAreasJson(areas) {
      if (!areas) return ''
      const areaObj = {}
      areas.forEach(item => {
        areaObj[String(item.id)] = item
        item.selected_all = item.checked
        if (item.checked) item.children = null
        if (Array.isArray(item.children)) {
          item.children = this.makeAreasJson(item.children)
        }
      })
      return areaObj
    },
    // 获取选中的地区名称
    getRowAreaNames(areas) {
      const names = []
      const colorMap = {
        '1': 'rgb(51, 51, 51)',
        '2': 'rgb(119, 119, 119)',
        '3': 'rgb(170, 170, 170)'
      }
      areas.forEach(item => {
        const color = colorMap[String(item.level)]
        let style = `color:${color}`
        if (!item.checked) style += `;font-style:italic`
        if (String(item.level) === '1') style += `;font-weight: bold`
        if (item.checked) {
          names.push(`<span style="${style}">${item.local_name}</span>`)
        } else if (Array.isArray(item.children)) {
          names.push(`<span style="${style}">${item.local_name}(${this.getRowAreaNames(item.children)})</span>`)
        }
      })
      return names.join('、')
    }
  }
}

</script>
<style lang="scss" scoped>
.add-template-wrap {
  background: #fff;
  padding: 20px;
  ::v-deep .el-button.is-plain, .el-button.is-plain:hover {
    border: none;
    background: none;
  }
}
.add-template-wrap ::v-deep .el-table .el-table__cell {
  vertical-align: top;
}
</style>
