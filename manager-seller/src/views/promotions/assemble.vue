<template>
  <div class="content-goods-publish">
    <el-form
      :model="activityForm"
      status-icon
      :rules="rules"
      label-position="right"
      ref="activityForm"
      label-width="120px"
      :disabled="isView"
      class="demo-ruleForm">
      <el-form-item  label="活动名称：" prop="promotion_name">
        <el-input
          v-model="activityForm.promotion_name"
          @change="activityForm.promotion_name  = activityForm.promotion_name.trim()"
          placeholder="不超过20个字符"
          maxLength="20"
        ></el-input>
      </el-form-item>
      <el-form-item  label="活动标题：" prop="promotion_title">
        <el-input
          v-model="activityForm.promotion_title"
          @change="activityForm.promotion_title  = activityForm.promotion_title.trim()"
          placeholder="不超过5个字符"
          maxLength="5"
        ></el-input>
      </el-form-item>
      <el-form-item label="生效时间：" prop="take_effect_time">
        <el-date-picker
          v-model="activityForm.take_effect_time"
          type="datetimerange"
          value-format="timestamp"
          range-separator="-"
          placement="bottom-start"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[MixinDefaultTime, MixinDefaultTime]"
          :picker-options="{disabledDate(time) { return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime() > endTime }}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="参团人数：" prop="required_num">
        <el-input
          v-model="activityForm.required_num"
          @change="activityForm.required_num = activityForm.required_num.trim()"
          placeholder="不超过3个字符"
          maxLength="3"
        >
          <template slot="append">人</template>
        </el-input>
      </el-form-item>
      <el-form-item label="成团时限：" prop="limit_time">
        <el-input
          v-model="activityForm.limit_time"
          @change="activityForm.limit_time = activityForm.limit_time.trim()"
          placeholder="不超过3个字符"
          maxLength="3"
        >
          <template slot="append">小时</template>
        </el-input>
      </el-form-item>
      <el-form-item label="虚拟成团：">
        <el-switch
          v-model="activityForm.enable_mocker"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="开启"
          inactive-text="关闭"
        />
        <p class="tip">开启虚拟成团后，活动成团时限到期时人数未满的团，系统将会模拟匿名买家凑满人数，使该团成团，开启以提高成团率</p>
      </el-form-item>
      <el-form-item>
        <el-button v-show="!isView" type="primary" @click="handleSaveActivity('activityForm')">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import * as API_activity from '@/api/activity'
  import { RegExp } from '~/ui-utils'

  export default {
    name: 'assemble',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          promotion_id: ''
        },

        /** 新增满减表单信息*/
        activityForm: {},

        /** 表单校验规则*/
        rules: {
          promotion_name: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 2, max: 25, message: '长度在2-25个字符之内', trigger: 'blur' }
          ],
          promotion_title: [
            { min: 0, max: 5, message: '长度在5个字符之内', trigger: 'blur' }
          ],
          take_effect_time: [
            { type: 'array', required: true, message: '请选择起止时间', trigger: 'blur' }
          ],
          required_num: [
            { required: true, message: '请填写参团人数', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(new Error('请填写参团人数'))
                } else if (!RegExp.integer.test(value)) {
                  callback(new Error('请填写正整数'))
                } else {
                  callback()
                }
              }
            }
          ],
          limit_time: [
            { required: true, message: '请填写成团时限', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                if (!Number(value) || !RegExp.positiveInteger.test(value)) {
                  callback(new Error('请填写大于0的正整数'))
                } else {
                  callback()
                }
              }
            }
          ]
        },
        // 是否为查看
        isView: false,
        endTime: ''
      }
    },
    watch: {
      $route: {
        handler(val) {
          if (val.name !== 'addAssemble' && val.name !== 'editAssemble' && val.name !== 'viewAssemble') return
          this.isView = val.name === 'viewAssemble'

          if (val.name === 'addAssemble') {
            this.activityForm = {}
          } else {
            this.params.promotion_id = this.$route.params.promotion_id
            this.GET_AssembleActivity()
          }
        },
        immediate: true
      }
    },
    mounted() {
      // 获取某天23:59:59秒的时间戳
      this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
    },
    methods: {
      /** 查询单个活动信息 */
      GET_AssembleActivity() {
        API_activity.getAssembleActivity(this.params.promotion_id).then(response => {
          this.activityForm = {
            ...response,
            take_effect_time: [parseInt(response.start_time) * 1000, parseInt(response.end_time) * 1000],
            enable_mocker: response.enable_mocker === 1
          }
        })
      },

      /** 保存表单设置*/
      handleSaveActivity(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.activityForm.start_time = parseInt(this.activityForm.take_effect_time[0] / 1000)
            this.activityForm.end_time = parseInt(this.activityForm.take_effect_time[1] / 1000)
            const _params = { ...this.activityForm }
            _params.enable_mocker = _params.enable_mocker ? 1 : 0
            delete _params.take_effect_time
            if (this.activityForm.promotion_id) {
              API_activity.editAssembleActivity(_params.promotion_id, _params).then(() => {
                this.$message.success('保存成功！')
                this.handleSuccessCallBack()
              }).catch(() => {})
            } else {
              API_activity.addAssembleActivity(_params).then(() => {
                this.$message.success('添加成功！')
                this.handleSuccessCallBack()
              }).catch(() => {})
            }
          } else {
            this.$message.error('表单存在错误，请修正')
          }
        })
      },
      /** 新增或编辑成功后操作 */
      handleSuccessCallBack() {
        this.$router.push({ path: '/promotions/assembleManager' })
        this.$store.state.tagsView.cachedViews = this.$store.state.tagsView.cachedViews.filter(tab => tab !== 'assemble')
        this.$store.state.tagsView.visitedViews = this.$store.state.tagsView.visitedViews.filter(tab => tab.name !== 'assemble')
        this.$route.params.callback()
        this.$store.dispatch('delCurrentViews', {
          view: this.$route,
          $router: this.$router
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .content-goods-publish {
    ::v-deep div.toolbar {
      height: 70px;
      padding: 20px 0;
    }
    ::v-deep .el-input {
      max-width: 400px;
    }
    ::v-deep .el-textarea__inner {
      max-width: 500px;
    }
  }

  .content-goods-publish {
    padding: 15px;
    margin: 0 auto;
    text-align: center;
    border: 1px solid #ddd;
    background: none repeat scroll 0 0 #fff;
  }

  /*表单信息*/
  .el-form {
    padding-bottom: 80px;
    .el-form-item {
      width: 100%;
      text-align: left;

      /*送积分*/
      .integral-show {
        .el-input {
          width: 50px;
        }
      }
      /** 下拉列表 */
      ::v-deep .el-select .el-select--medium {
        width: 160px;
      }
    }
    .discount-model {
      div {
        margin: 5px 0;
      }
    }
    p.tip {
      font-size: 14px;
      color: #ccc;
    }
  }

  /** 表格信息 */
  .goods-info {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    div {
      a {
        color: #409EFF;
      }
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: flex-start;
      margin-left: 20px;
    }
  }
</style>


