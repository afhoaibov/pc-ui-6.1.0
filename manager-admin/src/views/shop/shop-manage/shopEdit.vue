<template>
  <div v-loading="loading" class="shop-edit">
    <el-form class="shop-info-form" :model="shopForm" :rules="shopRules" ref="shopForm" label-width="190px">
      <el-tabs type="border-card" v-model="tableName" ref="tabs">
        <el-tab-pane label="基本信息" name="base" class="base-form">
          <el-form-item label="公司名称" prop="company_name" label-width="100px">
            <el-input v-model="shopForm.company_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司地址" prop="company_address" label-width="100px">
            <el-input v-model="shopForm.company_address" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司电话" prop="company_phone" label-width="100px">
            <el-input v-model="shopForm.company_phone" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="员工总数" prop="employee_num" class="employee_num" label-width="100px">
            <el-input-number v-model="shopForm.employee_num" :min="1" :max="99999999"/>
          </el-form-item>
          <el-form-item label="注册资金" prop="reg_money" label-width="100px">
            <el-input
              v-model="shopForm.reg_money"
              class="reg-money-input"
              :maxlength="10">
              <template slot="append">万</template>
            </el-input>
          </el-form-item>
          <el-form-item label="联系姓名" prop="link_name" label-width="100px">
            <el-input v-model="shopForm.link_name" :maxlength="50"></el-input>
          </el-form-item>
          <en-area-select
            :showType="1"
            labelText="联系电话"
            label-width="100px"
            ref="AreaSelect"
            :class="open_i18n ? 'area-input' : 'area-form'"
            v-model="shopForm.link_phone"/>
          <el-form-item label="电子邮箱" prop="company_email" label-width="100px">
            <el-input v-model="shopForm.company_email" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="自营店铺" prop="self_operated" label-width="100px">
            <el-radio-group v-model="shopForm.self_operated">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="营业执照信息" name="legal">
          <div style="display: flex;">
            <div style="margin-right: 20px;">
              <el-form-item label="法人姓名" prop="legal_name">
                <el-input v-model="shopForm.legal_name" :maxlength="200"></el-input>
              </el-form-item>
              <el-form-item label="法人身份证号" prop="legal_id">
                <el-input v-model="shopForm.legal_id" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="license_num">
                <el-input v-model="shopForm.license_num" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="营业执照详细地址 " prop="license_add">
                <el-input v-model="shopForm.license_add" :maxlength="200"></el-input>
              </el-form-item>
              <el-form-item label="成立日期" prop="establish_date">
                <el-date-picker
                  class="license-date"
                  v-model="shopForm.establish_date"
                  type="date"
                  align="center"
                  :editable="false"
                  value-format="timestamp"
                  :picker-options="{ disabledDate(time) { return time.getTime() > (shopForm.licence_end - 86400000) } }">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="营业执照有效期" prop="licence_start">
                <el-date-picker
                  class="license-date"
                  v-model="shopForm.licence_start" type="date" align="center"
                  :editable="false"
                  value-format="timestamp"
                  :picker-options="{ disabledDate(time) { return time.getTime() > (shopForm.licence_end - 86400000) } }"
                >
                </el-date-picker>
                <span>-</span>
                <el-date-picker
                  class="license-date" v-model="shopForm.licence_end" type="date" align="center"
                  :editable="false"
                  value-format="timestamp"
                  :picker-options="{ disabledDate(time) { return time.getTime() < (shopForm.licence_start + 86400000) } }"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="营业执照所在地" prop="license_region">
                <en-region-picker
                  :api="MixinRegionApi"
                  :default="defaultRegionLicense"
                  @changed="handleRegionChanged('license', $event)"
                />
              </el-form-item>
            </div>
          </div>
          <div>
            <br>
            <div class="scope-box">
              <el-form-item label="法定经营范围" prop="scope">
                <el-input v-model="shopForm.scope" type="textarea" rows="5"></el-input>
              </el-form-item>
            </div>
            <br>
            <el-form-item label="法人身份证" prop="legal_img">
              <el-upload class="avatar-uploader" :action="MixinUploadApi" :headers="MixinAccessToken"
                         :show-file-list="false" :on-success="(res) => uploadSuccess(res, 'legal_img')">
                <img v-if="shopForm.legal_img" :src="shopForm.legal_img" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
              <a v-if="shopForm.legal_img" :href="shopForm.legal_img" target="_blank" class="see-original">查看原图</a>
            </el-form-item>
            <br>
            <el-form-item label="营业执照" prop="licence_img">
              <el-upload class="avatar-uploader" :action="MixinUploadApi" :headers="MixinAccessToken"
                         :show-file-list="false" :on-success="(res) => uploadSuccess(res, 'licence_img')">
                <img v-if="shopForm.licence_img" :src="shopForm.licence_img" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
              <a v-if="shopForm.licence_img" :href="shopForm.licence_img" target="_blank"
                 class="see-original">查看原图</a>
            </el-form-item>
          </div>
        </el-tab-pane>
        <el-tab-pane label="开户行银行许可证" name="bank" style="width: 700px">
          <el-form-item label="银行开户名" prop="bank_account_name">
            <el-input v-model="shopForm.bank_account_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司银行账号" prop="bank_number">
            <el-input v-model="shopForm.bank_number" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="开户银行支行名称" prop="bank_name">
            <el-input v-model="shopForm.bank_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="开户行所在地" prop="bank_region">
            <en-region-picker
              :api="MixinRegionApi"
              :default="defaultRegionBank"
              @changed="handleRegionChanged('bank', $event)"
            />
          </el-form-item>
          <br>
          <el-form-item label="开户行许可证" prop="bank_img">
            <el-upload
              class="avatar-uploader"
              :action="MixinUploadApi"
              :headers="MixinAccessToken"
              :show-file-list="false"
              :on-success="(res) => uploadSuccess(res, 'bank_img')"
            >
              <img v-if="shopForm.bank_img" :src="shopForm.bank_img" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <a v-if="shopForm.bank_img" :href="shopForm.bank_img" target="_blank" class="see-original">查看原图</a>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="店铺信息" name="shop">
          <el-form-item label="店铺名称" prop="shop_name">
            <el-input v-model="shopForm.shop_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="佣金比例" prop="shop_commission">
            <el-input class="shop-commission-input" v-model="shopForm.shop_commission" :maxlength="50">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="店铺所在地" prop="shop_region">
            <en-region-picker
              :api="MixinRegionApi"
              :default="defaultRegionShop"
              @changed="handleRegionChanged('shop', $event)"
            />
          </el-form-item>
          <el-form-item label="店铺详细地址" prop="shop_add">
            <el-input v-model="shopForm.shop_add" :maxlength="200"></el-input>
          </el-form-item>
        </el-tab-pane>
        <template v-if="isO2O">
          <el-tab-pane label="经营类目" name="category">
            <el-form-item label-width="100px" label="经营类目" prop="goods_management_category" class="form-item-cat">
              <el-radio-group v-model="shopForm.goods_management_category">
                <el-radio v-for="cat in categorys" :label="cat.id" :key="cat.id">{{ cat.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
        </template>
        <template v-if="!isO2O">
          <el-tab-pane label="经营类目" name="category">
            <el-form-item label-width="100px" label="经营类目" prop="goods_management_category" class="form-item-cat">
              <el-checkbox
                :indeterminate="isIndeterminateCat"
                v-model="checkAllCat"
                @change="handleCheckAllCatChange"
              >全选</el-checkbox>
              <div style="margin: 15px 0;"></div>
              <el-checkbox-group
                v-model="shopForm.goods_management_category"
                @change="handleCheckedCatsChange">
                <el-checkbox v-for="cat in categorys" :label="cat.id" :key="cat.id">{{ cat.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
        </template>
        <el-tab-pane label="财务信息" name="financial">
          <el-form-item required label="结算日" label-width="120px">
            <span>已添加{{ settlementDate.length }}个结算日，最多可添加5个结算日</span>
          </el-form-item>
          <el-form-item label="每月：" label-width="120px" prop="settlement_day">
            <el-tag
              class="tag-item"
              :key="tag"
              v-for="(tag, index) in settlementDate"
              closable
              :disable-transitions="false"
              @close="handleCloseTag(index)">
              {{ tag }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-model="tagValue"
              ref="saveTagInput"
              size="small"
              oninput="value = value = (value < 1 || value > 31) ? '' : value.replace(/[^\d]/g, '')"
              @keyup.enter.native="handleInputConfirm"
            >
            </el-input>
          </el-form-item>
          <div class="tips" :style="{'padding-left': `${!open_i18n ? '120px' : ''}`}">
            输入1-31之间的数字，点击“enter回车键”添加，当月不包含所设日期时，将会顺延到下一个结算日
          </div>
          <div class="sample-box" :style="{'padding-left': `${!open_i18n ? '60px' : ''}`}">
            <p>注：店铺1号申请开店，设置结算日为15日、25日</p>
            <img style="width: 550px;" src="@/assets/images/jiesuan.png"/>
            <p>
              生成的结算单依次为：1号-14号，15号至24号，25号至2月14号，往后结算单以此类推，每月生成2次，统计的订单日期到设置结算日前一天。</p>
          </div>
          <el-form-item label="订单结算状态" label-width="120px" prop="settlement_status">
            <el-checkbox-group v-model="checkList" @change="changeSettlementStatus">
              <el-checkbox
                v-for="child in settlementStatus"
                :key="child.value"
                :label="child.value"
              >{{ child.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="店铺保证金" label-width="120px">
            <span class="security-deposit">{{ shopForm.remaining_margin }}</span>
            <el-button
              size="mini"
              type="primary"
              @click="showDeductDialog = true">扣除保证金
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="showRecordDialog = true">保证金流水
            </el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <div class="save-btn-box">
        <el-button type="primary" @click="handleSaveEdit">
          {{ isAudit ? '通过并保存' : shopForm.shop_disable === 'WAIN_IMPROVED' ? '开店' : '保存修改' }}
        </el-button>
        <el-button v-if="isAudit" type="danger" @click="handleRefusePass">拒绝通过</el-button>
      </div>
    </el-form>
    <!-- 扣除保证金弹窗 -->
    <deduct-margin
      v-model="showDeductDialog"
      :remainingMargin="shopForm.remaining_margin"
      :shopId="shop_id"
      @onClose="showDeductDialog = false"
      @onSuccess="onSuccess"
    />
    <!-- 查看保证金流水 -->
    <margin-record
      v-model="showRecordDialog"
      :shopId="shop_id"
      @onClose="showRecordDialog = false"/>

    <!--审核商品 dialog-->
    <el-dialog
      :title="dialogAuditTitle"
      :visible.sync="dialogAuditVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="auditForm" :rules="auditRules" ref="auditForm" label-width="100px">
        <el-form-item label="备注信息" prop="audit_remark">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入审核备注(120字以内)"
            :maxlength="120"
            v-model="auditForm.audit_remark">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAuditVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAuditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import * as API_Category from '@/api/category'
import { RegExp, Foundation } from '~/ui-utils'
import { api } from '~/ui-domain'
import DeductMargin from '../components/DeductMargin'
import MarginRecord from '../components/MarginRecord'

const settlementStatus = [
  { label: '已付款', value: 'PAID_OFF' },
  { label: '已完成', value: 'COMPLETE' },
  { label: '售后失效', value: 'EXPIRED' }
]
export default {
  name: 'shopEdit',
  components: {
    DeductMargin,
    MarginRecord
  },
  data() {
    return {
      settlementStatus,
      // 审核店铺 dialog
      dialogAuditVisible: false,
      auditForm: {
        audit_remark: ''
      },
      // 审核店铺dialogTitle
      dialogAuditTitle: '审核店铺',
      open_i18n: process.env.I18N,
      api: `${api.base}/base/countries`,
      tableName: 'base',
      shop_id: this.$route.params.id,
      isAudit: !!this.$route.query.audit,
      loading: true,
      shopForm: {
        shop_type: 'NORMAL',
        shop_commission: 5,
        goods_management_category: []
      },
      // 已选结算日期
      settlementDate: [],
      // 结算日期输入
      tagValue: '',
      // 结算订单状态选择
      checkList: [],
      showDeductDialog: false,
      showRecordDialog: false,
      // 审核商品 表单校验
      auditRules: {
        audit_remark: [this.MixinRequired('请输入审核备注！')]
      },
      shopRules: {
        company_name: [this.MixinRequired('公司名称不能为空！')],
        company_address: [this.MixinRequired('公司地址不能为空！')],
        company_phone: [
          this.MixinRequired('公司电话不能为空！')
        ],
        employee_num: [this.MixinRequired('公司员工数不能为空！')],
        reg_money: [
          this.MixinRequired('注册资金不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (value && !RegExp.money.test(value)) {
                callback(new Error('注册资金格式有误！'))
              } else if (value.length > 10) {
                callback(new Error('注册资金超过最大限额！'))
              } else {
                callback()
              }
            }
          }
        ],
        link_name: [this.MixinRequired('联系姓名不能为空！')],
        link_phone: [
          {
            validator: (rule, value, callback) => {
              const { mobile_regex, formatValid } = this.$refs.AreaSelect
              if (!value) {
                callback(new Error('联系电话不能为空！'))
              } else if (mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                callback(new Error('联系电话格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ],
        company_email: [this.MixinRequired('公司电子邮箱不能为空！')],
        legal_name: [this.MixinRequired('法人姓名不能为空！')],
        legal_id: [
          this.MixinRequired('法人身份证不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (value && !RegExp.IDCard.test(value)) {
                callback(new Error('身份证格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ],
        license_num: [this.MixinRequired('营业执照不能为空！')],
        scope: [this.MixinRequired('法定经营范围不能为空！')],
        license_region: [this.MixinRequired('请选择营业执照所在地！')],
        license_add: [this.MixinRequired('营业执照详细地址不能为空！')],
        establish_date: [this.MixinRequired('请选择公司成立日期！')],
        licence_start: [this.MixinRequired('请选择营业执照有效期开始时间！')],
        // licence_end: [this.MixinRequired('请选择营业执照有效期结束时间！')],
        legal_img: [this.MixinRequired('请上传法人身份证！')],
        licence_img: [this.MixinRequired('请上传营业执照！')],
        license_img: [this.MixinRequired('请上传营业执照！')],
        bank_account_name: [this.MixinRequired('银行开户名不能为空！')],
        bank_number: [this.MixinRequired('公司银行账号不能为空！')],
        bank_name: [this.MixinRequired('开户银行支行名称不能为空！')],
        bank_region: [this.MixinRequired('请选择开户行所在地！')],
        bank_img: [this.MixinRequired('请上传开户行许可证！')],
        shop_name: [this.MixinRequired('店铺名称不能为空！')],
        shop_region: this.MixinRequired('请选择店铺所在地！'),

        shop_add: [this.MixinRequired('店铺详细地址不能为空！')],
        shop_commission: [
          this.MixinRequired('店铺佣金比例不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.money.test(value)) {
                callback(new Error('店铺佣金比例格式不正确！'))
              } else if (value > 100) {
                callback(new Error('店铺佣金比例不能超过100%！'))
              } else {
                callback()
              }
            }
          }
        ],
        goods_management_category: [this.MixinRequired('请选择店铺经营类目！')],
        settlement_day: this.MixinRequired('请输入结算日期！'),
        settlement_status: this.MixinRequired('请选择订单结算状态！')
      },
      isIndeterminateCat: true,
      checkAllCat: false,
      categorys: [],
      defaultRegionLicense: null,
      defaultRegionBank: null,
      defaultRegionShop: null
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'shopEdit') return
        this.shop_id = newVal.params.id
        this.isAudit = !!newVal.query.audit
        if (this.shop_id) {
          this.shopForm = {
            shop_type: 'NORMAL',
            shop_commission: 5,
            goods_management_category: []
          }
          this.initMemberInfo()
        }
      }
    },
    settlementDate: {
      handler(val) {
        if (val) {
          this.$set(this.shopForm, 'settlement_day', val.join(','))
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 财务结算状态选择 */
    changeSettlementStatus() {
      if (this.checkList.length > 1) {
        this.checkList.splice(0, 1)
      }
      this.$set(this.shopForm, 'settlement_status', this.checkList[0])
      this.$refs.shopForm.validateField('settlement_status')
    },
    /** 财务结算日期添加 */
    handleInputConfirm() {
      const tagValue = this.tagValue
      const settlementDate = this.settlementDate
      if (tagValue) {
        let errorMsg = ''
        if (settlementDate.length === 5) {
          errorMsg = '最多可添加5个结算日'
        } else if (settlementDate.some(v => {
          return v === tagValue
        })) {
          errorMsg = `已存在${tagValue}, 请重新添加`
        }
        if (errorMsg) {
          this.$message.error(errorMsg)
        } else {
          this.settlementDate.push(tagValue)
        }
      }
      this.tagValue = ''
    },

    /** 删除结算日日期 */
    handleCloseTag(index) {
      this.settlementDate.splice(index, 1)
    },

    uploadSuccess(res, type) {
      this.$set(this.shopForm, type, res.url)
    },
    submitAuditForm() {
      this.$refs['auditForm'].validate((valid) => {
        if (valid) {
          const params = this._getParams()
          params.pass = 0
          params.audit_remark = this.auditForm.audit_remark
          API_Shop.editAuthShop(this.shop_id, params).then(response => {
            this.$message.success('已拒绝该店铺！')
            const { callback } = this.$route.params
            typeof callback === 'function' && callback()
            this.$store.dispatch('delCurrentViews', {
              view: this.$route,
              $router: this.$router
            })
            this.dialogAuditVisible = false
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          return false
        }
      })
    },

    handleRegionChanged(type, object) {
      const key = `${type}_region`
      this.$set(this.shopForm, key, JSON.stringify(object))
      this.$refs.shopForm.validateField(key)
    },

    /** 经营类目全选 */
    handleCheckAllCatChange(val) {
      this.shopForm.goods_management_category = val ? this.categorys.map(item => item.id) : []
      this.isIndeterminateCat = false
    },

    /** 经营类目选择 */
    handleCheckedCatsChange(value) {
      let checkedCount = value.length
      this.checkAllCat = checkedCount === this.categorys.length
      this.isIndeterminateCat = checkedCount > 0 && checkedCount < this.categorys.length
    },
    /** 保存修改 */
    handleSaveEdit() {
      const _params = this.$route.params

      this.$refs['shopForm'].validate((valid, error) => {
        if (valid) {
          const params = this._getParams()
          API_Shop.editAuthShop(this.shop_id, params).then(response => {
            if (this.isAudit) {
              this.$message.success('审核通过！')
              this.isAudit = false
              this.$store.dispatch('delCurrentViews', {
                view: this.$route,
                $router: this.$router
              })
              _params.callback()
            } else {
              this.$message.success('修改成功！')
              this.$store.dispatch('delCurrentViews', {
                view: this.$route,
                $router: this.$router
              })
              _params.callback()
            }
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          // 找到出错的第一个tab
          // 再将tab切换过去
          const firstError = Object.keys(error)[0]
          let tabChildren = this.$refs['tabs'].$children
          for (let i = 0; i < tabChildren.length; i++) {
            const item = tabChildren[i]
            let finded = false
            for (let j = 0; j < item.$children.length; j++) {
              if (item.$children[j].prop === firstError) {
                this.tableName = item.name
                finded = true
                break
              }
            }
            if (finded) break
          }
          return false
        }
      })
    },
    /** 获取提交参数 */
    _getParams() {
      const params = this.MixinClone(this.shopForm)
      if (this.isAudit || params.shop_disable === 'WAIN_IMPROVED') {
        params.pass = 1
      }
      params.licence_start /= 1000
      params.licence_end /= 1000
      params.establish_date /= 1000
      params.link_phone = this.$refs.AreaSelect.mobileValue
      return params
    },
    /** 拒绝通过 */
    handleRefusePass() {
      this.dialogAuditVisible = true
    },
    /** 保证金扣除回调 */
    onSuccess(e) {
      this.shopForm.remaining_margin = e.total_amount
      this.showDeductDialog = false
    },
    /** 初始化会员信息 */
    initMemberInfo() {
      Promise.all([
        API_Shop.getShopDetail(this.shop_id),
        API_Category.getCategoryChildren()
      ]).then(responses => {
        const shopInfo = responses[0]
        const categorys = responses[1]
        if (shopInfo.shop_disable !== 'WAIN_IMPROVED') {
          // 设置店铺信息
          this.shopForm = this.MixinClone(shopInfo)
          const { shop_commission } = this.shopForm
          if (!shop_commission && shop_commission !== 0) {
            this.shopForm.shop_commission = 5
          }
          this.shopForm.licence_start *= 1000
          this.shopForm.licence_end = +this.shopForm.licence_end === 0 ? null : this.shopForm.licence_end *= 1000
          this.shopForm.establish_date *= 1000
          this.defaultRegionLicense = this.MixinGetRegionDefaultData(shopInfo, 'license_')
          this.defaultRegionBank = this.MixinGetRegionDefaultData(shopInfo, 'bank_')
          this.defaultRegionShop = this.MixinGetRegionDefaultData(shopInfo, 'shop_')
          if (this.isO2O) {
            this.shopForm.goods_management_category = shopInfo.goods_management_category
          } else {
            this.shopForm.goods_management_category = []
            if (shopInfo.goods_management_category) {
              const _categorys = shopInfo.goods_management_category.split(',')
              this.shopForm.goods_management_category = _categorys
              if (_categorys.length !== 0) {
                if (_categorys.length < categorys.length) {
                  this.isIndeterminateCat = true
                } else if (_categorys.length === categorys.length) {
                  this.checkAllCat = true
                }
              }
            }
          }
        } else {
          this.shopForm.shop_disable = shopInfo.shop_disable
          this.shopForm.shop_name = shopInfo.shop_name
          this.shopForm.remaining_margin = shopInfo.remaining_margin
        }
        if (shopInfo.settlement_day) {
          this.settlementDate = shopInfo.settlement_day.split(',')
        }
        if (shopInfo.settlement_status) {
          this.checkList = [shopInfo.settlement_status]
        }

        // 设置经营类目
        this.categorys = categorys.map(item => ({
          id: String(item.category_id),
          name: item.name
        }))
        // 避免快速点击造成的地区未选择问题
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.shop-edit ::v-deep .shop-info-form {
  .region-picker {
    .app-address-body {
      left: 0 !important;
    }
  }
  .el-input__inner {
    width: 400px;
  }
  .area-form {
    .el-form-item__label {
      width: 100px !important;
    }
    .el-form-item__content {
      margin-left: 100px !important;
    }
  }
  .area-input {
    .el-input__inner {
      width: calc(400px - 80px);
    }
  }
  .reg-money-input, .shop-commission-input {
    .el-input__inner {
      width: calc(400px - 54px);
    }
  }
  .el-input-number--small {
    width: 180px;
  }
  .employee_num .el-input__inner {
    width: 180px;
  }
  .el-form-item__content {
    width: 400px;
  }
  .el-date-editor {
    .el-input__inner {
      width: 180px;
    }
  }
  .base-form {
    .el-form-item__label {
      width: 100px;
    }
  }
  .form-item {
    .el-form-item__label {
      width: 190px;
    }
    .el-form-item__content {
      width: 100%;
    }
    .el-input--small {
      width: 400px;
    }
  }
  .el-form-item {
    margin-bottom: 26px;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    &:hover {
      border-color: #409eff;
    }
  }
  .avatar-uploader {
    width: 180px;
    height: 180px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .avatar-uploader .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .form-item-cat .el-form-item__content {
    width: auto;
  }
  .el-tabs__content {
    overflow: inherit;
  }
}
.shop-info-form  {
  ::v-deep .el-tab-pane {
    width: 700px;
  }
}
.tag-item {
  margin-right: 10px;
}
.sample-box {
  font-size: 14px;
  color: #333;
}
.tips {
  margin-bottom: 10px;
  font-size: 13px;
  color: #999;
}
.security-deposit {
  font-size: 16px;
  color: #666;
  margin-right: 20px;
  font-weight: 600;
}
.save-btn-box {
  text-align: center;
  background-color: #fff;
  padding: 10px 0;
  border: 1px solid #dcdfe6;
  border-top: 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
}
.see-original {
  font-size: 12px;
  color: #006db7;
  &:hover {
    color: #f00;
  }
}
.license-date {
  width: 180px;
}
.areal-item {
  display: flex;
  align-items: center;
  .flag {
    width: 20px;
    margin-right: 10px;
  }
}
</style>
