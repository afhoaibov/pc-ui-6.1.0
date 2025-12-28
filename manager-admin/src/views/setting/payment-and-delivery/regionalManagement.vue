<template>
  <div>
    <el-tabs v-model="template_type" type="INTERNAL" v-if="open_i18n">
      <el-tab-pane label="国内" name="INTERNAL"></el-tab-pane>
      <el-tab-pane label="国际" name="INTERNATIONAL"></el-tab-pane>
    </el-tabs>
    <en-grade-editor-Int
      v-if="template_type === 'INTERNATIONAL'"
      ref="regionEditorINT"
      :api="MixinCountriesINTApi"
      :api2="MixinRegionINTApi"
      :btns="btnsINT"
      :maxLevel="2"
      :params-names="{ id: 'id', text: 'name' }"
      @add-click="handleAddINT" />

    <en-grade-editor
      v-else
      ref="regionEditor"
      type-text="地区"
      :api="MixinRegionApi"
      :btns="btns"
      :maxLevel="4"
      :params-names="{ id: 'id', text: 'local_name' }"
      @add-click="handleAdd" />

    <el-dialog :title="regionForm.id ? '编辑地区' : '添加地区'" width="500px" :visible.sync="dialogRegionVisible"
      :modal-append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="regionForm" :rules="regionRules" ref="regionForm" label-width="130px">
        <el-form-item label="地区名称" prop="local_name">
          <el-input v-model="regionForm.local_name"></el-input>
        </el-form-item>
        <el-form-item label="邮政编号">
          <el-input v-model="regionForm.zipcode" :maxlength="6"></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="regionForm.longitude" type="number" :maxlength="18"/>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="regionForm.latitude" type="number" :maxlength="18"/>
        </el-form-item>
        <el-form-item label="是否支持货到付款" prop="cod">
          <el-radio-group v-model="regionForm.cod">
            <el-radio :label="1">支持</el-radio>
            <el-radio :label="0">不支持</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRegionVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRegionForm('regionForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="regionForm.id ? '编辑地区' : '添加地区'" width="500px" :visible.sync="dialogRegionVisibleINT"
      :modal-append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="regionForm" ref="regionFormINT" label-width="130px">
        <span v-if="regionForm.$level == 0">
          <el-form-item label="国家名称">
            <el-form-item label="英语" prop="name" label-width="40px" style="margin-top:40px;">
              <el-input v-model="regionForm.name"></el-input>
            </el-form-item>
            <el-form-item label="母语" prop="mt" label-width="40px">
              <el-input v-model="regionForm.mt"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item label="国家编号" prop="code">
            <el-input v-model="regionForm.code"></el-input>
          </el-form-item>
          <el-form-item label="区号" prop="tel">
            <el-input v-model="regionForm.tel"></el-input>
          </el-form-item>
          <el-form-item label="效验正则" prop="tel">
            <el-input v-model="regionForm.mobile_regex"></el-input>
          </el-form-item>
          <el-form-item label="国旗(base64)" prop="flag">
            <el-input v-model="regionForm.flag"></el-input>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="国家编号" prop="country_code">
            <el-input v-model="regionForm.country_code"></el-input>
          </el-form-item>
          <el-form-item label="省编号" prop="code">
            <el-input v-model="regionForm.code"></el-input>
          </el-form-item>
          <el-form-item label="省名称" prop="name">
            <el-input v-model="regionForm.name"></el-input>
          </el-form-item>
        </span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRegionVisibleINT = false">取 消</el-button>
        <el-button type="primary" @click="submitRegionFormINT('regionFormINT')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Region from '@/api/region'

export default {
  name: 'regionalManagement',
  data() {
    return {
      template_type: 'INTERNAL',
      open_i18n: process.env.I18N,
      btns: [
        { text: '编辑', onClick: this.handleEdit },
        { text: '删除', onClick: this.handleDelete, color: 'red' }
      ],
      btnsINT: [
        { text: '编辑', onClick: this.handleEditINT },
        { text: '删除', onClick: this.handleDeleteINT, color: 'red' }
      ],
      /** 地区 表单 */
      regionForm: {},
      /** 地区 表单规则 */
      regionRules: {
        local_name: [this.MixinRequired('请输入地区名称！')],
        latitude: [this.MixinRequired('请输入地区纬度！')],
        longitude: [this.MixinRequired('请输入地区经度！')]
      },
      /** 地区表单 dialog */
      dialogRegionVisible: false,
      dialogRegionVisibleINT: false
    }
  },
  methods: {
    /** 编辑地区 */
    handleEditINT(region) {
      this.regionForm = this.MixinClone(region)
      this.dialogRegionVisibleINT = true
    },
    /** 编辑地区 */
    handleEdit(region) {
      this.regionForm = this.MixinClone(region)
      this.dialogRegionVisible = true
    },
    /** 删除地区 */
    handleDelete(region) {
      this.$confirm('确认要删除这个地区吗？').then(() => {
        API_Region.deleteRegion(region.id).then(() => {
          this.$message.success('删除成功！')
          this.$refs['regionEditor'].refresh('delete')
        })
      }).catch(() => { })
    },
    /** 删除地区 */
    handleDeleteINT(region) {
      this.$confirm('确认要删除这个地区吗？').then(() => {
        const deleteApi = region.$level === 0 ? API_Region.deleteCountriesINT : API_Region.deleteRegionINT
        deleteApi(region.id).then(() => {
          this.$message.success('删除成功！')
          this.$refs['regionEditorINT'].refresh('delete', {
            ...this.regionForm,
            id: this.regionForm.id,
            text: this.regionForm.local_name,
            code: this.regionForm.code
          })
        })
      }).catch(() => { })
    },
    /** 添加地区 */
    handleAdd(level, parent, parentArray) {
      this.regionForm = {
        parent_id: parent ? parent.id : 0,
        cod: 1
      }
      this.dialogRegionVisible = true
    },
    /** 添加地区 */
    handleAddINT(level, parent, parentArray) {
      this.regionForm = {
        parent_id: parent ? parent.id : 0,
        cod: 1,
        $level: level
      }
      this.dialogRegionVisibleINT = true
    },
    submitRegionFormINT(formName) {
      this.$refs[formName].validate((valid) => {
        console.log(this.regionForm)
        if (valid) {
          const { id } = this.regionForm
          if (!id) {
            if (this.regionForm.$level === 0) {
              API_Region.addCountriesINT(this.regionForm).then(response => {
                this.dialogRegionVisibleINT = false
                this.$message.success('添加成功！')
                this.$refs['regionEditorINT'].refresh('add')
              })
            } else {
              API_Region.addRegionINT(this.regionForm).then(response => {
                this.dialogRegionVisibleINT = false
                this.$message.success('添加成功！')
                this.$refs['regionEditorINT'].refresh('add', {
                  ...this.regionForm,
                  id: this.regionForm.id,
                  text: this.regionForm.local_name,
                  code: this.regionForm.code
                })
              })
            }
          } else {
            if (this.regionForm.$level === 0) {
              API_Region.editCountriesINT(id, this.regionForm).then(response => {
                this.dialogRegionVisibleINT = false
                this.$message.success('保存成功！')
                this.$refs['regionEditorINT'].refresh('edit', {
                  ...this.regionForm,
                  id: this.regionForm.id,
                  text: this.regionForm.local_name,
                  code: this.regionForm.code
                })
              })
            } else {
              API_Region.editRegionINT(id, this.regionForm).then(response => {
                this.dialogRegionVisibleINT = false
                this.$message.success('保存成功！')
                this.$refs['regionEditorINT'].refresh('edit', {
                  ...this.regionForm,
                  id: this.regionForm.id,
                  text: this.regionForm.local_name,
                  code: this.regionForm.code
                })
              })
            }
          }
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    },
    /** 提交地区表单 */
    submitRegionForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const { id } = this.regionForm
          if (!id) {
            API_Region.addRegion(this.regionForm).then(response => {
              this.dialogRegionVisible = false
              this.$message.success('添加成功！')
              this.$refs['regionEditor'].refresh('add')
            })
          } else {
            API_Region.editRegion(id, this.regionForm).then(response => {
              this.dialogRegionVisible = false
              this.$message.success('保存成功！')
              this.$refs['regionEditor'].refresh('edit', {
                ...this.regionForm,
                id: this.regionForm.id,
                text: this.regionForm.local_name
              })
            })
          }
        } else {
          this.$message.error('表单填写有误，请检查！')
          return false
        }
      })
    }
  }
}
</script>
