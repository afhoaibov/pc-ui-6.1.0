<template>
  <div class="sign-wrap send-message">
    <div class="table-tips-wrap">
      <div class="tips-box">
        <ul>
          <li>请选择签名和模板发送短信；</li>
          <li>“【短信签名】+短信内容+回T退订”是运营商确保短信发送成功的必填项，需计入短信字符内；</li>
          <li>发送时间范围：8:00-22:00，范围外的时间不能发送短信，建议定时发送时间在24小时内，合法时间范围内提交的短信将于30分钟内收到。</li>
          <li>无法向已停机或已提交注销申请的用户发送短信，但任务状态仍展示为成功</li>
        </ul>
      </div>
    </div>
    <div class="form-content">
      <div class="form-box">
        <el-form
          class="sign-form"
          ref="formData"
          :model="formData"
          label-width="100px"
          label-position="left"
          :rules="formRules"
          :disabled="Boolean(activeId)">
          <el-form-item label="短信签名：" prop="sign_id">
            <el-select
              clearable
              placeholder="请选择"
              v-model="formData.sign_id"
              @change="changeSign">
              <el-option
                v-for="item of signOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="短信模板：" prop="template_id">
            <el-select
              clearable
              placeholder="请选择"
              v-model="formData.template_id"
              @change="changeTmp">
              <el-option
                v-for="item of templateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="接收人：" required>
            <p>已选{{expectedPeopleNum}}人，预计消耗短信{{expectedTotal}}条</p>
            <el-checkbox-group
              @change="changeExecuteType"
              v-model="formData.receive_type">
              <el-checkbox label="ALL">全部</el-checkbox>
              <el-checkbox label="CUSTOM">自定义选择</el-checkbox>
            </el-checkbox-group>
            <div class="member-select-box" v-if="formData.receive_type[0] === 'CUSTOM'">
              <div class="member-list">
                <el-input
                  placeholder="输入手机号搜索"
                  v-model="memberParams.keyword"
                  class="input-with-select">
                  <el-button slot="append" @click="searchMemberList" icon="el-icon-search"></el-button>
                </el-input>
                <div class="member-content">
                  <p :class="['user-item', {'user-item-active': member.active}]"
                    v-for="(member, index) of memberList"
                    :key="member.member_id"
                    @click="chooseMember(index, member)"
                    >
                    {{member.mobile | formatMobile}} &nbsp; {{member.nickname}}
                  </p>
                </div>
              </div>
              <div class="select-list">
                <p class="select-item"
                  v-for="(member, index) of selectList"
                  :key="member.member_id">
                  <span>{{member.mobile | formatMobile}} &nbsp; {{member.nickname}}</span>
                  <i
                    class="el-icon-close"
                    v-if="!activeId"
                    @click="deleteSelectItem(member, index)"></i>
                </p>
              </div>
            </div>
            <div>
              <el-checkbox v-model="isManual">手动添加</el-checkbox>
              <el-input
                type="textarea"
                class="member-add-input"
                :autosize="{ minRows: 4, maxRows: 10}"
                placeholder="请输入您想发送的手机号，多个手机号请用‘,’隔开（英文逗号）"
                :maxlength="100"
                @input="handleManualReceiver($event)"
                v-model="formData.manual_receiver"
                clearable></el-input>
            </div>
          </el-form-item>

          <el-form-item label="发送时间：" maxlength="100" prop="execute_type">
            <div>
              <el-radio-group v-model="formData.execute_type">
                <el-radio label="QUICKLY">立即</el-radio>
                <el-radio label="TIMING">
                  定时
                  <el-date-picker
                    v-model="formData.execute_time"
                    v-if="formData.execute_type === 'TIMING'"
                    class="date-picker"
                    type="datetime"
                    value-format="timestamp"
                    placeholder="选择日期时间"
                    :default-time="MixinDefaultTime"
                    :picker-options="{ disabledDate (time) { return time.getTime() < (Date.now() - 8.64E7) || time.getTime() > Date.now() + (8.64E7 * 29) }}">
                  </el-date-picker>
                </el-radio>
              </el-radio-group>

              <p slot="tip" class="el-upload__tip">
                <i class="el-icon-warning" style="color: #E6A23C"></i>
                如需撤销，请在发送时间30分钟前操作
                <br />
                国内消息只能设置每天上午8:00到晚上22:00的发送任务
              </p>
            </div>
          </el-form-item>
        </el-form>
        <div class="iphone-bg-box">
          <div class="bubble-box">【{{formData.sign_name || '签名'}}】{{templateContent}}  回T退订</div>
        </div>
      </div>

      <div class="btn-box" v-if="!activeId">
        <el-button
          type="primary"
          size="medium"
          @click="submitEvent"
          >保存</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  import * as API_Message from '@/api/message'
  import * as API_Member from '@/api/member'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'sendMessage',
    data() {
      return {
        formRules: {
          sign_id: { required: true, message: '请选择短信签名', trigger: 'change' },
          template_id: { required: true, message: '请选择短信模板', trigger: 'change' },
          // receive_type: { required: true, message: '请选择或填写接收人', trigger: 'change' },
          execute_type: { required: true, message: '请选择发送时间', trigger: 'change' }
        },
        formData: {
          receive_type: [],
          execute_type: 'QUICKLY'
        },
        // manual_receiver: '',
        isManual: false,
        memberTotal: 0,
        // 用户检索
        memberParams: {
          keyword: '',
          page_no: 1,
          page_size: 500
        },
        // 用户列表
        memberList: [],
        // 已选用户列表
        selectList: [],
        // 签名选项
        signOptions: [],
        // 模板选项
        templateOptions: [],
        // 当前选择模板内容
        templateContent: '',
        activeId: ''
      }
    },
    watch: {
      $route: {
        handler(val) {
          if (val.name === 'sendMessage') {
            this.getMembersTotal()
            this.activeId = ''
            this.selectList = []
            this.formData = {
              receive_type: [],
              execute_type: 'QUICKLY'
            }
          }
          if (val.name === 'checkMessage' && val.params.id) {
            this.activeId = val.params.id
            this.getTaskInfo()
          }
          this.getPassSmsSignList()
          this.getPassTemplateList()
        },
        immediate: true
      }
    },
    computed: {
      /** 预计发送人数计算 */
      expectedPeopleNum() {
        const { receive_type, manual_receiver } = this.formData
        let number = 0
        if (receive_type[0] === 'ALL') {
          // 已选全部用户
          number += this.memberTotal
        } else {
          number += this.selectList.length
        }
        const manual = manual_receiver && manual_receiver.split(',').filter(item => {
          if (item) return item
        })
        if (manual && this.isManual) {
          number += manual.length
        }
        return number
      },
      expectedTotal() {
        return this.expectedPeopleNum
      }
    },
    methods: {
      changeExecuteType(label) {
        if (label.length > 1) {
          this.formData.receive_type.splice(0, 1)
        }
        if (label[0] === 'CUSTOM' && !this.memberList.length) {
          // 获取用户数据
          API_Member.getMemberList({
            page_no: 1,
            page_size: 50
          }).then(response => {
            this.memberList = response.data
          })
        }
        if (!label.length) {
          this.selectList = []
          this.memberList.map(item => {
            item.active = false
          })
        }
      },

      /** 查看短信详情 */
      getTaskInfo() {
        API_Message.getSmsTaskInfo(this.activeId).then(res => {
          res.execute_time = res.execute_time * 1000
          res.receive_type = [res.receive_type]
          if (res.custom_receiver) {
            this.selectList = res.custom_receiver.split(',').map(item => {
              return {
                mobile: item
              }
            })
          }
          this.formData = res
        })
      },
      handleManualReceiver(val) {
        val = val.replace(/[^\d,]/g, '')
        this.formData.manual_receiver = val
        if (val) {
          this.isManual = true
        } else {
          this.isManual = false
        }
      },
      /** 已选用户删除 */
      deleteSelectItem(member, index) {
        this.memberList.map(item => {
          if (item.member_id === member.member_id) {
            item.active = false
          }
        })
        this.selectList.splice(index, 1)
      },
      /** 用户选中 */
      chooseMember(index, member) {
        const active = !member.active
        this.$set(this.memberList[index], 'active', active)
        if (active) {
          this.selectList.push(member)
        } else {
          this.selectList.splice(this.selectList.findIndex(item => item.member_id === member.member_id), 1)
        }
      },
      /** 签名切换 */
      changeSign(val) {
        const activeItem = this.signOptions.find(item => { return item.value === val })
        this.formData.sign_name = activeItem && activeItem.label
      },
      /** 切换模板 */
      changeTmp(val) {
        const activeItem = this.templateOptions.find(item => { return item.value === val })
        this.formData.template_name = activeItem && activeItem.label
        this.templateContent = activeItem.template_content
      },
      /** 获取会员总人数 */
      getMembersTotal() {
        API_Member.getMembersTotal(this.memberParams).then(response => {
          this.memberTotal = response
        })
      },
      /** 检索用户 */
      searchMemberList() {
        API_Member.getMemberList(this.memberParams).then(response => {
          this.memberList = response.data
        })
      },
      /** 获取模板选项 */
      getPassTemplateList() {
        const params = {
          template_type: 'PROMOTE'
        }
        API_Message.getPassTemplateList(params).then(res => {
          this.templateOptions = res.map(item => {
            return {
              label: item.template_name,
              value: item.id,
              template_content: item.template_content
            }
          })
          if (this.formData.template_id) {
            const activeItem = res.find(item => { return item.id === this.formData.template_id })
            this.templateContent = activeItem.template_content
          }
        })
      },
      /** 获取短信签名选项 */
      getPassSmsSignList() {
        API_Message.getPassSmsSignList().then(res => {
          this.signOptions = res.map(item => {
            return {
              label: item.sign_name,
              value: item.id
            }
          })
        })
      },
      submitEvent() {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            const formData = cloneObj(this.formData)
            let errMsg = ''
            if (!this.expectedPeopleNum) {
              errMsg = '请选择或填写接收人！'
            }
            if (formData.execute_type === 'TIMING') {
              if (!formData.execute_time) {
                errMsg = '请选择发送时间！'
              }
              // 定时发送
              formData.execute_time = formData.execute_time && formData.execute_time / 1000
            }
            if (errMsg) {
              this.$message.error(errMsg)
              return
            }
            formData.receive_type = formData.receive_type[0]
            formData.expected_people_num = this.expectedPeopleNum
            formData.send_content = `【${formData.sign_name}】${this.templateContent} 回T退订`
            if (formData.receive_type === 'CUSTOM') {
              // 自定义接收人
              formData.custom_receiver = this.selectList.map(item => {
                return item.mobile
              })
              formData.custom_receiver = formData.custom_receiver.join(',')
            }
            API_Message.addSmsTask(formData).then(res => {
              this.$message.success('任务创建成功！')
              this.$store.dispatch('delVisitedViews', this.$route)
              this.$router.push({ name: 'textMessage' })
            })
          }
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
.send-message ::v-deep .el-input__inner {
  width: 400px;
}
.send-message ::v-deep .el-textarea__inner {
  width: 400px;
}
.sign-wrap {
  .form-content {
    background: #fff;
    padding: 40px 20px;
    width: 100%;
    .form-box {
      width: 80%;
      display: flex;
      justify-content: space-between;
      .iphone-bg-box {
        width: 240px;
        height: 500px;
        padding: 100px 30px;
        position: relative;
        background-image: url('../../../assets/images/iphone-bg.png');
        background-size: 240px auto;
        background-position: 0 center;
        background-repeat: no-repeat;
        .bubble-tips {
          color: #666;
          font-size: 12px;
        }
        .bubble-box {
          background: #efefef;
          position: relative;
          border: 2px solid #efefef;
          border-radius: 5px;
          min-height: 60px;
          line-height: 30px;
          display: flex;
          align-items: center;
          color: #333;
          font-size: 14px;
          padding: 10px;
        }

        .bubble-box::before {
          content: " ";
          position: absolute;
          right: 100%;
          top: 50%;
          margin: -5px 0 0;
          border: 10px solid transparent;
          border-right-color: #efefef;
        }

        .bubble-box::after {
          content: " ";
          position: absolute;
          right: 100%;
          top: 50%;
          margin-top: -2px;
          border: 7px solid transparent;
          border-right-color: #efefef;
        }
      }
    }
    .btn-box {
      width: 50%;
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }
  }
  .sign-form {
    width: 60%;
    ::v-deep .date-picker {
      .el-input__inner {
        width: 240px;
      }
    }
    ::v-deep .member-add-input {
      .el-textarea__inner {
        width: 100%;
      }
    }
    .member-select-box {
      width: 100%;
      height: 500px;
      border: 1px solid #efefef;
      border-radius: 4px;
      display: flex;
      .select-list {
        width: 50%;
        height: 100%;
        padding: 0 10px;
        .select-item {
          width: 100%;
          height: 35px;
          border-bottom: 1px solid #d9d9d9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .el-icon-close {
            color: #F56C6C;
            font-size: 24px;
            font-weight: 600;
            cursor: pointer;
          }
        }
      }
      .member-list {
        width: 50%;
        height: 100%;
        padding: 14px;
        border-right: 1px solid #efefef;
        .member-content {
          height: calc(100% - 40px);
          overflow: scroll;
        }
        .user-item {
          border-radius: 4px;
          width: 100%;
          height: 35px;
          border: 1px dashed #d9d9d9;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          &:hover {
            filter: brightness(1.1);
          }
        }
        .user-item-active {
          background: #409EFF;
          color: #fff;
          border: none;
        }
        ::v-deep .input-with-select {
          .el-input__inner {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
