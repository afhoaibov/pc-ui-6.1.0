<template>
  <div>
    <div class="level-content">
      <el-form
        :model="levelForm"
        :rules="levelRules"
        ref="levelForm"
        label-width="120px"
        :status-icon="false"
        label-position="top"
        inline
      >
        <el-divider>基础设置</el-divider>
        <el-form-item label="等级名称" prop="level_name" style="width: 100%;">
          <el-input v-model="levelForm.level_name" :maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="level_icon" style="width: 100%;">
          <el-upload
            :action="MixinUploadApi"
            :headers="MixinAccessToken"
            list-type="picture"
            :on-success="uploadSuccess"
            :on-remove="delImgEvent"
            :file-list="fileList"
            :multiple="false"
            :limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">&nbsp;请上传jpg/png文件，建议分辨率不要超过120*75、大小不超过1MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="店铺分摊比例" prop="allocation_ratio" style="width: 100%;">
          <el-input v-model="levelForm.allocation_ratio" :maxlength="3" clearable></el-input>
        </el-form-item>
        <el-form-item label="等级说明" prop="description">
          <en-rich-text-editor
            v-model="levelForm.description"
            :upload-api="MixinUploadApi"
            :upload-headers="MixinAccessToken"
            maxlength="9999"
          />
        </el-form-item>

        <el-divider>升级条件</el-divider>
        <div class="upgrade-item">
          <el-form-item label="积分" prop="point_condition_value_min">
            <el-input-number
              v-model="levelForm.point_condition_value_min"
              clearable
              :min="1"
              :max="999999999"
              :step="1"
              :controls="false"
              v-input.int
              placeholder="请填写最小积分数"
              style="width: 150px"
            />
            <span>至</span>
            <el-input-number
              v-model="levelForm.point_condition_value_max"
              clearable
              :min="1"
              :max="999999999"
              :step="1"
              :controls="false"
              v-input.int
              placeholder="请填写最大积分数"
              style="width: 150px"
            />
          </el-form-item>
        </div>
        <el-divider>等级福利</el-divider>
        <el-form-item label="是否开启优惠" prop="is_enabled">
          <el-switch
            v-model="levelForm.is_enabled"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>

        <el-form-item v-if="levelForm.is_enabled === 1" label="消费折扣" prop="discount_benefit_value">
          <el-input
            v-model="levelForm.discount_benefit_value"
            placeholder="请填写1-100之间的整数"
            :maxlength="3"
            clearable
            v-input.int
            style="width: 200px"
          >
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="confirm-btn">
        <el-button size="medium" type="primary" @click="handlerConfirm">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { RegExp } from '~/ui-utils'
import * as API_Member from '@/api/member'

export default {
  name: 'memberLevelAdd',
  data() {
    return {
      /** 添加，编辑  表单*/
      levelForm: {
        point_condition_value_min: '',
        point_condition_value_max: ''
      },
      fileList: [],
      sort_order: '',
      is_enabled: 1,
      /** 添加，编辑 表单规则*/
      levelRules: {
        level_name: [this.MixinRequired('请填写等级名称！')],
        level_icon: [this.MixinRequired('请上传图标！')],
        point_condition_value_min: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const { point_condition_value_min, point_condition_value_max } = this.levelForm
              if (!point_condition_value_min && !point_condition_value_max) {
                return callback(new Error('请填写积分数区间！'))
              }
              if (!point_condition_value_min) {
                return callback(new Error('请填写最小积分数！'))
              }
              if (!point_condition_value_max) {
                return callback(new Error('请填写最大积分数！'))
              }
              return callback()
            },
            trigger: 'blur'
          }
        ],
        allocation_ratio: [
          this.MixinRequired('请填写分摊比例！'),
          {
            validator: (rule, value, callback) => {
              return Number(value) >= 100 ? callback(new Error('分摊比例不能大于100%！')) : callback()
            },
            trigger: 'blur'
          }
        ],
        discount_benefit_value: [
          this.MixinRequired('请填写消费折扣！'),
          {
            validator: (rule, value, callback) => {
              return Number(value) > 100 ? callback(new Error('消费折扣不能大于100%')) : callback()
            },
            trigger: 'blur'
          }
        ]
      },
      id: ''
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (val.name === 'memberLevelEdit' && val.params.id) {
          this.id = val.params.id
          this.getMembersLevelDetail()
        } else if (val.name === 'memberLevelAdd') {
          this.levelForm = {}
        }
      },
      immediate: true
    }
  },
  methods: {
    uploadSuccess(res, file, fileList) {
      this.$set(this.levelForm, 'level_icon', res.url)
    },
    /** 图片移除之后 */
    delImgEvent() {
      this.fileList = []
      this.levelForm.level_icon = ''
    },
    /** 获取等级数据 */
    getMembersLevelDetail() {
      API_Member.getMembersLevelDetail(this.id).then(res => {
        const { upgrade_conditions, benefits } = res
        this.levelForm = this.MixinClone(res)
        this.$set(this.levelForm, 'point_condition_value_min', upgrade_conditions[0].condition_value_min)
        this.$set(this.levelForm, 'point_condition_value_max', upgrade_conditions[0].condition_value_max)
        this.$set(this.levelForm, 'discount_benefit_value', benefits[0].benefit_value)
        this.fileList = res.level_icon ? [{ name: 'level_icon', url: res.level_icon }] : []
        this.sort_order = res.sort_order
      })
    },
    handlerConfirm() {
      this.$refs['levelForm'].validate((valid) => {
        if (valid) {
          const levelForm = this.MixinClone(this.levelForm)
          if (parseInt(levelForm.point_condition_value_min) > parseInt(levelForm.point_condition_value_max)) {
            this.$message.error('起始积分数不得大于最大积分数！')
            return
          }
          const params = {
            level_name: levelForm.level_name,
            level_icon: levelForm.level_icon,
            allocation_ratio: levelForm.allocation_ratio,
            description: levelForm.description,
            is_enabled: levelForm.is_enabled,
            upgrade_conditions: [
              {
                condition_type: 'POINTS',
                condition_value_min: levelForm.point_condition_value_min,
                condition_value_max: levelForm.point_condition_value_max
              }
            ],
            benefits: [
              { benefit_type: 'DISCOUNT', benefit_value: levelForm.discount_benefit_value }
            ]
          }
          if (this.id) {
            params.sort_order = this.sort_order
            API_Member.updateMembersLevel(this.id, params).then(res => {
              this.$message.success('修改成功！')
              this.$router.push({ name: 'memberLevel' })
            })
          } else {
            API_Member.addMembersLevel(params).then(res => {
              this.$message.success('提交成功！')
              this.$router.push({ name: 'memberLevel' })
            })
          }
        }
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.level-content ::v-deep .el-input {
  max-width: 400px;
}
.level-content {
  background: #fff;
  padding: 20px;
  .confirm-btn {
    text-align: center;
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px dashed #dcdfe6;
  }
}
.upgrade-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #606266;
  margin: 20px;
  .span-text {
    min-width: 65px;
    text-align: center;
  }
  .el-input {
    max-width: 200px;
    margin: 0 10px;
  }
}
</style>
